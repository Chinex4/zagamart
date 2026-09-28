import { describe, expect, it } from "vitest";

import {
  calculateFraudScore,
  fraudRiskLevel,
  type FraudSignals,
} from "@/features/fraud/services/fraud-score";

const cleanSignals: FraudSignals = {
  kycSubmissions: 0,
  hasRejectedKyc: false,
  listingsLast10Minutes: 0,
  listingsLast24Hours: 0,
  sellerDisputes: 0,
  sellerSales: 0,
  cancelledTransactions: 0,
  highValueListingsLast24Hours: 0,
};

describe("fraud scoring", () => {
  it("scores every legacy risk signal at its documented weight", () => {
    expect(calculateFraudScore({ ...cleanSignals, kycSubmissions: 3 })).toBe(
      20,
    );
    expect(
      calculateFraudScore({ ...cleanSignals, hasRejectedKyc: true }),
    ).toBe(10);
    expect(
      calculateFraudScore({ ...cleanSignals, listingsLast10Minutes: 5 }),
    ).toBe(25);
    expect(
      calculateFraudScore({ ...cleanSignals, listingsLast24Hours: 12 }),
    ).toBe(15);
    expect(
      calculateFraudScore({
        ...cleanSignals,
        sellerDisputes: 3,
        sellerSales: 10,
      }),
    ).toBe(30);
    expect(
      calculateFraudScore({
        ...cleanSignals,
        sellerDisputes: 1,
        sellerSales: 2,
      }),
    ).toBe(20);
    expect(
      calculateFraudScore({ ...cleanSignals, cancelledTransactions: 3 }),
    ).toBe(15);
    expect(
      calculateFraudScore({
        ...cleanSignals,
        highValueListingsLast24Hours: 3,
      }),
    ).toBe(10);
  });

  it("caps aggregate risk at 100", () => {
    expect(
      calculateFraudScore({
        kycSubmissions: 3,
        hasRejectedKyc: true,
        listingsLast10Minutes: 5,
        listingsLast24Hours: 12,
        sellerDisputes: 3,
        sellerSales: 3,
        cancelledTransactions: 3,
        highValueListingsLast24Hours: 3,
      }),
    ).toBe(100);
  });

  it("maps the review thresholds to low, medium, and high", () => {
    expect(fraudRiskLevel(29)).toBe("low");
    expect(fraudRiskLevel(30)).toBe("medium");
    expect(fraudRiskLevel(59)).toBe("medium");
    expect(fraudRiskLevel(60)).toBe("high");
  });

  it("does not apply dispute ratio scoring when there are no sales", () => {
    expect(
      calculateFraudScore({
        ...cleanSignals,
        sellerDisputes: 1,
        sellerSales: 0,
      }),
    ).toBe(0);
  });
});
