import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader, formatDate } from "@/components/dashboard/page-kit";
import { createAdminClient } from "@/lib/supabase/admin";
export default async function AuditPage() {
  const { data } = await createAdminClient()
    .from("audit_logs")
    .select("id,actor_id,action,subject_type,subject_id,metadata,created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = data ?? [];
  return (
    <>
      <PageHeader
        eyebrow="Accountability"
        title="Audit log"
        description="Immutable operational activity provides traceability for privileged marketplace decisions."
      />
      {!rows.length ? (
        <EmptyState
          title="No audit events"
          description="Privileged operations will be recorded here."
        />
      ) : (
        <div className="space-y-2">
          {rows.map((x) => (
            <article key={x.id} className="rounded-xl border bg-white p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <strong>{x.action}</strong>
                <time className="text-xs text-slate-500">
                  {formatDate(x.created_at)}
                </time>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {x.subject_type} · {x.subject_id ?? "system"} · actor{" "}
                {x.actor_id ?? "system"}
              </p>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
