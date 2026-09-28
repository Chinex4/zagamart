import type { TransactionStatus } from "@/types/domain";

const allowedTransitions: Readonly<
  Record<TransactionStatus, readonly TransactionStatus[]>
> = {
  pending_payment: ["paid_held", "cancelled"],
  paid_held: ["release_pending", "disputed", "refunded"],
  release_pending: ["released", "disputed", "refunded"],
  released: [],
  disputed: ["released", "refunded"],
  refunded: [],
  cancelled: [],
};

export function canTransitionTransaction(
  currentStatus: TransactionStatus,
  nextStatus: TransactionStatus,
): boolean {
  return allowedTransitions[currentStatus].includes(nextStatus);
}

export function assertTransactionTransition(
  currentStatus: TransactionStatus,
  nextStatus: TransactionStatus,
): void {
  if (!canTransitionTransaction(currentStatus, nextStatus)) {
    throw new Error(
      `Invalid transaction transition: ${currentStatus} -> ${nextStatus}`,
    );
  }
}
