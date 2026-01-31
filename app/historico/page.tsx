"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MessageSquare,
  Search,
  Calendar,
  ArrowRight,
  Inbox,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import LegalDisclaimer from "@/components/LegalDisclaimer";
import { useConversations } from "@/hooks/useConversations";

export default function HistoricoPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const { conversations, isLoading, deleteConversation, deleteAllConversations, isDeletingAll } = useConversations();

  const handleCloseModal = useCallback(() => {
    setShowDeleteAllModal(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseModal();
    };
    if (showDeleteAllModal) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [showDeleteAllModal, handleCloseModal]);

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conv) =>
    conv.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort by most recent first
  const sortedConversations = [...filteredConversations].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return { bg: "#DCFCE7", text: "#16A34A", label: "Ativa" };
      case "ARCHIVED":
        return { bg: "#F3F4F6", text: "#6B7280", label: "Arquivada" };
      default:
        return { bg: "#F3F4F6", text: "#6B7280", label: status };
    }
  };

  return (
    <AppShell>
      <main className="p-4 sm:p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Histórico de Conversas
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Todas as suas consultas jurídicas
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            {conversations.length > 0 && (
              <button
                onClick={() => setShowDeleteAllModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 text-sm font-medium rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Excluir tudo
              </button>
            )}
            <Link
              href="/chat"
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Nova Consulta
            </Link>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total de Conversas</p>
              <p className="text-xl font-bold text-gray-900">
                {isLoading ? "..." : conversations.length}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar conversas..."
              className="w-full h-11 pl-12 pr-4 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-500">Carregando histórico...</p>
          </div>
        )}

        {/* Conversations List */}
        {!isLoading && sortedConversations.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {sortedConversations.map((conv, index) => {
              const status = getStatusColor(conv.status);
              return (
                <Link
                  key={conv.id}
                  href={`/chat?id=${conv.id}`}
                  className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                    index !== sortedConversations.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 hidden sm:flex">
                      <MessageSquare className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {conv.title || "Conversa sem título"}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {formatDate(conv.updated_at)}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: status.bg,
                            color: status.text,
                          }}
                        >
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Excluir conversa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && sortedConversations.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            {searchQuery ? (
              <>
                <p className="text-gray-600 font-medium mb-1">
                  Nenhuma conversa encontrada
                </p>
                <p className="text-gray-500 text-sm">
                  Não encontramos conversas com &quot;{searchQuery}&quot;
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-600 font-medium mb-1">
                  Nenhuma conversa ainda
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  Inicie sua primeira consulta jurídica com a IA
                </p>
                <Link
                  href="/chat"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Iniciar Conversa
                </Link>
              </>
            )}
          </div>
        )}

        {/* Legal Disclaimer */}
        <LegalDisclaimer />

        {/* Delete All Confirmation Modal */}
        {showDeleteAllModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={handleCloseModal}
          >
            <div
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Excluir todo o histórico
                </h2>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Tem certeza que deseja excluir todas as suas conversas? Esta ação
                não pode ser desfeita e todas as {conversations.length} conversas
                serão removidas permanentemente.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    deleteAllConversations();
                    setShowDeleteAllModal(false);
                  }}
                  disabled={isDeletingAll}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors"
                >
                  {isDeletingAll ? "Excluindo..." : "Excluir Tudo"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </AppShell>
  );
}
