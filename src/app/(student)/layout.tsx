import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireActiveUser } from "@/features/auth/services/auth.service";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireActiveUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();
  const items = [
    { href: "/dashboard", label: "Dashboard", icon: "gauge" as const },
    {
      href: "/marketplace",
      label: "Marketplace",
      icon: "shopping-bag" as const,
    },
    { href: "/listings", label: "My listings", icon: "list" as const },
    {
      href: "/listings/new",
      label: "Create listing",
      icon: "plus-circle" as const,
    },
    {
      href: "/transactions",
      label: "Transactions",
      icon: "receipt-text" as const,
    },
    { href: "/disputes", label: "Disputes", icon: "gavel" as const },
    {
      href: "/verification",
      label: "Verification",
      icon: "badge-check" as const,
    },
    { href: "/payouts", label: "Payouts", icon: "circle-dollar-sign" as const },
    { href: "/notifications", label: "Notifications", icon: "bell" as const },
    {
      href: "/profile",
      label: "Profile & account",
      icon: "circle-user-round" as const,
    },
  ];
  return (
    <DashboardShell
      items={items}
      mode="student"
      name={data?.full_name ?? user.email ?? "Student"}
    >
      {children}
    </DashboardShell>
  );
}
