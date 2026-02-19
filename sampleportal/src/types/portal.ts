export type Role = "SUPER_ADMIN" | "ADMIN" | "MEMBER";

export type AccessLevel = "NONE" | "VIEW" | "EDIT" | "ADMIN";

export type ModuleKey =
  | "dashboard"
  | "mission-control"
  | "kpi"
  | "gps"
  | "tasks"
  | "wiki"
  | "assets"
  | "calendar"
  | "training"
  | "hr"
  | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface SessionPayload {
  user: SessionUser;
  exp: number;
}

export interface ModuleAccess {
  [key: string]: AccessLevel;
}

export interface UserWithAccess extends User {
  moduleAccess: ModuleAccess;
}
