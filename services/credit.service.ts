import type { SupabaseClient } from "@supabase/supabase-js";

interface DeductCreditsResult {
  success: boolean;
  newBalance?: number;
  error?: string;
}

interface BalanceRow {
  balance: number;
}

/**
 * Deduct credits from user's balance
 * Uses optimistic locking to prevent race conditions
 */
export async function deductCredits(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  userId: string,
  amount: number,
  description: string = "Uso de créditos"
): Promise<DeductCreditsResult> {
  // Get current balance
  const { data: balanceData, error: balanceError } = await supabase
    .from("credit_balances")
    .select("balance")
    .eq("user_id", userId)
    .single();

  if (balanceError) {
    return { success: false, error: "Erro ao verificar saldo" };
  }

  const currentBalance = (balanceData as BalanceRow | null)?.balance ?? 0;

  if (currentBalance < amount) {
    return { success: false, error: "Créditos insuficientes" };
  }

  const newBalance = currentBalance - amount;

  // Update balance with optimistic locking (check current value)
  const { error: updateError } = await supabase
    .from("credit_balances")
    .update({
      balance: newBalance,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("user_id", userId)
    .eq("balance", currentBalance); // Optimistic lock

  if (updateError) {
    return { success: false, error: "Erro ao deduzir créditos" };
  }

  // Record transaction
  await supabase.from("credit_transactions").insert({
    user_id: userId,
    type: "usage",
    amount: -amount,
    description,
  } as never);

  return { success: true, newBalance };
}

/**
 * Add credits to user's balance
 */
export async function addCredits(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  userId: string,
  amount: number,
  description: string = "Créditos adicionados"
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  // Get current balance or create if not exists
  const { data: balanceData } = await supabase
    .from("credit_balances")
    .select("balance")
    .eq("user_id", userId)
    .single();

  const currentBalance = (balanceData as BalanceRow | null)?.balance ?? 0;
  const newBalance = currentBalance + amount;

  // Upsert balance
  const { error: upsertError } = await supabase
    .from("credit_balances")
    .upsert({
      user_id: userId,
      balance: newBalance,
      updated_at: new Date().toISOString(),
    } as never);

  if (upsertError) {
    return { success: false, error: "Erro ao adicionar créditos" };
  }

  // Record transaction
  await supabase.from("credit_transactions").insert({
    user_id: userId,
    type: "purchase",
    amount: amount,
    description,
  } as never);

  return { success: true, newBalance };
}
