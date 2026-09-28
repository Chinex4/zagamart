import Link from "next/link";
import { PageHeader, formatDate } from "@/components/dashboard/page-kit";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { createAdminClient } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const db = createAdminClient();
  let query = db
    .from("profiles")
    .select(
      "id,full_name,matric_number,university_email,programme,level,verification_status,account_status,role,created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  if (q)
    query = query.or(
      `full_name.ilike.%${q}%,matric_number.ilike.%${q}%,university_email.ilike.%${q}%`,
    );
  const { data } = await query;
  const rows = data ?? [];
  return (
    <>
      <PageHeader
        eyebrow="People"
        title="Student and admin accounts"
        description="Search identity, verification, access state, and account history. Open a profile for trusted moderation actions."
      />
      <form className="mb-5 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name, matric number, or email"
          className="min-h-11 flex-1 rounded-xl border border-slate-300 bg-white px-4"
        />
        <button className="rounded-xl bg-slate-950 px-5 font-semibold text-white">
          Search
        </button>
      </form>
      {!rows.length ? (
        <EmptyState
          title="No users found"
          description="Try another search term."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                {[
                  "User",
                  "Programme",
                  "Verification",
                  "Account",
                  "Role",
                  "Joined",
                  "",
                ].map((x) => (
                  <th key={x} className="px-4 py-3">
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <p className="font-semibold">{row.full_name}</p>
                    <p className="text-xs text-slate-500">
                      {row.matric_number ?? row.university_email ?? "—"}
                    </p>
                  </td>
                  <td className="px-4">
                    {row.programme ?? "—"} · {row.level ?? "—"}
                  </td>
                  <td className="px-4">
                    <StatusBadge status={row.verification_status} />
                  </td>
                  <td className="px-4">
                    <StatusBadge status={row.account_status} />
                  </td>
                  <td className="px-4 capitalize">{row.role}</td>
                  <td className="px-4">{formatDate(row.created_at)}</td>
                  <td className="px-4">
                    <Link
                      className="font-semibold text-blue-700"
                      href={`/admin/users/${row.id}`}
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
