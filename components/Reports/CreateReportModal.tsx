"use client";

import { useState } from "react";
import { X, Brain, BarChart3, Users, ChevronRight, ChevronLeft, Loader2, AlertCircle } from "lucide-react";
import type { ReportType, CreateReportInput } from "@/types/reports";
import { REPORT_COSTS, REPORT_TYPE_INFO } from "@/types/reports";

const reportTypes: ReportType[] = ["PREDICTIVE_ANALYSIS", "JURIMETRICS", "RELATOR_PROFILE"];

const typeIcons: Record<string, typeof Brain> = {
  Brain: Brain,
  BarChart3: BarChart3,
  Users: Users,
};

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: CreateReportInput) => Promise<void>;
  isCreating: boolean;
  balance: number;
}

export default function CreateReportModal({
  isOpen,
  onClose,
  onCreate,
  isCreating,
  balance,
}: CreateReportModalProps) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [title, setTitle] = useState("");
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(1);
    setSelectedType(null);
    setTitle("");
    setParameters({});
    setError(null);
    onClose();
  };

  const handleCreate = async () => {
    if (!selectedType) return;

    const creditsNeeded = REPORT_COSTS[selectedType];
    if (balance < creditsNeeded) {
      setError(`Créditos insuficientes. Você precisa de ${creditsNeeded} créditos.`);
      return;
    }

    try {
      await onCreate({
        type: selectedType,
        title: title || `${REPORT_TYPE_INFO[selectedType].label} - ${new Date().toLocaleDateString("pt-BR")}`,
        parameters: parameters as unknown as CreateReportInput["parameters"],
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar relatório");
    }
  };

  const getParameterFields = (type: ReportType) => {
    switch (type) {
      case "PREDICTIVE_ANALYSIS":
        return [
          { id: "tipo_acao", label: "Tipo de Ação", placeholder: "Ex: Ação de Cobrança, Trabalhista" },
          { id: "tribunal", label: "Tribunal", placeholder: "Ex: TJSP, TRT2, STJ" },
          { id: "argumentos", label: "Argumentos Principais", placeholder: "Descreva os principais argumentos do caso", multiline: true },
          { id: "pedidos", label: "Pedidos", placeholder: "Liste os pedidos da ação", multiline: true },
        ];
      case "JURIMETRICS":
        return [
          { id: "tribunal", label: "Tribunal", placeholder: "Ex: TJSP, TJRJ, TRT" },
          { id: "vara", label: "Vara/Câmara (opcional)", placeholder: "Ex: 1ª Vara Cível" },
          { id: "tipo_acao", label: "Tipo de Ação (opcional)", placeholder: "Ex: Indenização, Trabalhista" },
        ];
      case "RELATOR_PROFILE":
        return [
          { id: "nome_juiz", label: "Nome do Magistrado", placeholder: "Nome completo do juiz/desembargador" },
          { id: "tribunal", label: "Tribunal", placeholder: "Ex: TJSP, TRT2" },
        ];
      default:
        return [];
    }
  };

  const canProceed = () => {
    if (step === 1) return !!selectedType;
    if (step === 2) {
      const fields = getParameterFields(selectedType!);
      const required = fields.filter(f => !f.id.includes("opcional"));
      return required.every(f => parameters[f.id]?.trim());
    }
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Novo Relatório</h2>
            <p className="text-sm text-gray-500">Passo {step} de 3</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Step 1: Select Type */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">Selecione o tipo de relatório:</p>
              {reportTypes.map((type) => {
                const info = REPORT_TYPE_INFO[type];
                const Icon = typeIcons[info.icon] || Brain;
                const cost = REPORT_COSTS[type];
                const canAfford = balance >= cost;

                return (
                  <button
                    key={type}
                    onClick={() => canAfford && setSelectedType(type)}
                    disabled={!canAfford}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedType === type
                        ? "border-primary bg-primary/5"
                        : canAfford
                        ? "border-gray-200 hover:border-gray-300"
                        : "border-gray-100 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-${info.color}-100 flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 text-${info.color}-600`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{info.label}</p>
                          <p className="text-sm text-gray-500">{info.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${canAfford ? "text-gray-800" : "text-red-600"}`}>
                          {cost} créditos
                        </p>
                        {!canAfford && (
                          <p className="text-xs text-red-500">Saldo insuficiente</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 2: Parameters */}
          {step === 2 && selectedType && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Configure os parâmetros para {REPORT_TYPE_INFO[selectedType].label}:
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título do Relatório (opcional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`${REPORT_TYPE_INFO[selectedType].label} - ${new Date().toLocaleDateString("pt-BR")}`}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                />
              </div>

              {getParameterFields(selectedType).map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  {field.multiline ? (
                    <textarea
                      value={parameters[field.id] || ""}
                      onChange={(e) => setParameters({ ...parameters, [field.id]: e.target.value })}
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary resize-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={parameters[field.id] || ""}
                      onChange={(e) => setParameters({ ...parameters, [field.id]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && selectedType && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">Revise as informações:</p>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Tipo:</span>
                  <span className="text-sm font-medium text-gray-800">
                    {REPORT_TYPE_INFO[selectedType].label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Título:</span>
                  <span className="text-sm font-medium text-gray-800">
                    {title || `${REPORT_TYPE_INFO[selectedType].label} - ${new Date().toLocaleDateString("pt-BR")}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Custo:</span>
                  <span className="text-sm font-semibold text-primary">
                    {REPORT_COSTS[selectedType]} créditos
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Seu saldo:</span>
                  <span className="text-sm font-medium text-gray-800">{balance} créditos</span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800">
                  O relatório será criado como rascunho. Você poderá revisar os parâmetros
                  antes de gerar o conteúdo com IA, que consumirá os créditos.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t bg-gray-50">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : handleClose()}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
          >
            <ChevronLeft className="w-4 h-4" />
            {step > 1 ? "Voltar" : "Cancelar"}
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-1 px-5 py-2 bg-primary hover:bg-primary-hover disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Próximo
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary-hover disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Relatório"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
