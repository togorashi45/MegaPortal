import { canAccess } from "@/lib/access";
import { requireModuleAccess } from "@/lib/module-guard";
import { AutomationEngineClient } from "./automation-engine-client";

export default async function AutomationEnginePage() {
  const user = await requireModuleAccess("automation-engine", "VIEW");
  const canEdit = canAccess(user, "automation-engine", "EDIT");
  return <AutomationEngineClient canEdit={canEdit} />;
}
