import { Suspense } from "react";
import { getActiveProducts } from "@/lib/products";
import WishlistClient from "@/components/WishlistClient";

export const revalidate = 10; // Frequently revalidate cache

export default async function WishlistPage() {
  const products = await getActiveProducts();

  return (
    <main className="flex-1 bg-[#FFF9EB] min-h-screen">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[50vh] text-[#942E3A] font-sans text-xs">
          Loading wishlist...
        </div>
      }>
        <WishlistClient allProducts={products} />
      </Suspense>
    </main>
  );
}
