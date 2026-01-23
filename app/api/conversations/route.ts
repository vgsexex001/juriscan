import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createConversationSchema, validateBody } from "@/lib/validation/schemas";

// GET /api/conversations - List user's conversations
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "ACTIVE")
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Erro ao buscar conversas" },
        { status: 500 }
      );
    }

    const conversations = data || [];

    return NextResponse.json({ conversations });
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar conversas" },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Create a new conversation
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Validate request body
    const validation = await validateBody(request, createConversationSchema);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { title } = validation.data;

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        title: title || "Nova conversa",
        status: "ACTIVE",
      } as never)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Erro ao criar conversa" },
        { status: 500 }
      );
    }

    const conversation = data;

    return NextResponse.json({ conversation });
  } catch {
    return NextResponse.json(
      { error: "Erro ao criar conversa" },
      { status: 500 }
    );
  }
}
