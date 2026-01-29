/**
 * Generate Jurimetrics Report Use Case
 * Gera relatórios de jurimetria com insights de IA
 */

import { getOpenAI, AI_CONFIG } from '@/lib/ai/config';
import { getLegalDataGateway } from '@/src/infrastructure/gateways/LegalDataGateway';
import {
  createReportGenerator,
  ReportData,
  ReportStyle,
} from '@/src/infrastructure/adapters/export/ReportGeneratorAdapter';
import { JurimetricsData } from '@/src/domain/entities';

/**
 * Parâmetros de entrada
 */
export interface GenerateJurimetricsReportInput {
  /** Tribunal (ex: TJSP, TRT2) */
  tribunal: string;
  /** Período de análise */
  periodo: {
    inicio: Date;
    fim: Date;
  };
  /** Filtros opcionais */
  filtros?: {
    classe?: string;
    assunto?: string;
    materia?: string;
  };
  /** Estilo customizado */
  style?: Partial<ReportStyle>;
  /** ID do usuário que solicitou */
  userId?: string;
}

/**
 * Resultado do use case
 */
export interface GenerateJurimetricsReportOutput {
  success: boolean;
  report?: ReportData;
  error?: string;
  metadata: {
    generated_at: string;
    processing_time_ms: number;
    data_source: string;
    ai_model: string;
  };
}

/**
 * Insights gerados pela IA
 */
interface AIInsights {
  sumario: string;
  destaques: string[];
  recomendacoes: string[];
}

/**
 * Generate Jurimetrics Report Use Case
 */
export class GenerateJurimetricsReportUseCase {
  /**
   * Executa o use case
   */
  async execute(input: GenerateJurimetricsReportInput): Promise<GenerateJurimetricsReportOutput> {
    const startTime = Date.now();

    try {
      console.log('📊 [GenerateJurimetricsReport] Iniciando geração de relatório:', {
        tribunal: input.tribunal,
        periodo: input.periodo,
        filtros: input.filtros,
      });

      // 1. Buscar dados de jurimetria
      const gateway = getLegalDataGateway();
      const jurimetrics = await gateway.getJurimetrics({
        tribunal: input.tribunal,
        classe: input.filtros?.classe,
        assunto: input.filtros?.assunto,
        materia: input.filtros?.materia,
        periodo: input.periodo,
      });

      console.log('✅ [GenerateJurimetricsReport] Dados obtidos:', {
        total_processos: jurimetrics.metricas.total_processos,
      });

      // 2. Gerar insights com IA
      const insights = await this.generateInsights(jurimetrics);

      console.log('🤖 [GenerateJurimetricsReport] Insights gerados pela IA');

      // 3. Criar relatório estruturado
      const reportGenerator = createReportGenerator(input.style);
      const report = reportGenerator.generateJurimetricsReport(jurimetrics, insights);

      const processingTime = Date.now() - startTime;
      console.log(`✅ [GenerateJurimetricsReport] Relatório gerado em ${processingTime}ms`);

      return {
        success: true,
        report,
        metadata: {
          generated_at: new Date().toISOString(),
          processing_time_ms: processingTime,
          data_source: gateway.getActiveProviders().join(', '),
          ai_model: AI_CONFIG.model,
        },
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error('❌ [GenerateJurimetricsReport] Erro:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        metadata: {
          generated_at: new Date().toISOString(),
          processing_time_ms: processingTime,
          data_source: 'none',
          ai_model: AI_CONFIG.model,
        },
      };
    }
  }

