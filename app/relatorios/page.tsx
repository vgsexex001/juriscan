"use client";

import { useState } from "react";
import {
  Plus,
  FileText,
  Loader2,
  Filter,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import LegalDisclaimer from "@/components/LegalDisclaimer";
import ReportCard from "@/components/Reports/ReportCard";
import CreateReportModal from "@/components/Reports/CreateReportModal";
import ReportViewer from "@/components/Reports/ReportViewer";
import { useReports, useReport } from "@/hooks/useReports";
import { useCredits } from "@/hooks/useCredits";
import type { Report, ReportType, CreateReportInput } from "@/types/reports";

const filterOptions: { value: ReportType | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "PREDICTIVE_ANALYSIS", label: "Análise Preditiva" },
  { value: "JURIMETRICS", label: "Jurimetria" },
  { value: "RELATOR_PROFILE", label: "Perfil de Relator" },
];

export default function RelatoriosPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [typeFilter, setTypeFilter] = useState<ReportType | "all">("all");

  const { balance } = useCredits();
  const {
    reports,
    isLoading,
    createReport,
    isCreating,
    deleteReport,
    isDeleting,
  } = useReports({
    type: typeFilter === "all" ? undefined : typeFilter,
  });

  const {
    report: fullReport,
    generateReport,
    isGenerating,
  } = useReport(selectedReport?.id || null);

  const handleCreateReport = async (input: CreateReportInput) => {
    const report = await createReport(input);
    setIsCreateModalOpen(false);
    setSelectedReport(report);
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
  };

  const handleCloseViewer = () => {
    setSelectedReport(null);
  };

  const handleGenerateReport = async () => {
    if (!selectedReport) return;
    await generateReport();
  };

  const handleDeleteReport = (reportId: string) => {
    if (confirm("Tem certeza que deseja excluir este relatório?")) {
      deleteReport(reportId);
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
      }
    }
  };

  return (
    <AppShell>
      <main className="p-4 sm:p-6">
        {/* Page Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Relatórios Estratégicos
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Gerencie documentos analíticos e relatórios preditivos
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2.5 min-h-[44px] bg-primary hover:bg-primary-hover active:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Relatório</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </div>

        {/* Filters - horizontal scroll on mobile */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500 hidden sm:inline">Filtrar:</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mb-1 scrollbar-hide">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTypeFilter(option.value)}
                className={`px-3.5 py-2 min-h-[40px] text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                  typeFilter === option.value
                    ? "bg-primary text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reports Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Nenhum relatório encontrado
            </h2>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">
              {typeFilter !== "all"
                ? "Não há relatórios deste tipo. Tente outro filtro ou crie um novo."
                : "Comece criando seu primeiro relatório estratégico para análise jurídica."}
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Criar Relatório
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onView={handleViewReport}
                onDelete={handleDeleteReport}
                isDeleting={isDeleting}
              />
            ))}
          </div>
        )}

        {/* Legal Disclaimer */}
        <LegalDisclaimer />
      </main>

      {/* Create Report Modal */}
      <CreateReportModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateReport}
        isCreating={isCreating}
        balance={balance}
      />

      {/* Report Viewer */}
      {selectedReport && (
        <ReportViewer
          report={fullReport || selectedReport}
          isOpen={!!selectedReport}
          onClose={handleCloseViewer}
          onGenerate={handleGenerateReport}
          isGenerating={isGenerating}
        />
      )}
    </AppShell>
  );
}
