import Stripe from "stripe";

// Lazy initialization of Stripe to avoid build-time errors
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    });
  }
  return stripeInstance;
}

// For backward compatibility - getter that initializes on first use
export const stripe = {
  get instance() {
    return getStripe();
  },
  get customers() {
    return getStripe().customers;
  },
  get checkout() {
    return getStripe().checkout;
  },
  get billingPortal() {
    return getStripe().billingPortal;
  },
  get webhooks() {
    return getStripe().webhooks;
  },
  get subscriptions() {
    return getStripe().subscriptions;
  },
};

// Plans configuration
export const PLANS = {
  free: {
    id: "free",
    name: "Gratuito",
    description: "Para começar a explorar",
    price: 0,
    credits: 50,
    features: [
      "50 créditos por mês",
      "Chat jurídico básico",
      "1 análise por dia",
      "Suporte por email",
    ],
    stripePriceId: null,
  },
  professional: {
    id: "professional",
    name: "Profissional",
    description: "Para advogados autônomos",
    price: 97,
    credits: 500,
    features: [
      "500 créditos por mês",
      "Chat jurídico avançado",
      "Análises ilimitadas",
      "Relatórios PDF",
      "Suporte prioritário",
    ],
    stripePriceId: process.env.STRIPE_PRICE_PROFESSIONAL,
  },
  enterprise: {
    id: "enterprise",
    name: "Escritório",
    description: "Para escritórios de advocacia",
    price: 297,
    credits: 2000,
    features: [
      "2.000 créditos por mês",
      "Tudo do Profissional",
      "Multi-usuários",
      "API de integração",
      "Gerente de conta dedicado",
    ],
    stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE,
  },
} as const;

export type PlanId = keyof typeof PLANS;

// Credit packages for one-time purchases
export const CREDIT_PACKAGES = [
  {
    id: "credits_100",
    credits: 100,
    price: 29,
    pricePerCredit: 0.29,
    popular: false,
    stripePriceId: process.env.STRIPE_PRICE_CREDITS_100,
  },
  {
    id: "credits_500",
    credits: 500,
    price: 119,
    pricePerCredit: 0.238,
    popular: true,
    stripePriceId: process.env.STRIPE_PRICE_CREDITS_500,
  },
  {
    id: "credits_1000",
    credits: 1000,
    price: 199,
    pricePerCredit: 0.199,
    popular: false,
    stripePriceId: process.env.STRIPE_PRICE_CREDITS_1000,
  },
] as const;
