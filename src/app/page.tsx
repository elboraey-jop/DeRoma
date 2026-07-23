import { getActiveProducts } from "@/lib/products";
import HomeClient from "@/components/HomeClient";

export const revalidate = 60; // Cache page for 60 seconds

export default async function HomePage() {
  const products = await getActiveProducts();

  return (
    <main className="flex-1 bg-[#FFF9EB]">
      <HomeClient products={products} />
    </main>
  );
}
