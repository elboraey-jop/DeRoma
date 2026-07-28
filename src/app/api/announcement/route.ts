import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const now = new Date();
  const announcement = await prisma.announcementBar.findFirst({
    where: { active: true, AND: [{ OR: [{ startsAt: null }, { startsAt: { lte: now } }] }, { OR: [{ endsAt: null }, { endsAt: { gte: now } }] }] },
    orderBy: { createdAt: "desc" },
  }).catch(() => null);
  return NextResponse.json(announcement ? { text: announcement.text, backgroundColor: announcement.backgroundColor, textColor: announcement.textColor, moving: announcement.moving } : null, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
