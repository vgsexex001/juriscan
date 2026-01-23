import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface Conversation {
  id: string;
  user_id: string;
  title: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

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
      console.error("Error fetching conversations:", error);
      return NextResponse.json(
        { error: "Erro ao buscar conversas" },
        { status: 500 }
      );
    }

    const conversations = (data || []) as Conversation[];

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Conversations error:", error);
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

    const body = await request.json();
    const { title } = body;

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
      console.error("Error creating conversation:", error);
      return NextResponse.json(
        { error: "Erro ao criar conversa" },
        { status: 500 }
      );
    }

    const conversation = data as Conversation;

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json(
      { error: "Erro ao criar conversa" },
      { status: 500 }
    );
  }
}
