import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import AdminReviewsClient from "@/components/AdminReviewsClient";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  await requireAdmin();
  try {
    const [reviews, products, sectionOption] = await Promise.all([
      prisma.review.findMany({ include: { product: { select: { id: true, name: true, images: true, category: true } }, }, orderBy: { createdAt: "desc" } }),
      prisma.product.findMany({ select: { id: true, name: true, images: true, category: true }, orderBy: { name: "asc" } }),
      prisma.catalogOption.findUnique({
        where: {
          category_type_name: {
            category: "settings",
            type: "home_sections",
            name: "reviews_section",
          },
        },
      }),
    ]);
    const isHomeReviewsSectionVisible = sectionOption ? sectionOption.active : true;

    return <AdminReviewsClient
      reviews={reviews.map((review) => ({ ...review, createdAt: review.createdAt.toISOString(), updatedAt: review.updatedAt.toISOString() }))}
      products={products}
      isHomeReviewsSectionVisible={isHomeReviewsSectionVisible}
    />;
  } catch (error) {
    console.error("Unable to load reviews:", error);
    return <AdminReviewsClient reviews={[]} products={[]} isHomeReviewsSectionVisible={true} />;
  }
}
