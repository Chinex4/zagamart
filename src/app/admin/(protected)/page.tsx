import Link from "next/link";
import {
  BadgeCheck,
  CircleDollarSign,
  Gavel,
  List,
  ShieldAlert,
  ShoppingBag,
  Users,
} from "lucide-react";
import { PageHeader, StatCard } from "@/components/dashboard/page-kit";
import { createAdminClient } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
export default async function AdminPage() {
  const db = createAdminClient();
  const results = await Promise.all([
    db.from("profiles").select("id", { count: "exact", head: true }),
    db
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("verification_status", "verified"),
    db
      .from("student_verifications")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    db
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    db.from("transactions").select("id", { count: "exact", head: true }),
    db
      .from("disputes")
      .select("id", { count: "exact", head: true })
      .in("status", ["open", "under_review"]),
    db
      .from("payout_requests")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "processing"]),
    db
      .from("fraud_flags")
      .select("id", { count: "exact", head: true })
      .is("resolved_at", null),
  ]);
  const data = [
    ["Total users", results[0].count ?? 0, Users, "/admin/users"],
    ["Verified students", results[1].count ?? 0, BadgeCheck, "/admin/users"],
    ["Pending KYC", results[2].count ?? 0, BadgeCheck, "/admin/verifications"],
    ["Active listings", results[3].count ?? 0, ShoppingBag, "/admin/listings"],
    ["Transactions", results[4].count ?? 0, List, "/admin/transactions"],
    ["Open disputes", results[5].count ?? 0, Gavel, "/admin/disputes"],
    [
      "Pending payouts",
      results[6].count ?? 0,
      CircleDollarSign,
      "/admin/payouts",
    ],
    ["Fraud flags", results[7].count ?? 0, ShieldAlert, "/admin/fraud"],
  ] as const;
  return (
    <>
      <PageHeader
        eyebrow="Operations overview"
        title="Good decisions start with a clear view"
        description="Live marketplace, identity, payment, and trust signals from the ZagaMart database."
      />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.map(([label, value, icon, href]) => (
          <Link key={label} href={href}>
            <StatCard
              label={label}
              value={value}
              icon={icon}
              hint="Open queue →"
            />
          </Link>
        ))}
      </section>
      <section className="mt-7 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white">
          <p className="text-sm font-semibold text-blue-300">
            Priority actions
          </p>
          <h3 className="mt-2 text-xl font-bold">
            Keep student commerce moving
          </h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link
              href="/admin/verifications"
              className="rounded-xl bg-white/10 p-4 hover:bg-white/15"
            >
              Review pending KYC
            </Link>
            <Link
              href="/admin/disputes"
              className="rounded-xl bg-white/10 p-4 hover:bg-white/15"
            >
              Resolve disputes
            </Link>
            <Link
              href="/admin/fraud"
              className="rounded-xl bg-white/10 p-4 hover:bg-white/15"
            >
              Assess risk flags
            </Link>
            <Link
              href="/admin/payouts"
              className="rounded-xl bg-white/10 p-4 hover:bg-white/15"
            >
              Process payouts
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-semibold text-slate-500">
            Operational principle
          </p>
          <h3 className="mt-2 text-xl font-bold">Protected by design</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Admin actions are server-authorized, recorded in the audit log, and
            backed by trusted database operations. Private evidence is never
            exposed through public storage URLs.
          </p>
          <Link
            href="/admin/audit"
            className="mt-5 inline-block text-sm font-bold text-blue-700"
          >
            View audit trail →
          </Link>
        </div>
      </section>
    </>
  );
}
