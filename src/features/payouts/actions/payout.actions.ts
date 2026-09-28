"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/features/auth/services/auth.service";
import { payoutRequestSchema } from "@/features/payouts/schemas/payout.schema";
import { createAdminClient } from "@/lib/supabase/admin";

export async function requestPayoutAction(formData: FormData) {
  const user = await requireUser();
  const parsed = payoutRequestSchema.safeParse({
    bankAccountId: formData.get("bankAccountId"),
    amountNaira: formData.get("amountNaira"),
  });

  if (!parsed.success) throw new Error("Enter a valid payout request.");

  const admin = createAdminClient();
  const { error } = await admin.rpc("create_payout_request", {
    p_seller_id: user.id,
    p_bank_account_id: parsed.data.bankAccountId,
    p_amount_kobo: Math.round(parsed.data.amountNaira * 100),
  });

  if (error) throw new Error("Payout request could not be created.");
  revalidatePath("/payouts");
}
