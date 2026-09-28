import { cn } from "@/lib/utils/cn";

export function StatusBadge({ status }: { status: string }) {
  const value = status.replaceAll("_", " ");
  const tone = /verified|active|paid|released|resolved/.test(status)
    ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
    : /pending|processing|review|held/.test(status)
      ? "bg-amber-50 text-amber-700 ring-amber-600/20"
      : /reject|fail|suspend|cancel|critical/.test(status)
        ? "bg-red-50 text-red-700 ring-red-600/20"
        : "bg-slate-100 text-slate-700 ring-slate-500/20";
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset",
        tone,
      )}
    >
      {value}
    </span>
  );
}
