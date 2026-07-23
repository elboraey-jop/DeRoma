import { Suspense } from "react";
import { getActiveProducts } from "@/lib/products";
import ShopClient from "@/components/ShopClient";

export const revalidate = 60; // Cache page for 60 seconds

export default async function ShopPage() {
  const products = await getActiveProducts();

  return (
    <main className="flex-1 bg-[#FFF9EB] min-h-screen">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[50vh] text-stone-500 font-sans text-xs">
          Loading boutique...
        </div>
      }>
        <ShopClient initialProducts={products} />
      </Suspense>
    </main>
  );
}
