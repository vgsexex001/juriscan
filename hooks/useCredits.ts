"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStripe } from "@/lib/stripe/client";

interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: "purchase" | "subscription" | "usage" | "bonus" | "refund";
  description: string;
  created_at: string;
}

interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

interface CreditsData {
  balance: number;
  transactions: CreditTransaction[];
  subscription: Subscription | null;
}

export function useCredits() {
  const queryClient = useQueryClient();

  // Fetch credits data
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<CreditsData>({
    queryKey: ["credits"],
    queryFn: async () => {
      const response = await fetch("/api/credits");
      if (!response.ok) {
        throw new Error("Erro ao buscar créditos");
      }
      return response.json();
    },
  });

  // Create checkout session for subscription
  const subscribeMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, mode: "subscription" }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao criar checkout");
      }

      const { url } = await response.json();
      window.location.href = url;
    },
  });

  // Create checkout session for credit purchase
  const purchaseCreditsMutation = useMutation({
    mutationFn: async (creditPackageId: string) => {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creditPackageId, mode: "payment" }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao criar checkout");
      }

      const { url } = await response.json();
      window.location.href = url;
    },
  });

  // Open billing portal
  const openPortalMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao abrir portal");
      }

      const { url } = await response.json();
      window.location.href = url;
    },
  });

  // Deduct credits (for internal use when user uses a feature)
  const deductCredits = async (amount: number, description: string) => {
    // This would be called server-side when using features
    // For now, just invalidate the query to refetch
    await queryClient.invalidateQueries({ queryKey: ["credits"] });
  };

  return {
    balance: data?.balance || 0,
    transactions: data?.transactions || [],
    subscription: data?.subscription || null,
    isLoading,
    error,
    refetch,
    subscribe: subscribeMutation.mutate,
    isSubscribing: subscribeMutation.isPending,
    purchaseCredits: purchaseCreditsMutation.mutate,
    isPurchasing: purchaseCreditsMutation.isPending,
    openPortal: openPortalMutation.mutate,
    isOpeningPortal: openPortalMutation.isPending,
    deductCredits,
  };
}
