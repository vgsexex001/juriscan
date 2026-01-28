import { NextResponse } from "next/server";
import { apiHandler, parseBody, InsufficientCreditsError } from "@/lib/api";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getOpenAI, AI_CONFIG, LEGAL_SYSTEM_PROMPT, CREDIT_COSTS } from "@/lib/ai/config";
import { chatMessageSchema } from "@/lib/validation/schemas";
import { deductCredits } from "@/services/credit.service";
import { dbInsertAndSelect, dbInsert, dbUpdateQuery } from "@/lib/supabase/db";
import type { ChatAttachment } from "@/types/chat";

// Force dynamic rendering for authenticated routes
export const dynamic = "force-dynamic";

// Tipos para mensagens da OpenAI
type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string; detail?: "low" | "high" | "auto" } };

// Calcular custo de créditos baseado nos attachments
function calculateCreditCost(attachments: ChatAttachment[]): number {
  if (attachments.length === 0) {
    return CREDIT_COSTS.chat_message;
  }

  let cost = CREDIT_COSTS.chat_message;

  for (const att of attachments) {
    switch (att.type) {
      case "image":
        cost += CREDIT_COSTS.chat_with_image - CREDIT_COSTS.chat_message;
        break;
      case "file":
        cost += CREDIT_COSTS.chat_with_pdf - CREDIT_COSTS.chat_message;
        break;
      case "audio":
        cost += CREDIT_COSTS.chat_with_audio - CREDIT_COSTS.chat_message;
        break;
    }
  }

  return cost;
}

// Construir mensagem com attachments para OpenAI
function buildMessageContent(
  message: string,
  attachments: ChatAttachment[]
): string | ContentPart[] {
  // Se não há attachments, retornar apenas texto
  if (attachments.length === 0) {
    return message;
  }

  const parts: ContentPart[] = [];

  // Adicionar contexto de arquivos e áudio
  const contextParts: string[] = [];

  for (const att of attachments) {
    if (att.type === "file" && att.metadata.extracted_text) {
      contextParts.push(
        `[Conteúdo do documento "${att.name}"]:\n${att.metadata.extracted_text.substring(0, 3000)}`
      );
    }

    if (att.type === "audio" && att.metadata.transcription) {
      contextParts.push(
        `[Transcrição do áudio enviado]:\n${att.metadata.transcription}`
      );
    }

    if (att.type === "image") {
      // Adicionar imagem para GPT-4 Vision
      parts.push({
        type: "image_url",
        image_url: {
          url: att.url,
          detail: "high",
        },
      });
    }
  }

  // Montar texto completo
  let fullText = message;
  if (contextParts.length > 0) {
    fullText = contextParts.join("\n\n---\n\n") + "\n\n---\n\n" + message;
  }

  // Se não há imagens, retornar apenas texto
  const hasImages = attachments.some((att) => att.type === "image");
  if (!hasImages) {
    return fullText;
  }

  // Se há imagens, retornar array de content parts
  parts.unshift({ type: "text", text: fullText });
  return parts;
}

// POST /api/chat - Send message and get AI response with streaming
export const POST = apiHandler(async (request, { user }) => {
  const supabase = await createServerSupabaseClient();

  // Validate request body
  const { conversationId, message, attachments = [] } = await parseBody(
    request,
    chatMessageSchema
  );

  // Calcular custo de créditos
  const creditCost = calculateCreditCost(attachments as ChatAttachment[]);

  // Deduct credits with optimistic locking to prevent race conditions
  const creditResult = await deductCredits(
    supabase,
    user!.id,
    creditCost,
    attachments.length > 0
      ? `Mensagem de chat com ${attachments.length} anexo(s)`
      : "Mensagem de chat"
  );

  if (!creditResult.success) {
    throw new InsufficientCreditsError();
  }

  // Create or get conversation
  let actualConversationId = conversationId;

  if (!conversationId) {
    // Create new conversation
    const title = message.substring(0, 50) + (message.length > 50 ? "..." : "");
    const { data: newConv, error: convError } = await dbInsertAndSelect(
      supabase,
      "conversations",
      {
        user_id: user!.id,
        title: title || "Nova conversa",
        status: "ACTIVE",
      }
    );

    if (convError || !newConv) {
      throw new Error("Erro ao criar conversa");
    }

    actualConversationId = (newConv as { id: string }).id;
  }

  // Save user message with attachments
  await dbInsert(supabase, "messages", {
    conversation_id: actualConversationId,
    role: "USER",
    content: message,
    attachments: attachments,
  });

  // Get conversation history for context
  const { data: historyData } = await supabase
    .from("messages")
    .select("role, content, attachments")
    .eq("conversation_id", actualConversationId!)
    .order("created_at", { ascending: true })
    .limit(20);

  const history = (historyData || []) as {
    role: string;
    content: string;
    attachments?: ChatAttachment[];
  }[];

  // Format messages for OpenAI
  const formattedMessages: {
    role: "system" | "user" | "assistant";
    content: string | ContentPart[];
  }[] = [{ role: "system", content: LEGAL_SYSTEM_PROMPT }];

  for (const msg of history) {
    const role = msg.role === "USER" ? "user" : "assistant";
    const content = buildMessageContent(
      msg.content,
      (msg.attachments || []) as ChatAttachment[]
    );
    formattedMessages.push({ role, content });
  }

  // Create streaming response
  const encoder = new TextEncoder();
  let fullResponse = "";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Call OpenAI with streaming
        const openai = getOpenAI();
        const response = await openai.chat.completions.create({
          model: AI_CONFIG.model,
          max_tokens: AI_CONFIG.maxTokens,
          temperature: AI_CONFIG.temperature,
          // @ts-expect-error - OpenAI SDK types don't support mixed content arrays
          messages: formattedMessages,
          stream: true,
        });

        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            fullResponse += content;

            // Send chunk to client
            const data = JSON.stringify({
              type: "chunk",
              content: content,
              conversationId: actualConversationId,
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
        }

        // Save assistant message to database
        await dbInsert(supabase, "messages", {
          conversation_id: actualConversationId,
          role: "ASSISTANT",
          content: fullResponse,
          attachments: [], // Assistant messages don't have attachments
        });

        // Update conversation timestamp
        await dbUpdateQuery(supabase, "conversations", {
          updated_at: new Date().toISOString(),
        }).eq("id", actualConversationId!);

        // Send done message
        const doneChunk = JSON.stringify({
          type: "done",
          conversationId: actualConversationId,
        });
        controller.enqueue(encoder.encode(`data: ${doneChunk}\n\n`));
        controller.close();
      } catch (error) {
        console.error("Streaming error:", error);
        const errorChunk = JSON.stringify({
          type: "error",
          error: "Erro ao processar mensagem",
        });
        controller.enqueue(encoder.encode(`data: ${errorChunk}\n\n`));
        controller.close();
      }
    },
  });

  // Return SSE stream (not using successResponse since this is a special streaming response)
  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
});
