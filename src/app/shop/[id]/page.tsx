import { getProductById, getActiveProducts } from "@/lib/products";
import ProductDetailClient from "@/components/ProductDetailClient";
import { notFound } from "next/navigation";

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
  const similarProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <main className="flex-1 bg-[#FFF9EB] min-h-screen">
      <ProductDetailClient
        product={product}
        similarProducts={similarProducts}
      />
    </main>
  );
}
