import { canAccess } from "@/lib/access";
import { requireModuleAccess } from "@/lib/module-guard";
import { DealAnalyzerClient } from "./deal-analyzer-client";

export default async function DealAnalyzerPage() {
  const user = await requireModuleAccess("deal-analyzer", "VIEW");
  const canEdit = canAccess(user, "deal-analyzer", "EDIT");
  return <DealAnalyzerClient canEdit={canEdit} />;
}
