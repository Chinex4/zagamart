import Link from "next/link";
import type { LucideIcon } from "lucide-react";
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: { href: string; label: string };
}) {
  return (
    <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-blue-600">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-200"
        >
          {action.label}
        </Link>
      )}
    </header>
  );
}
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-700">
          <Icon className="size-5" />
        </span>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight">{value}</p>
      {hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
export function formatMoney(kobo: number | string | null) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(kobo ?? 0) / 100);
}
export function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(
        new Date(value),
      )
    : "—";
}
