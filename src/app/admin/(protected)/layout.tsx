import {
  BadgeCheck,
  Bell,
  CircleDollarSign,
  FileClock,
  Gauge,
  Gavel,
  List,
  Settings,
  ShieldAlert,
  ShoppingBag,
  Users,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireAdmin } from "@/features/auth/services/auth.service";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminGuard>{children}</AdminGuard>;
}
async function AdminGuard({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const items = [
    { href: "/admin", label: "Overview", icon: Gauge },
    {
      href: "/admin/verifications",
      label: "KYC verifications",
      icon: BadgeCheck,
    },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/listings", label: "Listings", icon: ShoppingBag },
    { href: "/admin/transactions", label: "Transactions", icon: List },
    { href: "/admin/fraud", label: "Fraud flags", icon: ShieldAlert },
    { href: "/admin/disputes", label: "Disputes", icon: Gavel },
    { href: "/admin/payouts", label: "Payouts", icon: CircleDollarSign },
    { href: "/admin/notifications", label: "Notifications", icon: Bell },
    { href: "/admin/audit", label: "Audit logs", icon: FileClock },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];
  return (
    <DashboardShell
      items={items}
      mode="admin"
      name={user.email ?? "Administrator"}
    >
      {children}
    </DashboardShell>
  );
}
