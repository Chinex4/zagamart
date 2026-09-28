import {
  BadgeCheck,
  Bell,
  CircleDollarSign,
  CircleUserRound,
  Gauge,
  Gavel,
  List,
  PlusCircle,
  ReceiptText,
  ShoppingBag,
} from "lucide-react";
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
    { href: "/dashboard", label: "Dashboard", icon: Gauge },
    { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
    { href: "/listings", label: "My listings", icon: List },
    { href: "/listings/new", label: "Create listing", icon: PlusCircle },
    { href: "/transactions", label: "Transactions", icon: ReceiptText },
    { href: "/disputes", label: "Disputes", icon: Gavel },
    { href: "/verification", label: "Verification", icon: BadgeCheck },
    { href: "/payouts", label: "Payouts", icon: CircleDollarSign },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/profile", label: "Profile & account", icon: CircleUserRound },
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
