import Link from "next/link";
import {
  BadgeCheck,
  CircleDollarSign,
  Gavel,
  List,
  ReceiptText,
  ShoppingBag,
} from "lucide-react";
import {
  PageHeader,
  StatCard,
  formatDate,
  formatMoney,
} from "@/components/dashboard/page-kit";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { requireActiveUser } from "@/features/auth/services/auth.service";
import { createClient } from "@/lib/supabase/server";
export default async function DashboardPage() {
  const user = await requireActiveUser();
  const db = await createClient();
  const [
    { data: profile },
    { count: listings },
    { count: sales },
    { count: purchases },
    { count: disputes },
    { data: recent },
  ] = await Promise.all([
    db
      .from("profiles")
      .select("full_name,verification_status")
      .eq("id", user.id)
      .single(),
    db
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", user.id)
      .eq("status", "active"),
    db
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", user.id),
    db
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("buyer_id", user.id),
    db
      .from("disputes")
      .select("id", { count: "exact", head: true })
      .eq("opened_by", user.id)
      .in("status", ["open", "under_review"]),
    db
      .from("transactions")
      .select("id,status,amount_kobo,created_at,listings(title)")
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);
  const cards = [
    ["Active listings", listings ?? 0, List],
    ["Sales", sales ?? 0, CircleDollarSign],
    ["Purchases", purchases ?? 0, ShoppingBag],
    ["Open disputes", disputes ?? 0, Gavel],
  ] as const;
  return (
    <>
      <PageHeader
        eyebrow="Student dashboard"
        title={`Welcome back, ${profile?.full_name?.split(" ")[0] ?? "student"}`}
        description="Your trusted campus commerce workspace—manage identity, listings, protected payments, and payouts."
      />
      <section className="mb-6 rounded-2xl bg-slate-950 p-5 text-white sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-400">Student verification</p>
          <div className="mt-2">
            <StatusBadge
              status={profile?.verification_status ?? "not_submitted"}
            />
          </div>
        </div>
        {profile?.verification_status !== "verified" && (
          <Link
            href="/verification"
            className="mt-4 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold sm:mt-0"
          >
            Complete verification
          </Link>
        )}
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([l, v, i]) => (
          <StatCard key={l} label={l} value={v} icon={i} />
        ))}
      </section>
      <section className="mt-7 grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
        <div className="rounded-2xl border bg-white p-5">
          <div className="flex justify-between">
            <h3 className="font-bold">Recent activity</h3>
            <Link
              href="/transactions"
              className="text-sm font-bold text-blue-700"
            >
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {recent?.length ? (
              recent.map((x) => {
                const l = Array.isArray(x.listings)
                  ? x.listings[0]
                  : x.listings;
                return (
                  <Link
                    href={`/transactions/${x.id}`}
                    key={x.id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
                  >
                    <div>
                      <p className="font-semibold">
                        {l?.title ?? "Transaction"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(x.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatMoney(x.amount_kobo)}</p>
                      <StatusBadge status={x.status} />
                    </div>
                  </Link>
                );
              })
            ) : (
              <p className="py-8 text-center text-sm text-slate-500">
                Your activity will appear here.
              </p>
            )}
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-5">
          <h3 className="font-bold">Quick actions</h3>
          <div className="mt-4 grid gap-2">
            {[
              ["Browse marketplace", "/marketplace", ShoppingBag],
              ["Create listing", "/listings/new", List],
              ["Transactions", "/transactions", ReceiptText],
              ["Verification", "/verification", BadgeCheck],
              ["Payouts", "/payouts", CircleDollarSign],
            ].map(([label, href, Icon]) => (
              <Link
                key={String(href)}
                href={String(href)}
                className="flex min-h-11 items-center gap-3 rounded-xl border px-3 text-sm font-semibold hover:border-blue-300 hover:bg-blue-50"
              >
                <Icon className="size-4 text-blue-600" />
                {String(label)}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
