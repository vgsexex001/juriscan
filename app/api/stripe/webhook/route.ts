import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe, PLANS } from "@/lib/stripe/config";
import { createAdminClient } from "@/lib/supabase/server";
import Stripe from "stripe";

interface CreditBalance {
  balance: number;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(supabase, session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(supabase, subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(supabase, subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(supabase, invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoiceFailed(supabase, invoice);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(
  supabase: Awaited<ReturnType<typeof createAdminClient>>,
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.user_id;
  if (!userId) return;

  // Handle one-time credit purchase
  if (session.mode === "payment") {
    const creditPackageId = session.metadata?.credit_package_id;
    const credits = session.metadata?.credits;

    if (creditPackageId && credits) {
      const creditsToAdd = parseInt(credits);

      // Get current balance
      const { data: balanceData } = await supabase
        .from("credit_balances")
        .select("balance")
        .eq("user_id", userId)
        .single();

      const balance = balanceData as CreditBalance | null;
      const currentBalance = balance?.balance || 0;

      // Update or insert balance
      await supabase.from("credit_balances").upsert({
        user_id: userId,
        balance: currentBalance + creditsToAdd,
        updated_at: new Date().toISOString(),
      } as never);

      // Record transaction
      await supabase.from("credit_transactions").insert({
        user_id: userId,
        amount: creditsToAdd,
        type: "purchase",
        description: `Compra de ${creditsToAdd} créditos`,
        stripe_payment_id: session.payment_intent as string,
      } as never);
    }
  }
}

async function handleSubscriptionChange(
  supabase: Awaited<ReturnType<typeof createAdminClient>>,
  subscription: Stripe.Subscription
) {
  const userId = subscription.metadata?.user_id;
  if (!userId) return;

  const planId = subscription.metadata?.plan_id as keyof typeof PLANS;
  const plan = planId ? PLANS[planId] : null;

  // Get period dates from subscription items
  const subscriptionItem = subscription.items?.data?.[0];
  const periodStart = subscriptionItem?.current_period_start || Math.floor(Date.now() / 1000);
  const periodEnd = subscriptionItem?.current_period_end || Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

  // Update or create subscription record
  await supabase.from("subscriptions").upsert({
    user_id: userId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    plan_id: planId || "free",
    status: subscription.status,
    current_period_start: new Date(periodStart * 1000).toISOString(),
    current_period_end: new Date(periodEnd * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  } as never);

  // Update profile with current plan
  await supabase
    .from("profiles")
    .update({
      current_plan: planId || "free",
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", userId);

  // Add monthly credits if subscription is active and plan exists
  if (subscription.status === "active" && plan) {
    const { data: balanceData } = await supabase
      .from("credit_balances")
      .select("balance")
      .eq("user_id", userId)
      .single();

    const balance = balanceData as CreditBalance | null;
    const currentBalance = balance?.balance || 0;

    await supabase.from("credit_balances").upsert({
      user_id: userId,
      balance: currentBalance + plan.credits,
      updated_at: new Date().toISOString(),
    } as never);

    await supabase.from("credit_transactions").insert({
      user_id: userId,
      amount: plan.credits,
      type: "subscription",
      description: `Créditos mensais - Plano ${plan.name}`,
      stripe_subscription_id: subscription.id,
    } as never);
  }
}

async function handleSubscriptionCanceled(
  supabase: Awaited<ReturnType<typeof createAdminClient>>,
  subscription: Stripe.Subscription
) {
  const userId = subscription.metadata?.user_id;
  if (!userId) return;

  // Update subscription status
  await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      updated_at: new Date().toISOString(),
    } as never)
    .eq("stripe_subscription_id", subscription.id);

  // Downgrade to free plan
  await supabase
    .from("profiles")
    .update({
      current_plan: "free",
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", userId);
}

async function handleInvoicePaid(
  supabase: Awaited<ReturnType<typeof createAdminClient>>,
  invoice: Stripe.Invoice
) {
  // Log successful payment
  console.log("Invoice paid:", invoice.id);
}

async function handleInvoiceFailed(
  supabase: Awaited<ReturnType<typeof createAdminClient>>,
  invoice: Stripe.Invoice
) {
  // Could send notification to user about failed payment
  console.log("Invoice failed:", invoice.id);
}
