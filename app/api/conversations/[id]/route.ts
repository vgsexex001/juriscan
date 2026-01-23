import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { updateConversationSchema, validateBody, validateUuid } from "@/lib/validation/schemas";

// GET /api/conversations/[id] - Get conversation with messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate UUID
    const uuidValidation = validateUuid(id);
    if (!uuidValidation.success) {
      return NextResponse.json({ error: uuidValidation.error }, { status: 400 });
    }

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

    // Get messages
    const { data: messagesData } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    return NextResponse.json({
      conversation: conversationData,
      messages: messagesData || [],
    });
  } catch {
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

    // Validate UUID
    const uuidValidation = validateUuid(id);
    if (!uuidValidation.success) {
      return NextResponse.json({ error: uuidValidation.error }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Validate request body
    const validation = await validateBody(request, updateConversationSchema);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { title, status } = validation.data;

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

    return NextResponse.json({ conversation: data });
  } catch {
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

    // Validate UUID
    const uuidValidation = validateUuid(id);
    if (!uuidValidation.success) {
      return NextResponse.json({ error: uuidValidation.error }, { status: 400 });
    }

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
  } catch {
    return NextResponse.json(
      { error: "Erro ao deletar conversa" },
      { status: 500 }
    );
  }
}
