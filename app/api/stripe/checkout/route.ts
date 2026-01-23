import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStripe, PLANS, CREDIT_PACKAGES } from "@/lib/stripe/config";

interface Profile {
  stripe_customer_id: string | null;
}

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
    const { priceId, mode, planId, creditPackageId } = body;

    // Get or create Stripe customer
    const { data: profileData } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    const profile = profileData as Profile | null;
    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      // Create new Stripe customer
      const customer = await getStripe().customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      customerId = customer.id;

      // Save customer ID to profile
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId } as never)
        .eq("id", user.id);
    }

    // Determine the price ID
    let finalPriceId = priceId;
    let lineItemMetadata: Record<string, string> = {};

    if (planId && PLANS[planId as keyof typeof PLANS]) {
      const plan = PLANS[planId as keyof typeof PLANS];
      finalPriceId = plan.stripePriceId;
      lineItemMetadata = { plan_id: planId };
    } else if (creditPackageId) {
      const pkg = CREDIT_PACKAGES.find((p) => p.id === creditPackageId);
      if (pkg) {
        finalPriceId = pkg.stripePriceId;
        lineItemMetadata = {
          credit_package_id: creditPackageId,
          credits: pkg.credits.toString(),
        };
      }
    }

    if (!finalPriceId) {
      return NextResponse.json(
        { error: "Plano ou pacote inválido" },
        { status: 400 }
      );
    }

    // Create checkout session
    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: mode || "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      success_url: `${request.nextUrl.origin}/configuracoes?tab=plano&success=true`,
      cancel_url: `${request.nextUrl.origin}/configuracoes?tab=plano&canceled=true`,
      metadata: {
        user_id: user.id,
        ...lineItemMetadata,
      },
      subscription_data:
        mode === "subscription"
          ? {
              metadata: {
                user_id: user.id,
                ...lineItemMetadata,
              },
            }
          : undefined,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Erro ao criar sessão de checkout" },
      { status: 500 }
    );
  }
}
