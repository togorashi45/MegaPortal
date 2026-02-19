import { NextResponse } from "next/server";
import { createSessionToken, authConfig } from "@/lib/auth";
import { findUserByEmail } from "@/data/users";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase() || "";
    const password = body.password || "";

    const user = findUserByEmail(email);
    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = createSessionToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({ ok: true, user: { id: user.id, name: user.name, role: user.role } });
    response.cookies.set(authConfig.SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: authConfig.SESSION_DURATION_SECONDS,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Unable to login" }, { status: 400 });
  }
}
