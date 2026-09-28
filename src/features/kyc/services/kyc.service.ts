import { createClient } from "@/lib/supabase/server";

export type VerificationSummary = {
  status: "not_submitted" | "pending" | "verified" | "rejected";
  rejectionReason: string | null;
  submittedAt: string | null;
};

export async function getVerificationSummary(
  userId: string,
): Promise<VerificationSummary> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("verification_status")
    .eq("id", userId)
    .single();

  const { data: verification } = await supabase
    .from("student_verifications")
    .select("status,rejection_reason,submitted_at")
    .eq("student_id", userId)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    status: profile?.verification_status ?? "not_submitted",
    rejectionReason: verification?.rejection_reason ?? null,
    submittedAt: verification?.submitted_at ?? null,
  };
}
