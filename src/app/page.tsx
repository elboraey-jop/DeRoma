import { getActiveProducts } from "@/lib/products";
import prisma from "@/lib/prisma";
import HomeClient from "@/components/HomeClient";

export const revalidate = 60; // Cache page for 60 seconds

export default async function HomePage() {
  const [products, rawHomeReviews] = await Promise.all([
    getActiveProducts(),
    prisma.review.findMany({
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
    }),
  ]);

  const dbHomeReviews = rawHomeReviews.map((r) => ({
    id: r.id,
    brand: r.product.category ? r.product.category.toUpperCase() : "DE ROMA",
    initials: r.customerName.slice(0, 2).toUpperCase(),
    model: r.product.name,
    rating: r.rating,
    quote: r.body,
    name: r.customerName,
    detail: r.verifiedPurchase ? "Verified DeRoma customer" : "DeRoma customer",
  }));

  return (
    <main className="flex-1 bg-[#FFF9EB]">
      <HomeClient products={products} dbHomeReviews={dbHomeReviews} />
    </main>
  );
}
