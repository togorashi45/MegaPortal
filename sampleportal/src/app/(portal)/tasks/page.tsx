import { requireModuleAccess } from "@/lib/module-guard";
import { TasksClient } from "./tasks-client";

export default async function TasksPage() {
  const user = await requireModuleAccess("tasks", "VIEW");
  const canEdit = user.role !== "MEMBER";
  return <TasksClient canEdit={canEdit} currentUser={user.name} />;
}
