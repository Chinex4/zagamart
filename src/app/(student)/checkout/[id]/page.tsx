import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { PageHeader, formatMoney } from "@/components/dashboard/page-kit";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { requireActiveUser } from "@/features/auth/services/auth.service";
import { startCheckoutAction } from "@/features/transactions/actions/checkout.actions";
import { createClient } from "@/lib/supabase/server";
export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireActiveUser();
  const { id } = await params;
  const { data: l } = await (
    await createClient()
  )
    .from("listings")
    .select(
      "id,title,description,price_kobo,status,seller_id,profiles!listings_seller_id_fkey(full_name,verification_status)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!l) notFound();
  const seller = Array.isArray(l.profiles) ? l.profiles[0] : l.profiles;
  const unavailable = l.status !== "active" || l.seller_id === user.id;
  return (
    <>
      <PageHeader
        eyebrow="Protected checkout"
        title="Review your order"
        description="The authoritative amount is loaded from the listing on the server and verified again before Paystack initialization."
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_.7fr]">
        <section className="rounded-2xl border bg-white p-6">
          <StatusBadge status={l.status} />
          <h3 className="mt-4 text-2xl font-bold">{l.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {l.description}
          </p>
          <div className="mt-6 border-t pt-5">
            <p className="text-xs text-slate-500">Sold by</p>
            <p className="font-bold">
              {seller?.full_name ?? "Verified student"}
            </p>
            <StatusBadge status={seller?.verification_status ?? "unknown"} />
          </div>
        </section>
        <aside className="rounded-2xl bg-slate-950 p-6 text-white">
          <h3 className="font-bold">Transaction summary</h3>
          <div className="mt-5 flex justify-between border-b border-slate-800 pb-5">
            <span className="text-slate-400">Item total</span>
            <strong className="text-2xl">{formatMoney(l.price_kobo)}</strong>
          </div>
          <div className="mt-5 flex gap-3 rounded-xl bg-blue-500/10 p-4">
            <ShieldCheck className="size-6 shrink-0 text-blue-400" />
            <p className="text-sm leading-6 text-slate-300">
              Payment is provider-verified and held in the protected transaction
              workflow until release.
            </p>
          </div>
          <form action={startCheckoutAction} className="mt-6">
            <input type="hidden" name="listingId" value={l.id} />
            <button
              disabled={unavailable}
              className="w-full rounded-xl bg-blue-600 px-5 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {unavailable
                ? "Checkout unavailable"
                : "Continue securely with Paystack"}
            </button>
          </form>
        </aside>
      </div>
    </>
  );
}
