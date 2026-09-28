"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/features/auth/services/auth.service";
import { disputeSchema } from "@/features/disputes/schemas/dispute.schema";
import { createAdminClient } from "@/lib/supabase/admin";

export async function openDisputeAction(formData: FormData) {
  const user = await requireUser();
  const parsed = disputeSchema.safeParse({
    transactionId: formData.get("transactionId"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) throw new Error("Enter a valid dispute reason.");

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("open_transaction_dispute", {
    p_transaction_id: parsed.data.transactionId,
    p_actor_id: user.id,
    p_reason: parsed.data.reason,
  });

  if (error || !data) throw new Error("This transaction cannot be disputed.");
  redirect(`/disputes/${data.id}`);
}

export async function requestReleaseAction(formData: FormData) {
  const user = await requireUser();
  const transactionId = formData.get("transactionId");
  if (typeof transactionId !== "string") {
    throw new Error("Invalid transaction.");
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("request_transaction_release", {
    p_transaction_id: transactionId,
    p_buyer_id: user.id,
  });

  if (error || !data) throw new Error("Release cannot be requested.");
  revalidatePath(`/transactions/${transactionId}`);
}
