import type { Metadata } from "next";
import { getProductById, getActiveProducts, getProductsByIds } from "@/lib/products";
import ProductDetailClient from "@/components/ProductDetailClient";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getProductPath, slugifyProductName } from "@/lib/productSlug";
import { getAutoRelatedProducts } from "@/lib/relatedProducts";
import { unstable_cache } from "next/cache";

export const revalidate = 60; // Cache page for 60 seconds

export async function generateStaticParams() {
  try {
    const products = await getActiveProducts();
    return products.map((product) => ({
      id: product.slug || slugifyProductName(product.name),
    }));
  } catch (error) {
    console.warn("Unable to generate product paths during build:", error);
    return [];
  }
}

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

  const getCachedRelations = unstable_cache(
    async () => prisma.productRelation.findMany({
      where: { productId: product.id },
      select: { relatedProductId: true },
      take: 6,
    }),
    ["deroma-product-relations-v2", product.id],
    { revalidate: 60, tags: ["products", `product:${product.id}`] },
  );
  const getCachedReviews = unstable_cache(
    async () => prisma.review.findMany({
      where: { productId: product.id, status: "approved" },
      select: { id: true, customerName: true, rating: true, createdAt: true, body: true },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    ["deroma-product-reviews-v2", product.id],
    { revalidate: 60, tags: ["products", `product:${product.id}`] },
  );

  const relatedData = await Promise.all([
    getCachedRelations(),
    getCachedReviews(),
  ]).then(async ([relations, productReviews]) => {
    const relatedIds = relations.map((relation) => relation.relatedProductId);
    const relatedProducts = await getProductsByIds(relatedIds);
    return {
      similarProducts: relatedProducts,
      reviews: productReviews.map((review) => ({
        id: review.id,
        name: review.customerName,
        avatar: review.customerName.charAt(0).toUpperCase(),
        rating: review.rating,
        date: new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        comment: review.body,
      })),
    };
  }).catch((error) => {
    console.error("Unable to load product relations/reviews:", error);
    return {
      similarProducts: [] as Awaited<ReturnType<typeof getProductsByIds>>,
      reviews: [] as Array<{ id: string; name: string; avatar: string; rating: number; date: string; comment: string }>,
    };
  });
  const { reviews } = relatedData;
  let similarProducts = relatedData.similarProducts;
  if (similarProducts.length === 0) {
    const allProducts = await getActiveProducts();
    similarProducts = getAutoRelatedProducts(product, allProducts, 6);
  }
  similarProducts = similarProducts.slice(0, 6);

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
    <main className="flex-1 bg-white min-h-screen">
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
