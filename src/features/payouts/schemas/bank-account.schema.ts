import { z } from "zod";

export const bankAccountSchema = z.object({
  bankCode: z.string().trim().min(2).max(12),
  bankName: z.string().trim().min(2).max(120),
  accountNumber: z.string().regex(/^\d{10}$/),
});
