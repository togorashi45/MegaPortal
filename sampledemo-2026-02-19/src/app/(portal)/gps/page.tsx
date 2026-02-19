import { requireModuleAccess } from "@/lib/module-guard";
import { GpsClient } from "./gps-client";

export default async function GpsPage() {
  const user = await requireModuleAccess("gps", "VIEW");
  const canEdit = user.role !== "MEMBER";
  return <GpsClient canEdit={canEdit} owner={user.name} />;
}
