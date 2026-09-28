import { createBrowserClient } from "@supabase/ssr";

import { publicEnvironment } from "@/lib/env";

export function createClient() {
  if (
    !publicEnvironment.NEXT_PUBLIC_SUPABASE_URL ||
    !publicEnvironment.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    throw new Error(
      "Supabase public environment variables are not configured.",
    );
  }

  return createBrowserClient(
    publicEnvironment.NEXT_PUBLIC_SUPABASE_URL,
    publicEnvironment.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
