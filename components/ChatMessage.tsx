"use client";

import { Scale } from "lucide-react";
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
        <div className="max-w-[75%]">
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
      <div className="max-w-[75%]">
        <p className="text-primary text-sm font-medium mb-1.5">
          Assistente Jurídico
        </p>
        <div className="bg-gray-100 rounded-xl rounded-tl-sm p-4">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {content}
          </p>

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
