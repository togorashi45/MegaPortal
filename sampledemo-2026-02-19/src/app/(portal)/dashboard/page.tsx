import { requireModuleAccess } from "@/lib/module-guard";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const user = await requireModuleAccess("dashboard", "VIEW");
  return <DashboardClient userName={user.name} canEdit={user.role !== "MEMBER"} />;
}
