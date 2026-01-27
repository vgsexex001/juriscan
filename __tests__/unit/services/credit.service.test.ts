import { describe, it, expect, vi, beforeEach } from "vitest";
import { deductCredits, addCredits } from "@/services/credit.service";

// Mock Supabase client factory
function createMockSupabase(options: {
  balance?: number;
  balanceError?: boolean;
  updateError?: boolean;
  upsertError?: boolean;
}) {
  const { balance = 100, balanceError = false, updateError = false, upsertError = false } = options;

  return {
    from: vi.fn((table: string) => {
      if (table === "credit_balances") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: balanceError ? null : { balance },
            error: balanceError ? { message: "Error" } : null,
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                error: updateError ? { message: "Update error" } : null,
              }),
            }),
          }),
          upsert: vi.fn().mockResolvedValue({
            error: upsertError ? { message: "Upsert error" } : null,
          }),
        };
      }
      if (table === "credit_transactions") {
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      return {};
    }),
  };
}

describe("credit.service", () => {
  describe("deductCredits", () => {
    it("should deduct credits successfully when balance is sufficient", async () => {
      const mockSupabase = createMockSupabase({ balance: 100 });

      const result = await deductCredits(
        mockSupabase as never,
        "user-123",
        10,
        "Test deduction"
      );

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(90);
      expect(result.error).toBeUndefined();
    });

    it("should fail when balance is insufficient", async () => {
      const mockSupabase = createMockSupabase({ balance: 5 });

      const result = await deductCredits(
        mockSupabase as never,
        "user-123",
        10,
        "Test deduction"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Créditos insuficientes");
    });

    it("should fail when balance check fails", async () => {
      const mockSupabase = createMockSupabase({ balanceError: true });

      const result = await deductCredits(
        mockSupabase as never,
        "user-123",
        10,
        "Test deduction"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Erro ao verificar saldo");
    });

    it("should fail when update fails", async () => {
      const mockSupabase = createMockSupabase({ balance: 100, updateError: true });

      const result = await deductCredits(
        mockSupabase as never,
        "user-123",
        10,
        "Test deduction"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Erro ao deduzir créditos");
    });

    it("should deduct exact amount for edge case (balance equals amount)", async () => {
      const mockSupabase = createMockSupabase({ balance: 10 });

      const result = await deductCredits(
        mockSupabase as never,
        "user-123",
        10,
        "Test deduction"
      );

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(0);
    });
  });

  describe("addCredits", () => {
    it("should add credits successfully", async () => {
      const mockSupabase = createMockSupabase({ balance: 50 });

      const result = await addCredits(
        mockSupabase as never,
        "user-123",
        25,
        "Test addition"
      );

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(75);
      expect(result.error).toBeUndefined();
    });

    it("should add credits to zero balance", async () => {
      const mockSupabase = createMockSupabase({ balance: 0 });

      const result = await addCredits(
        mockSupabase as never,
        "user-123",
        100,
        "Initial credits"
      );

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(100);
    });

    it("should fail when upsert fails", async () => {
      const mockSupabase = createMockSupabase({ balance: 50, upsertError: true });

      const result = await addCredits(
        mockSupabase as never,
        "user-123",
        25,
        "Test addition"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Erro ao adicionar créditos");
    });
  });
});
