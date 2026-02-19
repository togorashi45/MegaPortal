import { NextResponse } from "next/server";
import { listUsers, createDemoUser, findUserByEmail } from "@/data/users";
import { getSessionUser } from "@/lib/session";

export async function GET(): Promise<NextResponse> {
  const user = await getSessionUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    users: listUsers().map((item) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      role: item.role,
      moduleAccess: item.moduleAccess,
    })),
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  const user = await getSessionUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
    role?: "SUPER_ADMIN" | "ADMIN" | "MEMBER";
  };

  if (!body.name || !body.email || !body.password || !body.role) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (findUserByEmail(body.email)) {
    return NextResponse.json({ error: "User email already exists" }, { status: 409 });
  }

  const created = createDemoUser({
    name: body.name,
    email: body.email,
    password: body.password,
    role: body.role,
  });

  return NextResponse.json({ user: created }, { status: 201 });
}
