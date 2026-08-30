import { NextRequest, NextResponse } from "next/server";

const COOKIE = "deroma_admin_session";

function base64UrlToBytes(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(normalized);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function isValidSession(token?: string) {
  const adminSecret = process.env.ADMIN_SECRET || process.env.NEXTAUTH_SECRET;
  if (!token || !adminSecret) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  try {
    const data = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload))) as { role?: string; exp?: number };
    if (data.role !== "admin" || !data.exp || data.exp < Math.floor(Date.now() / 1000)) return false;
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(adminSecret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    return crypto.subtle.verify("HMAC", key, base64UrlToBytes(signature), new TextEncoder().encode(payload));
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin") || pathname === "/admin/login") return NextResponse.next();
  if (pathname.startsWith("/admin/api/")) return NextResponse.next();
  if (await isValidSession(request.cookies.get(COOKIE)?.value)) return NextResponse.next();

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = { matcher: ["/admin/:path*"] };
