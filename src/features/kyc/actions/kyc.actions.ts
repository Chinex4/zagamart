"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/features/auth/services/auth.service";
import {
  allowedKycMimeTypes,
  kycFileSchema,
} from "@/features/kyc/schemas/kyc.schema";
import { createClient } from "@/lib/supabase/server";

export type KycActionState = {
  error?: string;
  success?: string;
};

function safeExtension(file: File): string {
  if (file.type === "application/pdf") return "pdf";
  if (file.type === "image/png") return "png";
  return "jpg";
}

async function uploadKycFile(
  userId: string,
  label: "student-id" | "fee-receipt",
  file: File,
): Promise<string> {
  const supabase = await createClient();
  const path = `${userId}/${crypto.randomUUID()}-${label}.${safeExtension(file)}`;
  const { error } = await supabase.storage
    .from("kyc-documents")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    throw new Error("Document upload failed.");
  }

  return path;
}

export async function submitKycAction(
  _state: KycActionState,
  formData: FormData,
): Promise<KycActionState> {
  const user = await requireUser();
  const studentId = formData.get("studentId");
  const feeReceipt = formData.get("feeReceipt");

  if (!(studentId instanceof File) || !(feeReceipt instanceof File)) {
    return { error: "Upload both required documents." };
  }

  for (const file of [studentId, feeReceipt]) {
    const parsed = kycFileSchema.safeParse({
      type: file.type,
      size: file.size,
    });

    if (!parsed.success || !allowedKycMimeTypes.includes(file.type as never)) {
      return {
        error: "Documents must be JPG, PNG, or PDF and no larger than 5 MB.",
      };
    }
  }

  const supabase = await createClient();
  const { data: pending } = await supabase
    .from("student_verifications")
    .select("id")
    .eq("student_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (pending) {
    return { error: "Your verification is already awaiting review." };
  }

  try {
    const [studentIdPath, feeReceiptPath] = await Promise.all([
      uploadKycFile(user.id, "student-id", studentId),
      uploadKycFile(user.id, "fee-receipt", feeReceipt),
    ]);

    const { error } = await supabase.from("student_verifications").insert({
      student_id: user.id,
      student_id_path: studentIdPath,
      fee_receipt_path: feeReceiptPath,
      status: "pending",
    });

    if (error) {
      await Promise.all([
        supabase.storage.from("kyc-documents").remove([studentIdPath]),
        supabase.storage.from("kyc-documents").remove([feeReceiptPath]),
      ]);
      return {
        error: "Verification could not be submitted. Please try again.",
      };
    }

    revalidatePath("/verification");
    return { success: "Verification submitted for review." };
  } catch {
    return { error: "We could not upload your documents. Please try again." };
  }
}
