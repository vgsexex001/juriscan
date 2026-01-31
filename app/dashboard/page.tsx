"use client";

import {
  MessageSquare,
  CreditCard,
  History,
  Sparkles,
  ArrowRight,
  BookOpen,
  Zap,
  Shield,
} from "lucide-react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import LegalDisclaimer from "@/components/LegalDisclaimer";
import { useCredits } from "@/hooks/useCredits";
import { useConversations } from "@/hooks/useConversations";

export default function DashboardPage() {
  const { balance, isLoading: creditsLoading } = useCredits();
  const { conversations, isLoading: convsLoading } = useConversations();

  const activeConversations = conversations.filter(c => c.status === "ACTIVE").length;

  return (
    <AppShell>
      <main className="p-4 sm:p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Bem-vindo ao Juriscan
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Seu assistente jurídico com inteligência artificial
            </p>
          </div>
          <Link
            href="/chat"
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Nova Consulta
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
          {/* Credits Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-500 truncate">Créditos</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {creditsLoading ? "..." : balance}
                </p>
              </div>
            </div>
            <Link
              href="/configuracoes?tab=plano"
              className="text-xs sm:text-sm text-primary hover:text-primary-hover active:text-primary-hover font-medium flex items-center gap-1 min-h-[44px] sm:min-h-0 items-center"
            >
              Comprar mais
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </div>

          {/* Conversations Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-500 truncate">Conversas</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {convsLoading ? "..." : activeConversations}
                </p>
              </div>
            </div>
            <Link
              href="/chat"
              className="text-xs sm:text-sm text-primary hover:text-primary-hover active:text-primary-hover font-medium flex items-center gap-1 min-h-[44px] sm:min-h-0 items-center"
            >
              Ver conversas
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </div>

          {/* History Card */}
          <div className="col-span-2 lg:col-span-1 bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <History className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-500 truncate">Histórico</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {convsLoading ? "..." : conversations.length}
                </p>
              </div>
            </div>
            <Link
              href="/historico"
              className="text-xs sm:text-sm text-primary hover:text-primary-hover active:text-primary-hover font-medium flex items-center gap-1 min-h-[44px] sm:min-h-0 items-center"
            >
              Ver histórico
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </div>
        </div>

        {/* Quick Start Section */}
        <div className="bg-gradient-to-br from-primary to-blue-700 rounded-xl p-5 sm:p-6 mb-8 text-white">
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Comece sua análise jurídica</h2>
              <p className="text-blue-100 text-sm sm:text-base mb-4 leading-relaxed">
                Faça perguntas sobre casos jurídicos, obtenha análises de probabilidade
                de êxito e receba orientações estratégicas.
              </p>
              <Link
                href="/chat"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-3 sm:py-2 bg-white text-primary font-medium rounded-lg hover:bg-blue-50 active:bg-blue-100 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Iniciar Conversa
              </Link>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
          O que o Juriscan pode fazer por você
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 flex sm:block items-center gap-3 sm:gap-0">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 sm:mb-3">
              <Zap className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-0.5 sm:mb-1 text-sm sm:text-base">Análise Rápida</h4>
              <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 sm:line-clamp-none">
                Análises de probabilidade de êxito baseadas em milhares de precedentes.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 flex sm:block items-center gap-3 sm:gap-0">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 sm:mb-3">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-0.5 sm:mb-1 text-sm sm:text-base">Pesquisa Jurídica</h4>
              <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 sm:line-clamp-none">
                Jurisprudência relevante e precedentes que fortalecem sua argumentação.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 flex sm:block items-center gap-3 sm:gap-0 sm:col-span-2 md:col-span-1">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 sm:mb-3">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-0.5 sm:mb-1 text-sm sm:text-base">Estratégia Processual</h4>
              <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 sm:line-clamp-none">
                Recomendações baseadas no perfil do relator e histórico da vara.
              </p>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <LegalDisclaimer />
      </main>
    </AppShell>
  );
}
