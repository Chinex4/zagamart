import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/features/auth/services/auth.service";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DisputeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const supabase = await createClient();
  const { data: dispute } = await supabase
    .from("disputes")
    .select(
      "id,reason,status,resolution_note,created_at,transactions(id,amount_kobo,listings(title))",
    )
    .eq("id", id)
    .maybeSingle();

  if (!dispute) notFound();

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/dashboard" className="text-sm font-semibold text-blue-700">
          ← Dashboard
        </Link>
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-7">
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
            Dispute
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">
            {dispute.transactions?.[0]?.listings?.[0]?.title ??
              "Transaction dispute"}
          </h1>
          <p className="mt-5 text-sm leading-6 text-slate-700">
            {dispute.reason}
          </p>
          <div className="mt-6 rounded-2xl bg-slate-100 p-4">
            <p className="text-sm text-slate-500">Status</p>
            <p className="font-semibold capitalize">
              {dispute.status.replaceAll("_", " ")}
            </p>
          </div>
          {dispute.resolution_note ? (
            <div className="mt-4 rounded-2xl border border-slate-200 p-4">
              <p className="text-sm font-semibold">Resolution</p>
              <p className="mt-1 text-sm text-slate-700">
                {dispute.resolution_note}
              </p>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
