import { z } from "zod";
import { uuidSchema } from "./common";

// Re-export uuidSchema for backwards compatibility
export { uuidSchema };

// Chat API schemas
export const chatMessageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().min(1, "Mensagem não pode estar vazia").max(10000, "Mensagem muito longa"),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;

// Conversation API schemas
export const createConversationSchema = z.object({
  title: z.string().min(1).max(200).optional(),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;

export const updateConversationSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  status: z.enum(["ACTIVE", "ARCHIVED", "DELETED"]).optional(),
});

export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;

// Helper function to validate and parse request body
export async function validateBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return {
        success: false,
        error: firstIssue?.message || "Dados inválidos",
      };
    }

    return { success: true, data: result.data };
  } catch {
    return { success: false, error: "Corpo da requisição inválido" };
  }
}

// Helper function to validate UUID param
export function validateUuid(id: string): { success: true; id: string } | { success: false; error: string } {
  const result = uuidSchema.safeParse(id);

  if (!result.success) {
    return { success: false, error: "ID inválido" };
  }

  return { success: true, id: result.data };
}
