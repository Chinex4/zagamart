import Link from "next/link";

import { requireAdmin } from "@/features/auth/services/auth.service";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  const client = createAdminClient();

  const [
    { count: pendingVerifications },
    { count: openFraudFlags },
    { count: openDisputes },
    { count: pendingPayouts },
  ] = await Promise.all([
    client
      .from("student_verifications")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    client
      .from("fraud_flags")
      .select("id", { count: "exact", head: true })
      .is("resolved_at", null),
    client
      .from("disputes")
      .select("id", { count: "exact", head: true })
      .in("status", ["open", "under_review"]),
    client
      .from("payout_requests")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "processing"]),
  ]);

  const cards = [
    ["KYC reviews", pendingVerifications ?? 0, "/admin/verifications"],
    ["Fraud flags", openFraudFlags ?? 0, "/admin/fraud"],
    ["Disputes", openDisputes ?? 0, "/admin/disputes"],
    ["Payouts", pendingPayouts ?? 0, "/admin/payouts"],
  ] as const;

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
          Zagamart operations
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Admin control center
        </h1>
        <p className="mt-4 max-w-2xl text-slate-400">
          Review identity, marketplace risk, transaction disputes, and payout
          operations from trusted admin workflows.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(([label, count, href]) => (
            <Link
              key={href}
              href={href}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-blue-500"
            >
              <p className="text-sm text-slate-400">{label}</p>
              <p className="mt-3 text-3xl font-semibold">{count}</p>
            </Link>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link
            className="rounded-xl border border-slate-800 px-4 py-2"
            href="/admin/users"
          >
            Users
          </Link>
          <Link
            className="rounded-xl border border-slate-800 px-4 py-2"
            href="/admin/audit"
          >
            Audit log
          </Link>
        </div>
      </div>
    </main>
  );
}
