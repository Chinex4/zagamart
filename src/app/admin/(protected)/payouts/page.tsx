import { EmptyState } from "@/components/dashboard/empty-state";
import {
  PageHeader,
  formatDate,
  formatMoney,
} from "@/components/dashboard/page-kit";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { updatePayoutStatusAction } from "@/features/admin/actions/admin.actions";
import { createAdminClient } from "@/lib/supabase/admin";
export default async function AdminPayoutsPage() {
  const db = createAdminClient();
  const { data } = await db
    .from("payout_requests")
    .select(
      "id,amount_kobo,status,provider_reference,failure_reason,created_at,profiles!payout_requests_seller_id_fkey(full_name,matric_number),bank_accounts(bank_name,account_name,account_number_last4)",
    )
    .order("created_at", { ascending: false });
  const rows = data ?? [];
  return (
    <>
      <PageHeader
        eyebrow="Money operations"
        title="Payout management"
        description="Progress trusted requests through an explicit administrative workflow. Paid status requires a real provider reference and does not initiate a transfer by itself."
      />
      {!rows.length ? (
        <EmptyState
          title="No payout requests"
          description="Student payout requests will appear here."
        />
      ) : (
        <div className="grid gap-4">
          {rows.map((row) => {
            const profile = Array.isArray(row.profiles)
              ? row.profiles[0]
              : row.profiles;
            const bank = Array.isArray(row.bank_accounts)
              ? row.bank_accounts[0]
              : row.bank_accounts;
            return (
              <article key={row.id} className="rounded-2xl border bg-white p-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                  <div>
                    <h3 className="text-xl font-bold">
                      {formatMoney(row.amount_kobo)}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {profile?.full_name ?? "Seller"} ·{" "}
                      {bank?.bank_name ?? "Bank unavailable"} · ••••{" "}
                      {bank?.account_number_last4 ?? "----"}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Requested {formatDate(row.created_at)} · Reference{" "}
                      {row.provider_reference ?? "not assigned"}
                    </p>
                  </div>
                  <StatusBadge status={row.status} />
                </div>
                {["pending", "processing"].includes(row.status) && (
                  <form
                    action={updatePayoutStatusAction}
                    className="mt-4 grid gap-2 border-t pt-4 sm:grid-cols-[1fr_1fr_auto_auto_auto]"
                  >
                    <input type="hidden" name="payoutId" value={row.id} />
                    <input
                      name="providerReference"
                      placeholder="Provider reference"
                      className="rounded-xl border px-3 py-2"
                    />
                    <input
                      name="failureReason"
                      placeholder="Failure reason"
                      className="rounded-xl border px-3 py-2"
                    />
                    <button
                      name="status"
                      value="processing"
                      className="rounded-xl bg-amber-500 px-3 py-2 font-semibold"
                    >
                      Processing
                    </button>
                    <button
                      name="status"
                      value="paid"
                      className="rounded-xl bg-emerald-600 px-3 py-2 font-semibold text-white"
                    >
                      Paid
                    </button>
                    <button
                      name="status"
                      value="failed"
                      className="rounded-xl bg-red-600 px-3 py-2 font-semibold text-white"
                    >
                      Failed
                    </button>
                  </form>
                )}
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
