import { notFound } from "next/navigation";
import {
  PageHeader,
  formatDate,
  formatMoney,
} from "@/components/dashboard/page-kit";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { updateAccountStatusAction } from "@/features/admin/actions/admin.actions";
import { createAdminClient } from "@/lib/supabase/admin";
export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = createAdminClient();
  const [
    { data: profile },
    { data: listings },
    { data: transactions },
    { data: disputes },
    { data: flags },
    { data: logs },
  ] = await Promise.all([
    db.from("profiles").select("*").eq("id", id).maybeSingle(),
    db
      .from("listings")
      .select("id,title,status,price_kobo")
      .eq("seller_id", id)
      .limit(10),
    db
      .from("transactions")
      .select("id,status,amount_kobo,created_at")
      .or(`buyer_id.eq.${id},seller_id.eq.${id}`)
      .limit(10),
    db
      .from("disputes")
      .select("id,status,reason,created_at")
      .eq("opened_by", id)
      .limit(10),
    db
      .from("fraud_flags")
      .select("id,score,severity,rule_code,resolved_at")
      .eq("user_id", id),
    db
      .from("audit_logs")
      .select("id,action,created_at")
      .eq("subject_id", id)
      .limit(10),
  ]);
  if (!profile) notFound();
  return (
    <>
      <PageHeader
        eyebrow="User record"
        title={profile.full_name}
        description={`${profile.matric_number ?? "No matric number"} · ${profile.university_email ?? "Email unavailable"} · joined ${formatDate(profile.created_at)}`}
      />
      <div className="grid gap-5 lg:grid-cols-3">
        <section className="rounded-2xl border bg-white p-5 lg:col-span-2">
          <h3 className="font-bold">Profile & access</h3>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-500">Programme / level</dt>
              <dd>
                {profile.programme ?? "—"} · {profile.level ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Verification</dt>
              <dd className="mt-1">
                <StatusBadge status={profile.verification_status} />
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Account</dt>
              <dd className="mt-1">
                <StatusBadge status={profile.account_status} />
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Role</dt>
              <dd className="capitalize">{profile.role}</dd>
            </div>
          </dl>
          {profile.suspension_reason && (
            <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              Suspension reason: {profile.suspension_reason}
            </p>
          )}
          {profile.role !== "admin" && (
            <form
              action={updateAccountStatusAction}
              className="mt-5 flex flex-col gap-3 border-t pt-5 sm:flex-row"
            >
              <input type="hidden" name="userId" value={profile.id} />
              <input
                name="reason"
                required={profile.account_status === "active"}
                placeholder="Reason for suspension"
                className="flex-1 rounded-xl border px-4 py-2"
              />
              <input
                type="hidden"
                name="suspended"
                value={profile.account_status === "active" ? "true" : "false"}
              />
              <button
                className={`rounded-xl px-5 py-2 font-semibold text-white ${profile.account_status === "active" ? "bg-red-600" : "bg-emerald-600"}`}
              >
                {profile.account_status === "active"
                  ? "Suspend account"
                  : "Reactivate account"}
              </button>
            </form>
          )}
        </section>
        <section className="rounded-2xl border bg-slate-950 p-5 text-white">
          <h3 className="font-bold">Risk overview</h3>
          <p className="mt-4 text-3xl font-bold">
            {flags?.filter((x) => !x.resolved_at).length ?? 0}
          </p>
          <p className="text-sm text-slate-400">unresolved fraud flags</p>
          <div className="mt-5 space-y-2">
            {flags?.map((f) => (
              <div key={f.id} className="rounded-xl bg-white/10 p-3 text-sm">
                {f.rule_code} · score {f.score} · {f.severity}
              </div>
            ))}
          </div>
        </section>
      </div>
      <section className="mt-5 grid gap-5 lg:grid-cols-3">
        <Record
          title="Listings"
          rows={(listings ?? []).map(
            (x) => `${x.title} · ${formatMoney(x.price_kobo)} · ${x.status}`,
          )}
        />
        <Record
          title="Transactions"
          rows={(transactions ?? []).map(
            (x) =>
              `${formatMoney(x.amount_kobo)} · ${x.status} · ${formatDate(x.created_at)}`,
          )}
        />
        <Record
          title="Disputes & activity"
          rows={[
            ...(disputes ?? []).map((x) => `${x.status}: ${x.reason}`),
            ...(logs ?? []).map(
              (x) => `${x.action} · ${formatDate(x.created_at)}`,
            ),
          ]}
        />
      </section>
    </>
  );
}
function Record({ title, rows }: { title: string; rows: string[] }) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <h3 className="font-bold">{title}</h3>
      <div className="mt-3 space-y-2">
        {rows.length ? (
          rows.map((x, i) => (
            <p key={`${x}-${i}`} className="rounded-lg bg-slate-50 p-3 text-sm">
              {x}
            </p>
          ))
        ) : (
          <p className="text-sm text-slate-500">No records.</p>
        )}
      </div>
    </div>
  );
}
