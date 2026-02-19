import { NextResponse } from "next/server";
import { updateUserAccess } from "@/data/users";
import { getSessionUser } from "@/lib/session";
import type { AccessLevel, ModuleKey } from "@/types/portal";

const accessValues: AccessLevel[] = ["NONE", "VIEW", "EDIT", "ADMIN"];

export async function PATCH(request: Request): Promise<NextResponse> {
  const user = await getSessionUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as {
    userId?: string;
    module?: ModuleKey;
    accessLevel?: AccessLevel;
  };

  if (!body.userId || !body.module || !body.accessLevel || !accessValues.includes(body.accessLevel)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const updated = updateUserAccess(body.userId, body.module, body.accessLevel);
  if (!updated) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user: updated });
}
