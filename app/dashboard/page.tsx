"use client";

import {
  Menu,
  Scale,
  MessageSquare,
  BarChart3,
  Target,
  Briefcase,
  FileText,
} from "lucide-react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import MetricCard from "@/components/MetricCard";
import MemoryCard from "@/components/MemoryCard";
import PriorityActions from "@/components/PriorityActions";
import TribunalChart from "@/components/TribunalChart";
import QuickActions from "@/components/QuickActions";
import AnalysesTable from "@/components/AnalysesTable";
import LegalDisclaimer from "@/components/LegalDisclaimer";

// Data for metrics cards
const metricsData = [
  {
    icon: BarChart3,
    iconBackground: "#EEF2FF",
    iconColor: "#1C398E",
    value: "156",
    label: "Análises Estratégicas",
    trend: { value: "+12%", direction: "up" as const, color: "#10B981" },
  },
  {
    icon: Target,
    iconBackground: "#FEF3C7",
    iconColor: "#D97706",
    value: "68%",
    label: "Taxa de Êxito Média",
    trend: { value: "+5%", direction: "up" as const, color: "#10B981" },
  },
  {
    icon: Briefcase,
    iconBackground: "#DCFCE7",
    iconColor: "#16A34A",
    value: "42",
    label: "Processos Ativos",
    trend: { value: "-3", direction: "down" as const, color: "#6B7280" },
  },
  {
    icon: FileText,
    iconBackground: "#F3E8FF",
    iconColor: "#9333EA",
    value: "89",
    label: "Relatórios Estratégicos",
    trend: { value: "+18", direction: "up" as const, color: "#10B981" },
  },
];

// Data for memory card
const memoryMetrics = [
  {
    value: "124",
    label: "Casos analisados",
    sublabel: "Base de conhecimento em evolução",
  },
  {
    value: "89%",
    label: "Previsões positivas",
    sublabel: "Variação de +12% em 30 dias",
  },
  {
    value: "342",
    label: "Padrões identificados",
    sublabel: "Insights jurisprudenciais ativos",
  },
];

// Data for priority actions
const priorityActionsData = [
  {
    type: "high" as const,
    badge: { text: "Alta", background: "#FEE2E2", color: "#DC2626" },
    title: "3 processos com alta probabilidade de êxito",
    description: "Priorize recursos para maximizar resultados",
    actionText: "Revisar estratégia →",
    indicatorColor: "#DC2626",
  },
  {
    type: "medium" as const,
    badge: { text: "Alta", background: "#FEE2E2", color: "#DC2626" },
    title: "2 prazos processuais próximos",
    description: "Ação necessária na próxima 48 horas",
    actionText: "Ver detalhes →",
    indicatorColor: "#F59E0B",
  },
  {
    type: "info" as const,
    badge: { text: "Média", background: "#FEF3C7", color: "#D97706" },
    title: "Nova jurisprudência identificada",
    description: "10 precedentes favoráveis no TJSP",
    actionText: "Analisar impacto →",
    indicatorColor: "#3B82F6",
  },
];

// Data for tribunal chart
const tribunalData = [
  { label: "TJSP", value: 85, color: "#1C398E" },
  { label: "TJRJ", value: 72, color: "#1C398E" },
  { label: "TJMG", value: 68, color: "#1C398E" },
  { label: "TJRS", value: 61, color: "#1C398E" },
  { label: "TJPR", value: 54, color: "#1C398E" },
];

// Data for analyses table
const analysesData = [
  {
    processo: { number: "0001234-56.2024", sub: "8.26.0100" },
    tipo: "Ação de Cobrança",
    tribunal: { badge: "TJSP", color: "#1C398E" },
    predicao: { value: "72%", percentage: 72, color: "#10B981" },
    prioridade: { badge: "Alta", background: "#FEE2E2", color: "#DC2626" },
    status: {
      badge: "Concluído",
      background: "#DCFCE7",
      color: "#16A34A",
      type: "completed" as const,
    },
    actionText: "Ver estratégia →",
  },
  {
    processo: { number: "0087688-12.2024", sub: "8.19.0001" },
    tipo: "Rescisão Contratual",
    tribunal: { badge: "TJRJ", color: "#7C3AED" },
    predicao: { value: "61%", percentage: 61, color: "#F59E0B" },
    prioridade: { badge: "Média", background: "#FEF3C7", color: "#D97706" },
    status: {
      badge: "Processando",
      background: "#DBEAFE",
      color: "#2563EB",
      type: "processing" as const,
    },
    actionText: "Ver status →",
  },
  {
    processo: { number: "0056078-90.2024", sub: "8.13.0024" },
    tipo: "Revisional de Aluguel",
    tribunal: { badge: "TJMG", color: "#059669" },
    predicao: { value: "55%", percentage: 55, color: "#F59E0B" },
    prioridade: { badge: "Baixa", background: "#F3F4F6", color: "#6B7280" },
    status: {
      badge: "Concluído",
      background: "#DCFCE7",
      color: "#16A34A",
      type: "completed" as const,
    },
    actionText: "Ver resultado →",
  },
];

export default function DashboardPage() {
  // Modal de termos agora é gerenciado globalmente em lib/providers.tsx (TermsGate)
  // Tour é iniciado automaticamente após aceitar termos

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
                Painel de Decisão Estratégica
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Visão executiva com ações priorizadas
              </p>
            </div>
            <Link
              href="/chat"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Consultar IA
            </Link>
          </div>

          {/* Metrics Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {metricsData.map((metric, index) => (
              <MetricCard key={index} {...metric} />
            ))}
          </div>

          {/* Memory Card */}
          <MemoryCard metrics={memoryMetrics} />

          {/* Priority Actions */}
          <PriorityActions actions={priorityActionsData} />

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <TribunalChart data={tribunalData} />
            <QuickActions />
          </div>

          {/* Recent Analyses Table */}
          <AnalysesTable analyses={analysesData} />

          {/* Legal Disclaimer */}
          <LegalDisclaimer />
        </main>
      </div>
    </div>
  );
}
