import { randomBytes } from "node:crypto";
import { publicEnvironment } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  initializePaystackTransaction,
  verifyPaystackTransaction,
} from "@/features/payments/services/paystack.service";
const reference = () =>
  `zagamart-${Date.now()}-${randomBytes(8).toString("hex")}`;
export async function initializeCheckout(input: {
  listingId: string;
  buyerId: string;
  buyerEmail: string;
}) {
  const admin = createAdminClient();
  const paymentReference = reference();
  const { data: transaction, error } = await admin.rpc(
    "create_checkout_transaction",
    {
      p_listing_id: input.listingId,
      p_buyer_id: input.buyerId,
      p_payment_reference: paymentReference,
    },
  );
  if (error || !transaction)
    throw new Error("This listing is no longer available.");
  try {
    const initialized = await initializePaystackTransaction({
      email: input.buyerEmail,
      amountKobo: Number(transaction.amount_kobo),
      reference: paymentReference,
      callbackUrl: `${publicEnvironment.NEXT_PUBLIC_SITE_URL}/payments/callback`,
      transactionId: transaction.id,
    });
    await admin
      .from("transactions")
      .update({
        authorization_url: initialized.authorization_url,
        payment_initialized_at: new Date().toISOString(),
      })
      .eq("id", transaction.id)
      .eq("status", "pending_payment");
    return {
      transactionId: transaction.id,
      authorizationUrl: initialized.authorization_url,
    };
  } catch (error) {
    await admin.rpc("cancel_pending_transaction", {
      p_transaction_id: transaction.id,
      p_buyer_id: input.buyerId,
    });
    throw error;
  }
}
export async function settleVerifiedPayment(paymentReference: string) {
  const admin = createAdminClient();
  const { data: transaction } = await admin
    .from("transactions")
    .select("id,amount_kobo,currency,status,payment_reference")
    .eq("payment_reference", paymentReference)
    .maybeSingle();
  if (!transaction) return { ok: false as const, reason: "not_found" as const };
  if (transaction.status === "paid_held")
    return { ok: true as const, transactionId: transaction.id };
  const verified = await verifyPaystackTransaction(paymentReference);
  if (
    verified.status !== "success" ||
    verified.reference !== transaction.payment_reference ||
    verified.amount !== Number(transaction.amount_kobo) ||
    verified.currency !== transaction.currency
  )
    return { ok: false as const, reason: "verification_failed" as const };
  const { data: marked, error } = await admin.rpc("mark_transaction_paid", {
    p_transaction_id: transaction.id,
    p_payment_reference: paymentReference,
    p_provider_transaction_id: verified.id,
  });
  if (error || !marked)
    return { ok: false as const, reason: "state_conflict" as const };
  return { ok: true as const, transactionId: transaction.id };
}
