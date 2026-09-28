import { z } from "zod";

export const payoutRequestSchema = z.object({
  bankAccountId: z.string().uuid(),
  amountNaira: z.coerce.number().min(5000).max(200000),
});
