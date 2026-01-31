"use client";

import { useState, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Message } from "./useConversations";
import type { ChatAttachment } from "@/types/chat";

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

// Extensão do tipo Message para incluir attachments
interface MessageWithAttachments extends Message {
  attachments?: ChatAttachment[];
}

const TIMEOUT_MS = 60000; // 60 segundos

export function useChat({ conversationId, onConversationCreated }: UseChatOptions) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false); // Esperando primeiro chunk
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMessageRef = useRef<{ content: string; attachments: ChatAttachment[] } | null>(null);
  const queryClient = useQueryClient();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const sendMessage = useCallback(
    async (content: string, attachments: ChatAttachment[] = []) => {
      if ((!content.trim() && attachments.length === 0) || isStreaming) return;

      // Salvar para retry
      lastMessageRef.current = { content, attachments };

      setError(null);
      setIsStreaming(true);
      setIsWaiting(true);
      setStreamingContent("");

      // Add user message to UI immediately
      const tempUserMessage: MessageWithAttachments = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId || "",
        role: "USER",
        content,
        attachments,
        created_at: new Date().toISOString(),
      };

      // Update conversation cache with user message
      if (conversationId) {
        queryClient.setQueryData(
          ["conversation", conversationId],
          (old: { conversation: unknown; messages: MessageWithAttachments[] } | undefined) => {
            if (!old) return old;
            return {
              ...old,
              messages: [...old.messages, tempUserMessage],
            };
          }
        );
      }

      // Add placeholder for assistant message
      const tempAssistantMessage: MessageWithAttachments = {
        id: `temp-assistant-${Date.now()}`,
        conversation_id: conversationId || "",
        role: "ASSISTANT",
        content: "",
        attachments: [],
        created_at: new Date().toISOString(),
      };

      if (conversationId) {
        queryClient.setQueryData(
          ["conversation", conversationId],
          (old: { conversation: unknown; messages: MessageWithAttachments[] } | undefined) => {
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

        // Timeout para evitar loading infinito
        timeoutRef.current = setTimeout(() => {
          abortControllerRef.current?.abort();
        }, TIMEOUT_MS);

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...(conversationId && { conversationId }),
            message: content,
            attachments,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error?.message || errorData.error || `Erro ${response.status}: Falha ao processar mensagem`
          );
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("Erro ao ler resposta do servidor");

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
                  // Primeiro chunk recebido — sair do estado "waiting"
                  if (isWaiting || accumulatedContent === "") {
                    setIsWaiting(false);
                  }

                  accumulatedContent += event.content;
                  setStreamingContent(accumulatedContent);

                  // Update the message in cache
                  const currentConvId = event.conversationId || newConversationId;
                  if (currentConvId) {
                    queryClient.setQueryData(
                      ["conversation", currentConvId],
                      (old: { conversation: unknown; messages: MessageWithAttachments[] } | undefined) => {
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
                // Re-throw if it's our error (not a JSON parse error)
                if (parseError instanceof Error && parseError.message !== "Unexpected end of JSON input" && !parseError.message.includes("JSON")) {
                  throw parseError;
                }
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          // Verificar se foi timeout ou cancelamento manual
          setError("A resposta demorou muito. Tente novamente.");
          // Remover a mensagem placeholder do assistente
          if (conversationId) {
            queryClient.setQueryData(
              ["conversation", conversationId],
              (old: { conversation: unknown; messages: MessageWithAttachments[] } | undefined) => {
                if (!old) return old;
                const messages = old.messages.filter(
                  (m) => !(m.role === "ASSISTANT" && !m.content)
                );
                return { ...old, messages };
              }
            );
          }
          return;
        }
        console.error("Chat error:", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido. Tente novamente.");

        // Remover mensagem placeholder vazia do assistente em caso de erro
        if (conversationId) {
          queryClient.setQueryData(
            ["conversation", conversationId],
            (old: { conversation: unknown; messages: MessageWithAttachments[] } | undefined) => {
              if (!old) return old;
              const messages = old.messages.filter(
                (m) => !(m.role === "ASSISTANT" && !m.content)
              );
              return { ...old, messages };
            }
          );
        }
      } finally {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setIsStreaming(false);
        setIsWaiting(false);
        setStreamingContent("");
        abortControllerRef.current = null;
      }
    },
    [conversationId, isStreaming, isWaiting, onConversationCreated, queryClient]
  );

  const retry = useCallback(async () => {
    if (!lastMessageRef.current) return;
    setError(null);

    // Remover a mensagem do usuário anterior e placeholder do assistente
    if (conversationId) {
      queryClient.setQueryData(
        ["conversation", conversationId],
        (old: { conversation: unknown; messages: MessageWithAttachments[] } | undefined) => {
          if (!old) return old;
          // Remover as últimas mensagens temp (user + assistant vazio)
          const messages = old.messages.filter(
            (m) => !m.id.startsWith("temp-")
          );
          return { ...old, messages };
        }
      );
    }

    const { content, attachments } = lastMessageRef.current;
    await sendMessage(content, attachments);
  }, [conversationId, queryClient, sendMessage]);

  const cancelStream = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return {
    sendMessage,
    cancelStream,
    retry,
    clearError,
    isStreaming,
    isWaiting,
    streamingContent,
    error,
  };
}
