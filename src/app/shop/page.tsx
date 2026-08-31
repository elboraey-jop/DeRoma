import { Suspense } from "react";
import { getActiveProducts } from "@/lib/products";
import ShopClient from "@/components/ShopClient";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  let products: any[] = [];
  let colorOptions: Array<{ name: string; value: string | null }> = [];

  try {
    products = await getActiveProducts();
  } catch (err) {
    console.error("Failed to load active products for shop:", err);
  }

  try {
    colorOptions = await prisma.catalogOption.findMany({
      where: { type: "color", active: true },
      select: { name: true, value: true },
      orderBy: { name: "asc" },
    });
  } catch (err) {
    console.warn("Failed to load catalog color options for shop:", err);
  }

  return (
    <main className="flex-1 bg-[#FFF9EB] min-h-screen">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[50vh] text-stone-500 font-sans text-xs">
          Loading boutique...
        </div>
      }>
        <ShopClient initialProducts={products} catalogColors={colorOptions} />
      </Suspense>
    </main>
  );
}
