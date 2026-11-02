import "dotenv/config";
import prisma from "../src/lib/prisma";

const SHIPPING_ZONES = [
  {
    id: "zone-cairo-giza",
    name: "Cairo, Delta & Canal",
    governorates: [
      "Cairo",
      "Giza",
      "Alexandria",
      "Beheira",
      "Dakahlia",
      "Gharbia",
      "Kafr El Sheikh",
      "Monufia",
      "Qalyubia",
      "Sharqia",
      "Damietta",
      "Port Said",
      "Ismailia",
      "Suez",
    ],
    fee: 90,
    estimatedDays: "2–4 business days",
  },
  {
    id: "zone-delta",
    name: "Upper Egypt, New Valley, Matrouh & Red Sea",
    governorates: [
      "Fayoum",
      "Beni Suef",
      "Minya",
      "Asyut",
      "Sohag",
      "Qena",
      "Luxor",
      "Aswan",
      "New Valley",
      "Matrouh",
      "Red Sea",
    ],
    fee: 130,
    estimatedDays: "3–6 business days",
  },
  {
    id: "zone-upper-egypt",
    name: "North & South Sinai",
    governorates: ["North Sinai", "South Sinai"],
    fee: 150,
    estimatedDays: "4–7 business days",
  },
] as const;

async function configureShipping() {
  const execute = process.argv.includes("--execute");
  const targetIds = SHIPPING_ZONES.map((zone) => zone.id);
  const [currentZones, currentExceptions, settings] = await Promise.all([
    prisma.shippingZone.findMany({
      include: { exceptions: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.shippingZoneException.count(),
    prisma.shippingSettings.findUnique({ where: { id: "default" } }),
  ]);

  console.log("Shipping configuration preview");
  console.log(`- Existing zones: ${currentZones.length}`);
  console.log(`- Existing city exceptions to clear: ${currentExceptions}`);
  console.log(`- Global free shipping: ${settings?.freeShippingEnabled ? "enabled" : "disabled"}`);
  console.log("\nTarget zones:");
  for (const zone of SHIPPING_ZONES) {
    console.log(`- ${zone.name}: ${zone.fee} EGP (${zone.governorates.length} governorates)`);
  }

  if (!execute) {
    console.log("\nNo changes made. Run with --execute to apply this configuration.");
    return;
  }

  const result = await prisma.$transaction(async (tx) => {
    for (const zone of SHIPPING_ZONES) {
      await tx.shippingZone.upsert({
        where: { id: zone.id },
        create: {
          id: zone.id,
          name: zone.name,
          governorates: [...zone.governorates],
          fee: zone.fee,
          estimatedDays: zone.estimatedDays,
          freeShippingThreshold: null,
          active: true,
        },
        update: {
          name: zone.name,
          governorates: [...zone.governorates],
          fee: zone.fee,
          estimatedDays: zone.estimatedDays,
          freeShippingThreshold: null,
          active: true,
        },
      });
    }

    const deletedExceptions = await tx.shippingZoneException.deleteMany({});
    const deletedZones = await tx.shippingZone.deleteMany({ where: { id: { notIn: targetIds } } });
    return { deletedExceptions: deletedExceptions.count, deletedZones: deletedZones.count };
  });

  console.log("\nShipping configuration applied successfully");
  console.log(`- Active zones configured: ${SHIPPING_ZONES.length}`);
  console.log(`- City exceptions cleared: ${result.deletedExceptions}`);
  console.log(`- Old zones removed: ${result.deletedZones}`);
}

configureShipping()
  .catch((error) => {
    console.error("Shipping configuration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
