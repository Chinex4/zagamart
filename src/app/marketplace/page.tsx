import Link from "next/link";

import { ListingCard } from "@/features/listings/components/listing-card";
import { getMarketplaceListings } from "@/features/listings/services/listing.service";

export const dynamic = "force-dynamic";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; condition?: string }>;
}) {
  const params = await searchParams;
  const listings = await getMarketplaceListings({
    query: params.q?.trim() || undefined,
    category: params.category || undefined,
    condition: params.condition || undefined,
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-bold">Zagamart</Link>
          <div className="flex gap-3">
            <Link href="/dashboard" className="rounded-lg px-4 py-2 text-sm font-semibold">Dashboard</Link>
            <Link href="/listings/new" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold">Sell an item</Link>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">DELSU campus marketplace</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Find what you need around campus.</h1>
          <p className="mt-3 text-slate-600">Browse items published by verified students.</p>
        </div>
        <form className="mt-8 flex max-w-2xl gap-3">
          <input name="q" defaultValue={params.q} placeholder="Search listings" className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3" />
          <button className="rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white">Search</button>
        </form>
        {listings.length ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">No active listings match your search yet.</div>
        )}
      </section>
    </main>
  );
}
