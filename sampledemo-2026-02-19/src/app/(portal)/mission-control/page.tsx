import { requireModuleAccess } from "@/lib/module-guard";
import { MissionControlClient } from "./mission-control-client";

export default async function MissionControlPage() {
  const user = await requireModuleAccess("mission-control", "VIEW");
  return <MissionControlClient canEdit={user.role !== "MEMBER"} />;
}
