import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import AdminShippingClient, {
  SerializedZone,
  SerializedShippingSettings,
  SerializedFreeShippingPromo,
} from "@/components/AdminShippingClient";

export const dynamic = "force-dynamic";

export default async function ShippingPage() {
  await requireAdmin();
  const [zones, settings, freeShippingPromotions] = await Promise.all([
    prisma.shippingZone
      .findMany({
        include: { exceptions: true },
        orderBy: { createdAt: "asc" },
      })
      .catch((err) => {
        console.error("Failed to load shipping zones:", err);
        return [];
      }),
    prisma.shippingSettings
      .findUnique({ where: { id: "default" } })
      .catch((err) => {
        console.error("Failed to load shipping settings:", err);
        return null;
      }),
    prisma.promotion
      .findMany({
        where: { type: "free_shipping" },
        orderBy: { createdAt: "desc" },
      })
      .catch((err) => {
        console.error("Failed to load free shipping promotions:", err);
        return [];
      }),
  ]);

  const serializedZones: SerializedZone[] = zones.map((zone) => ({
    id: zone.id,
    name: zone.name,
    governorates: zone.governorates,
    fee: Number(zone.fee),
    active: zone.active,
    exceptions: zone.exceptions.map((item) => ({
      city: item.city,
      fee: Number(item.fee),
    })),
  }));

  const serializedSettings: SerializedShippingSettings = settings
    ? {
        freeShippingEnabled: settings.freeShippingEnabled,
        freeShippingThreshold: settings.freeShippingThreshold
          ? Number(settings.freeShippingThreshold)
          : null,
      }
    : null;

  const serializedPromos: SerializedFreeShippingPromo[] = freeShippingPromotions.map(
    (promo) => ({
      id: promo.id,
      name: promo.name,
      code: promo.code,
      minimumOrderValue: promo.minimumOrderValue ? Number(promo.minimumOrderValue) : null,
      usageLimit: promo.usageLimit,
      startsAt: promo.startsAt ? promo.startsAt.toISOString() : null,
      endsAt: promo.endsAt ? promo.endsAt.toISOString() : null,
      active: promo.active,
    })
  );

  return (
    <AdminShippingClient
      zones={serializedZones}
      settings={serializedSettings}
      freeShippingPromotions={serializedPromos}
    />
  );
}
