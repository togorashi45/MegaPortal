import { getAccessForModule } from "@/data/users";
import type { AccessLevel, ModuleKey, UserWithAccess } from "@/types/portal";

const rank: Record<AccessLevel, number> = {
  NONE: 0,
  VIEW: 1,
  EDIT: 2,
  ADMIN: 3,
};

export function canAccess(user: UserWithAccess, module: ModuleKey, minimum: AccessLevel = "VIEW"): boolean {
  if (user.role === "SUPER_ADMIN") return true;
  const current = getAccessForModule(user, module) as AccessLevel;
  return rank[current] >= rank[minimum];
}
