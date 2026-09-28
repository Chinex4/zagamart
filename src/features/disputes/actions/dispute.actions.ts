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
  const evidence = formData.get("evidence");
  if (evidence instanceof File && evidence.size > 0) {
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowed.includes(evidence.type) || evidence.size > 5 * 1024 * 1024)
      throw new Error(
        "Evidence must be JPG, PNG, or PDF and no larger than 5 MB.",
      );
    const extension =
      evidence.type === "application/pdf"
        ? "pdf"
        : evidence.type === "image/png"
          ? "png"
          : "jpg";
    const path = `${user.id}/${data.id}/${crypto.randomUUID()}.${extension}`;
    const uploaded = await admin.storage
      .from("dispute-evidence")
      .upload(path, evidence, { contentType: evidence.type });
    if (uploaded.error)
      throw new Error(
        "The dispute was opened, but evidence could not be uploaded.",
      );
    await admin.from("dispute_evidence").insert({
      dispute_id: data.id,
      submitted_by: user.id,
      storage_path: path,
      note: "Evidence submitted when dispute was opened",
    });
  }
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
