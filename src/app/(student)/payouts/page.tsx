import { requireUser } from "@/features/auth/services/auth.service";
import { addBankAccountAction } from "@/features/payouts/actions/bank-account.actions";
import { requestPayoutAction } from "@/features/payouts/actions/payout.actions";
import { listPaystackBanks } from "@/features/payments/services/paystack.service";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PayoutsPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const [accountsResult, payoutsResult, banks] = await Promise.all([
    supabase
      .from("bank_accounts")
      .select("id,bank_name,account_number_last4,account_name,is_default")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("payout_requests")
      .select("id,amount_kobo,status,created_at")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false }),
    listPaystackBanks(),
  ]);
  const accounts = accountsResult.data ?? [];
  const payouts = payoutsResult.data ?? [];

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">Payouts</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Your payout accounts</h1>
          <p className="mt-2 text-sm text-slate-600">Requests must be between ₦5,000 and ₦200,000.</p>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold">Add bank account</h2>
          <form action={addBankAccountAction} className="mt-4 grid gap-4 sm:grid-cols-2">
            <select name="bankCode" required className="rounded-xl border border-slate-300 p-3">
              <option value="">Select bank</option>
              {banks.filter((bank) => bank.active && bank.type === "nuban").map((bank) => (
                <option key={bank.code} value={bank.code}>{bank.name}</option>
              ))}
            </select>
            <input name="bankName" required placeholder="Bank name" className="rounded-xl border border-slate-300 p-3" />
            <input name="accountNumber" required inputMode="numeric" maxLength={10} placeholder="10-digit account number" className="rounded-xl border border-slate-300 p-3" />
            <button className="rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white">Verify and save</button>
          </form>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold">Request payout</h2>
          <form action={requestPayoutAction} className="mt-4 grid gap-4 sm:grid-cols-2">
            <select name="bankAccountId" required className="rounded-xl border border-slate-300 p-3">
              <option value="">Select payout account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>{account.bank_name} •••• {account.account_number_last4}</option>
              ))}
            </select>
            <input name="amountNaira" type="number" min={5000} max={200000} required placeholder="Amount in naira" className="rounded-xl border border-slate-300 p-3" />
            <button className="rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white">Request payout</button>
          </form>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold">Payout history</h2>
          <div className="mt-4 space-y-3">
            {payouts.length ? payouts.map((payout) => (
              <div key={payout.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <span className="font-semibold">₦{(payout.amount_kobo / 100).toLocaleString("en-NG")}</span>
                <span className="text-sm capitalize text-slate-600">{payout.status}</span>
              </div>
            )) : <p className="text-sm text-slate-500">No payout requests yet.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
