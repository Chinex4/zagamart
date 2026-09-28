import { AuthShell } from "@/features/auth/components/auth-shell";
import { OtpForm } from "@/features/auth/components/otp-form";
export default function VerifyEmailPage() {
  return (
    <AuthShell
      title="Verify your student email"
      description="Enter the one-time code sent by Supabase Auth. Codes expire for your protection."
    >
      <OtpForm />
    </AuthShell>
  );
}
