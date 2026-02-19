import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    ok: true,
    service: "sampleportal-rspur",
    mode: "sample",
    timestamp: new Date().toISOString(),
  });
}
