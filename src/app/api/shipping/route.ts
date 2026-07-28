import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const zones = await prisma.shippingZone.findMany({ where: { active: true }, select: { governorates: true, fee: true, estimatedDays: true, freeShippingThreshold: true } }).catch(() => []);
  return NextResponse.json(zones.map((zone) => ({ governorates: zone.governorates, fee: Number(zone.fee), estimatedDays: zone.estimatedDays, freeShippingThreshold: zone.freeShippingThreshold ? Number(zone.freeShippingThreshold) : null })), { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
