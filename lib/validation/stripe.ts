import { z } from "zod";

/**
 * Stripe checkout session schema
 */
export const checkoutSchema = z.object({
  priceId: z.string().optional(),
  mode: z.enum(["subscription", "payment"]).default("subscription"),
  planId: z.enum(["starter", "professional", "enterprise"]).optional(),
  creditPackageId: z.string().optional(),
}).refine(
  (data) => data.priceId || data.planId || data.creditPackageId,
  { message: "Deve fornecer priceId, planId ou creditPackageId" }
);

export type CheckoutInput = z.infer<typeof checkoutSchema>;
