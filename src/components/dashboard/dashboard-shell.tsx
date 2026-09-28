"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgeCheck, Bell, CircleDollarSign, CircleUserRound, ChevronRight, FileClock, Gauge, Gavel, List, LogOut, Menu, PlusCircle, ReceiptText, Settings, ShieldAlert, ShieldCheck, ShoppingBag, Users, X } from "lucide-react";

import { logoutAction } from "@/features/auth/actions/auth.actions";
import { cn } from "@/lib/utils/cn";

export type NavigationItem = {
  href: string;
  label: string;
  icon: "badge-check" | "bell" | "circle-dollar-sign" | "circle-user-round" | "file-clock" | "gauge" | "gavel" | "list" | "plus-circle" | "receipt-text" | "settings" | "shield-alert" | "shopping-bag" | "users";
};

const navigationIcons = {
  "badge-check": BadgeCheck,
  bell: Bell,
  "circle-dollar-sign": CircleDollarSign,
  "circle-user-round": CircleUserRound,
  "file-clock": FileClock,
  gauge: Gauge,
  gavel: Gavel,
  list: List,
  "plus-circle": PlusCircle,
  "receipt-text": ReceiptText,
  settings: Settings,
  "shield-alert": ShieldAlert,
  "shopping-bag": ShoppingBag,
  users: Users,
} satisfies Record<NavigationItem["icon"], React.ComponentType<{ className?: string }>>;

export function DashboardShell({
  children,
  items,
  mode,
  name,
}: {
  children: React.ReactNode;
  items: NavigationItem[];
  mode: "student" | "admin";
  name: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) =>
      event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const nav = (
    <>
      <div className="flex h-20 items-center justify-between border-b border-slate-800 px-5">
        <Link
          href={mode === "admin" ? "/admin" : "/dashboard"}
          className="flex items-center gap-3 font-bold text-white"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-blue-600">
            <ShieldCheck className="size-5" />
          </span>
          <span>
            ZagaMart{" "}
            <small className="block text-[10px] font-semibold uppercase tracking-widest text-blue-300">
              {mode === "admin" ? "Operations" : "Student market"}
            </small>
          </span>
        </Link>
        <button
          ref={closeRef}
          type="button"
          aria-label="Close navigation"
          className="rounded-lg p-2 text-slate-300 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <X />
        </button>
      </div>
      <nav
        aria-label={`${mode} navigation`}
        className="flex-1 space-y-1 overflow-y-auto p-4"
      >
        {items.map(({ href, label, icon }) => {
          const Icon = navigationIcons[icon];
          const active =
            pathname === href ||
            (href !== "/admin" &&
              href !== "/dashboard" &&
              pathname.startsWith(`${href}/`));
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white",
              )}
            >
              <Icon className="size-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <form action={logoutAction} className="border-t border-slate-800 p-4">
        <button className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-300 hover:bg-red-950 hover:text-red-200">
          <LogOut className="size-5" /> Sign out
        </button>
      </form>
    </>
  );

  const title =
    items.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    )?.label ?? "Workspace";
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col bg-slate-950 lg:flex">
        {nav}
      </aside>
      {open && (
        <>
          <button
            aria-label="Close navigation overlay"
            className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="fixed inset-y-0 left-0 z-50 flex w-[min(86vw,20rem)] flex-col bg-slate-950 shadow-2xl lg:hidden"
          >
            {nav}
          </aside>
        </>
      )}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-20 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
            className="grid size-11 place-items-center rounded-xl border border-slate-200 lg:hidden"
          >
            <Menu />
          </button>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 text-xs font-medium text-slate-500">
              ZagaMart <ChevronRight className="size-3" />{" "}
              {mode === "admin" ? "Admin" : "My account"}
            </p>
            <h1 className="truncate text-lg font-bold sm:text-xl">{title}</h1>
          </div>
          <Link
            href={mode === "admin" ? "/admin/notifications" : "/notifications"}
            aria-label="Notifications"
            className="relative grid size-11 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <Bell className="size-5" />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-blue-600" />
          </Link>
          <div className="hidden items-center gap-3 sm:flex">
            <span className="grid size-10 place-items-center rounded-full bg-slate-900 font-bold text-white">
              {name.slice(0, 1).toUpperCase()}
            </span>
            <span className="max-w-36 truncate text-sm font-semibold">
              {name}
            </span>
          </div>
        </header>
        <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
