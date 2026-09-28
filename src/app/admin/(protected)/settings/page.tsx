import { PageHeader, formatDate } from "@/components/dashboard/page-kit";
import { EmptyState } from "@/components/dashboard/empty-state";
import { updateEmailLoginOtpSettingAction } from "@/features/admin/actions/admin.actions";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function SettingsPage() {
  const { data } = await createAdminClient()
    .from("system_settings")
    .select("key,value,description,updated_at")
    .order("key");
  const otpEnabled =
    data?.find((item) => item.key === "email_login_otp_enabled")?.value ===
    true;

  return (
    <>
      <PageHeader
        eyebrow="Platform configuration"
        title="Settings"
        description="Read the trusted operational configuration currently applied by ZagaMart."
      />
      <form
        action={updateEmailLoginOtpSettingAction}
        className="mb-4 rounded-2xl border bg-white p-5"
      >
        <h3 className="font-bold">Email OTP on login</h3>
        <p className="mt-1 text-sm text-slate-500">
          Require a one-time email code after a valid password sign-in.
        </p>
        <div className="mt-4 flex gap-2">
          <button
            name="enabled"
            value="true"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            type="submit"
          >
            Enable
          </button>
          <button
            name="enabled"
            value="false"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold"
            type="submit"
          >
            Disable
          </button>
          <span className="self-center text-sm text-slate-500">
            Currently {otpEnabled ? "enabled" : "disabled"}
          </span>
        </div>
      </form>
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
