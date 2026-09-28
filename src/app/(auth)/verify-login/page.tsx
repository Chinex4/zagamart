import { AuthShell } from "@/features/auth/components/auth-shell";
import { OtpForm } from "@/features/auth/components/otp-form";

export default async function VerifyLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email = "" } = await searchParams;
  return (
    <AuthShell
      title="Verify your login"
      description="Enter the one-time code sent to your email to finish signing in."
    >
      <OtpForm defaultEmail={email} mode="login" />
    </AuthShell>
  );
}
