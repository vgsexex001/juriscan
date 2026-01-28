import { apiHandler, successResponse, ValidationError } from "@/lib/api";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";

const deleteAccountSchema = z.object({
  confirmation: z.string().email("Email inválido"),
});

// DELETE /api/privacy/account - Permanently delete account
export const DELETE = apiHandler(async (request, { user }) => {
  const supabase = await createServerSupabaseClient();

  // Validate confirmation matches user email
  const body = await request.json();
  const result = deleteAccountSchema.safeParse(body);

  if (!result.success) {
    throw new ValidationError("Email de confirmação inválido.");
  }

  if (result.data.confirmation !== user!.email) {
    throw new ValidationError("O email digitado não corresponde ao email da sua conta.");
  }

  // Cancel any active Stripe subscription first
  const { data: profileData } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user!.id)
    .single();

  const profile = profileData as { stripe_customer_id: string | null } | null;

  if (profile?.stripe_customer_id) {
    try {
      const { getStripe } = await import("@/lib/stripe/config");
      const stripe = getStripe();

      // List and cancel all active subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: "active",
      });

      for (const subscription of subscriptions.data) {
        await stripe.subscriptions.cancel(subscription.id);
      }
    } catch {
      // Log but don't block deletion if Stripe fails
      // The user data deletion is more important
    }
  }

  // Soft delete: Mark profile as deleted instead of hard delete
  // This preserves data integrity and allows recovery if needed
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      status: "DELETED",
      deleted_at: new Date().toISOString(),
      email: `deleted_${user!.id}@deleted.juriscan.com`, // Anonymize email
      name: "Usuário Removido",
      oab: null,
      phone: null,
      avatar_url: null,
      law_firm: null,
      practice_areas: [],
    } as never)
    .eq("id", user!.id);

  if (updateError) {
    throw new Error("Erro ao excluir conta. Por favor, tente novamente.");
  }

  // Delete all user data
  await Promise.all([
    supabase.from("reports").delete().eq("user_id", user!.id),
    supabase.from("analyses").delete().eq("user_id", user!.id),
    supabase.from("conversations").delete().eq("user_id", user!.id),
    supabase.from("credit_transactions").delete().eq("user_id", user!.id),
    supabase.from("credit_balances").delete().eq("user_id", user!.id),
    supabase.from("notification_preferences").delete().eq("user_id", user!.id),
    supabase.from("subscriptions").delete().eq("user_id", user!.id),
    supabase.from("sessions").delete().eq("user_id", user!.id),
  ]);

  // Use admin client to delete the auth user
  const adminSupabase = await createAdminClient();
  await adminSupabase.auth.admin.deleteUser(user!.id);

  return successResponse({
    message: "Sua conta foi excluída permanentemente.",
  });
});
