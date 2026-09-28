import { AuthShell } from "@/features/auth/components/auth-shell";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Choose a new password"
      description="Use a strong password with upper and lowercase letters and at least one number."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
