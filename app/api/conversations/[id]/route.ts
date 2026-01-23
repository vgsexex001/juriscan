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

interface Message {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  created_at: string;
}

// GET /api/conversations/[id] - Get conversation with messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Get conversation
    const { data: conversationData, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (convError || !conversationData) {
      return NextResponse.json(
        { error: "Conversa não encontrada" },
        { status: 404 }
      );
    }

    const conversation = conversationData as Conversation;

    // Get messages
    const { data: messagesData } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    const messages = (messagesData || []) as Message[];

    return NextResponse.json({ conversation, messages });
  } catch (error) {
    console.error("Get conversation error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar conversa" },
      { status: 500 }
    );
  }
}

// PATCH /api/conversations/[id] - Update conversation (title, archive)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { title, status } = body;

    const updateData: Record<string, string> = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title;
    if (status !== undefined) updateData.status = status;

    const { data, error } = await supabase
      .from("conversations")
      .update(updateData as never)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Erro ao atualizar conversa" },
        { status: 500 }
      );
    }

    const conversation = data as Conversation;

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("Update conversation error:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar conversa" },
      { status: 500 }
    );
  }
}

// DELETE /api/conversations/[id] - Delete conversation (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { error } = await supabase
      .from("conversations")
      .update({ status: "DELETED", updated_at: new Date().toISOString() } as never)
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { error: "Erro ao deletar conversa" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete conversation error:", error);
    return NextResponse.json(
      { error: "Erro ao deletar conversa" },
      { status: 500 }
    );
  }
}
