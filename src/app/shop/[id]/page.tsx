import { getProductById, getActiveProducts } from "@/lib/products";
import ProductDetailClient from "@/components/ProductDetailClient";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";

export const revalidate = 60; // Cache page for 60 seconds

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;

  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const allProducts = await getActiveProducts();
  let relatedIds: string[] = [];
  let reviews: Array<{ id: string; name: string; avatar: string; rating: number; date: string; comment: string }> = [];
  try {
    const [relations, productReviews] = await Promise.all([
      prisma.productRelation.findMany({ where: { productId: product.id }, select: { relatedProductId: true } }),
      prisma.review.findMany({ where: { productId: product.id, status: "approved" }, orderBy: { createdAt: "desc" }, take: 12 }),
    ]);
    relatedIds = relations.map((relation) => relation.relatedProductId);
    reviews = productReviews.map((review) => ({ id: review.id, name: review.customerName, avatar: review.customerName.charAt(0).toUpperCase(), rating: review.rating, date: new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), comment: review.body }));
  } catch (error) {
    console.warn("Unable to load product relations/reviews", error);
  }
  const similarProducts = [
    ...allProducts.filter((p) => relatedIds.includes(p.id)),
    ...allProducts.filter((p) => p.category === product.category && p.id !== product.id && !relatedIds.includes(p.id)),
  ].slice(0, 4);

  return (
    <main className="flex-1 bg-[#FFF9EB] min-h-screen">
      <ProductDetailClient
        product={product}
        similarProducts={similarProducts}
        reviews={reviews}
      />
    </main>
  );
}
