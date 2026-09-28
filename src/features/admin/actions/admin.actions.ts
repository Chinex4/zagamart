"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/features/auth/services/auth.service";
import { createAdminClient } from "@/lib/supabase/admin";

export async function reviewVerificationAction(formData: FormData) {
  const admin = await requireAdmin();
  const verificationId = String(formData.get("verificationId") ?? "");
  const status = String(formData.get("status") ?? "");
  const reason = String(formData.get("reason") ?? "");

  if (!verificationId || !["verified", "rejected"].includes(status)) {
    throw new Error("Invalid verification review.");
  }

  const client = createAdminClient();
  const { error } = await client.rpc("review_student_verification", {
    p_verification_id: verificationId,
    p_admin_id: admin.id,
    p_status: status,
    p_rejection_reason: reason || null,
  });
  if (error) throw new Error("Verification review failed.");

  revalidatePath("/admin");
  revalidatePath("/admin/verifications");
}

export async function updateAccountStatusAction(formData: FormData) {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const suspended = String(formData.get("suspended")) === "true";
  const reason = String(formData.get("reason") ?? "");

  if (!userId) throw new Error("Invalid account.");

  const client = createAdminClient();
  const { error } = await client.rpc("set_account_suspension", {
    p_user_id: userId,
    p_admin_id: admin.id,
    p_suspended: suspended,
    p_reason: reason || null,
  });
  if (error) throw new Error("Account status update failed.");

  revalidatePath("/admin/users");
}

export async function updatePayoutStatusAction(formData: FormData) {
  const admin = await requireAdmin();
  const payoutId = String(formData.get("payoutId") ?? "");
  const status = String(formData.get("status") ?? "");
  const providerReference = String(formData.get("providerReference") ?? "");
  const failureReason = String(formData.get("failureReason") ?? "");

  if (
    !payoutId ||
    !["processing", "paid", "failed", "cancelled"].includes(status)
  ) {
    throw new Error("Invalid payout update.");
  }

  const client = createAdminClient();
  const { error } = await client.rpc("update_payout_status", {
    p_payout_id: payoutId,
    p_admin_id: admin.id,
    p_status: status,
    p_provider_reference: providerReference || null,
    p_failure_reason: failureReason || null,
  });
  if (error) throw new Error("Payout status update failed.");

  revalidatePath("/admin/payouts");
}
