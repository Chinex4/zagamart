import { z } from "zod";

const publicEnvironmentSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
});

export const publicEnvironment = publicEnvironmentSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

export function getServerEnvironment() {
  return z
    .object({
      SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
      PAYSTACK_SECRET_KEY: z.string().min(1).optional(),
      RESEND_API_KEY: z.string().min(1).optional(),
    })
    .parse({
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
    });
}
