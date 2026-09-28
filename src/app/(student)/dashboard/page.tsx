import Link from "next/link";

import { logoutAction } from "@/features/auth/actions/auth.actions";
import { requireUser } from "@/features/auth/services/auth.service";
import { getVerificationSummary } from "@/features/kyc/services/kyc.service";

export default async function DashboardPage() {
  const user = await requireUser();
  const verification = await getVerificationSummary(user.id);

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-5">
          <Link className="text-xl font-bold" href="/">
            Zagamart
          </Link>
          <form action={logoutAction}>
            <button
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-900"
              type="submit"
            >
              Sign out
            </button>
          </form>
        </header>

        <section className="mt-16 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
            Student dashboard
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Your Zagamart account is ready.
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            Complete student verification to unlock marketplace trading.
          </p>
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Verification status</p>
            <p className="mt-2 text-xl font-semibold capitalize">
              {verification.status.replace("_", " ")}
            </p>
            {verification.status !== "verified" ? (
              <Link
                className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500"
                href="/verification"
              >
                Continue verification
              </Link>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
