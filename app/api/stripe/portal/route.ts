import { apiHandler, successResponse, ValidationError } from "@/lib/api";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/config";

interface Profile {
  stripe_customer_id: string | null;
}

export const POST = apiHandler(async (request, { user }) => {
  const supabase = await createServerSupabaseClient();

  // Get Stripe customer ID
  const { data: profileData } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user!.id)
    .single();

  const profile = profileData as Profile | null;

  if (!profile?.stripe_customer_id) {
    throw new ValidationError("Nenhuma assinatura encontrada");
  }

  // Create portal session
  const session = await getStripe().billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${request.nextUrl.origin}/configuracoes?tab=plano`,
  });

  return successResponse({ url: session.url });
});
