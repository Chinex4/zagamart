import { AuthShell } from "@/features/auth/components/auth-shell";
import { OtpForm } from "@/features/auth/components/otp-form";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email = "" } = await searchParams;
  return (
    <AuthShell
      title="Verify your student email"
      description="Enter the one-time code sent to your email. Codes expire for your protection."
    >
      <OtpForm defaultEmail={email} />
    </AuthShell>
  );
}
