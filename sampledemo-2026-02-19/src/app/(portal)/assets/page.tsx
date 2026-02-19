import { requireModuleAccess } from "@/lib/module-guard";
import { AssetsClient } from "./assets-client";

export default async function AssetsPage() {
  const user = await requireModuleAccess("assets", "VIEW");
  return <AssetsClient canEdit={user.role === "SUPER_ADMIN"} />;
}
