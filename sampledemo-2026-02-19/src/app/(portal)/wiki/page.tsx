import { requireModuleAccess } from "@/lib/module-guard";
import { WikiClient } from "./wiki-client";

export default async function WikiPage() {
  const user = await requireModuleAccess("wiki", "VIEW");
  const canEdit = user.role !== "MEMBER";
  return <WikiClient canEdit={canEdit} />;
}
