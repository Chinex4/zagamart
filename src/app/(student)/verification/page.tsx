import Link from "next/link";

import { requireUser } from "@/features/auth/services/auth.service";
import { KycForm } from "@/features/kyc/components/kyc-form";
import { getVerificationSummary } from "@/features/kyc/services/kyc.service";

export default async function VerificationPage() {
  const user = await requireUser();
  const verification = await getVerificationSummary(user.id);

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="mx-auto max-w-3xl">
        <Link className="font-bold text-slate-950" href="/dashboard">
          Zagamart
        </Link>
        <div className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
            Student verification
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Verify your student identity
          </h1>
          <p className="mt-3 leading-7 text-slate-600">
            Verification protects the campus marketplace. Your documents are
            stored privately and reviewed before trading is enabled.
          </p>

          <VerificationState status={verification.status} rejectionReason={verification.rejectionReason} />
        </div>
      </div>
    </main>
  );
}

function VerificationState({
  status,
  rejectionReason,
}: {
  status: "not_submitted" | "pending" | "verified" | "rejected";
  rejectionReason: string | null;
}) {
  if (status === "verified") {
    return <p className="mt-8 rounded-2xl bg-emerald-50 p-5 font-medium text-emerald-800">Your student account is verified. Marketplace trading is enabled.</p>;
  }

  if (status === "pending") {
    return <p className="mt-8 rounded-2xl bg-amber-50 p-5 font-medium text-amber-800">Your documents are awaiting administrator review.</p>;
  }

  return (
    <>
      {status === "rejected" ? (
        <div className="mt-8 rounded-2xl bg-red-50 p-5 text-red-800">
          <p className="font-semibold">Your previous submission needs attention.</p>
          {rejectionReason ? <p className="mt-2 text-sm">{rejectionReason}</p> : null}
        </div>
      ) : null}
      <KycForm />
    </>
  );
}
