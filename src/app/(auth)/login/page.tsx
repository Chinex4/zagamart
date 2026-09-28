import { AuthShell } from "@/features/auth/components/auth-shell";
import { LoginForm } from "@/features/auth/components/login-form";
import { requireGuest } from "@/features/auth/services/auth.service";

export default async function LoginPage() {
  await requireGuest();

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to manage your listings, purchases, sales, and verification."
    >
      <LoginForm />
    </AuthShell>
  );
}
