import { requireModuleAccess } from "@/lib/module-guard";
import { TrainingClient } from "./training-client";

export default async function TrainingPage() {
  const user = await requireModuleAccess("training", "VIEW");
  const canEdit = user.role !== "MEMBER";
  return <TrainingClient canEdit={canEdit} userName={user.name} />;
}