  /**
   * Gera insights usando IA
   */
  private async generateInsights(data: JurimetricsData): Promise<AIInsights> {
    try {
      const openai = getOpenAI();

      // Preparar contexto para a IA
      const context = this.buildAnalysisContext(data);

      const response = await openai.chat.completions.create({
        model: AI_CONFIG.model,
        temperature: 0.7,
        max_tokens: 2000,
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em jurimetria e análise estatística jurídica.
Sua tarefa é analisar dados jurimétricos e gerar insights acionáveis para advogados.

REGRAS:
- Seja objetivo e direto
- Use linguagem profissional mas acessível
- Baseie-se nos dados fornecidos
- Destaque padrões e anomalias
- Forneça recomendações práticas

FORMATO DE RESPOSTA (JSON):
{
  "sumario": "Resumo executivo em 2-3 parágrafos",
  "destaques": ["destaque 1", "destaque 2", "destaque 3", "destaque 4", "destaque 5"],
  "recomendacoes": ["recomendação 1", "recomendação 2", "recomendação 3"]
}`,
          },
          {
            role: 'user',
            content: `Analise os seguintes dados jurimétricos e gere insights:

${context}

Responda APENAS com o JSON, sem markdown ou explicações adicionais.`,
          },
        ],
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Resposta vazia da IA');
      }

      // Parse da resposta
      const parsed = JSON.parse(content) as AIInsights;

      // Validar estrutura
      if (!parsed.sumario || !Array.isArray(parsed.destaques) || !Array.isArray(parsed.recomendacoes)) {
        throw new Error('Resposta da IA com estrutura inválida');
      }

      return parsed;
    } catch (error) {
      console.warn('⚠️ [GenerateJurimetricsReport] Erro ao gerar insights com IA, usando fallback:', error);

      // Fallback: gerar insights básicos
      return this.generateFallbackInsights(data);
    }
  }

  /**
   * Constrói contexto para análise da IA
   */
  private buildAnalysisContext(data: JurimetricsData): string {
    const { metricas, periodo, escopo } = data;

    let context = `## DADOS JURIMÉTRICOS

**Período:** ${periodo.inicio.toLocaleDateString('pt-BR')} a ${periodo.fim.toLocaleDateString('pt-BR')}
**Escopo:** ${[escopo.tribunal, escopo.tipo_acao, escopo.materia].filter(Boolean).join(' | ') || 'Geral'}

### VOLUME
- Total de processos: ${metricas.total_processos.toLocaleString('pt-BR')}

### TAXAS DE RESULTADO
- Procedência: ${(metricas.taxas.procedencia * 100).toFixed(1)}%
- Improcedência: ${(metricas.taxas.improcedencia * 100).toFixed(1)}%
- Parcialmente Procedente: ${(metricas.taxas.parcial_procedencia * 100).toFixed(1)}%
- Acordo: ${(metricas.taxas.acordo * 100).toFixed(1)}%
- Extinção sem mérito: ${(metricas.taxas.extincao_sem_merito * 100).toFixed(1)}%

### TEMPOS MÉDIOS (em dias)
- Distribuição à Citação: ${metricas.tempos.distribuicao_citacao_dias}
- Citação à Sentença: ${metricas.tempos.citacao_sentenca_dias}
- Distribuição à Sentença: ${metricas.tempos.distribuicao_sentenca_dias}
- Sentença ao Acórdão: ${metricas.tempos.sentenca_acordao_dias}
- Total de Tramitação: ${metricas.tempos.total_tramitacao_dias}

### VALORES
- Média de Condenação: R$ ${metricas.valores.media_condenacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Mediana: R$ ${metricas.valores.mediana_condenacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Média Valor da Causa: R$ ${metricas.valores.media_valor_causa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Total de Condenações: ${metricas.valores.total_condenacoes.toLocaleString('pt-BR')}
`;

    // Adicionar distribuição por classe se disponível
    if (metricas.distribuicao.por_classe.length > 0) {
      context += `\n### CLASSES MAIS FREQUENTES\n`;
      metricas.distribuicao.por_classe.slice(0, 5).forEach((c, i) => {
        context += `${i + 1}. ${c.classe}: ${c.quantidade} (${(c.percentual * 100).toFixed(1)}%)\n`;
      });
    }

    // Adicionar volume mensal se disponível
    if (metricas.volume.por_mes.length > 0) {
      context += `\n### EVOLUÇÃO MENSAL\n`;
      metricas.volume.por_mes.slice(-6).forEach((m) => {
        context += `- ${m.mes}: ${m.quantidade} processos\n`;
      });
    }

    // Adicionar tendências se disponíveis
    if (data.tendencias && data.tendencias.length > 0) {
      context += `\n### TENDÊNCIAS IDENTIFICADAS\n`;
      data.tendencias.slice(0, 5).forEach((t) => {
        context += `- ${t.metrica}: ${t.tipo.toUpperCase()} (${t.variacao_percentual > 0 ? '+' : ''}${t.variacao_percentual.toFixed(1)}%)\n`;
      });
    }

    return context;
  }

  /**
   * Gera insights básicos sem IA (fallback)
   */
  private generateFallbackInsights(data: JurimetricsData): AIInsights {
    const { metricas, escopo } = data;
    const taxaProcedencia = metricas.taxas.procedencia * 100;
    const taxaAcordo = metricas.taxas.acordo * 100;

    // Sumário baseado nos dados
    let sumario = `Análise de ${metricas.total_processos.toLocaleString('pt-BR')} processos `;
    sumario += escopo.tribunal ? `no ${escopo.tribunal}` : 'em diversos tribunais';
    sumario += `. A taxa de procedência é de ${taxaProcedencia.toFixed(1)}%`;

    if (taxaProcedencia > 60) {
      sumario += ', indicando um cenário favorável para ações similares. ';
    } else if (taxaProcedencia < 40) {
      sumario += ', sugerindo cautela na propositura de ações similares. ';
    } else {
      sumario += ', indicando um cenário equilibrado. ';
    }

    sumario += `O tempo médio até sentença é de ${metricas.tempos.distribuicao_sentenca_dias} dias.`;

    // Destaques
    const destaques: string[] = [];

    destaques.push(
      `Taxa de procedência de ${taxaProcedencia.toFixed(1)}% para o tipo de ação analisado`
    );

    if (metricas.valores.media_condenacao > 0) {
      destaques.push(
        `Valor médio de condenação: R$ ${metricas.valores.media_condenacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      );
    }

    destaques.push(
      `Tempo médio de tramitação: ${metricas.tempos.distribuicao_sentenca_dias} dias até sentença`
    );

    if (taxaAcordo > 15) {
      destaques.push(
        `Taxa de acordo de ${taxaAcordo.toFixed(1)}%, indicando abertura para conciliação`
      );
    }

    if (metricas.distribuicao.por_classe.length > 0) {
      const topClasse = metricas.distribuicao.por_classe[0];
      destaques.push(
        `Classe mais frequente: ${topClasse.classe} (${(topClasse.percentual * 100).toFixed(1)}%)`
      );
    }

    // Recomendações
    const recomendacoes: string[] = [];

    if (taxaProcedencia > 60) {
      recomendacoes.push('Cenário favorável para propositura de ações similares');
    } else if (taxaProcedencia < 40) {
      recomendacoes.push('Avaliar criteriosamente a viabilidade antes de ajuizar');
    }

    if (taxaAcordo > 20) {
      recomendacoes.push('Considerar tentativa de acordo como estratégia inicial');
    }

    if (metricas.tempos.distribuicao_sentenca_dias > 365) {
      recomendacoes.push('Preparar cliente para processo de longa duração');
    }

    recomendacoes.push('Documentar adequadamente todos os fatos e provas antes do ajuizamento');

    return {
      sumario,
      destaques,
      recomendacoes,
    };
  }
}

/**
 * Factory function
 */
export function createGenerateJurimetricsReportUseCase(): GenerateJurimetricsReportUseCase {
  return new GenerateJurimetricsReportUseCase();
}
