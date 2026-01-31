import { NextResponse } from "next/server";
import { apiHandler, parseBody, InsufficientCreditsError } from "@/lib/api";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getOpenAI, AI_CONFIG, LEGAL_SYSTEM_PROMPT } from "@/lib/ai/config";
import { chatMessageSchema } from "@/lib/validation/schemas";
import { deductCredits } from "@/services/credit.service";
import { calculateChatCost } from "@/lib/credits/costs";
import { dbInsertAndSelect, dbInsert, dbUpdateQuery } from "@/lib/supabase/db";
import type { ChatAttachment } from "@/types/chat";
import { createAnalyzeCaseUseCase, type EnrichedContext } from "@/src/application/use-cases/chat/AnalyzeCaseUseCase";

// Force dynamic rendering for authenticated routes
export const dynamic = "force-dynamic";

// Tipos para mensagens da OpenAI
type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string; detail?: "low" | "high" | "auto" } };


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
  const imageParts: ContentPart[] = [];

  // Adicionar contexto de arquivos e áudio
  const contextParts: string[] = [];

  for (const att of attachments) {
    if (att.type === "file" && att.metadata.extracted_text) {
      console.log(
        `📄 Including document "${att.name}" with ${att.metadata.extracted_text.length} chars`
      );
      contextParts.push(
        `[Conteúdo do documento "${att.name}"]:\n${att.metadata.extracted_text}`
      );
    } else if (att.type === "file") {
      console.log(
        `⚠️ Document "${att.name}" has no extracted_text in metadata`
      );
    }

    if (att.type === "audio") {
      if (att.metadata.transcription) {
        console.log(`🎤 Including audio transcription: "${att.metadata.transcription.substring(0, 100)}..."`);
        contextParts.push(
          `[Transcrição do áudio enviado]:\n${att.metadata.transcription}`
        );
      } else {
        console.log(`⚠️ Audio "${att.name}" has no transcription in metadata`);
        contextParts.push(
          `[O usuário enviou um áudio, mas não foi possível transcrevê-lo. Informe que você não conseguiu ouvir o áudio.]`
        );
      }
    }

    if (att.type === "image") {
      // Adicionar imagem para GPT-4 Vision
      console.log(`🖼️ Including image "${att.name}" with URL: ${att.url.substring(0, 100)}...`);
      imageParts.push({
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
  if (imageParts.length === 0) {
    return fullText;
  }

  // IMPORTANTE: Texto PRIMEIRO, depois imagens (melhor para GPT-4 Vision)
  parts.push({ type: "text", text: fullText });
  parts.push(...imageParts);

  console.log(`📨 Built message with ${parts.length} parts (1 text + ${imageParts.length} images)`);
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
  const creditCost = calculateChatCost(attachments as ChatAttachment[]);

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

  // Analisar última mensagem para extrair entidades e buscar dados jurídicos
  let enrichedContext: EnrichedContext | null = null;
  try {
    const analyzeCaseUseCase = createAnalyzeCaseUseCase();
    const analysisResult = await analyzeCaseUseCase.execute({
      mensagem: message,
      userId: user!.id,
      conversationId: actualConversationId || undefined,
    });

    if (analysisResult.deve_usar_dados && analysisResult.contexto.contexto_prompt) {
      enrichedContext = analysisResult.contexto;
      console.log("📊 [Chat] Contexto jurídico enriquecido:", {
        entidades: analysisResult.contexto.entidades,
        processos: analysisResult.dados_utilizados.processos_analisados,
        tempo_ms: analysisResult.dados_utilizados.tempo_busca_ms,
      });
    }
  } catch (error) {
    console.warn("⚠️ [Chat] Erro ao analisar caso (continuando sem dados):", error);
  }

  // Format messages for OpenAI
  // Se temos contexto enriquecido, adicionar ao system prompt
  const systemPrompt = enrichedContext?.contexto_prompt
    ? LEGAL_SYSTEM_PROMPT + "\n\n" + enrichedContext.contexto_prompt
    : LEGAL_SYSTEM_PROMPT;

  const formattedMessages: {
    role: "system" | "user" | "assistant";
    content: string | ContentPart[];
  }[] = [{ role: "system", content: systemPrompt }];

  for (const msg of history) {
    const role = msg.role === "USER" ? "user" : "assistant";
    const content = buildMessageContent(
      msg.content,
      (msg.attachments || []) as ChatAttachment[]
    );
    formattedMessages.push({ role, content });
  }

  // Log para debug
  console.log(`🤖 Sending ${formattedMessages.length} messages to OpenAI (model: ${AI_CONFIG.model})`);
  for (let i = 0; i < formattedMessages.length; i++) {
    const msg = formattedMessages[i];
    if (Array.isArray(msg.content)) {
      const types = msg.content.map((p) => p.type).join(", ");
      console.log(`  [${i}] ${msg.role}: [${types}]`);
    } else {
      console.log(`  [${i}] ${msg.role}: ${(msg.content as string).substring(0, 50)}...`);
    }
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
          presence_penalty: AI_CONFIG.presencePenalty,
          frequency_penalty: AI_CONFIG.frequencyPenalty,
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

        let errorMessage = "Erro ao processar mensagem. Tente novamente.";
        const err = error as Record<string, unknown>;
        if (err?.code === "ETIMEDOUT" || err?.code === "ECONNABORTED" || err?.type === "request-timeout") {
          errorMessage = "O servidor demorou muito para responder. Tente novamente.";
        } else if (err?.status === 429) {
          errorMessage = "Muitas requisições. Aguarde alguns segundos e tente novamente.";
        } else if (err?.status === 503) {
          errorMessage = "Serviço temporariamente indisponível. Tente novamente em alguns instantes.";
        }

        const errorChunk = JSON.stringify({
          type: "error",
          error: errorMessage,
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
