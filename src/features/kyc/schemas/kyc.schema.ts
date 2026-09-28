import { z } from "zod";

export const kycSubmissionSchema = z.object({
  studentIdPath: z.string().min(1),
  feeReceiptPath: z.string().min(1),
});

export const kycFileSchema = z.object({
  type: z.enum(["image/jpeg", "image/png", "application/pdf"]),
  size: z
    .number()
    .positive()
    .max(5 * 1024 * 1024),
});

export const allowedKycMimeTypes = [
  "image/jpeg",
  "image/png",
  "application/pdf",
] as const;
