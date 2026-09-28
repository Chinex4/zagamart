import Link from "next/link";
import { notFound } from "next/navigation";

import { getListingById } from "@/features/listings/services/listing.service";

export const dynamic = "force-dynamic";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) notFound();

  const price = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(listing.price_kobo / 100);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link
          href="/marketplace"
          className="text-sm font-semibold text-blue-700"
        >
          ← Marketplace
        </Link>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="aspect-[4/3] rounded-3xl bg-slate-200" />
          <section className="rounded-3xl border border-slate-200 bg-white p-7">
            <p className="text-sm font-semibold text-blue-700">
              {listing.category} · {listing.condition}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              {listing.title}
            </h1>
            <p className="mt-4 text-3xl font-bold text-slate-950">{price}</p>
            {listing.location_label ? (
              <p className="mt-3 text-sm text-slate-500">
                Meet-up: {listing.location_label}
              </p>
            ) : null}
            <div className="my-6 h-px bg-slate-200" />
            <p className="whitespace-pre-wrap leading-7 text-slate-700">
              {listing.description}
            </p>
            <div className="mt-8 rounded-2xl bg-blue-50 p-4 text-sm text-blue-950">
              Checkout and protected transaction handling will be connected in
              the payments phase. Never pay a seller outside Zagamart based on
              this page.
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
