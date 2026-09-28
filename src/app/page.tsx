import Link from "next/link";

const categories = [
  ["Phones", "Stay connected", "PH"],
  ["Laptops", "Study & build", "LP"],
  ["Fashion", "Campus style", "FS"],
  ["Books", "Learn more", "BK"],
  ["Electronics", "Everyday tech", "EL"],
  ["Furniture", "Set up your space", "FR"],
];

const benefits = [
  ["Verified students", "Trade within a community built around student verification."],
  ["Protected payments", "Transaction states keep purchases traceable from payment to release."],
  ["Campus-first", "Discover useful items from people around your university community."],
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-950">
      <div className="bg-slate-950 px-5 py-2 text-center text-xs font-medium text-slate-300">
        A safer student marketplace for buying and selling around campus
      </div>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-5 py-5 lg:px-8">
          <Link href="/" className="text-2xl font-black tracking-tight text-blue-600">ZagaMart</Link>
          <form action="/marketplace" className="hidden flex-1 md:block">
            <input name="q" placeholder="Search phones, laptops, books and more..." className="w-full rounded-xl bg-slate-100 px-5 py-3 text-sm outline-none ring-blue-100 focus:ring-4" />
          </form>
          <nav className="ml-auto flex items-center gap-3 text-sm font-semibold">
            <Link href="/login" className="hidden sm:block">Sign in</Link>
            <Link href="/register" className="rounded-xl bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700">Join ZagaMart</Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-7 lg:px-8">
        <div className="grid overflow-hidden rounded-[2rem] bg-slate-950 lg:grid-cols-[1.2fr_.8fr]">
          <div className="p-8 sm:p-12 lg:p-16">
            <p className="text-sm font-bold uppercase tracking-[.18em] text-blue-400">Verified campus commerce</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-[-.04em] text-white sm:text-6xl">Great campus deals, without the marketplace guesswork.</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">Discover student-listed essentials, pay through a protected transaction flow, and sell what you no longer need.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/marketplace" className="rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white hover:bg-blue-500">Explore marketplace</Link>
              <Link href="/listings/new" className="rounded-xl border border-slate-700 px-6 py-3.5 font-bold text-white hover:bg-slate-900">Sell an item</Link>
            </div>
          </div>
          <div className="relative hidden min-h-[420px] overflow-hidden bg-blue-600 lg:block">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border-[42px] border-white/10" />
            <div className="absolute bottom-10 left-10 right-10 rounded-3xl bg-white p-7 shadow-2xl">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Campus picks</p>
              <p className="mt-2 text-2xl font-black">Find your next useful thing.</p>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {["Tech", "Books", "Style"].map((item) => <div key={item} className="rounded-2xl bg-slate-100 p-4 text-center text-sm font-bold">{item}</div>)}
              </div>
            </div>
          </div>
        </div>

        <section className="py-12">
          <div className="flex items-end justify-between gap-5 border-b border-slate-200 pb-4">
            <div><p className="text-sm font-semibold text-slate-500">Shop from</p><h2 className="text-2xl font-black">Top categories</h2></div>
            <Link href="/marketplace" className="text-sm font-bold text-blue-600">View all →</Link>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map(([name, desc, icon]) => (
              <Link href={"/marketplace?category="+encodeURIComponent(name)} key={name} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-sm font-black text-blue-600 group-hover:bg-blue-600 group-hover:text-white">{icon}</div>
                <h3 className="mt-5 font-bold">{name}</h3><p className="mt-1 text-xs text-slate-500">{desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-5 pb-14 md:grid-cols-3">
          {benefits.map(([title, copy], i) => <div key={title} className="rounded-3xl bg-white p-7 shadow-sm"><span className="text-sm font-black text-blue-600">0{i+1}</span><h3 className="mt-5 text-xl font-black">{title}</h3><p className="mt-3 leading-7 text-slate-600">{copy}</p></div>)}
        </section>
      </section>
      <footer className="bg-slate-950 px-5 py-10 text-slate-400"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 sm:flex-row"><strong className="text-xl text-white">ZagaMart</strong><p className="text-sm">Student commerce, designed with trust in mind.</p></div></footer>
    </main>
  );
}
