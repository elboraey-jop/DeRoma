import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import AdminPromotionsClient, {
  SerializedPromotion,
  SerializedAnnouncementBar,
} from "@/components/AdminPromotionsClient";

export const dynamic = "force-dynamic";

export default async function PromotionsPage() {
  await requireAdmin();

  let serializedPromotions: SerializedPromotion[] = [];
  let serializedAnnouncements: SerializedAnnouncementBar[] = [];

  try {
    const [promotions, announcements] = await Promise.all([
      prisma.promotion.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.announcementBar.findMany({ orderBy: { createdAt: "desc" } }),
    ]);

    serializedPromotions = promotions.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      type: p.type,
      value: Number(p.value || 0),
      scope: p.scope,
      targetValue: p.targetValue,
      minimumOrderValue: p.minimumOrderValue ? Number(p.minimumOrderValue) : null,
      usageLimit: p.usageLimit,
      usedCount: p.usedCount,
      startsAt: p.startsAt ? p.startsAt.toISOString() : null,
      endsAt: p.endsAt ? p.endsAt.toISOString() : null,
      active: p.active,
      createdAt: p.createdAt.toISOString(),
    }));

    serializedAnnouncements = announcements.map((a) => ({
      id: a.id,
      text: a.text,
      backgroundColor: a.backgroundColor,
      textColor: a.textColor,
      moving: a.moving,
      active: a.active,
      startsAt: a.startsAt ? a.startsAt.toISOString() : null,
      endsAt: a.endsAt ? a.endsAt.toISOString() : null,
      createdAt: a.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Unable to load promotions/announcements:", error);
  }

  return (
    <AdminPromotionsClient
      promotions={serializedPromotions}
      announcements={serializedAnnouncements}
    />
  );
}
