import { getActiveProducts } from "@/lib/products";
import prisma from "@/lib/prisma";
import HomeClient from "@/components/HomeClient";

export const revalidate = 60; // Cache page for 60 seconds

export default async function HomePage() {
  let products: any[] = [];
  let rawHomeReviews: any[] = [];
  let showReviewsSection = true;

  try {
    const [activeProducts, sectionOption] = await Promise.all([
      getActiveProducts(),
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
    products = activeProducts;
    if (sectionOption) {
      showReviewsSection = sectionOption.active;
    }
  } catch (e) {
    console.error("HomePage getActiveProducts/sectionOption error:", e);
  }

  if (showReviewsSection) {
    try {
      rawHomeReviews = await prisma.review.findMany({
        where: {
          status: "approved",
          showOnHome: true,
        },
        include: {
          product: {
            select: {
              name: true,
              category: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (e) {
      console.error("HomePage reviews query error:", e);
    }
  }

  const dbHomeReviews = rawHomeReviews.map((r) => ({
    id: r.id,
    brand: r.product.category ? r.product.category.toUpperCase() : "DE ROMA",
    initials: r.customerName.slice(0, 2).toUpperCase(),
    model: r.product.name,
    rating: r.rating,
    quote: r.body,
    name: r.customerName,
    detail: "DeRoma Customer",
  }));

  return (
    <main className="flex-1 bg-[#FFF9EB]">
      <HomeClient
        products={products}
        dbHomeReviews={dbHomeReviews}
        showReviewsSection={showReviewsSection}
      />
    </main>
  );
}
