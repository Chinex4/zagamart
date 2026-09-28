import { reviewVerificationAction } from "@/features/admin/actions/admin.actions";
import { PageHeader, formatDate } from "@/components/dashboard/page-kit";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { createAdminClient } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
export default async function VerificationsPage() {
  const db = createAdminClient();
  const { data } = await db
    .from("student_verifications")
    .select(
      "id,student_id,status,rejection_reason,reviewed_at,submitted_at,student_id_path,fee_receipt_path,profiles!student_verifications_student_id_fkey(full_name,matric_number,programme,level)",
    )
    .order("submitted_at", { ascending: false });
  const rows = data ?? [];
  return (
    <>
      <PageHeader
        eyebrow="Identity & trust"
        title="KYC verification queue"
        description="Inspect student identity documents through short-lived signed links, then approve or reject with a clear reason."
      />
      {!rows.length ? (
        <EmptyState
          title="Queue cleared"
          description="There are no student verification submissions yet."
        />
      ) : (
        <div className="grid gap-4">
          {await Promise.all(
            rows.map(async (row) => {
              const [idUrl, receiptUrl] = await Promise.all([
                db.storage
                  .from("kyc-documents")
                  .createSignedUrl(row.student_id_path, 300),
                db.storage
                  .from("kyc-documents")
                  .createSignedUrl(row.fee_receipt_path, 300),
              ]);
              const profile = Array.isArray(row.profiles)
                ? row.profiles[0]
                : row.profiles;
              return (
                <article
                  key={row.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold">
                          {profile?.full_name ?? "Student"}
                        </h3>
                        <StatusBadge status={row.status} />
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {profile?.matric_number ?? "No matric number"} ·{" "}
                        {profile?.programme ?? "Programme unavailable"} ·{" "}
                        {profile?.level ?? "—"}
                      </p>
                      <p className="mt-2 text-xs text-slate-400">
                        Submitted {formatDate(row.submitted_at)} · Reviewed{" "}
                        {formatDate(row.reviewed_at)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={idUrl.data?.signedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border px-4 py-2 text-sm font-semibold"
                      >
                        Student ID
                      </a>
                      <a
                        href={receiptUrl.data?.signedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border px-4 py-2 text-sm font-semibold"
                      >
                        Fee receipt
                      </a>
                    </div>
                  </div>
                  {row.status === "pending" && (
                    <form
                      action={reviewVerificationAction}
                      className="mt-5 grid gap-3 border-t pt-5 sm:grid-cols-[1fr_auto_auto]"
                    >
                      <input
                        type="hidden"
                        name="verificationId"
                        value={row.id}
                      />
                      <input
                        name="reason"
                        placeholder="Rejection reason (required when rejecting)"
                        className="rounded-xl border border-slate-300 px-4 py-2.5"
                      />
                      <button
                        name="status"
                        value="verified"
                        className="rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white"
                      >
                        Approve
                      </button>
                      <button
                        name="status"
                        value="rejected"
                        className="rounded-xl bg-red-600 px-4 py-2.5 font-semibold text-white"
                      >
                        Reject
                      </button>
                    </form>
                  )}
                  {row.rejection_reason && (
                    <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                      Reason: {row.rejection_reason}
                    </p>
                  )}
                </article>
              );
            }),
          )}
        </div>
      )}
    </>
  );
}
