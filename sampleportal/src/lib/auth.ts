import crypto from "node:crypto";
import type { SessionPayload, SessionUser } from "@/types/portal";

const SESSION_COOKIE = "sampleportal_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30;

function b64url(input: Buffer | string): string {
  const buff = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buff
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function decodeB64url(input: string): Buffer {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return Buffer.from(padded, "base64");
}

function getSecret(): string {
  return process.env.AUTH_SECRET || "change-this-in-production";
}

export function createSessionToken(user: SessionUser): string {
  const payload: SessionPayload = {
    user,
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
  };

  const payloadEncoded = b64url(JSON.stringify(payload));
  const signature = b64url(
    crypto.createHmac("sha256", getSecret()).update(payloadEncoded).digest()
  );

  return `${payloadEncoded}.${signature}`;
}

export function verifySessionToken(token?: string): SessionPayload | null {
  if (!token || !token.includes(".")) return null;
  const [payloadEncoded, signature] = token.split(".");

  const expected = b64url(
    crypto.createHmac("sha256", getSecret()).update(payloadEncoded).digest()
  );

  if (signature !== expected) return null;

  try {
    const decoded = decodeB64url(payloadEncoded).toString("utf8");
    const payload = JSON.parse(decoded) as SessionPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export const authConfig = {
  SESSION_COOKIE,
  SESSION_DURATION_SECONDS,
};
