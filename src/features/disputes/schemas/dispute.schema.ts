import { z } from "zod";

export const disputeSchema = z.object({
  transactionId: z.string().uuid(),
  reason: z.string().trim().min(10).max(2000),
});

export const disputeEvidenceSchema = z.object({
  disputeId: z.string().uuid(),
  note: z.string().trim().max(1000).optional(),
});
