import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { AdminLoginForm } from "@/features/auth/components/admin-login-form";
export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen bg-slate-950 lg:grid-cols-2">
      <section className="hidden flex-col justify-between p-14 text-white lg:flex">
        <Link href="/" className="text-xl font-bold">
          ZagaMart
        </Link>
        <div>
          <ShieldCheck className="size-14 text-blue-400" />
          <h1 className="mt-7 max-w-xl text-5xl font-bold tracking-tight">
            Trusted marketplace operations, in one secure workspace.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-slate-300">
            Review identity, risk, disputes, and payout operations while
            protecting student commerce.
          </p>
        </div>
        <p className="text-sm text-slate-500">
          ZagaMart · Administrator portal
        </p>
      </section>
      <section className="flex items-center justify-center bg-slate-50 p-5 sm:p-10">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-9">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="font-bold">
              ZagaMart
            </Link>
          </div>
          <p className="text-sm font-bold uppercase tracking-[.18em] text-blue-600">
            Secure access
          </p>
          <h2 className="mt-2 text-3xl font-bold">Administrator sign in</h2>
          <p className="mt-2 text-sm text-slate-500">
            Use your authorized operations account.
          </p>
          <div className="mt-8">
            <AdminLoginForm />
          </div>
          <Link
            href="/login"
            className="mt-6 block text-center text-sm font-semibold text-blue-700"
          >
            Student sign in →
          </Link>
        </div>
      </section>
    </main>
  );
}
