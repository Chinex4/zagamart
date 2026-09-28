import { notFound } from "next/navigation";
import {
  PageHeader,
  formatDate,
  formatMoney,
} from "@/components/dashboard/page-kit";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveDisputeAction } from "@/features/admin/actions/admin.actions";
export default async function AdminDisputePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = createAdminClient();
  const { data: row } = await db
    .from("disputes")
    .select(
      "id,status,reason,resolution_note,created_at,resolved_at,transaction_id,transactions(id,status,amount_kobo,payment_reference,buyer_id,seller_id,created_at,listings(title)),dispute_evidence(id,storage_path,note,created_at)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!row) notFound();
  const tx = Array.isArray(row.transactions)
    ? row.transactions[0]
    : row.transactions;
  const listing =
    tx && (Array.isArray(tx.listings) ? tx.listings[0] : tx.listings);
  const evidence = await Promise.all(
    (row.dispute_evidence ?? []).map(async (item) => ({
      item,
      url: (
        await db.storage
          .from("dispute-evidence")
          .createSignedUrl(item.storage_path, 300)
      ).data?.signedUrl,
    })),
  );
  return (
    <>
      <PageHeader
        eyebrow="Dispute investigation"
        title={listing?.title ?? "Transaction dispute"}
        description={`Transaction ${tx?.payment_reference ?? tx?.id ?? "—"} · opened ${formatDate(row.created_at)}`}
      />
      <div className="grid gap-5 lg:grid-cols-3">
        <section className="rounded-2xl border bg-white p-6 lg:col-span-2">
          <div className="flex justify-between">
            <h3 className="font-bold">Case details</h3>
            <StatusBadge status={row.status} />
          </div>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-500">Amount</dt>
              <dd className="text-xl font-bold">
                {formatMoney(tx?.amount_kobo ?? 0)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Transaction status</dt>
              <dd>
                <StatusBadge status={tx?.status ?? "unknown"} />
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Buyer</dt>
              <dd className="break-all text-sm">{tx?.buyer_id}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Seller</dt>
              <dd className="break-all text-sm">{tx?.seller_id}</dd>
            </div>
          </dl>
          <h4 className="mt-6 text-sm font-bold">Student statement</h4>
          <p className="mt-2 rounded-xl bg-slate-50 p-4 text-sm leading-6">
            {row.reason}
          </p>
          {row.resolution_note && (
            <p className="mt-4 rounded-xl bg-blue-50 p-4 text-sm">
              Admin note: {row.resolution_note}
            </p>
          )}
        </section>
        <section className="rounded-2xl border bg-slate-950 p-6 text-white">
          <h3 className="font-bold">Private evidence</h3>
          <p className="mt-2 text-xs text-slate-400">
            Links expire after five minutes.
          </p>
          <div className="mt-4 space-y-2">
            {evidence.length ? (
              evidence.map(({ item, url }) => (
                <a
                  key={item.id}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl bg-white/10 p-3 text-sm hover:bg-white/15"
                >
                  {item.note ?? "Open evidence"} · {formatDate(item.created_at)}
                </a>
              ))
            ) : (
              <p className="text-sm text-slate-400">No evidence uploaded.</p>
            )}
          </div>
        </section>
      </div>
      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <strong>Provider safety:</strong> A database resolution must never be
        described as a completed refund until Paystack confirms the provider
        refund.
      </div>
      {["open", "under_review"].includes(row.status) && (
        <form
          action={resolveDisputeAction}
          className="mt-5 grid gap-3 rounded-2xl border bg-white p-5 sm:grid-cols-[1fr_auto_auto]"
        >
          <input type="hidden" name="disputeId" value={row.id} />
          <input
            name="note"
            required
            minLength={5}
            placeholder="Resolution notes and provider status"
            className="rounded-xl border px-4 py-2.5"
          />
          <button
            name="status"
            value="resolved_buyer"
            className="rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white"
          >
            Resolve for buyer
          </button>
          <button
            name="status"
            value="resolved_seller"
            className="rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white"
          >
            Resolve for seller
          </button>
        </form>
      )}
    </>
  );
}
