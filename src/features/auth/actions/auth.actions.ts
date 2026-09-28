"use server";

import { redirect } from "next/navigation";

import {
  forgotPasswordSchema,
  loginSchema,
  registrationSchema,
  resetPasswordSchema,
} from "@/features/auth/schemas/auth.schema";
import {
  canAccessAdmin,
  normalizeMatricNumber,
} from "@/features/auth/services/auth.service";
import { publicEnvironment } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type AuthActionState = {
  error?: string;
  success?: string;
};

export async function registerAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registrationSchema.safeParse({
    fullName: formData.get("fullName"),
    matricNumber: formData.get("matricNumber"),
    email: formData.get("email"),
    programme: formData.get("programme"),
    level: formData.get("level"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        matric_number: normalizeMatricNumber(parsed.data.matricNumber),
        programme: parsed.data.programme,
        level: parsed.data.level,
      },
      emailRedirectTo: `${publicEnvironment.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return {
      error:
        "We could not create that account. Check your details or try signing in.",
    };
  }

  redirect(`/verify-email?email=${encodeURIComponent(parsed.data.email.toLowerCase())}`);
}

export async function loginAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Enter a valid email address and password." };

  const email = parsed.data.email.toLowerCase();
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });

  if (error) {
    if (error.code === "email_not_confirmed") {
      await supabase.auth.resend({ type: "signup", email });
      redirect(`/verify-email?email=${encodeURIComponent(email)}`);
    }
    return { error: "The email or password is incorrect." };
  }

  const { data: setting } = await createAdminClient()
    .from("system_settings")
    .select("value")
    .eq("key", "email_login_otp_enabled")
    .maybeSingle();

  if (setting?.value === true) {
    await supabase.auth.signOut();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    if (otpError) return { error: "We could not send your login code. Please try again." };
    redirect(`/verify-login?email=${encodeURIComponent(email)}`);
  }

  redirect("/dashboard");
}

export async function adminLoginAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success)
    return { error: "Enter valid administrator credentials." };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
  });
  if (error || !data.user)
    return { error: "The administrator credentials are invalid." };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role,account_status")
    .eq("id", data.user.id)
    .single();
  if (!canAccessAdmin(profile)) {
    await supabase.auth.signOut();
    return { error: "The administrator credentials are invalid." };
  }
  redirect("/admin");
}

export async function verifyEmailOtpAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const token = String(formData.get("token") ?? "").replace(/\s/g, "");
  if (!email.includes("@") || !/^\d{6}$/.test(token))
    return { error: "Enter your email and the 6-digit code." };
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });
  if (error)
    return {
      error: "That code is invalid or has expired. Request a new code.",
    };
  redirect("/dashboard");
}

export async function resendEmailOtpAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email.includes("@"))
    return { error: "Enter the email used to register." };
  const supabase = await createClient();
  await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${publicEnvironment.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });
  return {
    success:
      "If the account is awaiting verification, a new code has been sent.",
  };
}

export async function verifyLoginOtpAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const token = String(formData.get("token") ?? "").replace(/\s/g, "");
  if (!email.includes("@") || !/^\d{6}$/.test(token))
    return { error: "Enter your email and the 6-digit code." };
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error) return { error: "That code is invalid or has expired. Request a new code." };
  redirect("/dashboard");
}

export async function resendLoginOtpAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email.includes("@")) return { error: "Enter your account email." };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });
  if (error) return { error: "Please wait before requesting another code." };
  return { success: "A new login code has been sent." };
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function forgotPasswordAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: "Enter a valid email address." };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email.toLowerCase(), {
    redirectTo: `${publicEnvironment.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset-password`,
  });

  return {
    success:
      "If an account exists for that email, password reset instructions have been sent.",
  };
}

export async function resetPasswordAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: "Your password could not be updated. Request a new link." };
  }

  return { success: "Password updated. You can continue to your dashboard." };
}
