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
    { href: "/admin", label: "Overview", icon: "gauge" as const },
    {
      href: "/admin/verifications",
      label: "KYC verifications",
      icon: "badge-check" as const,
    },
    { href: "/admin/users", label: "Users", icon: "users" as const },
    { href: "/admin/listings", label: "Listings", icon: "shopping-bag" as const },
    { href: "/admin/transactions", label: "Transactions", icon: "list" as const },
    { href: "/admin/fraud", label: "Fraud flags", icon: "shield-alert" as const },
    { href: "/admin/disputes", label: "Disputes", icon: "gavel" as const },
    { href: "/admin/payouts", label: "Payouts", icon: "circle-dollar-sign" as const },
    { href: "/admin/notifications", label: "Notifications", icon: "bell" as const },
    { href: "/admin/audit", label: "Audit logs", icon: "file-clock" as const },
    { href: "/admin/settings", label: "Settings", icon: "settings" as const },
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
