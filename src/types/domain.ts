export const TRANSACTION_STATUSES = [
  "pending_payment",
  "paid_held",
  "release_pending",
  "released",
  "disputed",
  "refunded",
  "cancelled",
] as const;

export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

export const VERIFICATION_STATUSES = [
  "not_submitted",
  "pending",
  "verified",
  "rejected",
] as const;

export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const USER_ROLES = ["student", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];
