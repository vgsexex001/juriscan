/**
 * Document text extraction utilities
 * Supports PDF, DOCX, DOC, and TXT files
 */

// PDF extraction using pdf-parse
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import to avoid build issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);
    return data.text || "";
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error("Falha ao extrair texto do PDF");
  }
}

// DOCX extraction using mammoth
export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import to avoid build issues
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  } catch (error) {
    console.error("DOCX extraction error:", error);
    throw new Error("Falha ao extrair texto do DOCX");
  }
}

// Extract text from any supported file type
export async function extractTextFromFile(
  file: File
): Promise<{ text: string; pageCount?: number }> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type;

  // Plain text
  if (mimeType === "text/plain") {
    return { text: await file.text() };
  }

  // PDF
  if (mimeType === "application/pdf") {
    const text = await extractTextFromPDF(buffer);
    // Estimate page count (rough: ~3000 chars per page)
    const pageCount = Math.max(1, Math.ceil(text.length / 3000));
    return { text, pageCount };
  }

  // DOCX
  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    const text = await extractTextFromDocx(buffer);
    return { text };
  }

  // Unsupported type
  return { text: "" };
}

// Limit text to a maximum length while keeping it meaningful
export function truncateText(text: string, maxLength: number = 10000): string {
  if (text.length <= maxLength) {
    return text;
  }

  // Try to truncate at a sentence boundary
  const truncated = text.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf(".");
  const lastNewline = truncated.lastIndexOf("\n");
  const cutPoint = Math.max(lastPeriod, lastNewline, maxLength - 500);

  return truncated.substring(0, cutPoint + 1) + "\n\n[...texto truncado...]";
}
