import Link from "next/link";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  PageHeader,
  formatDate,
  formatMoney,
} from "@/components/dashboard/page-kit";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { createAdminClient } from "@/lib/supabase/admin";
export default async function AdminListings() {
  const { data } = await createAdminClient()
    .from("listings")
    .select(
      "id,title,category,condition,price_kobo,status,created_at,profiles!listings_seller_id_fkey(full_name)",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  const rows = data ?? [];
  return (
    <>
      <PageHeader
        eyebrow="Marketplace oversight"
        title="Listings"
        description="Monitor inventory and listing states across the student marketplace."
      />
      {!rows.length ? (
        <EmptyState
          title="No listings"
          description="Marketplace listings will appear here."
        />
      ) : (
        <div className="grid gap-3">
          {rows.map((x) => {
            const p = Array.isArray(x.profiles) ? x.profiles[0] : x.profiles;
            return (
              <Link
                href={`/marketplace/${x.id}`}
                key={x.id}
                className="flex flex-col justify-between gap-3 rounded-2xl border bg-white p-5 hover:border-blue-300 sm:flex-row sm:items-center"
              >
                <div>
                  <h3 className="font-bold">{x.title}</h3>
                  <p className="text-sm text-slate-500">
                    {p?.full_name ?? "Seller"} · {x.category} · {x.condition} ·{" "}
                    {formatDate(x.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <strong>{formatMoney(x.price_kobo)}</strong>
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
