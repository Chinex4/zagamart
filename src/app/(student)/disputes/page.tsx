import Link from "next/link";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader, formatDate } from "@/components/dashboard/page-kit";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { requireActiveUser } from "@/features/auth/services/auth.service";
import { createClient } from "@/lib/supabase/server";
export default async function Disputes() {
  const u = await requireActiveUser();
  const { data } = await (
    await createClient()
  )
    .from("disputes")
    .select("id,status,reason,created_at,transactions(listings(title))")
    .eq("opened_by", u.id)
    .order("created_at", { ascending: false });
  return (
    <>
      <PageHeader
        eyebrow="Resolution center"
        title="Your disputes"
        description="Track submitted transaction issues and administrator resolutions."
      />
      {!data?.length ? (
        <EmptyState
          title="No disputes"
          description="Eligible transactions can be disputed from their transaction workspace."
        />
      ) : (
        <div className="grid gap-3">
          {data.map((x) => {
            const t = Array.isArray(x.transactions)
              ? x.transactions[0]
              : x.transactions;
            const l =
              t && (Array.isArray(t.listings) ? t.listings[0] : t.listings);
            return (
              <Link
                key={x.id}
                href={`/disputes/${x.id}`}
                className="rounded-2xl border bg-white p-5"
              >
                <div className="flex justify-between">
                  <h3 className="font-bold">
                    {l?.title ?? "Transaction dispute"}
                  </h3>
                  <StatusBadge status={x.status} />
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                  {x.reason}
                </p>
                <p className="mt-3 text-xs text-slate-400">
                  Opened {formatDate(x.created_at)}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
