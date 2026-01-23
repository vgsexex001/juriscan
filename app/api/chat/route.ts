import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getOpenAI, AI_CONFIG, LEGAL_SYSTEM_PROMPT, CREDIT_COSTS } from "@/lib/ai/config";
import { chatMessageSchema, validateBody } from "@/lib/validation/schemas";
import { deductCredits } from "@/services/credit.service";
import { dbInsertAndSelect, dbInsert, dbUpdateQuery } from "@/lib/supabase/db";

// POST /api/chat - Send message and get AI response with streaming
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate request body
    const validation = await validateBody(request, chatMessageSchema);
    if (!validation.success) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { conversationId, message } = validation.data;

    // Deduct credits with optimistic locking to prevent race conditions
    const creditResult = await deductCredits(
      supabase,
      user.id,
      CREDIT_COSTS.chat_message,
      "Mensagem de chat"
    );

    if (!creditResult.success) {
      return new Response(
        JSON.stringify({ error: creditResult.error || "Créditos insuficientes" }),
        {
          status: 402,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create or get conversation
    let actualConversationId = conversationId;

    if (!conversationId) {
      // Create new conversation
      const { data: newConv, error: convError } = await dbInsertAndSelect(
        supabase,
        "conversations",
        {
          user_id: user.id,
          title: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
          status: "ACTIVE",
        }
      );

      if (convError || !newConv) {
        return new Response(
          JSON.stringify({ error: "Erro ao criar conversa" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      actualConversationId = (newConv as { id: string }).id;
    }

    // Save user message
    await dbInsert(supabase, "messages", {
      conversation_id: actualConversationId,
      role: "USER",
      content: message,
    });

    // Get conversation history for context
    const { data: historyData } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", actualConversationId!)
      .order("created_at", { ascending: true })
      .limit(20);

    const history = (historyData || []) as { role: string; content: string }[];

    // Format messages for OpenAI
    const formattedMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: LEGAL_SYSTEM_PROMPT },
      ...history.map((msg) => ({
        role: (msg.role === "USER" ? "user" : "assistant") as "user" | "assistant",
        content: msg.content,
      })),
    ];

    // Create streaming response
    const encoder = new TextEncoder();
    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Call OpenAI with streaming
          const response = await getOpenAI().chat.completions.create({
            model: AI_CONFIG.model,
            max_tokens: AI_CONFIG.maxTokens,
            temperature: AI_CONFIG.temperature,
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

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: "Erro ao processar mensagem" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
