import Link from "next/link";

import { requireUser } from "@/features/auth/services/auth.service";
import { ListingForm } from "@/features/listings/components/listing-form";

export default async function NewListingPage() {
  await requireUser();

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/dashboard" className="text-sm font-semibold text-blue-700">← Dashboard</Link>
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-7 sm:p-9">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">New listing</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Sell something on campus</h1>
          <p className="mt-3 text-slate-600">Add accurate details so buyers know exactly what they are getting.</p>
          <div className="mt-8"><ListingForm /></div>
        </div>
      </div>
    </main>
  );
}
