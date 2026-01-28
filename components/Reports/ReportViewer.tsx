"use client";

import { X, Download, Loader2, AlertCircle, CheckCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { Report, PredictiveAnalysisResult, JurimetricsResult, JudgeProfileResult } from "@/types/reports";
import { REPORT_TYPE_INFO } from "@/types/reports";

interface ReportViewerProps {
  report: Report;
  isOpen: boolean;
  onClose: () => void;
  onGenerate: () => Promise<void>;
  isGenerating: boolean;
}

export default function ReportViewer({
  report,
  isOpen,
  onClose,
  onGenerate,
  isGenerating,
}: ReportViewerProps) {
  if (!isOpen) return null;

  const content = report.content as {
    parameters?: Record<string, unknown>;
    result?: PredictiveAnalysisResult | JurimetricsResult | JudgeProfileResult;
    error?: string;
  } | null;

  const result = content?.result;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleExport = () => {
    if (!result) return;

    let textContent = "";
    const divider = "═".repeat(60);
    const subDivider = "─".repeat(60);

    // Header
    textContent += `${divider}\n`;
    textContent += `JURISCAN - RELATÓRIO ESTRATÉGICO\n`;
    textContent += `${divider}\n\n`;
    textContent += `Título: ${report.title}\n`;
    textContent += `Tipo: ${REPORT_TYPE_INFO[report.type]?.label}\n`;
    textContent += `Data de Geração: ${formatDate(report.generated_at || report.created_at)}\n`;
    textContent += `\n${subDivider}\n\n`;

    // Content based on type
    if (report.type === "PREDICTIVE_ANALYSIS") {
      const data = result as PredictiveAnalysisResult;
      textContent += `ANÁLISE PREDITIVA\n\n`;
      textContent += `Probabilidade de Êxito: ${data.probabilidade_exito}%\n`;
      textContent += `Nível de Confiança: ${data.confianca.toUpperCase()}\n\n`;

      textContent += `${subDivider}\n`;
      textContent += `RESUMO EXECUTIVO\n${subDivider}\n`;
      textContent += `${data.resumo_executivo}\n\n`;

      textContent += `${subDivider}\n`;
      textContent += `FATORES FAVORÁVEIS\n${subDivider}\n`;
      data.fatores_favoraveis.forEach((f, i) => {
        textContent += `${i + 1}. ${f}\n`;
      });
      textContent += `\n`;

      textContent += `${subDivider}\n`;
      textContent += `FATORES DESFAVORÁVEIS\n${subDivider}\n`;
      data.fatores_desfavoraveis.forEach((f, i) => {
        textContent += `${i + 1}. ${f}\n`;
      });
      textContent += `\n`;

      textContent += `${subDivider}\n`;
      textContent += `RECOMENDAÇÕES ESTRATÉGICAS\n${subDivider}\n`;
      data.recomendacoes.forEach((r, i) => {
        textContent += `${i + 1}. ${r}\n`;
      });
      textContent += `\n`;

      if (data.jurisprudencia.length > 0) {
        textContent += `${subDivider}\n`;
        textContent += `JURISPRUDÊNCIA RELEVANTE\n${subDivider}\n`;
        data.jurisprudencia.forEach((j) => {
          textContent += `• ${j.tribunal} - ${j.numero}\n`;
          textContent += `  ${j.resumo}\n\n`;
        });
      }

      if (data.riscos.length > 0) {
        textContent += `${subDivider}\n`;
        textContent += `RISCOS IDENTIFICADOS\n${subDivider}\n`;
        data.riscos.forEach((r, i) => {
          textContent += `${i + 1}. ${r}\n`;
        });
      }
    } else if (report.type === "JURIMETRICS") {
      const data = result as JurimetricsResult;
      textContent += `ANÁLISE DE JURIMETRIA\n\n`;
      textContent += `Tribunal: ${data.tribunal}\n`;
      textContent += `Período: ${data.periodo_analise.inicio} a ${data.periodo_analise.fim}\n\n`;

      textContent += `${subDivider}\n`;
      textContent += `ESTATÍSTICAS\n${subDivider}\n`;
      textContent += `Volume Total de Processos: ${data.volume_total.toLocaleString()}\n`;
      textContent += `Taxa de Procedência: ${data.taxa_procedencia}%\n`;
      textContent += `Taxa de Improcedência: ${data.taxa_improcedencia}%\n`;
      textContent += `Taxa Parcial: ${data.taxa_parcial}%\n`;
      textContent += `Taxa de Acordo: ${data.taxa_acordo}%\n`;
      textContent += `Tempo Médio até Sentença: ${data.tempo_medio_sentenca_dias} dias\n`;
      textContent += `Tempo Médio até Trânsito: ${data.tempo_medio_transito_dias} dias\n\n`;

      textContent += `${subDivider}\n`;
      textContent += `COMPARATIVO NACIONAL\n${subDivider}\n`;
      textContent += `${data.comparativo_nacional.acima_media ? "Acima" : "Abaixo"} da média nacional\n`;
      textContent += `Diferença: ${data.comparativo_nacional.diferenca_percentual > 0 ? "+" : ""}${data.comparativo_nacional.diferenca_percentual}%\n\n`;

      textContent += `${subDivider}\n`;
      textContent += `TENDÊNCIAS\n${subDivider}\n`;
      data.tendencias.forEach((t, i) => {
        textContent += `${i + 1}. ${t}\n`;
      });
      textContent += `\n`;

      textContent += `${subDivider}\n`;
      textContent += `INSIGHTS\n${subDivider}\n`;
      data.insights.forEach((ins, i) => {
        textContent += `${i + 1}. ${ins}\n`;
      });
    } else if (report.type === "RELATOR_PROFILE") {
      const data = result as JudgeProfileResult;
      textContent += `PERFIL DO MAGISTRADO\n\n`;
      textContent += `Nome: ${data.magistrado.nome}\n`;
      textContent += `Tribunal: ${data.magistrado.tribunal}\n`;
      textContent += `Vara/Câmara: ${data.magistrado.vara_camara}\n`;
      textContent += `Tempo de Atuação: ${data.magistrado.tempo_atuacao_anos} anos\n\n`;

      textContent += `${subDivider}\n`;
      textContent += `ESTATÍSTICAS\n${subDivider}\n`;
      textContent += `Total de Decisões: ${data.estatisticas.total_decisoes}\n`;
      textContent += `Taxa de Procedência: ${data.estatisticas.taxa_procedencia}%\n`;
      textContent += `Taxa de Reforma: ${data.estatisticas.taxa_reforma}%\n`;
      textContent += `Tempo Médio para Decisão: ${data.estatisticas.tempo_medio_decisao_dias} dias\n\n`;

      textContent += `${subDivider}\n`;
      textContent += `TENDÊNCIA\n${subDivider}\n`;
      const favoreceLabel = data.tendencias.favorece === "autor" ? "Autor" :
                           data.tendencias.favorece === "reu" ? "Réu" : "Neutro";
      textContent += `Favorece: ${favoreceLabel}\n`;
      textContent += `Intensidade: ${data.tendencias.intensidade}\n\n`;

      textContent += `${subDivider}\n`;
      textContent += `TIPOS DE CASO MAIS FREQUENTES\n${subDivider}\n`;
      data.tipos_caso_frequentes.forEach((t) => {
        textContent += `• ${t.tipo}: ${t.percentual}%\n`;
      });
      textContent += `\n`;

      textContent += `${subDivider}\n`;
      textContent += `RECOMENDAÇÕES ESTRATÉGICAS\n${subDivider}\n`;
      data.recomendacoes_estrategicas.forEach((r, i) => {
        textContent += `${i + 1}. ${r}\n`;
      });
    }

    // Footer
    textContent += `\n${divider}\n`;
    textContent += `AVISO LEGAL\n`;
    textContent += `${divider}\n`;
    textContent += `Esta análise é baseada em padrões estatísticos e jurisprudência\n`;
    textContent += `histórica. Não constitui garantia de resultado nem substitui\n`;
    textContent += `parecer jurídico profissional.\n\n`;
    textContent += `Gerado por Juriscan - ${new Date().toLocaleDateString("pt-BR")}\n`;

    // Create and download file
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.title.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderPredictiveResult = (data: PredictiveAnalysisResult) => (
    <div className="space-y-6">
      {/* Probability */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Probabilidade de Êxito</p>
          <p className="text-5xl font-bold text-primary mb-2">{data.probabilidade_exito}%</p>
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
            data.confianca === "alta" ? "bg-green-100 text-green-700" :
            data.confianca === "media" ? "bg-amber-100 text-amber-700" :
            "bg-red-100 text-red-700"
          }`}>
            Confiança {data.confianca}
          </span>
        </div>
      </div>

      {/* Summary */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-2">Resumo Executivo</h4>
        <p className="text-sm text-gray-600 leading-relaxed">{data.resumo_executivo}</p>
      </div>

      {/* Factors */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-xl p-4">
          <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Fatores Favoráveis
          </h4>
          <ul className="space-y-2">
            {data.fatores_favoraveis.map((fator, i) => (
              <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {fator}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-red-50 rounded-xl p-4">
          <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            Fatores Desfavoráveis
          </h4>
          <ul className="space-y-2">
            {data.fatores_desfavoraveis.map((fator, i) => (
              <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {fator}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3">Recomendações Estratégicas</h4>
        <ul className="space-y-2">
          {data.recomendacoes.map((rec, i) => (
            <li key={i} className="text-sm text-gray-600 flex items-start gap-2 bg-gray-50 p-3 rounded-lg">
              <span className="w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              {rec}
            </li>
          ))}
        </ul>
      </div>

      {/* Jurisprudence */}
      {data.jurisprudencia.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">Jurisprudência Relevante</h4>
          <div className="space-y-2">
            {data.jurisprudencia.map((j, i) => (
              <div key={i} className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-800">{j.tribunal} - {j.numero}</p>
                <p className="text-sm text-gray-600 mt-1">{j.resumo}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risks */}
      {data.riscos.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h4 className="font-semibold text-amber-800 mb-2">Riscos Identificados</h4>
          <ul className="space-y-1">
            {data.riscos.map((risco, i) => (
              <li key={i} className="text-sm text-amber-700">• {risco}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderJurimetricsResult = (data: JurimetricsResult) => (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{data.volume_total.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Processos Analisados</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{data.taxa_procedencia}%</p>
          <p className="text-xs text-gray-500">Procedentes</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{data.taxa_improcedencia}%</p>
          <p className="text-xs text-gray-500">Improcedentes</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{data.tempo_medio_sentenca_dias}</p>
          <p className="text-xs text-gray-500">Dias até Sentença</p>
        </div>
      </div>

      {/* Comparativo */}
      <div className={`rounded-xl p-4 flex items-center justify-between ${
        data.comparativo_nacional.acima_media ? "bg-green-50" : "bg-amber-50"
      }`}>
        <div className="flex items-center gap-3">
          {data.comparativo_nacional.acima_media ? (
            <TrendingUp className="w-6 h-6 text-green-600" />
          ) : (
            <TrendingDown className="w-6 h-6 text-amber-600" />
          )}
          <div>
            <p className="font-medium text-gray-800">Comparativo Nacional</p>
            <p className="text-sm text-gray-600">
              {data.comparativo_nacional.acima_media ? "Acima" : "Abaixo"} da média nacional
            </p>
          </div>
        </div>
        <span className={`text-lg font-bold ${
          data.comparativo_nacional.acima_media ? "text-green-600" : "text-amber-600"
        }`}>
          {data.comparativo_nacional.diferenca_percentual > 0 ? "+" : ""}
          {data.comparativo_nacional.diferenca_percentual}%
        </span>
      </div>

      {/* Tendências */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3">Tendências Identificadas</h4>
        <ul className="space-y-2">
          {data.tendencias.map((t, i) => (
            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
              <Minus className="w-4 h-4 text-primary mt-0.5" />
              {t}
            </li>
          ))}
        </ul>
      </div>

      {/* Insights */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3">Insights</h4>
        <div className="grid gap-2">
          {data.insights.map((insight, i) => (
            <div key={i} className="bg-primary/5 p-3 rounded-lg text-sm text-gray-700">
              {insight}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderJudgeProfileResult = (data: JudgeProfileResult) => (
    <div className="space-y-6">
      {/* Magistrado Info */}
      <div className="bg-gray-50 rounded-xl p-5">
        <h4 className="font-semibold text-gray-800 text-lg">{data.magistrado.nome}</h4>
        <p className="text-sm text-gray-600">{data.magistrado.tribunal} - {data.magistrado.vara_camara}</p>
        <p className="text-xs text-gray-500 mt-1">{data.magistrado.tempo_atuacao_anos} anos de atuação</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{data.estatisticas.total_decisoes}</p>
          <p className="text-xs text-gray-500">Total de Decisões</p>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{data.estatisticas.taxa_procedencia}%</p>
          <p className="text-xs text-gray-500">Taxa Procedência</p>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{data.estatisticas.taxa_reforma}%</p>
          <p className="text-xs text-gray-500">Taxa de Reforma</p>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{data.estatisticas.tempo_medio_decisao_dias}</p>
          <p className="text-xs text-gray-500">Dias para Decisão</p>
        </div>
      </div>

      {/* Tendência */}
      <div className={`rounded-xl p-4 ${
        data.tendencias.favorece === "autor" ? "bg-green-50" :
        data.tendencias.favorece === "reu" ? "bg-amber-50" :
        "bg-gray-50"
      }`}>
        <p className="font-medium text-gray-800">Tendência Identificada</p>
        <p className="text-sm text-gray-600">
          Favorece {data.tendencias.favorece === "autor" ? "o Autor" : data.tendencias.favorece === "reu" ? "o Réu" : "Neutro"}
          {" "}com intensidade {data.tendencias.intensidade}
        </p>
      </div>

      {/* Tipos de Caso */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3">Tipos de Caso Mais Frequentes</h4>
        <div className="space-y-2">
          {data.tipos_caso_frequentes.map((tipo, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${tipo.percentual}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-24">{tipo.tipo}</span>
              <span className="text-sm font-medium text-gray-800 w-12 text-right">{tipo.percentual}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recomendações */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3">Recomendações Estratégicas</h4>
        <ul className="space-y-2">
          {data.recomendacoes_estrategicas.map((rec, i) => (
            <li key={i} className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderContent = () => {
    if (report.status === "DRAFT") {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Relatório em Rascunho</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Clique em &quot;Gerar Relatório&quot; para processar os dados e criar o conteúdo com IA.
          </p>
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Gerando...
              </>
            ) : (
              "Gerar Relatório"
            )}
          </button>
        </div>
      );
    }

    if (report.status === "GENERATING") {
      return (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Gerando Relatório...</h3>
          <p className="text-gray-500">Isso pode levar alguns segundos.</p>
        </div>
      );
    }

    if (report.status === "FAILED") {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Falha ao Gerar</h3>
          <p className="text-gray-500 mb-6">{content?.error || "Erro desconhecido"}</p>
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg"
          >
            Tentar Novamente
          </button>
        </div>
      );
    }

    if (report.status === "COMPLETED" && result) {
      switch (report.type) {
        case "PREDICTIVE_ANALYSIS":
          return renderPredictiveResult(result as PredictiveAnalysisResult);
        case "JURIMETRICS":
          return renderJurimetricsResult(result as JurimetricsResult);
        case "RELATOR_PROFILE":
          return renderJudgeProfileResult(result as JudgeProfileResult);
        default:
          return <p className="text-gray-500">Tipo de relatório não suportado para visualização.</p>;
      }
    }

    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{report.title}</h2>
            <p className="text-sm text-gray-500">
              {REPORT_TYPE_INFO[report.type]?.label} • {formatDate(report.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {report.status === "COMPLETED" && (
              <button
                onClick={handleExport}
                className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {renderContent()}
        </div>

        {/* Disclaimer */}
        {report.status === "COMPLETED" && (
          <div className="p-4 bg-gray-50 border-t">
            <p className="text-xs text-gray-500 text-center">
              Esta análise é baseada em padrões estatísticos e jurisprudência histórica.
              Não constitui garantia de resultado nem substitui parecer jurídico profissional.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
