import { notFound, redirect } from "next/navigation";
import { ModuleWorkbench } from "@/components/module-workbench";
import { demoModuleConfigs, isDemoModuleKey } from "@/data/module-demos";
import { moduleRegistry } from "@/data/modules";
import { superAdminOnlyModules } from "@/data/users";
import { canAccess } from "@/lib/access";
import { requireModuleAccess } from "@/lib/module-guard";

export default async function DynamicModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  const registryEntry = moduleRegistry.find((item) => item.path === `/${module}`);
  if (!registryEntry) notFound();
  if (!isDemoModuleKey(registryEntry.key)) notFound();

  const user = await requireModuleAccess(registryEntry.key, "VIEW");
  if (
    superAdminOnlyModules.includes(registryEntry.key) &&
    user.role !== "SUPER_ADMIN"
  ) {
    redirect("/dashboard?blocked=1");
  }
  const canEdit = canAccess(user, registryEntry.key, "EDIT");

  return <ModuleWorkbench config={demoModuleConfigs[registryEntry.key]} canEdit={canEdit} />;
}
