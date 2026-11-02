import { getHomeProducts } from "@/lib/products";
import prisma from "@/lib/prisma";
import { getSiteSettings } from "@/lib/siteSettings";
import HomeClient from "@/components/HomeClient";

// Product and settings changes are revalidated by the admin actions. A short
// ISR window keeps the homepage fast during traffic spikes while still making
// catalog changes visible quickly.
export const revalidate = 60;

export default async function HomePage() {
  let products: any[] = [];
  let rawHomeReviews: any[] = [];
  let showReviewsSection = true;
  let totalProductCount = 0;
  let homeForYouProductIds: string[] = [];
  let homeBestSellerProductIds: string[] = [];

  try {
    const siteSettings = await getSiteSettings();
    homeForYouProductIds = siteSettings.forYouProductIds;
    homeBestSellerProductIds = siteSettings.bestSellerProductIds;

    const [homeCatalog, sectionOption] = await Promise.all([
      getHomeProducts({
        forYouProductIds: homeForYouProductIds,
        bestSellerProductIds: homeBestSellerProductIds,
      }),
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
    products = homeCatalog.products;
    totalProductCount = homeCatalog.totalProductCount;
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
              brand: true,
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
    brand: r.product.brand || (r.product.category ? r.product.category.toUpperCase() : "DE ROMA"),
    initials: r.customerName.slice(0, 2).toUpperCase(),
    model: r.product.name,
    rating: r.rating,
    quote: r.body,
    name: r.customerName,
    detail: "DeRoma Customer",
  }));

  return (
    <main className="flex-1 bg-white">
      <HomeClient
        products={products}
        totalProductCount={totalProductCount}
        homeForYouProductIds={homeForYouProductIds}
        homeBestSellerProductIds={homeBestSellerProductIds}
        dbHomeReviews={dbHomeReviews}
        showReviewsSection={showReviewsSection}
      />
    </main>
  );
}
