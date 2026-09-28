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
    <main className="min-h-screen bg-[#f7f9fc] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <Link
            className="text-2xl font-black tracking-tight text-blue-600"
            href="/"
          >
            ZagaMart
          </Link>
          <Link
            className="text-sm font-semibold text-slate-600 hover:text-blue-600"
            href="/marketplace"
          >
            Browse marketplace
          </Link>
        </div>
      </header>
      <div className="mx-auto grid min-h-[calc(100vh-81px)] max-w-7xl lg:grid-cols-[.9fr_1.1fr]">
        <aside className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
          <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full border-[50px] border-blue-500/15" />
          <p className="relative text-sm font-bold uppercase tracking-[.2em] text-blue-400">
            Campus marketplace
          </p>
          <div className="relative">
            <h2 className="max-w-md text-5xl font-black leading-[1.05] tracking-[-.04em]">
              Buy better. Sell safely. Stay on campus.
            </h2>
            <p className="mt-6 max-w-md text-lg leading-8 text-slate-300">
              Join a marketplace designed around verified students, protected
              transactions and clear dispute handling.
            </p>
            <div className="mt-8 flex gap-6 text-sm text-slate-400">
              <span>Verified users</span>
              <span>Protected payments</span>
            </div>
          </div>
          <p className="relative text-sm text-slate-500">
            ZagaMart · Student commerce with trust built in.
          </p>
        </aside>
        <section className="flex items-center px-5 py-12 sm:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
            <p className="text-sm font-bold text-blue-600">
              Welcome to ZagaMart
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-.03em]">
              {title}
            </h1>
            <p className="mt-3 leading-7 text-slate-600">{description}</p>
            <div className="mt-8">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
