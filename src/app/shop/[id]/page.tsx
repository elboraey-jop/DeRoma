import type { Metadata } from "next";
import { getProductById, getActiveProducts } from "@/lib/products";
import ProductDetailClient from "@/components/ProductDetailClient";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getProductPath } from "@/lib/productSlug";

export const revalidate = 60; // Cache page for 60 seconds

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return { title: "Product Not Found" };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://deroma.store";
  const title = `${product.name} | DeRoma Store`;
  const description = product.description || `Buy ${product.name} premium women's shoes from the curated DeRoma Store collection.`;
  const imageUrl = product.images[0] ? (product.images[0].startsWith("http") ? product.images[0] : `${baseUrl}${product.images[0]}`) : `${baseUrl}/banners/hero-1-desktop.webp`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}${getProductPath(product)}`,
      siteName: "DeRoma Store",
      images: [{ url: imageUrl, width: 800, height: 800, alt: product.name }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
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
    console.error("Unable to load product relations/reviews:", error);
  }
  const manuallyRelatedProducts = allProducts.filter((p) => relatedIds.includes(p.id));
  const fallbackProducts = allProducts
    .filter((p) => p.id !== product.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);
  const similarProducts = (manuallyRelatedProducts.length > 0
    ? manuallyRelatedProducts
    : fallbackProducts
  ).slice(0, 4);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://deroma.store";
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description || `${product.name} women's shoes from the curated DeRoma Store collection`,
    sku: product.sku || product.id,
    brand: {
      "@type": "Brand",
      name: product.brand || "DeRoma",
    },
    offers: {
      "@type": "Offer",
      url: `${baseUrl}${getProductPath(product)}`,
      priceCurrency: "EGP",
      price: Number(product.price),
      availability: product.variants.some((v) => v.stock > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <main className="flex-1 bg-[#FFF9EB] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <ProductDetailClient
        product={product}
        similarProducts={similarProducts}
        reviews={reviews}
      />
    </main>
  );
}
