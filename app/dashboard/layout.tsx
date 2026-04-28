import { requireActiveSession } from "@/lib/workspace";
import { DashboardShellProvider } from "@/components/dashboard/dashboard-shell-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireActiveSession();
  return (
    <DashboardShellProvider session={session}>{children}</DashboardShellProvider>
  );
}
