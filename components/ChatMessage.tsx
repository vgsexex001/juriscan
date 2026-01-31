"use client";

import { Scale } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { ChatAttachment } from "@/types/chat";
import { ChatFileMessage, ChatImageMessage, ChatAudioMessage } from "./Chat";

interface ChatMessageProps {
  type: "assistant" | "user";
  content: string;
  timestamp: string;
  attachments?: ChatAttachment[];
}

// Renderizar attachment baseado no tipo
function renderAttachment(attachment: ChatAttachment) {
  switch (attachment.type) {
    case "file":
      return <ChatFileMessage key={attachment.id} attachment={attachment} />;
    case "image":
      return <ChatImageMessage key={attachment.id} attachment={attachment} />;
    case "audio":
      return <ChatAudioMessage key={attachment.id} attachment={attachment} />;
    default:
      return null;
  }
}

export default function ChatMessage({
  type,
  content,
  timestamp,
  attachments = [],
}: ChatMessageProps) {
  const hasAttachments = attachments.length > 0;

  if (type === "user") {
    return (
      <div className="flex justify-end mb-6">
        <div className="max-w-[90%] sm:max-w-[75%]">
          {/* Attachments */}
          {hasAttachments && (
            <div className="flex flex-wrap gap-2 mb-2 justify-end">
              {attachments.map((att) => renderAttachment(att))}
            </div>
          )}

          {/* Conteúdo de texto */}
          {content && (
            <div className="bg-primary text-white rounded-xl rounded-tr-sm p-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {content}
              </p>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-1.5 text-right">{timestamp}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
        <Scale className="w-4 h-4 text-white" strokeWidth={1.5} />
      </div>
      <div className="max-w-[90%] sm:max-w-[75%]">
        <p className="text-primary text-sm font-medium mb-1.5">
          Assistente Jurídico
        </p>
        <div className="bg-gray-100 rounded-xl rounded-tl-sm p-4 prose prose-sm prose-gray max-w-none">
          <ReactMarkdown
            components={{
              // Estilizar parágrafos
              p: ({ children }) => (
                <p className="text-sm text-gray-700 leading-relaxed mb-2 last:mb-0">
                  {children}
                </p>
              ),
              // Estilizar negrito
              strong: ({ children }) => (
                <strong className="font-semibold text-gray-900">{children}</strong>
              ),
              // Estilizar títulos
              h1: ({ children }) => (
                <h1 className="text-lg font-bold text-gray-900 mt-3 mb-2">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-base font-bold text-gray-900 mt-3 mb-2">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-sm font-bold text-gray-800 mt-2 mb-1">{children}</h3>
              ),
              // Estilizar listas
              ul: ({ children }) => (
                <ul className="list-disc list-inside text-sm text-gray-700 mb-2 space-y-1">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside text-sm text-gray-700 mb-2 space-y-1">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-sm text-gray-700">{children}</li>
              ),
              // Estilizar tabelas
              table: ({ children }) => (
                <div className="overflow-x-auto my-2">
                  <table className="min-w-full text-sm border-collapse">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-gray-200">{children}</thead>
              ),
              th: ({ children }) => (
                <th className="px-3 py-2 text-left font-semibold text-gray-800 border border-gray-300">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-3 py-2 text-gray-700 border border-gray-300">
                  {children}
                </td>
              ),
              // Estilizar código inline
              code: ({ children }) => (
                <code className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono">
                  {children}
                </code>
              ),
              // Estilizar links
              a: ({ href, children }) => (
                <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
            }}
          >
            {content}
          </ReactMarkdown>

          {/* Attachments na resposta do assistente (raro, mas possível) */}
          {hasAttachments && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
              {attachments.map((att) => renderAttachment(att))}
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1.5">{timestamp}</p>
      </div>
    </div>
  );
}
