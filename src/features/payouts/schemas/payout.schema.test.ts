import { describe, expect, it } from "vitest";

import { bankAccountSchema } from "@/features/payouts/schemas/bank-account.schema";
import { payoutRequestSchema } from "@/features/payouts/schemas/payout.schema";

describe("payout validation", () => {
  it("accepts Nigerian bank account input", () => {
    expect(
      bankAccountSchema.safeParse({
        bankCode: "058",
        bankName: "Example Bank",
        accountNumber: "0123456789",
      }).success,
    ).toBe(true);
  });

  it("enforces payout limits", () => {
    expect(
      payoutRequestSchema.safeParse({
        bankAccountId: "550e8400-e29b-41d4-a716-446655440000",
        amountNaira: 4999,
      }).success,
    ).toBe(false);
    expect(
      payoutRequestSchema.safeParse({
        bankAccountId: "550e8400-e29b-41d4-a716-446655440000",
        amountNaira: 5000,
      }).success,
    ).toBe(true);
  });
});
