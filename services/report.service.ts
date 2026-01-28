import type { SupabaseClient } from "@supabase/supabase-js";
import { getOpenAI, AI_CONFIG } from "@/lib/ai/config";
import {
  buildPredictivePrompt,
  buildJurimetricsPrompt,
  buildJudgeProfilePrompt,
} from "@/lib/ai/report-prompts";
import type {
  Report,
  ReportType,
  CreateReportInput,
  PredictiveAnalysisParams,
  PredictiveAnalysisResult,
  JurimetricsParams,
  JurimetricsResult,
  JudgeProfileParams,
  JudgeProfileResult,
  REPORT_COSTS,
} from "@/types/reports";
import { deductCredits } from "./credit.service";

// Re-export costs for use in other files
export { REPORT_COSTS } from "@/types/reports";

interface ReportRow {
  id: string;
  user_id: string;
  analysis_id: string | null;
  title: string;
  type: ReportType;
  version: string;
  content: Record<string, unknown> | null;
  file_url: string | null;
  file_size: number | null;
  page_count: number | null;
  credits_used: number;
  status: string;
  created_at: string;
  updated_at: string;
  generated_at: string | null;
}

/**
 * List all reports for a user
 */
export async function listReports(
  supabase: SupabaseClient,
  userId: string,
  options?: {
    type?: ReportType;
    status?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ data: Report[]; error: string | null }> {
  let query = supabase
    .from("reports")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (options?.type) {
    query = query.eq("type", options.type);
  }

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: (data || []) as Report[], error: null };
}

/**
 * Get a single report by ID
 */
export async function getReport(
  supabase: SupabaseClient,
  userId: string,
  reportId: string
): Promise<{ data: Report | null; error: string | null }> {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("id", reportId)
    .eq("user_id", userId)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as Report, error: null };
}

/**
 * Create a new report (draft)
 */
export async function createReport(
  supabase: SupabaseClient,
  userId: string,
  input: CreateReportInput
): Promise<{ data: Report | null; error: string | null }> {
  const { data, error } = await supabase
    .from("reports")
    .insert({
      user_id: userId,
      title: input.title,
      type: input.type,
      status: "DRAFT",
      content: { parameters: input.parameters },
      credits_used: 0,
    } as never)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as Report, error: null };
}

/**
 * Delete a report
 */
export async function deleteReport(
  supabase: SupabaseClient,
  userId: string,
  reportId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("reports")
    .delete()
    .eq("id", reportId)
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Generate report content using AI
 */
export async function generateReport(
  supabase: SupabaseClient,
  userId: string,
  reportId: string,
  creditsToDeduct: number
): Promise<{ data: Report | null; error: string | null }> {
  // Get the report
  const { data: report, error: fetchError } = await getReport(supabase, userId, reportId);

  if (fetchError || !report) {
    return { data: null, error: fetchError || "Relatório não encontrado" };
  }

  if (report.status !== "DRAFT") {
    return { data: null, error: "Relatório já foi gerado" };
  }

  // Deduct credits first
  const creditResult = await deductCredits(
    supabase,
    userId,
    creditsToDeduct,
    `Geração de relatório: ${report.title}`
  );

  if (!creditResult.success) {
    return { data: null, error: creditResult.error || "Erro ao deduzir créditos" };
  }

  // Update status to generating
  await supabase
    .from("reports")
    .update({ status: "GENERATING" } as never)
    .eq("id", reportId);

  const startTime = Date.now();

  try {
    // Generate content based on type
    const parameters = (report.content as { parameters?: Record<string, unknown> })?.parameters || {};
    let result: unknown;
    let prompt: string;

    switch (report.type) {
      case "PREDICTIVE_ANALYSIS":
        prompt = buildPredictivePrompt(parameters as unknown as PredictiveAnalysisParams);
        result = await generateWithAI<PredictiveAnalysisResult>(prompt);
        break;

      case "JURIMETRICS":
        prompt = buildJurimetricsPrompt(parameters as unknown as JurimetricsParams);
        result = await generateWithAI<JurimetricsResult>(prompt);
        break;

      case "RELATOR_PROFILE":
        prompt = buildJudgeProfilePrompt(parameters as unknown as JudgeProfileParams);
        result = await generateWithAI<JudgeProfileResult>(prompt);
        break;

      default:
        return { data: null, error: "Tipo de relatório não suportado" };
    }

    const processingTime = Date.now() - startTime;

    // Update report with generated content
    const { data: updatedReport, error: updateError } = await supabase
      .from("reports")
      .update({
        status: "COMPLETED",
        content: {
          parameters,
          result,
          generated_at: new Date().toISOString(),
          processing_time_ms: processingTime,
        },
        credits_used: creditsToDeduct,
        generated_at: new Date().toISOString(),
      } as never)
      .eq("id", reportId)
      .select()
      .single();

    if (updateError) {
      return { data: null, error: updateError.message };
    }

    return { data: updatedReport as Report, error: null };
  } catch (error) {
    // Update status to failed
    await supabase
      .from("reports")
      .update({
        status: "FAILED",
        content: {
          ...(report.content as object),
          error: error instanceof Error ? error.message : "Erro desconhecido",
        },
      } as never)
      .eq("id", reportId);

    return {
      data: null,
      error: error instanceof Error ? error.message : "Erro ao gerar relatório",
    };
  }
}

/**
 * Generate content using OpenAI
 */
async function generateWithAI<T>(prompt: string): Promise<T> {
  const response = await getOpenAI().chat.completions.create({
    model: AI_CONFIG.model,
    max_tokens: 2000,
    temperature: 0.3, // Lower temperature for more consistent output
    messages: [
      {
        role: "system",
        content:
          "Você é um analista jurídico especializado. Responda APENAS com JSON válido, sem markdown ou texto adicional.",
      },
      { role: "user", content: prompt },
    ],
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("Resposta vazia da IA");
  }

  // Parse JSON response
  try {
    // Remove markdown code blocks if present
    const cleanContent = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    return JSON.parse(cleanContent) as T;
  } catch {
    throw new Error("Erro ao processar resposta da IA");
  }
}

/**
 * Get report statistics for a user
 */
export async function getReportStats(
  supabase: SupabaseClient,
  userId: string
): Promise<{
  total: number;
  by_type: Record<ReportType, number>;
  by_status: Record<string, number>;
  credits_used: number;
}> {
  const { data } = await supabase
    .from("reports")
    .select("type, status, credits_used")
    .eq("user_id", userId);

  const reports = (data || []) as ReportRow[];

  const stats = {
    total: reports.length,
    by_type: {} as Record<ReportType, number>,
    by_status: {} as Record<string, number>,
    credits_used: 0,
  };

  for (const report of reports) {
    // Count by type
    stats.by_type[report.type as ReportType] = (stats.by_type[report.type as ReportType] || 0) + 1;

    // Count by status
    stats.by_status[report.status] = (stats.by_status[report.status] || 0) + 1;

    // Sum credits
    stats.credits_used += report.credits_used || 0;
  }

  return stats;
}
