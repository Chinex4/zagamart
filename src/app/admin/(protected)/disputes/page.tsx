import Link from "next/link";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  PageHeader,
  formatDate,
  formatMoney,
} from "@/components/dashboard/page-kit";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { createAdminClient } from "@/lib/supabase/admin";
export default async function AdminDisputesPage() {
  const db = createAdminClient();
  const { data } = await db
    .from("disputes")
    .select(
      "id,status,reason,created_at,transactions(amount_kobo,listings(title))",
    )
    .order("created_at", { ascending: false });
  const rows = data ?? [];
  return (
    <>
      <PageHeader
        eyebrow="Resolution center"
        title="Dispute queue"
        description="Review transaction context and private evidence before applying a state-machine-safe resolution."
      />
      {!rows.length ? (
        <EmptyState
          title="No disputes"
          description="Open student disputes will appear here."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-white">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Listing", "Reason", "Amount", "Opened", "Status", ""].map(
                  (x) => (
                    <th key={x} className="p-4">
                      {x}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => {
                const tx = Array.isArray(row.transactions)
                  ? row.transactions[0]
                  : row.transactions;
                const listing =
                  tx &&
                  (Array.isArray(tx.listings) ? tx.listings[0] : tx.listings);
                return (
                  <tr key={row.id}>
                    <td className="p-4 font-semibold">
                      {listing?.title ?? "Transaction"}
                    </td>
                    <td className="max-w-xs truncate p-4">{row.reason}</td>
                    <td className="p-4">{formatMoney(tx?.amount_kobo ?? 0)}</td>
                    <td className="p-4">{formatDate(row.created_at)}</td>
                    <td className="p-4">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/admin/disputes/${row.id}`}
                        className="font-bold text-blue-700"
                      >
                        Review →
                      </Link>
                    </td>
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
