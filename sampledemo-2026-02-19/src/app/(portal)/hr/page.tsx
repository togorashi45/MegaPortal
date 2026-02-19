import { requireModuleAccess } from "@/lib/module-guard";
import { HrClient } from "./hr-client";

export default async function HrPage() {
  const user = await requireModuleAccess("hr", "VIEW");
  const canEdit = user.role !== "MEMBER";
  return <HrClient canEdit={canEdit} />;
}
