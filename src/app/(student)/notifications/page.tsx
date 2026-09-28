import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader, formatDate } from "@/components/dashboard/page-kit";
import { requireActiveUser } from "@/features/auth/services/auth.service";
import { createClient } from "@/lib/supabase/server";
export default async function Notifications() {
  const u = await requireActiveUser();
  const { data } = await (
    await createClient()
  )
    .from("notifications")
    .select("id,title,body,read_at,created_at")
    .eq("user_id", u.id)
    .order("created_at", { ascending: false });
  return (
    <>
      <PageHeader
        eyebrow="Updates"
        title="Notifications"
        description="Verification, transaction, dispute, and payout events for your account."
      />
      {!data?.length ? (
        <EmptyState
          title="You're all caught up"
          description="Important marketplace updates will appear here."
        />
      ) : (
        <div className="space-y-3">
          {data.map((x) => (
            <article
              key={x.id}
              className={`rounded-2xl border bg-white p-5 ${x.read_at ? "opacity-70" : "border-blue-200"}`}
            >
              <div className="flex justify-between gap-3">
                <h3 className="font-bold">{x.title}</h3>
                <time className="text-xs text-slate-400">
                  {formatDate(x.created_at)}
                </time>
              </div>
              <p className="mt-2 text-sm text-slate-600">{x.body}</p>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
