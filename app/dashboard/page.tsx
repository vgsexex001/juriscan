"use client";

import {
  Menu,
  Scale,
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
import Sidebar from "@/components/Sidebar";
import LegalDisclaimer from "@/components/LegalDisclaimer";
import { useCredits } from "@/hooks/useCredits";
import { useConversations } from "@/hooks/useConversations";

export default function DashboardPage() {
  const { balance, isLoading: creditsLoading } = useCredits();
  const { conversations, isLoading: convsLoading } = useConversations();

  const activeConversations = conversations.filter(c => c.status === "ACTIVE").length;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="lg:ml-60 min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-[#E5E7EB] flex items-center px-4">
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 ml-2">
            <Scale className="w-6 h-6 text-primary" strokeWidth={1.5} />
            <span className="text-primary text-lg font-semibold">Juriscan</span>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {/* Credits Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Créditos Disponíveis</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {creditsLoading ? "..." : balance}
                  </p>
                </div>
              </div>
              <Link
                href="/configuracoes?tab=plano"
                className="text-sm text-primary hover:text-primary-hover font-medium flex items-center gap-1"
              >
                Comprar mais créditos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Conversations Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Conversas Ativas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {convsLoading ? "..." : activeConversations}
                  </p>
                </div>
              </div>
              <Link
                href="/chat"
                className="text-sm text-primary hover:text-primary-hover font-medium flex items-center gap-1"
              >
                Ver conversas
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* History Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <History className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Histórico</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {convsLoading ? "..." : conversations.length}
                  </p>
                </div>
              </div>
              <Link
                href="/historico"
                className="text-sm text-primary hover:text-primary-hover font-medium flex items-center gap-1"
              >
                Ver histórico
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Quick Start Section */}
          <div className="bg-gradient-to-br from-primary to-blue-700 rounded-xl p-6 mb-8 text-white">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">Comece sua análise jurídica</h2>
                <p className="text-blue-100 mb-4">
                  Faça perguntas sobre casos jurídicos, obtenha análises de probabilidade
                  de êxito e receba orientações estratégicas baseadas em jurisprudência.
                </p>
                <Link
                  href="/chat"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-primary font-medium rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Iniciar Conversa
                </Link>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            O que o Juriscan pode fazer por você
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-3">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Análise Rápida</h4>
              <p className="text-sm text-gray-500">
                Obtenha análises de probabilidade de êxito em segundos, baseadas em milhares de precedentes.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Pesquisa Jurídica</h4>
              <p className="text-sm text-gray-500">
                Encontre jurisprudência relevante e precedentes que fortalecem sua argumentação.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-3">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Estratégia Processual</h4>
              <p className="text-sm text-gray-500">
                Receba recomendações de estratégia baseadas no perfil do relator e histórico da vara.
              </p>
            </div>
          </div>

          {/* Legal Disclaimer */}
          <LegalDisclaimer />
        </main>
      </div>
    </div>
  );
}
