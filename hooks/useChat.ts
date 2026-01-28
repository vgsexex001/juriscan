"use client";

import { useState, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Message } from "./useConversations";

interface UseChatOptions {
  conversationId: string | null;
  onConversationCreated?: (id: string) => void;
}

interface StreamEvent {
  type: "chunk" | "done" | "error";
  content?: string;
  conversationId?: string;
  error?: string;
}

export function useChat({ conversationId, onConversationCreated }: UseChatOptions) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      setError(null);
      setIsStreaming(true);
      setStreamingContent("");

      // Add user message to UI immediately
      const tempUserMessage: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId || "",
        role: "USER",
        content,
        created_at: new Date().toISOString(),
      };

      // Update conversation cache with user message
      if (conversationId) {
        queryClient.setQueryData(
          ["conversation", conversationId],
          (old: { conversation: unknown; messages: Message[] } | undefined) => {
            if (!old) return old;
            return {
              ...old,
              messages: [...old.messages, tempUserMessage],
            };
          }
        );
      }

      // Add placeholder for assistant message
      const tempAssistantMessage: Message = {
        id: `temp-assistant-${Date.now()}`,
        conversation_id: conversationId || "",
        role: "ASSISTANT",
        content: "",
        created_at: new Date().toISOString(),
      };

      if (conversationId) {
        queryClient.setQueryData(
          ["conversation", conversationId],
          (old: { conversation: unknown; messages: Message[] } | undefined) => {
            if (!old) return old;
            return {
              ...old,
              messages: [...old.messages, tempAssistantMessage],
            };
          }
        );
      }

      try {
        abortControllerRef.current = new AbortController();

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId,
            message: content,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || "Erro ao enviar mensagem");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let accumulatedContent = "";
        let newConversationId = conversationId;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const event: StreamEvent = JSON.parse(line.slice(6));

                if (event.type === "chunk" && event.content) {
                  accumulatedContent += event.content;
                  setStreamingContent(accumulatedContent);

                  // Update the message in cache
                  const currentConvId = event.conversationId || newConversationId;
                  if (currentConvId) {
                    queryClient.setQueryData(
                      ["conversation", currentConvId],
                      (old: { conversation: unknown; messages: Message[] } | undefined) => {
                        if (!old) return old;
                        const messages = [...old.messages];
                        const lastIndex = messages.length - 1;
                        if (messages[lastIndex]?.role === "ASSISTANT") {
                          messages[lastIndex] = {
                            ...messages[lastIndex],
                            content: accumulatedContent,
                          };
                        }
                        return { ...old, messages };
                      }
                    );
                  }
                }

                if (event.type === "done") {
                  newConversationId = event.conversationId || newConversationId;

                  if (newConversationId && newConversationId !== conversationId) {
                    onConversationCreated?.(newConversationId);
                  }

                  // Invalidate queries to refetch fresh data
                  queryClient.invalidateQueries({ queryKey: ["conversations"] });
                  queryClient.invalidateQueries({ queryKey: ["credits"] });

                  if (newConversationId) {
                    queryClient.invalidateQueries({
                      queryKey: ["conversation", newConversationId]
                    });
                  }
                }

                if (event.type === "error") {
                  throw new Error(event.error || "Erro durante streaming");
                }
              } catch (parseError) {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          // User cancelled
          return;
        }
        console.error("Chat error:", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setIsStreaming(false);
        setStreamingContent("");
        abortControllerRef.current = null;
      }
    },
    [conversationId, isStreaming, onConversationCreated, queryClient]
  );

  const cancelStream = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return {
    sendMessage,
    cancelStream,
    isStreaming,
    streamingContent,
    error,
  };
}
