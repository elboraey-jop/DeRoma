import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import AdminCategoriesClient from "@/components/AdminCategoriesClient";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  let options: Array<{ id: string; category: string; type: string; name: string }> = [];
  let products: Array<{
    id: string;
    name: string;
    category: string;
    brand: string | null;
    subcategory: string | null;
    material: string | null;
    price: number;
    compareAtPrice: number | null;
    images: string[];
    color: string | null;
    variants: Array<{ size: string; stock: number }>;
  }> = [];
  try {
    options = await prisma.catalogOption.findMany({ where: { active: true }, select: { id: true, category: true, type: true, name: true }, orderBy: [{ category: "asc" }, { type: "asc" }, { sortOrder: "asc" }, { name: "asc" }] });
    products = (await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        brand: true,
        subcategory: true,
        material: true,
        price: true,
        compareAtPrice: true,
        images: true,
        color: true,
        variants: { select: { size: true, stock: true } },
      },
      orderBy: { name: "asc" },
    })).map((product) => ({
      ...product,
      price: Number(product.price),
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    }));
  } catch (error) {
    console.warn("Unable to load catalog options", error);
  }
  return <AdminCategoriesClient options={options} products={products} />;
}
