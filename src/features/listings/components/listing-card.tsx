import Link from "next/link";

import type { MarketplaceListing } from "@/features/listings/types/listing";

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

export function ListingCard({ listing }: { listing: MarketplaceListing }) {
  return (
    <Link
      href={`/marketplace/${listing.id}`}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="aspect-[4/3] bg-slate-100 p-5">
        <div className="flex h-full items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-medium text-slate-500">
          {listing.category}
        </div>
      </div>
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
          {listing.condition}
        </p>
        <h2 className="mt-2 line-clamp-2 font-semibold text-slate-950 group-hover:text-blue-700">
          {listing.title}
        </h2>
        <p className="mt-3 text-lg font-bold text-slate-950">
          {formatNaira(listing.price_kobo)}
        </p>
        {listing.location_label ? (
          <p className="mt-2 text-sm text-slate-500">
            {listing.location_label}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
