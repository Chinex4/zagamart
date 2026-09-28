import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-20 lg:px-8">
        <p className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-blue-400">
          Campus marketplace
        </p>
        <h1 className="max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
          Buy and sell safely within your campus community.
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
          Zagamart is being built around verified students, protected
          transactions, transparent disputes, and a marketplace experience that
          feels fast on every device.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
            href="/marketplace"
          >
            Explore marketplace
          </Link>
          <Link
            className="rounded-xl border border-slate-700 px-6 py-3 font-semibold transition hover:bg-slate-900"
            href="/register"
          >
            Create account
          </Link>
        </div>
      </section>
    </main>
  );
}
