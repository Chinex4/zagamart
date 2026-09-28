import { createClient } from "@supabase/supabase-js";
import { publicEnvironment, getServerEnvironment } from "@/lib/env";

export function createAdminClient() {
  const serverEnvironment = getServerEnvironment();

  if (
    !publicEnvironment.NEXT_PUBLIC_SUPABASE_URL ||
    !serverEnvironment.SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error("Supabase privileged environment variables are not configured.");
  }

  return createClient(
    publicEnvironment.NEXT_PUBLIC_SUPABASE_URL,
    serverEnvironment.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
