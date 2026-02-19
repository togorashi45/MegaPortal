import { redirect } from "next/navigation";
import { canAccess } from "@/lib/access";
import { requireSessionUser } from "@/lib/session";
import type { AccessLevel, ModuleKey, UserWithAccess } from "@/types/portal";

export async function requireModuleAccess(
  module: ModuleKey,
  minimum: AccessLevel = "VIEW"
): Promise<UserWithAccess> {
  const user = await requireSessionUser();
  if (!canAccess(user, module, minimum)) {
    redirect("/dashboard?blocked=1");
  }
  return user;
}
