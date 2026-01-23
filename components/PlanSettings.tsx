"use client";

import { useEffect } from "react";
import { Check, Loader2, ExternalLink } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";
import { PLANS, CREDIT_PACKAGES } from "@/lib/stripe/config";
import { useSearchParams } from "next/navigation";

export default function PlanSettings() {
  const searchParams = useSearchParams();
  const {
    balance,
    transactions,
    subscription,
    isLoading,
    subscribe,
    isSubscribing,
    purchaseCredits,
    isPurchasing,
    openPortal,
    isOpeningPortal,
    refetch,
  } = useCredits();

  // Handle success from Stripe redirect
  useEffect(() => {
    const success = searchParams.get("success");

    if (success === "true") {
      refetch();
    }
  }, [searchParams, refetch]);

  const currentPlanId = subscription?.plan_id || "free";
  const currentPlan = PLANS[currentPlanId as keyof typeof PLANS] || PLANS.free;

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Format transaction amount
  const formatAmount = (amount: number, type: string) => {
    const prefix = type === "usage" ? "-" : "+";
    return `${prefix}${Math.abs(amount)} créditos`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Hero Card */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: "linear-gradient(135deg, #1C398E 0%, #2563EB 100%)",
        }}
      >
        <div>
          <h2 className="text-xl font-semibold text-white">
            Plano {currentPlan.name}
          </h2>
          <p className="text-sm text-blue-200 mt-1">
            {currentPlan.description}
          </p>
        </div>

        <div className="flex gap-12 mt-5">
          <div>
            <p className="text-[13px] text-blue-200">Créditos disponíveis</p>
            <p className="text-4xl font-bold text-white mt-1">{balance}</p>
          </div>
          {subscription?.current_period_end && (
            <div>
              <p className="text-[13px] text-blue-200">Próxima renovação</p>
              <p className="text-xl font-semibold text-white mt-1">
                {formatDate(subscription.current_period_end)}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-5">
          {subscription && (
            <button
              onClick={() => openPortal()}
              disabled={isOpeningPortal}
              className="flex-1 px-6 py-3 bg-white/15 hover:bg-white/25 border border-white/30 text-white text-sm font-medium rounded-[10px] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isOpeningPortal ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
              Gerenciar assinatura
            </button>
          )}
        </div>
      </div>

      {/* Credit Packages */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Comprar Créditos
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CREDIT_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative rounded-xl p-5 border ${
                pkg.popular
                  ? "border-primary bg-primary/5"
                  : "border-gray-200"
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-2.5 py-1 bg-primary text-white text-[11px] font-semibold rounded">
                    Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <p className="text-3xl font-bold text-gray-800">
                  {pkg.credits}
                </p>
                <p className="text-sm text-gray-500">créditos</p>
              </div>

              <div className="mt-3 text-center">
                <p className="text-2xl font-bold text-gray-800">
                  R$ {pkg.price}
                </p>
                <p className="text-xs text-gray-500">
                  R$ {pkg.pricePerCredit.toFixed(2)}/crédito
                </p>
              </div>

              <button
                onClick={() => purchaseCredits(pkg.id)}
                disabled={isPurchasing}
                className={`w-full mt-4 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${
                  pkg.popular
                    ? "bg-primary text-white hover:bg-primary-hover"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {isPurchasing ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  "Comprar"
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Usage History */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Histórico de Uso
        </h3>

        {transactions.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">
            Nenhuma transação ainda
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between py-3.5"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {transaction.description}
                  </p>
                  <p className="text-[13px] text-gray-500 mt-0.5">
                    {formatDate(transaction.created_at)}
                  </p>
                </div>
                <p
                  className={`text-sm font-medium ${
                    transaction.type === "usage"
                      ? "text-gray-700"
                      : "text-green-500"
                  }`}
                >
                  {formatAmount(transaction.amount, transaction.type)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Plans */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-5">
          Planos Disponíveis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.values(PLANS).map((plan) => {
            const isCurrent = plan.id === currentPlanId;

            return (
              <div
                key={plan.id}
                className={`relative rounded-xl p-6 text-center ${
                  isCurrent
                    ? "border-2 border-primary"
                    : "border border-gray-200"
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-2.5 py-1 bg-primary text-white text-[11px] font-semibold rounded">
                      Atual
                    </span>
                  </div>
                )}

                <h4 className="text-base font-semibold text-gray-800 mt-2">
                  {plan.name}
                </h4>

                <div className="mt-4">
                  {plan.price === 0 ? (
                    <span className="text-[32px] font-bold text-gray-800">
                      Grátis
                    </span>
                  ) : (
                    <>
                      <span className="text-[32px] font-bold text-gray-800">
                        R$ {plan.price}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">
                        /mês
                      </span>
                    </>
                  )}
                </div>

                <ul className="mt-4 space-y-2">
                  {plan.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-center gap-2 text-[13px] text-gray-500"
                    >
                      <Check className="w-4 h-4 text-gray-700" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => !isCurrent && plan.stripePriceId && subscribe(plan.id)}
                  disabled={isCurrent || isSubscribing || !plan.stripePriceId}
                  className={`w-full mt-5 px-5 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isCurrent
                      ? "bg-primary text-white cursor-default"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {isSubscribing ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : isCurrent ? (
                    "Plano atual"
                  ) : plan.id === "enterprise" ? (
                    "Fale conosco"
                  ) : (
                    "Selecionar"
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
