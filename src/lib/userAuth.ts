import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export const CUSTOMER_SESSION_COOKIE = "deroma_customer_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getSecret() {
  return process.env.CUSTOMER_SECRET || process.env.ADMIN_SECRET || process.env.NEXTAUTH_SECRET || "deroma-customer-secret-key-2026";
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createCustomerToken(user: { id: string; email: string; name?: string | null }) {
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      name: user.name || "",
      role: "customer",
      exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
    })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readCustomerToken(token?: string) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      sub: string;
      email: string;
      name?: string;
      role: string;
      exp: number;
    };
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getCustomerSession() {
  const cookieStore = await cookies();
  return readCustomerToken(cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value);
}
