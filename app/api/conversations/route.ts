import { apiHandler, successResponse, parseBody } from "@/lib/api";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createConversationSchema } from "@/lib/validation/schemas";

// GET /api/conversations - List user's conversations
export const GET = apiHandler(async (_request, { user }) => {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("user_id", user!.id)
    .eq("status", "ACTIVE")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error("Erro ao buscar conversas");
  }

  const conversations = data || [];

  return successResponse({ conversations });
});

// POST /api/conversations - Create a new conversation
export const POST = apiHandler(async (request, { user }) => {
  const supabase = await createServerSupabaseClient();

  const { title } = await parseBody(request, createConversationSchema);

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      user_id: user!.id,
      title: title || "Nova conversa",
      status: "ACTIVE",
    } as never)
    .select()
    .single();

  if (error) {
    throw new Error("Erro ao criar conversa");
  }

  return successResponse({ conversation: data });
});
