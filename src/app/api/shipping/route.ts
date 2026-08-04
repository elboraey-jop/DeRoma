import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [zones, settings] = await Promise.all([
      prisma.shippingZone.findMany({
        where: { active: true },
        include: { exceptions: true },
      }),
      prisma.shippingSettings.findUnique({ where: { id: "default" } }),
    ]);

    return NextResponse.json(
      {
        settings: settings
          ? {
              freeShippingEnabled: settings.freeShippingEnabled,
              freeShippingThreshold: settings.freeShippingThreshold
                ? Number(settings.freeShippingThreshold)
                : null,
            }
          : null,
        zones: zones.map((zone) => ({
          id: zone.id,
          name: zone.name,
          governorates: zone.governorates,
          fee: Number(zone.fee),
          estimatedDays: zone.estimatedDays,
          freeShippingThreshold: zone.freeShippingThreshold
            ? Number(zone.freeShippingThreshold)
            : null,
          exceptions: zone.exceptions.map((e) => ({
            city: e.city,
            fee: Number(e.fee),
          })),
        })),
      },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch {
    return NextResponse.json({ settings: null, zones: [] });
  }
}
