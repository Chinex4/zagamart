"use server";

import { revalidatePath } from "next/cache";

import { requireActiveUser } from "@/features/auth/services/auth.service";
import { bankAccountSchema } from "@/features/payouts/schemas/bank-account.schema";
import {
  createPaystackTransferRecipient,
  listPaystackBanks,
  resolvePaystackAccount,
} from "@/features/payments/services/paystack.service";
import { createAdminClient } from "@/lib/supabase/admin";

export async function addBankAccountAction(formData: FormData) {
  const user = await requireActiveUser();
  const parsed = bankAccountSchema.safeParse({
    bankCode: formData.get("bankCode"),
    bankName: formData.get("bankName"),
    accountNumber: formData.get("accountNumber"),
  });

  if (!parsed.success) throw new Error("Enter valid Nigerian bank details.");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("verification_status")
    .eq("id", user.id)
    .single();

  if (profile?.verification_status !== "verified") {
    throw new Error("Complete verification before adding a payout account.");
  }

  const banks = await listPaystackBanks();
  const bank = banks.find(
    (item) =>
      item.code === parsed.data.bankCode &&
      item.active &&
      item.currency === "NGN",
  );
  if (!bank) throw new Error("Select a supported Nigerian bank.");

  const resolved = await resolvePaystackAccount(
    parsed.data.accountNumber,
    bank.code,
  );
  if (resolved.account_number !== parsed.data.accountNumber) {
    throw new Error("The account could not be verified.");
  }

  const last4 = parsed.data.accountNumber.slice(-4);
  const { data: existing } = await admin
    .from("bank_accounts")
    .select("id")
    .eq("student_id", user.id)
    .eq("bank_code", bank.code)
    .eq("account_number_last4", last4)
    .maybeSingle();

  if (existing) throw new Error("This payout account is already saved.");

  const recipient = await createPaystackTransferRecipient({
    name: resolved.account_name,
    accountNumber: parsed.data.accountNumber,
    bankCode: bank.code,
  });

  const { error } = await admin.from("bank_accounts").insert({
    student_id: user.id,
    bank_code: bank.code,
    bank_name: bank.name,
    account_number_last4: last4,
    account_name: resolved.account_name,
    recipient_code: recipient.recipient_code,
  });

  if (error) throw new Error("Bank account could not be saved.");
  revalidatePath("/payouts");
}
