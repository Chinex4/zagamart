import { AuthShell } from "@/features/auth/components/auth-shell";
import { RegisterForm } from "@/features/auth/components/register-form";
import { requireGuest } from "@/features/auth/services/auth.service";

export default async function RegisterPage() {
  await requireGuest();

  return (
    <AuthShell
      title="Create your student account"
      description="Register with your student details. Trading remains locked until your identity is verified."
    >
      <RegisterForm />
    </AuthShell>
  );
}
