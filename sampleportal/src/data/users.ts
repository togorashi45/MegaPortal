import type { ModuleAccess, ModuleKey, UserWithAccess } from "@/types/portal";

const allEdit: ModuleAccess = {
  dashboard: "ADMIN",
  "mission-control": "ADMIN",
  kpi: "ADMIN",
  gps: "ADMIN",
  tasks: "ADMIN",
  wiki: "ADMIN",
  assets: "ADMIN",
  calendar: "ADMIN",
  training: "ADMIN",
  hr: "ADMIN",
  admin: "ADMIN",
};

const editorAccess: ModuleAccess = {
  dashboard: "VIEW",
  "mission-control": "EDIT",
  kpi: "EDIT",
  gps: "EDIT",
  tasks: "EDIT",
  wiki: "EDIT",
  assets: "NONE",
  calendar: "EDIT",
  training: "EDIT",
  hr: "VIEW",
  admin: "NONE",
};

const viewerAccess: ModuleAccess = {
  dashboard: "VIEW",
  "mission-control": "VIEW",
  kpi: "VIEW",
  gps: "VIEW",
  tasks: "VIEW",
  wiki: "VIEW",
  assets: "NONE",
  calendar: "VIEW",
  training: "VIEW",
  hr: "VIEW",
  admin: "NONE",
};

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
  accessLevel: "NONE" | "VIEW" | "EDIT" | "ADMIN"
): UserWithAccess | null {
  const user = sampleUsers.find((item) => item.id === userId);
  if (!user) return null;
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
  const defaultAccess: ModuleAccess = {
    dashboard: "VIEW",
    "mission-control": "VIEW",
    kpi: "VIEW",
    gps: "VIEW",
    tasks: "VIEW",
    wiki: "VIEW",
    assets: input.role === "SUPER_ADMIN" ? "ADMIN" : "NONE",
    calendar: "VIEW",
    training: "VIEW",
    hr: "VIEW",
    admin: input.role === "SUPER_ADMIN" ? "ADMIN" : "NONE",
  };

  const user: UserWithAccess = {
    id,
    name: input.name,
    email: input.email,
    password: input.password,
    role: input.role,
    moduleAccess: defaultAccess,
  };

  sampleUsers.push(user);
  return user;
}
