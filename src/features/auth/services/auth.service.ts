import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export function normalizeMatricNumber(value: string): string {
  return value.trim().replace(/\s+/g, "").toUpperCase();
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

export async function requireGuest() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }
}
