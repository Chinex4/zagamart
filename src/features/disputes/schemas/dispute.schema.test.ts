import { describe, expect, it } from "vitest";

import { disputeSchema } from "@/features/disputes/schemas/dispute.schema";

describe("disputeSchema", () => {
  it("accepts a valid dispute", () => {
    const result = disputeSchema.safeParse({
      transactionId: "550e8400-e29b-41d4-a716-446655440000",
      reason: "The delivered item does not match the listing.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a short reason", () => {
    const result = disputeSchema.safeParse({
      transactionId: "550e8400-e29b-41d4-a716-446655440000",
      reason: "Broken",
    });
    expect(result.success).toBe(false);
  });
});
