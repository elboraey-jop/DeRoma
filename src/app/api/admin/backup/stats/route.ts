import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";
import { getDatabaseStats } from "@/lib/backup/db-export";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await prisma.user.findUnique({ where: { id: session.sub }, select: { role: true } });
  if (admin?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const stats = await getDatabaseStats();
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("Failed to fetch database stats:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch database stats" },
      { status: 500 }
    );
  }
}
