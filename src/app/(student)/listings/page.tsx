import Link from "next/link";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader, formatMoney } from "@/components/dashboard/page-kit";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { requireActiveUser } from "@/features/auth/services/auth.service";
import { createClient } from "@/lib/supabase/server";
export default async function MyListings() {
  const u = await requireActiveUser();
  const { data } = await (
    await createClient()
  )
    .from("listings")
    .select("id,title,price_kobo,status,condition,category")
    .eq("seller_id", u.id)
    .order("created_at", { ascending: false });
  return (
    <>
      <PageHeader
        eyebrow="Your storefront"
        title="My listings"
        description="Manage every item you have offered to the student community."
        action={{ href: "/listings/new", label: "Create listing" }}
      />
      {!data?.length ? (
        <EmptyState
          title="Your storefront is empty"
          description="Create your first listing to reach verified students."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((x) => (
            <Link
              href={`/marketplace/${x.id}`}
              key={x.id}
              className="rounded-2xl border bg-white p-5"
            >
              <StatusBadge status={x.status} />
              <h3 className="mt-4 text-lg font-bold">{x.title}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {x.category} · {x.condition}
              </p>
              <p className="mt-4 text-xl font-bold">
                {formatMoney(x.price_kobo)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
