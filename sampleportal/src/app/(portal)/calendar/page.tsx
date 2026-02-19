import { requireModuleAccess } from "@/lib/module-guard";
import { CalendarClient } from "./calendar-client";

export default async function CalendarPage() {
  const user = await requireModuleAccess("calendar", "VIEW");
  const canEdit = user.role !== "MEMBER";
  return <CalendarClient canEdit={canEdit} currentUser={user.name} />;
}
