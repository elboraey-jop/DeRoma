import { Suspense } from "react";
import { getActiveProducts } from "@/lib/products";
import WishlistClient from "@/components/WishlistClient";

export const revalidate = 86400; // 24 hours (client handles dynamic user items)

export default async function WishlistPage() {
  const products = await getActiveProducts();

  return (
    <main className="flex-1 bg-white min-h-screen">
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
