import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[a-z]/, "Password must include a lowercase letter.")
  .regex(/[A-Z]/, "Password must include an uppercase letter.")
  .regex(/[0-9]/, "Password must include a number.");

export const registrationSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120),
    matricNumber: z.string().trim().min(3).max(40),
    email: z.string().trim().email(),
    programme: z.string().trim().min(2).max(120),
    level: z.string().trim().min(1).max(30),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1, "Enter your password."),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegistrationInput = z.infer<typeof registrationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
