import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const ADMIN_SESSION_COOKIE = "deroma_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 12;
const adminAuthConfigError = "ADMIN_SECRET is not configured.";

function getSecret() {
  const secret = process.env.ADMIN_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret || secret === "your-admin-secret-here" || secret === "your-nextauth-secret-here") {
    throw new Error(adminAuthConfigError);
  }
  return secret;
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

function createToken(user: { id: string; email: string }) {
  const payload = Buffer.from(JSON.stringify({
    sub: user.id,
    email: user.email,
    role: "admin",
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function readToken(token?: string) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { sub: string; email: string; role: string; exp: number };
    if (data.role !== "admin" || data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return readToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  try {
    const user = await prisma.user.findUnique({ where: { id: session.sub }, select: { id: true, email: true, role: true, name: true } });
    if (!user || user.role !== "admin") redirect("/admin/login");
    return user;
  } catch (error) {
    console.error("Failed to verify admin session user:", error);
    redirect("/admin/login");
  }
}

export async function loginAdmin(email: string, password: string) {
  // Validate configuration before touching the database so callers can
  // distinguish a missing secret from a transient database failure.
  getSecret();
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user || user.role !== "admin" || !(await bcrypt.compare(password, user.passwordHash))) {
    return { success: false as const, error: "Invalid admin email or password." };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, createToken(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: SESSION_MAX_AGE,
  });
  return { success: true as const };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, "", { httpOnly: true, expires: new Date(0), path: "/admin" });
}
