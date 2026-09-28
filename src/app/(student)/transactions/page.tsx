import Link from "next/link";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  PageHeader,
  formatDate,
  formatMoney,
} from "@/components/dashboard/page-kit";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { requireActiveUser } from "@/features/auth/services/auth.service";
import { createClient } from "@/lib/supabase/server";
export default async function Transactions() {
  const u = await requireActiveUser();
  const { data } = await (
    await createClient()
  )
    .from("transactions")
    .select(
      "id,buyer_id,seller_id,status,amount_kobo,created_at,listings(title)",
    )
    .or(`buyer_id.eq.${u.id},seller_id.eq.${u.id}`)
    .order("created_at", { ascending: false });
  return (
    <>
      <PageHeader
        eyebrow="Protected payments"
        title="Purchases and sales"
        description="Follow every checkout from payment verification through release or dispute."
      />
      {!data?.length ? (
        <EmptyState
          title="No transactions yet"
          description="Items you buy or sell will appear here with a complete status trail."
        />
      ) : (
        <div className="grid gap-3">
          {data.map((x) => {
            const l = Array.isArray(x.listings) ? x.listings[0] : x.listings;
            return (
              <Link
                href={`/transactions/${x.id}`}
                key={x.id}
                className="flex flex-col justify-between gap-3 rounded-2xl border bg-white p-5 sm:flex-row sm:items-center"
              >
                <div>
                  <h3 className="font-bold">
                    {l?.title ?? "Marketplace transaction"}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {x.buyer_id === u.id ? "Purchase" : "Sale"} ·{" "}
                    {formatDate(x.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <strong>{formatMoney(x.amount_kobo)}</strong>
                  <StatusBadge status={x.status} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
