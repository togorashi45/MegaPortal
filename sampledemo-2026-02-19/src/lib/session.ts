import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findUserById } from "@/data/users";
import { authConfig, verifySessionToken } from "@/lib/auth";
import type { UserWithAccess } from "@/types/portal";

export async function getSessionUser(): Promise<UserWithAccess | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(authConfig.SESSION_COOKIE)?.value;
  const payload = verifySessionToken(token);
  if (!payload) return null;
  const user = findUserById(payload.user.id);
  return user || null;
}

export async function requireSessionUser(): Promise<UserWithAccess> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}
