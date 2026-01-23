"use client";

import { useState, useEffect } from "react";
import {
  Menu,
  Scale,
  FileText,
  CheckCircle,
  Clock,
  BarChart3,
  Search,
  Filter,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import HistoricoMetricCard from "@/components/HistoricoMetricCard";
import HistoricoTable from "@/components/HistoricoTable";
import Pagination from "@/components/Pagination";
import LegalDisclaimer from "@/components/LegalDisclaimer";

// Metrics data
const metricsData = [
  {
    icon: FileText,
    iconColor: "#1C398E",
    value: "7",
    label: "Total de Análises",
  },
  {
    icon: CheckCircle,
    iconColor: "#10B981",
    value: "5",
    label: "Concluídas",
  },
  {
    icon: Clock,
    iconColor: "#F59E0B",
    value: "1",
    label: "Em Processamento",
  },
  {
    icon: BarChart3,
    iconColor: "#3B82F6",
    value: "66%",
    label: "Média de Êxito",
  },
];

// Analysis data
const analysesData = [
  {
    id: 1,
    dataHora: { date: "10/12/2024", time: "14:30" },
    processo: { number: "0001234-56.2024", sub: ".8.26.0100" },
    tipo: "Ação de Cobrança",
    tribunal: { badge: "TJSP", background: "#EEF2FF", color: "#1C398E" },
    relator: "Des. José Carlos Ferreira",
    predicao: { value: "72%", trend: "up" as const, color: "#10B981" },
    confianca: { text: "Alta", color: "#10B981" },
    status: {
      badge: "Concluído",
      type: "completed" as const,
      background: "#DCFCE7",
      color: "#16A34A",
    },
  },
  {
    id: 2,
    dataHora: { date: "12/12/2024", time: "09:15" },
    processo: { number: "0007890-12.2024", sub: ".8.19.0001" },
    tipo: "Rescisão Contratual",
    tribunal: { badge: "TJRJ", background: "#F3E8FF", color: "#7C3AED" },
    relator: "Des. Maria Silva Santos",
    predicao: { value: "65%", trend: "down" as const, color: "#EF4444" },
    confianca: { text: "Média-Alta", color: "#84CC16" },
    status: {
      badge: "Processando",
      type: "processing" as const,
      background: "#FEF3C7",
      color: "#D97706",
    },
  },
  {
    id: 3,
    dataHora: { date: "11/12/2024", time: "16:45" },
    processo: { number: "0005678-90.2024", sub: ".8.13.0024" },
    tipo: "Revisional de Aluguel",
    tribunal: { badge: "TJMG", background: "#DCFCE7", color: "#16A34A" },
    relator: "Des. Pedro Oliveira",
    predicao: { value: "58%", trend: "down" as const, color: "#EF4444" },
    confianca: { text: "Média", color: "#F59E0B" },
    status: {
      badge: "Concluído",
      type: "completed" as const,
      background: "#DCFCE7",
      color: "#16A34A",
    },
  },
  {
    id: 4,
    dataHora: { date: "09/12/2024", time: "11:20" },
    processo: { number: "0003456-78.2024", sub: ".8.21.0001" },
    tipo: "Indenização por Danos Morais",
    tribunal: { badge: "TJRS", background: "#FEE2E2", color: "#DC2626" },
    relator: "Des. Ana Paula Costa",
    predicao: { value: "75%", trend: "up" as const, color: "#10B981" },
    confianca: { text: "Alta", color: "#10B981" },
    status: {
      badge: "Concluído",
      type: "completed" as const,
      background: "#DCFCE7",
      color: "#16A34A",
    },
  },
  {
    id: 5,
    dataHora: { date: "08/12/2024", time: "15:00" },
    processo: { number: "0009876-54.2024", sub: ".8.07.0001" },
    tipo: "Execução Fiscal",
    tribunal: { badge: "TJDF", background: "#DBEAFE", color: "#2563EB" },
    relator: "Des. Roberto Machado",
    predicao: { value: "45%", trend: "up" as const, color: "#F59E0B" },
    confianca: { text: "Baixa-Média", color: "#F97316" },
    status: {
      badge: "Concluído",
      type: "completed" as const,
      background: "#DCFCE7",
      color: "#16A34A",
    },
  },
  {
    id: 6,
    dataHora: { date: "07/12/2024", time: "10:30" },
    processo: { number: "0002468-13.2024", sub: ".8.26.0577" },
    tipo: "Ação Trabalhista",
    tribunal: { badge: "TJSP", background: "#EEF2FF", color: "#1C398E" },
    relator: "Des. Luiz Fernando",
    predicao: { value: "82%", trend: "up" as const, color: "#10B981" },
    confianca: { text: "Muito Alta", color: "#16A34A" },
    status: {
      badge: "Concluído",
      type: "completed" as const,
      background: "#DCFCE7",
      color: "#16A34A",
    },
  },
  {
    id: 7,
    dataHora: { date: "13/12/2024", time: "08:00" },
    processo: { number: "0001357-24.2024", sub: ".8.19.0021" },
    tipo: "Divórcio Litigioso",
    tribunal: { badge: "TJRJ", background: "#F3E8FF", color: "#7C3AED" },
    relator: "Des. Carla Mendes",
    predicao: { value: "68%", trend: "down" as const, color: "#F59E0B" },
    confianca: { text: "Média-Alta", color: "#84CC16" },
    status: {
      badge: "Pendente",
      type: "pending" as const,
      background: "#F3F4F6",
      color: "#6B7280",
    },
  },
];

export default function HistoricoPage() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter analyses based on search query
  const filteredAnalyses = analysesData.filter(
    (analysis) =>
      analysis.processo.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      analysis.tipo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      analysis.relator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      analysis.tribunal.badge.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAnalyses.length / itemsPerPage);
  const paginatedAnalyses = filteredAnalyses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleRowClick = (id: number) => {
    console.log("Clicked analysis:", id);
    // Navigate to analysis detail page
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Histórico de Análises
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Todas as análises jurimétricas realizadas
            </p>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {metricsData.map((metric, index) => (
              <HistoricoMetricCard key={index} {...metric} />
            ))}
          </div>

          {/* Search and Filter */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Buscar por processo, tipo ou relator"
                className="w-full h-11 pl-12 pr-4 bg-white border border-gray-200 rounded-[10px] text-sm focus:outline-none focus:border-primary"
                aria-label="Buscar análises"
              />
            </div>
            <button
              className="w-11 h-11 flex items-center justify-center bg-white border border-gray-200 rounded-[10px] text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
              aria-label="Filtrar análises"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* Table */}
          <HistoricoTable
            analyses={paginatedAnalyses}
            onRowClick={handleRowClick}
          />

          {/* Pagination */}
          {filteredAnalyses.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages || 1}
              totalItems={filteredAnalyses.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          )}

          {/* Empty State */}
          {filteredAnalyses.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Nenhuma análise encontrada para &quot;{searchQuery}&quot;
              </p>
            </div>
          )}

          {/* Legal Disclaimer */}
          <LegalDisclaimer />
        </main>
      </div>
    </div>
  );
}
