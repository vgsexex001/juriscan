import { apiHandler, successResponse, parseBody } from "@/lib/api";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { z } from "zod";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

// Schema for profile update
const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  oab: z.string().max(20).optional(),
  phone: z.string().max(20).optional(),
  law_firm: z.string().max(100).optional(),
  practice_areas: z.array(z.string()).optional(),
  avatar_url: z.string().url().max(500).optional().nullable(),
});

// GET /api/profile - Get user profile
export const GET = apiHandler(async (_request, { user }) => {
  const supabase = await createServerSupabaseClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  if (error) {
    throw new Error("Erro ao buscar perfil");
  }

  return successResponse({ profile });
});

// PATCH /api/profile - Update user profile
export const PATCH = apiHandler(async (request, { user }) => {
  const supabase = await createServerSupabaseClient();

  const data = await parseBody(request, updateProfileSchema);

  // Build update object with only provided fields
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (data.name !== undefined) updateData.name = data.name;
  if (data.oab !== undefined) updateData.oab = data.oab;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.law_firm !== undefined) updateData.law_firm = data.law_firm;
  if (data.practice_areas !== undefined) updateData.practice_areas = data.practice_areas;
  if (data.avatar_url !== undefined) updateData.avatar_url = data.avatar_url;

  const { data: profile, error } = await supabase
    .from("profiles")
    .update(updateData as never)
    .eq("id", user!.id)
    .select()
    .single();

  if (error) {
    throw new Error("Erro ao atualizar perfil");
  }

  return successResponse({ profile });
});
