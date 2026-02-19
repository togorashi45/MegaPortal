import { moduleRegistry } from "@/data/modules";
import type { AccessLevel, ModuleAccess, ModuleKey, UserWithAccess } from "@/types/portal";

const moduleKeys = moduleRegistry.map((module) => module.key);

export const superAdminOnlyModules: ModuleKey[] = [
  "health-tracker",
  "house-manual",
  "family-manual",
];

export function canGrantModuleAccess(
  role: UserWithAccess["role"],
  module: ModuleKey,
  accessLevel: AccessLevel
): boolean {
  if (role !== "SUPER_ADMIN" && module === "admin" && accessLevel !== "NONE") {
    return false;
  }
  if (
    role !== "SUPER_ADMIN" &&
    superAdminOnlyModules.includes(module) &&
    accessLevel !== "NONE"
  ) {
    return false;
  }
  return true;
}

function buildAccess(defaultLevel: AccessLevel, overrides: Partial<Record<ModuleKey, AccessLevel>> = {}): ModuleAccess {
  const access: ModuleAccess = {};
  for (const key of moduleKeys) {
    access[key] = defaultLevel;
  }
  for (const [key, value] of Object.entries(overrides)) {
    if (value) access[key] = value;
  }
  return access;
}

const allEdit = buildAccess("ADMIN");

const editorAccess = buildAccess("EDIT", {
  assets: "NONE",
  admin: "NONE",
  "health-tracker": "NONE",
  "house-manual": "NONE",
  "family-manual": "NONE",
});

const viewerAccess = buildAccess("VIEW", {
  assets: "NONE",
  admin: "NONE",
  "health-tracker": "NONE",
  "house-manual": "NONE",
  "family-manual": "NONE",
  "automation-engine": "NONE",
  "appfolio-dashboard": "NONE",
  "tax-insurance": "NONE",
  "lending-capital-tracker": "NONE",
});

export const sampleUsers: UserWithAccess[] = [
  {
    id: "u_jake",
    name: "Jake McKinney",
    email: "jake@rspur.com",
    password: "sample123",
    role: "SUPER_ADMIN",
    moduleAccess: allEdit,
  },
  {
    id: "u_ian",
    name: "Ian",
    email: "ian@rspur.com",
    password: "sample123",
    role: "ADMIN",
    moduleAccess: editorAccess,
  },
  {
    id: "u_ava",
    name: "Ava",
    email: "ava@rspur.com",
    password: "sample123",
    role: "MEMBER",
    moduleAccess: viewerAccess,
  },
];

export function findUserByEmail(email: string): UserWithAccess | undefined {
  return sampleUsers.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string): UserWithAccess | undefined {
  return sampleUsers.find((user) => user.id === id);
}

export function getAccessForModule(user: UserWithAccess, module: ModuleKey): string {
  if (user.role === "SUPER_ADMIN") return "ADMIN";
  return user.moduleAccess[module] ?? "NONE";
}

export function listUsers(): UserWithAccess[] {
  return sampleUsers.map((user) => ({
    ...user,
    moduleAccess: { ...user.moduleAccess },
  }));
}

export function updateUserAccess(
  userId: string,
  module: ModuleKey,
  accessLevel: AccessLevel
): UserWithAccess | null {
  const user = sampleUsers.find((item) => item.id === userId);
  if (!user) return null;
  if (!canGrantModuleAccess(user.role, module, accessLevel)) return null;
  user.moduleAccess[module] = accessLevel;
  return user;
}

export function createDemoUser(input: {
  name: string;
  email: string;
  password: string;
  role: "SUPER_ADMIN" | "ADMIN" | "MEMBER";
}): UserWithAccess {
  const id = `u_${Math.random().toString(36).slice(2, 9)}`;
  const moduleAccess =
    input.role === "SUPER_ADMIN"
      ? buildAccess("ADMIN")
      : input.role === "ADMIN"
        ? buildAccess("EDIT", {
            assets: "NONE",
            admin: "NONE",
            "health-tracker": "NONE",
            "house-manual": "NONE",
            "family-manual": "NONE",
          })
        : buildAccess("VIEW", {
            assets: "NONE",
            admin: "NONE",
            "health-tracker": "NONE",
            "house-manual": "NONE",
            "family-manual": "NONE",
            "automation-engine": "NONE",
            "appfolio-dashboard": "NONE",
            "tax-insurance": "NONE",
            "lending-capital-tracker": "NONE",
          });

  const user: UserWithAccess = {
    id,
    name: input.name,
    email: input.email,
    password: input.password,
    role: input.role,
    moduleAccess,
  };

  sampleUsers.push(user);
  return user;
}
