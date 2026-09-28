import { notFound } from "next/navigation";
import {
  PageHeader,
  formatDate,
  formatMoney,
} from "@/components/dashboard/page-kit";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { requireActiveUser } from "@/features/auth/services/auth.service";
import {
  openDisputeAction,
  requestReleaseAction,
} from "@/features/disputes/actions/dispute.actions";
import { createClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireActiveUser();
  const { id } = await params;
  const db = await createClient();
  const { data: t } = await db
    .from("transactions")
    .select(
      "id,status,amount_kobo,currency,payment_reference,buyer_id,seller_id,paid_at,release_requested_at,released_at,refunded_at,cancelled_at,created_at,listings(title),disputes(id,status,reason)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!t) notFound();
  const listing = Array.isArray(t.listings) ? t.listings[0] : t.listings;
  const dispute = Array.isArray(t.disputes) ? t.disputes[0] : t.disputes;
  const isBuyer = t.buyer_id === user.id;
  const timeline = [
    ["Transaction created", t.created_at],
    ["Payment verified", t.paid_at],
    ["Release requested", t.release_requested_at],
    ["Funds released", t.released_at],
    ["Refund confirmed", t.refunded_at],
    ["Cancelled", t.cancelled_at],
  ].filter((x): x is [string, string] => Boolean(x[1]));
  return (
    <>
      <PageHeader
        eyebrow="Transaction workspace"
        title={listing?.title ?? "Marketplace transaction"}
        description={`Reference ${t.payment_reference ?? t.id} · You are the ${isBuyer ? "buyer" : "seller"}.`}
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_.7fr]">
        <section className="rounded-2xl border bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">Protected amount</p>
              <p className="mt-1 text-3xl font-bold">
                {formatMoney(t.amount_kobo)}
              </p>
            </div>
            <StatusBadge status={t.status} />
          </div>
          <dl className="mt-6 grid gap-4 border-t pt-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-500">Buyer</dt>
              <dd className="break-all text-sm">{t.buyer_id}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Seller</dt>
              <dd className="break-all text-sm">{t.seller_id}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Payment status</dt>
              <dd className="font-semibold">
                {t.paid_at ? "Provider verified" : "Awaiting verification"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Release state</dt>
              <dd className="font-semibold">
                {t.released_at
                  ? "Released"
                  : t.release_requested_at
                    ? "Requested"
                    : "Not requested"}
              </dd>
            </div>
          </dl>
          {isBuyer && t.status === "paid_held" && (
            <form action={requestReleaseAction} className="mt-5">
              <input type="hidden" name="transactionId" value={t.id} />
              <button className="rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white">
                Confirm receipt & request release
              </button>
            </form>
          )}
        </section>
        <aside className="rounded-2xl bg-slate-950 p-6 text-white">
          <h3 className="font-bold">Transaction timeline</h3>
          <ol className="mt-5 space-y-4">
            {timeline.map(([label, date]) => (
              <li
                key={label}
                className="relative border-l border-blue-500 pl-5"
              >
                <span className="absolute -left-1.5 top-1 size-3 rounded-full bg-blue-400" />
                <p className="font-semibold">{label}</p>
                <p className="text-xs text-slate-400">{formatDate(date)}</p>
              </li>
            ))}
          </ol>
        </aside>
      </div>
      <section className="mt-5 rounded-2xl border bg-white p-6">
        <h3 className="font-bold">Dispute protection</h3>
        {dispute ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-50 p-4">
            <div>
              <p className="font-semibold">{dispute.reason}</p>
              <StatusBadge status={dispute.status} />
            </div>
            <a
              href={`/disputes/${dispute.id}`}
              className="font-bold text-blue-700"
            >
              View dispute →
            </a>
          </div>
        ) : ["paid_held", "release_pending"].includes(t.status) ? (
          <form
            action={openDisputeAction}
            encType="multipart/form-data"
            className="mt-4 grid gap-3"
          >
            <input type="hidden" name="transactionId" value={t.id} />
            <label>
              <span className="mb-1 block text-sm font-medium">
                Reason and description
              </span>
              <textarea
                name="reason"
                required
                minLength={10}
                maxLength={2000}
                rows={4}
                className="w-full rounded-xl border p-3"
                placeholder="Explain what happened and the resolution you need."
              />
            </label>
            <label>
              <span className="mb-1 block text-sm font-medium">
                Evidence (optional)
              </span>
              <input
                name="evidence"
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                className="w-full rounded-xl border p-3 text-sm"
              />
            </label>
            <button className="justify-self-start rounded-xl bg-red-600 px-5 py-3 font-bold text-white">
              Submit dispute
            </button>
          </form>
        ) : (
          <p className="mt-2 text-sm text-slate-500">
            This transaction is not currently eligible for a dispute.
          </p>
        )}
      </section>
    </>
  );
}
