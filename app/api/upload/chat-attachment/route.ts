import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  CHAT_ATTACHMENT_LIMITS,
  getAttachmentType,
  type ChatAttachment,
  type AttachmentMetadata,
} from "@/types/chat";

// POST /api/upload/chat-attachment - Upload de arquivo para o chat
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Verificar autenticação
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Processar FormData
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    const attachmentType = getAttachmentType(file.type);
    if (!attachmentType) {
      return NextResponse.json(
        { success: false, error: `Tipo de arquivo não suportado: ${file.type}` },
        { status: 400 }
      );
    }

    // Validar tamanho
    const maxSize =
      attachmentType === "image"
        ? CHAT_ATTACHMENT_LIMITS.maxImageSize
        : CHAT_ATTACHMENT_LIMITS.maxFileSize;

    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / 1024 / 1024);
      return NextResponse.json(
        { success: false, error: `Arquivo muito grande. Máximo: ${maxSizeMB}MB` },
        { status: 400 }
      );
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split(".").pop() || "";
    const baseName = file.name.replace(/\.[^/.]+$/, "").substring(0, 50);
    const safeName = baseName.replace(/[^a-zA-Z0-9-_]/g, "_");
    const fileName = `${safeName}_${timestamp}_${random}.${extension}`;
    const filePath = `${user.id}/${fileName}`;

    // Fazer upload para o Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("chat-attachments")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { success: false, error: "Erro ao fazer upload do arquivo" },
        { status: 500 }
      );
    }

    // Gerar URL assinada (7 dias)
    const { data: urlData } = await supabase.storage
      .from("chat-attachments")
      .createSignedUrl(uploadData.path, 60 * 60 * 24 * 7);

    if (!urlData?.signedUrl) {
      return NextResponse.json(
        { success: false, error: "Erro ao gerar URL do arquivo" },
        { status: 500 }
      );
    }

    // Extrair metadados baseados no tipo
    const metadata: AttachmentMetadata = {};

    // TODO: Para PDFs, extrair texto usando pdf-parse
    // if (attachmentType === 'file' && file.type === 'application/pdf') {
    //   const pdfText = await extractPdfText(file);
    //   metadata.extracted_text = pdfText.substring(0, 5000); // Limitar a 5000 chars
    // }

    // Montar resposta
    const attachment: ChatAttachment = {
      id: `att_${timestamp}_${random}`,
      type: attachmentType,
      name: file.name,
      url: urlData.signedUrl,
      size: file.size,
      mime_type: file.type,
      metadata,
    };

    return NextResponse.json({
      success: true,
      attachment,
    });
  } catch (error) {
    console.error("Upload handler error:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
