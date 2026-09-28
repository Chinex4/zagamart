import { describe, expect, it } from "vitest";

import {
  assertTransactionTransition,
  canTransitionTransaction,
} from "@/features/transactions/services/transaction-state";

describe("transaction state machine", () => {
  it("allows a verified payment to enter the held state", () => {
    expect(canTransitionTransaction("pending_payment", "paid_held")).toBe(true);
  });

  it("allows a held transaction to become disputed", () => {
    expect(canTransitionTransaction("paid_held", "disputed")).toBe(true);
  });

  it("does not allow released funds to move backwards", () => {
    expect(canTransitionTransaction("released", "paid_held")).toBe(false);
  });

  it("rejects invalid transitions", () => {
    expect(() =>
      assertTransactionTransition("cancelled", "released"),
    ).toThrow("Invalid transaction transition");
  });
});
