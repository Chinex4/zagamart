export interface FraudSignals {
  kycSubmissions: number;
  hasRejectedKyc: boolean;
  listingsLast10Minutes: number;
  listingsLast24Hours: number;
  sellerDisputes: number;
  sellerSales: number;
  cancelledTransactions: number;
  highValueListingsLast24Hours: number;
}

export type FraudRiskLevel = "low" | "medium" | "high";

export function calculateFraudScore(signals: FraudSignals) {
  let score = 0;

  if (signals.kycSubmissions >= 3) score += 20;
  if (signals.hasRejectedKyc) score += 10;
  if (signals.listingsLast10Minutes >= 5) score += 25;
  if (signals.listingsLast24Hours >= 12) score += 15;
  if (signals.sellerDisputes >= 3) score += 30;
  if (
    signals.sellerDisputes >= 1 &&
    signals.sellerSales > 0 &&
    signals.sellerDisputes / signals.sellerSales >= 0.5
  ) {
    score += 20;
  }
  if (signals.cancelledTransactions >= 3) score += 15;
  if (signals.highValueListingsLast24Hours >= 3) score += 10;

  return Math.min(score, 100);
}

export function fraudRiskLevel(score: number): FraudRiskLevel {
  if (score >= 60) return "high";
  if (score >= 30) return "medium";
  return "low";
}
