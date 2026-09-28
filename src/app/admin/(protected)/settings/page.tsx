import { PageHeader, formatDate } from "@/components/dashboard/page-kit";
import { EmptyState } from "@/components/dashboard/empty-state";
import { createAdminClient } from "@/lib/supabase/admin";
export default async function SettingsPage() {
  const { data } = await createAdminClient()
    .from("system_settings")
    .select("key,value,description,updated_at")
    .order("key");
  return (
    <>
      <PageHeader
        eyebrow="Platform configuration"
        title="Settings"
        description="Read the trusted operational configuration currently applied by ZagaMart."
      />
      {!data?.length ? (
        <EmptyState
          title="No custom settings"
          description="The platform is currently using secure application defaults."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.map((x) => (
            <article key={x.key} className="rounded-2xl border bg-white p-5">
              <h3 className="font-bold">{x.key}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {x.description ?? "Platform setting"}
              </p>
              <pre className="mt-4 overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-blue-200">
                {JSON.stringify(x.value, null, 2)}
              </pre>
              <p className="mt-2 text-xs text-slate-400">
                Updated {formatDate(x.updated_at)}
              </p>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
