import Link from "next/link";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-slate-950">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="hidden bg-slate-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <Link className="text-xl font-bold tracking-tight" href="/">
            Zagamart
          </Link>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
              Verified campus commerce
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight">
              A safer way for students to buy and sell.
            </h2>
            <p className="mt-5 max-w-md leading-7 text-slate-300">
              Student verification, protected transactions, clear dispute
              handling, and account controls are built into the marketplace.
            </p>
          </div>
          <p className="text-sm text-slate-400">
            Built initially for the DELSU Abraka community.
          </p>
        </aside>

        <section className="flex items-center p-7 sm:p-12 lg:p-16">
          <div className="mx-auto w-full max-w-md">
            <Link className="mb-10 inline-block font-bold lg:hidden" href="/">
              Zagamart
            </Link>
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-3 leading-7 text-slate-600">{description}</p>
            <div className="mt-8">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
