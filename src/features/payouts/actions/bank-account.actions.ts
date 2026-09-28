"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/features/auth/services/auth.service";
import { bankAccountSchema } from "@/features/payouts/schemas/bank-account.schema";
import {
  createPaystackTransferRecipient,
  resolvePaystackAccount,
} from "@/features/payments/services/paystack.service";
import { createAdminClient } from "@/lib/supabase/admin";

export async function addBankAccountAction(formData: FormData) {
  const user = await requireUser();
  const parsed = bankAccountSchema.safeParse({
    bankCode: formData.get("bankCode"),
    bankName: formData.get("bankName"),
    accountNumber: formData.get("accountNumber"),
  });

  if (!parsed.success) throw new Error("Enter valid Nigerian bank details.");

  const resolved = await resolvePaystackAccount(
    parsed.data.accountNumber,
    parsed.data.bankCode,
  );
  if (resolved.account_number !== parsed.data.accountNumber) {
    throw new Error("The account could not be verified.");
  }

  const recipient = await createPaystackTransferRecipient({
    name: resolved.account_name,
    accountNumber: parsed.data.accountNumber,
    bankCode: parsed.data.bankCode,
  });

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("account_status,verification_status")
    .eq("id", user.id)
    .single();

  if (
    profile?.account_status !== "active" ||
    profile.verification_status !== "verified"
  ) {
    throw new Error("Complete verification before adding a payout account.");
  }

  const { error } = await admin.from("bank_accounts").insert({
    student_id: user.id,
    bank_code: parsed.data.bankCode,
    bank_name: parsed.data.bankName,
    account_number_last4: parsed.data.accountNumber.slice(-4),
    account_name: resolved.account_name,
    recipient_code: recipient.recipient_code,
  });

  if (error) throw new Error("Bank account could not be saved.");
  revalidatePath("/payouts");
}
