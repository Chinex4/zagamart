import { AuthShell } from "@/features/auth/components/auth-shell";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { requireGuest } from "@/features/auth/services/auth.service";

export default async function ForgotPasswordPage() {
  await requireGuest();

  return (
    <AuthShell
      title="Reset your password"
      description="Enter your account email. We will send reset instructions if an account matches it."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
