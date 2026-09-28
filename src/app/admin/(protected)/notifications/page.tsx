import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader, formatDate } from "@/components/dashboard/page-kit";
import { requireAdmin } from "@/features/auth/services/auth.service";
import { createAdminClient } from "@/lib/supabase/admin";
export default async function AdminNotifications() {
  const user = await requireAdmin();
  const { data } = await createAdminClient()
    .from("notifications")
    .select("id,title,body,type,read_at,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  return (
    <>
      <PageHeader
        eyebrow="Operations inbox"
        title="Notifications"
        description="Security, queue, and marketplace updates for your administrator account."
      />
      {!data?.length ? (
        <EmptyState
          title="Inbox clear"
          description="New operational notifications will appear here."
        />
      ) : (
        <div className="space-y-3">
          {data.map((x) => (
            <article
              key={x.id}
              className={`rounded-2xl border bg-white p-5 ${x.read_at ? "opacity-70" : "border-blue-200"}`}
            >
              <div className="flex justify-between gap-4">
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
