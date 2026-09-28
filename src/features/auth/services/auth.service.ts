import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export function normalizeMatricNumber(value: string): string {
  return value.trim().replace(/\s+/g, "").toUpperCase();
}

export type AccessProfile = { role: string; account_status: string } | null;
export function canAccessAdmin(profile: AccessProfile): boolean {
  return profile?.role === "admin" && profile.account_status === "active";
}
export function canAccessStudent(profile: AccessProfile): boolean {
  return profile?.role === "student" && profile.account_status === "active";
}

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireActiveUser() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("account_status")
    .eq("id", user.id)
    .single();

  if (profile?.account_status !== "active") {
    redirect("/login?error=account_unavailable");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role,account_status")
    .eq("id", user.id)
    .single();

  if (!canAccessAdmin(profile)) {
    redirect("/dashboard");
  }

  return user;
}

export async function requireGuest() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }
}
