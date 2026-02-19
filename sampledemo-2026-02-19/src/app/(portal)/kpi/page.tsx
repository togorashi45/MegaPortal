import { requireModuleAccess } from "@/lib/module-guard";
import { KpiClient } from "./kpi-client";

export default async function KpiPage() {
  const user = await requireModuleAccess("kpi", "VIEW");
  const canEdit = user.role === "SUPER_ADMIN" || user.role === "ADMIN";
  return <KpiClient canEdit={canEdit} />;
}
