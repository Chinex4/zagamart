import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader, formatDate } from "@/components/dashboard/page-kit";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { createAdminClient } from "@/lib/supabase/admin";
export default async function FraudPage({
  searchParams,
}: {
  searchParams: Promise<{ severity?: string }>;
}) {
  const { severity } = await searchParams;
  const db = createAdminClient();
  let query = db
    .from("fraud_flags")
    .select(
      "id,user_id,score,severity,rule_code,details,resolved_at,created_at,profiles!fraud_flags_user_id_fkey(full_name,matric_number)",
    )
    .order("created_at", { ascending: false });
  if (severity) query = query.eq("severity", severity);
  const { data } = await query;
  const rows = data ?? [];
  return (
    <>
      <PageHeader
        eyebrow="Marketplace safety"
        title="Fraud and risk flags"
        description="Risk signals are restricted to active administrators. Review contributing rules without exposing security intelligence to students."
      />
      <form className="mb-5">
        <select
          name="severity"
          defaultValue={severity}
          className="rounded-xl border bg-white px-4 py-3"
          onChange={undefined}
        >
          <option value="">All severity levels</option>
          {["low", "medium", "high", "critical"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <button className="ml-2 rounded-xl bg-slate-950 px-4 py-3 text-white">
          Filter
        </button>
      </form>
      {!rows.length ? (
        <EmptyState
          title="No matching risk flags"
          description="No accounts currently match this filter."
        />
      ) : (
        <div className="grid gap-4">
          {rows.map((row) => {
            const profile = Array.isArray(row.profiles)
              ? row.profiles[0]
              : row.profiles;
            return (
              <article key={row.id} className="rounded-2xl border bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold">
                      {profile?.full_name ?? "Unknown user"}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {profile?.matric_number ?? row.user_id} · {row.rule_code}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{row.score}</span>
                    <StatusBadge status={row.severity} />
                    <StatusBadge
                      status={row.resolved_at ? "resolved" : "open"}
                    />
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Created {formatDate(row.created_at)} · Signals:{" "}
                  {JSON.stringify(row.details)}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
