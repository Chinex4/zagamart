import { EmptyState } from "@/components/dashboard/empty-state";
import {
  PageHeader,
  formatDate,
  formatMoney,
} from "@/components/dashboard/page-kit";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { createAdminClient } from "@/lib/supabase/admin";
export default async function AdminTransactions() {
  const { data } = await createAdminClient()
    .from("transactions")
    .select(
      "id,payment_reference,amount_kobo,status,created_at,listings(title)",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  const rows = data ?? [];
  return (
    <>
      <PageHeader
        eyebrow="Protected payments"
        title="Transactions"
        description="A read-only operations view of payment and release states. Authoritative amounts originate on the server."
      />
      {!rows.length ? (
        <EmptyState
          title="No transactions"
          description="Checkout transactions will appear here."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-white">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Reference", "Product", "Amount", "Status", "Created"].map(
                  (x) => (
                    <th className="p-4" key={x}>
                      {x}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((x) => {
                const l = Array.isArray(x.listings)
                  ? x.listings[0]
                  : x.listings;
                return (
                  <tr key={x.id}>
                    <td className="p-4 font-mono text-xs">
                      {x.payment_reference ?? x.id.slice(0, 8)}
                    </td>
                    <td className="p-4 font-semibold">
                      {l?.title ?? "Listing"}
                    </td>
                    <td className="p-4">{formatMoney(x.amount_kobo)}</td>
                    <td className="p-4">
                      <StatusBadge status={x.status} />
                    </td>
                    <td className="p-4">{formatDate(x.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
