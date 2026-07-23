import { getActiveProducts } from "@/lib/products";
import ShopClient from "@/components/ShopClient";

export const revalidate = 60; // Cache page for 60 seconds

export default async function ShopPage() {
  const products = await getActiveProducts();

  return (
    <main className="flex-1 bg-[#FFF9EB] min-h-screen">
      <ShopClient initialProducts={products} />
    </main>
  );
}
