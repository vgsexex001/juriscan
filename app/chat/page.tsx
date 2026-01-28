"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Menu,
  Scale,
  Brain,
  Paperclip,
  Send,
  Plus,
  MessageSquare,
  Trash2,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  FileText,
  Mic,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import ChatMessage from "@/components/ChatMessage";
import SuggestionCards from "@/components/SuggestionCards";
import LegalDisclaimerInline from "@/components/LegalDisclaimerInline";
import { ChatAttachmentPreview, AudioRecorder } from "@/components/Chat";
import { useConversations, useConversation } from "@/hooks/useConversations";
import { useChat } from "@/hooks/useChat";
import { useCredits } from "@/hooks/useCredits";
import { useChatAttachments } from "@/hooks/useChatAttachments";
import type { ChatAttachment } from "@/types/chat";

const suggestions = [
  { text: "Analisar estratégia processual 0001234-56.2024.8.26.0100" },
  { text: "Qual a probabilidade de êxito em ação de cobrança no TJSP?" },
  { text: "Análise de jurisprudência sobre responsabilidade civil" },
  { text: "Gerar análise preditiva com próximos passos" },
];

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationIdParam = searchParams.get("id");

  const [mounted, setMounted] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(
    conversationIdParam
  );
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { conversations, isLoading: isLoadingConversations, deleteConversation } =
    useConversations();
  const { messages, isLoading: isLoadingMessages } = useConversation(currentConversationId);
  const { balance } = useCredits();
  const { sendMessage, isStreaming, error: chatError } = useChat({
    conversationId: currentConversationId,
    onConversationCreated: (id) => {
      setCurrentConversationId(id);
      router.push(`/chat?id=${id}`, { scroll: false });
    },
  });

  const {
    attachments,
    uploadProgress,
    isUploading,
    error: attachmentError,
    addAttachment,
    addAudioAttachment,
    removeAttachment,
    clearAttachments,
    uploadAttachments,
    transcribeAudio,
    totalCost,
  } = useChatAttachments();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentConversationId(conversationIdParam);
  }, [conversationIdParam]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Fechar menu de anexos ao clicar fora
  useEffect(() => {
    const handleClickOutside = () => setShowAttachMenu(false);
    if (showAttachMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showAttachMenu]);

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    router.push("/chat", { scroll: false });
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
    router.push(`/chat?id=${id}`, { scroll: false });
    setShowSidebar(false);
  };

  const handleDeleteConversation = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta conversa?")) {
      deleteConversation(id);
      if (currentConversationId === id) {
        handleNewConversation();
      }
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if ((!text && attachments.length === 0) || isStreaming || isUploading) return;

    if (balance < totalCost) {
      alert(`Créditos insuficientes. Você precisa de ${totalCost} créditos.`);
      return;
    }

    // Upload attachments primeiro
    let uploadedAttachments: ChatAttachment[] = [];
    if (attachments.length > 0) {
      uploadedAttachments = await uploadAttachments();
    }

    // Enviar mensagem
    sendMessage(text, uploadedAttachments);
    setInputValue("");
    clearAttachments();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (text: string) => {
    handleSendMessage(text);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      await addAttachment(file);
    }

    // Reset input
    if (e.target) e.target.value = "";
    setShowAttachMenu(false);
  };

  const handleAudioComplete = (blob: Blob, duration: number) => {
    addAudioAttachment(blob, duration);
    setIsRecordingAudio(false);
  };

  const showSuggestions = messages.length === 0 && attachments.length === 0;
  const hasAttachments = attachments.length > 0;

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Conversations Sidebar */}
      {showSidebar && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowSidebar(false)}
          />
          <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-800">Conversas</h2>
            </div>
            <div className="p-2">
              <button
                onClick={handleNewConversation}
                className="w-full flex items-center gap-2 p-3 text-primary hover:bg-primary/5 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Nova conversa</span>
              </button>
            </div>
            <div className="overflow-y-auto h-[calc(100%-120px)]">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`flex items-center justify-between p-3 mx-2 rounded-lg cursor-pointer ${
                    currentConversationId === conv.id
                      ? "bg-primary/10"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <div
                    className="flex items-center gap-2 flex-1 min-w-0"
                    onClick={() => handleSelectConversation(conv.id)}
                  >
                    <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm truncate">{conv.title || "Nova conversa"}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteConversation(conv.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:ml-60 min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-5">
          {/* Mobile Menu */}
          <div className="lg:hidden flex items-center gap-2 mb-4">
            <button
              onClick={() => setShowSidebar(true)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Scale className="w-6 h-6 text-primary" strokeWidth={1.5} />
            <span className="text-primary text-lg font-semibold">Juriscan</span>
          </div>

          {/* Header Content */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#EEF2FF] rounded-[10px]">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">
                  Análise Estratégica Jurídica
                </h1>
                <p className="text-sm text-gray-500">
                  IA conversacional especializada em jurimetria e previsão processual
                </p>
              </div>
            </div>

            {/* Conversation History Toggle (Desktop) */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={handleNewConversation}
                className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/5 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="text-sm">Nova conversa</span>
              </button>
            </div>
          </div>

          {/* Conversation List (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 mt-4 overflow-x-auto pb-2">
            {isLoadingConversations ? (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            ) : (
              conversations.slice(0, 5).map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                    currentConversationId === conv.id
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="max-w-[150px] truncate">
                    {conv.title || "Nova conversa"}
                  </span>
                </button>
              ))
            )}
          </div>
        </header>

        {/* Chat Area */}
        <main
          ref={chatContainerRef}
          className="flex-1 p-6 pb-48 overflow-y-auto"
          aria-label="Histórico de mensagens"
        >
          {/* Error Message */}
          {(chatError || attachmentError) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{chatError || attachmentError}</span>
            </div>
          )}

          {/* Welcome Message */}
          {messages.length === 0 && !isLoadingMessages && (
            <div className="flex items-start gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Scale className="w-4 h-4 text-white" strokeWidth={1.5} />
              </div>
              <div className="max-w-2xl">
                <p className="text-primary text-sm font-medium mb-1.5">
                  Assistente Jurídico
                </p>
                <div className="bg-gray-100 rounded-xl rounded-tl-sm p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    Olá! Sou o assistente jurídico da Juriscan. Como posso ajudá-lo hoje?
                    {"\n\n"}
                    Você pode me enviar um número de processo, texto descrevendo um caso,
                    ou fazer perguntas sobre legislação e jurisprudência.
                    {"\n\n"}
                    <span className="text-gray-500">
                      💡 Agora você também pode enviar arquivos PDF, imagens de documentos
                      ou gravar mensagens de áudio!
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {isLoadingMessages ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage
                key={message.id}
                type={message.role === "USER" ? "user" : "assistant"}
                content={message.content}
                timestamp={new Date(message.created_at).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                attachments={(message as { attachments?: ChatAttachment[] }).attachments}
              />
            ))
          )}

          {/* Streaming Indicator */}
          {isStreaming && (
            <div className="flex items-start gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Scale className="w-4 h-4 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-primary text-sm font-medium mb-1.5">
                  Assistente Jurídico
                </p>
                <div className="bg-gray-100 rounded-xl rounded-tl-sm p-4">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Suggestion Cards */}
          {showSuggestions && !isStreaming && (
            <SuggestionCards
              suggestions={suggestions}
              onSuggestionClick={handleSuggestionClick}
            />
          )}
        </main>

        {/* Input Area */}
        <div className="fixed bottom-0 left-0 lg:left-60 right-0 bg-white border-t border-gray-200 p-4 z-10">
          <div className="max-w-4xl mx-auto">
            {/* Attachment Preview */}
            {hasAttachments && (
              <ChatAttachmentPreview
                attachments={attachments}
                uploadProgress={uploadProgress}
                isUploading={isUploading}
                onRemove={removeAttachment}
                onTranscribe={transcribeAudio}
              />
            )}

            {/* Audio Recorder */}
            {isRecordingAudio ? (
              <div className="flex items-center justify-center py-2">
                <AudioRecorder
                  onRecordingComplete={handleAudioComplete}
                  onCancel={() => setIsRecordingAudio(false)}
                  disabled={isStreaming || isUploading}
                />
              </div>
            ) : (
              <div
                data-tour="chat-input"
                className={`flex items-center gap-3 bg-gray-50 border border-gray-200 px-4 py-2 focus-within:border-blue-500 transition-colors ${
                  hasAttachments ? "rounded-b-full" : "rounded-full"
                }`}
              >
                {/* Attach Button with Dropdown */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAttachMenu(!showAttachMenu);
                    }}
                    disabled={isStreaming || isUploading}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
                    aria-label="Anexar arquivo"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  {/* Dropdown Menu */}
                  {showAttachMenu && (
                    <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px]">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <FileText className="w-4 h-4 text-amber-500" />
                        Documento
                      </button>
                      <button
                        onClick={() => imageInputRef.current?.click()}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <ImageIcon className="w-4 h-4 text-blue-500" />
                        Imagem
                      </button>
                    </div>
                  )}
                </div>

                {/* Hidden File Inputs */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,text/plain"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <input
                  ref={imageInputRef}
                  type="file"
                  accept=".jpg, .jpeg, .png, .gif, .webp"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Input Field */}
                <input
                  ref={inputRef}
                  id="chat-input-field"
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Descreva o caso, informe o número do processo ou faça uma pergunta estratégica..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 placeholder-gray-400"
                  disabled={isStreaming || isUploading}
                />

                {/* Credit Balance */}
                <span className="text-xs text-gray-400 hidden sm:block">
                  {hasAttachments ? `${totalCost} créditos` : `${balance} créditos`}
                </span>

                {/* Audio Record Button */}
                <button
                  onClick={() => setIsRecordingAudio(true)}
                  disabled={isStreaming || isUploading}
                  className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 disabled:opacity-50 rounded-full transition-colors"
                  aria-label="Gravar áudio"
                  title="Gravar áudio"
                >
                  <Mic className="w-5 h-5" />
                </button>

                {/* Send Button */}
                <button
                  onClick={() => handleSendMessage()}
                  disabled={
                    (!inputValue.trim() && attachments.length === 0) ||
                    isStreaming ||
                    isUploading ||
                    balance < totalCost
                  }
                  className="w-10 h-10 bg-primary hover:bg-primary-hover disabled:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Enviar mensagem"
                >
                  {isStreaming || isUploading ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
            )}

            {/* Legal Disclaimer */}
            <LegalDisclaimerInline />
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<ChatLoading />}>
      <ChatContent />
    </Suspense>
  );
}
