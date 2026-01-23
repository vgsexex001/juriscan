"use client";

import { useState, useEffect } from "react";
import {
  Menu,
  Scale,
  FileText,
  Brain,
  HardDrive,
  Search,
  Plus,
  User,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import HistoricoMetricCard from "@/components/HistoricoMetricCard";
import ReportCard from "@/components/ReportCard";
import TemplateCard from "@/components/TemplateCard";
import LegalDisclaimer from "@/components/LegalDisclaimer";

// Metrics data
const metricsData = [
  {
    icon: FileText,
    iconColor: "#1C398E",
    value: "5",
    label: "Total de Relatórios",
  },
  {
    icon: Brain,
    iconColor: "#8B5CF6",
    value: "2",
    label: "Análises Preditivas",
  },
  {
    icon: Scale,
    iconColor: "#3B82F6",
    value: "1",
    label: "Jurimetria",
  },
  {
    icon: HardDrive,
    iconColor: "#10B981",
    value: "14.3 MB",
    label: "Uso Total",
  },
];

// Reports data
const reportsData = [
  {
    id: 1,
    title: "Análise Estratégica Completa - Ação de Cobrança",
    badges: [
      { text: "Análise Preditiva", background: "#EEF2FF", color: "#1C398E" },
      { text: "v2.1", background: "#F3F4F6", color: "#6B7280" },
    ],
    origin: {
      icon: "MessageSquare",
      label: "Origem da Análise",
      value: "Análise IA - Chat Jurídico",
      subValue: "ID: ANL-2024-00124",
    },
    details: [
      { icon: "FileText", label: "Processo: 0001234-56.2024.8.26.0100" },
      { icon: "Building", badge: { text: "TJSP", background: "#EEF2FF", color: "#1C398E" } },
      { icon: "Calendar", value: "10/12/2024, 14:25" },
      { icon: "FileText", value: "15 páginas" },
      { icon: "HardDrive", value: "2.4 MB" },
      { icon: "TrendingUp", label: "Predição:", value: "72%", color: "#10B981" },
    ],
    downloadColor: "#1C398E",
  },
  {
    id: 2,
    title: "Jurimetria Tribunal - TJSP 2024",
    badges: [
      { text: "Jurimetria", background: "#DBEAFE", color: "#2563EB" },
      { text: "v1.0", background: "#F3F4F6", color: "#6B7280" },
    ],
    origin: {
      icon: "FileText",
      label: "Origem da Análise",
      value: "Análise Manual",
      subValue: "ID: JMT-2024-00089",
    },
    details: [
      { icon: "Layers", label: "Processo: Múltiplos processos" },
      { icon: "Building", badge: { text: "TJSP", background: "#EEF2FF", color: "#1C398E" } },
      { icon: "Calendar", value: "08/12/2024, 18:20" },
      { icon: "FileText", value: "34 páginas" },
      { icon: "HardDrive", value: "5.8 MB" },
    ],
    downloadColor: "#1C398E",
  },
  {
    id: 3,
    title: "Relatório Executivo - Revisional de Aluguel",
    badges: [
      { text: "Executivo", background: "#FEF3C7", color: "#D97706" },
      { text: "v1.2", background: "#F3F4F6", color: "#6B7280" },
    ],
    origin: {
      icon: "Upload",
      label: "Origem da Análise",
      value: "Upload de Documentos",
      subValue: "ID: ANL-2024-00156",
    },
    details: [
      { icon: "FileText", label: "Processo: 0005678-90.2024.8.13.0024" },
      { icon: "Building", badge: { text: "TJMG", background: "#DCFCE7", color: "#16A34A" } },
      { icon: "Calendar", value: "11/12/2024, 17:50" },
      { icon: "FileText", value: "5 páginas" },
      { icon: "HardDrive", value: "1.2 MB" },
      { icon: "TrendingDown", label: "Predição:", value: "58%", color: "#F59E0B" },
    ],
    downloadColor: "#F59E0B",
  },
  {
    id: 4,
    title: "Análise de Relator - Des. José Carlos",
    badges: [
      { text: "Relator", background: "#F3E8FF", color: "#7C3AED" },
      { text: "v1.0", background: "#F3F4F6", color: "#6B7280" },
    ],
    origin: {
      icon: "Search",
      label: "Origem da Análise",
      value: "Investigação Jurimetrica",
      subValue: "ID: REL-2024-00034",
    },
    details: [
      { icon: "FileText", label: "Processo: Análise Avulsa" },
      { icon: "Building", badge: { text: "TJSP", background: "#EEF2FF", color: "#1C398E" } },
      { icon: "Calendar", value: "08/12/2024, 10:15" },
      { icon: "FileText", value: "22 páginas" },
      { icon: "HardDrive", value: "3.1 MB" },
    ],
    downloadColor: "#7C3AED",
  },
  {
    id: 5,
    title: "Predição Estratégica Detalhada - Indenização",
    badges: [
      { text: "Análise Preditiva", background: "#EEF2FF", color: "#1C398E" },
      { text: "v1.0", background: "#F3F4F6", color: "#6B7280" },
    ],
    origin: {
      icon: "MessageSquare",
      label: "Origem da Análise",
      value: "Análise IA - Chat Jurídico",
      subValue: "ID: ANL-2024-00148",
    },
    details: [
      { icon: "FileText", label: "Processo: 0003456-78.2024.8.21.0001" },
      { icon: "Building", badge: { text: "TJRS", background: "#FEE2E2", color: "#DC2626" } },
      { icon: "Calendar", value: "09/12/2024, 11:35" },
      { icon: "FileText", value: "8 páginas" },
      { icon: "HardDrive", value: "1.8 MB" },
      { icon: "TrendingUp", label: "Predição:", value: "75%", color: "#10B981" },
    ],
    downloadColor: "#1C398E",
  },
];

// Templates data
const templatesData = [
  {
    icon: Brain,
    iconBackground: "#EEF2FF",
    iconColor: "#1C398E",
    title: "Análise Preditiva Estratégica",
    description: "Análises, previsões e perspectivas com pontos-chave",
  },
  {
    icon: Scale,
    iconBackground: "#DBEAFE",
    iconColor: "#2563EB",
    title: "Relatório Jurimetrico",
    description: "Estatísticas e padrões por tribunal",
  },
  {
    icon: User,
    iconBackground: "#F3E8FF",
    iconColor: "#7C3AED",
    title: "Relator",
    description: "Perfil de decisões",
  },
];

export default function RelatoriosPage() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter reports based on search query
  const filteredReports = reportsData.filter(
    (report) =>
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.badges.some((badge) =>
        badge.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const handleDownload = (id: number) => {
    console.log("Download report:", id);
  };

  const handleView = (id: number) => {
    console.log("View report:", id);
  };

  const handleShare = (id: number) => {
    console.log("Share report:", id);
  };

  const handleNewVersion = (id: number) => {
    console.log("Generate new version:", id);
  };

  const handleTemplateClick = (title: string) => {
    console.log("Selected template:", title);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="lg:ml-60 min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center px-4">
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 ml-2">
            <Scale className="w-6 h-6 text-primary" strokeWidth={1.5} />
            <span className="text-primary text-lg font-semibold">Juriscan</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {/* Page Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Relatórios Estratégicos
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Gerencie documentos analíticos e relatórios preditivos
              </p>
            </div>
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              Novo Relatório
            </button>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {metricsData.map((metric, index) => (
              <HistoricoMetricCard key={index} {...metric} />
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar relatórios..."
              className="w-full h-11 pl-12 pr-4 bg-white border border-gray-200 rounded-[10px] text-sm focus:outline-none focus:border-primary"
              aria-label="Buscar relatórios"
            />
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onDownload={handleDownload}
                onView={handleView}
                onShare={handleShare}
                onNewVersion={handleNewVersion}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredReports.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center mb-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Nenhum relatório encontrado para &quot;{searchQuery}&quot;
              </p>
            </div>
          )}

          {/* Templates Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Modelos de Relatório Estratégico
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {templatesData.map((template, index) => (
                <TemplateCard
                  key={index}
                  {...template}
                  onClick={() => handleTemplateClick(template.title)}
                />
              ))}
            </div>
          </div>

          {/* Legal Disclaimer */}
          <LegalDisclaimer />
        </main>
      </div>
    </div>
  );
}
