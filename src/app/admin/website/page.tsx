import { requireAdmin } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";
import { getSiteSettings } from "@/lib/siteSettings";
import AdminWebsiteClient from "@/components/AdminWebsiteClient";

export const dynamic = "force-dynamic";

export default async function AdminWebsitePage() {
  await requireAdmin();

  const [settings, products] = await Promise.all([
    getSiteSettings(),
    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        price: true,
        images: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const serializedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: Number(p.price),
    image: p.images[0] || undefined,
  }));

  return (
    <AdminWebsiteClient
      initialSettings={settings}
      products={serializedProducts}
    />
  );
}
