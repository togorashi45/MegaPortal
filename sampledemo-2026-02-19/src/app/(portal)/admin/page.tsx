import { requireModuleAccess } from "@/lib/module-guard";
import { AdminClient } from "./admin-client";

export default async function AdminPage() {
  await requireModuleAccess("admin", "VIEW");
  return <AdminClient />;
}
