import { PageHeader, formatDate } from "@/components/dashboard/page-kit";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { requireActiveUser } from "@/features/auth/services/auth.service";
import { createClient } from "@/lib/supabase/server";
export default async function Profile() {
  const u = await requireActiveUser();
  const { data: p } = await (
    await createClient()
  )
    .from("profiles")
    .select(
      "full_name,matric_number,university_email,programme,level,phone,verification_status,account_status,created_at",
    )
    .eq("id", u.id)
    .single();
  return (
    <>
      <PageHeader
        eyebrow="Your account"
        title="Profile and security"
        description="The trusted identity connected to your ZagaMart activity."
      />
      <section className="max-w-3xl rounded-2xl border bg-white p-6">
        <div className="flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row">
          <div>
            <h3 className="text-xl font-bold">{p?.full_name}</h3>
            <p className="text-sm text-slate-500">
              Member since {formatDate(p?.created_at ?? null)}
            </p>
          </div>
          <div className="flex gap-2">
            <StatusBadge status={p?.verification_status ?? "not_submitted"} />
            <StatusBadge status={p?.account_status ?? "unknown"} />
          </div>
        </div>
        <dl className="mt-5 grid gap-5 sm:grid-cols-2">
          {[
            ["University email", p?.university_email ?? u.email],
            ["Matric number", p?.matric_number],
            ["Programme", p?.programme],
            ["Level", p?.level],
            ["Phone", p?.phone],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs font-semibold uppercase text-slate-400">
                {k}
              </dt>
              <dd className="mt-1 font-medium">{v ?? "Not provided"}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
