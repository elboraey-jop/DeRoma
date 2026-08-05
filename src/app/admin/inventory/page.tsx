import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { getActiveProducts } from "@/lib/products";
import AdminInventoryClient, { InventoryRow } from "@/components/AdminInventoryClient";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  await requireAdmin();
  let rows: InventoryRow[] = [];

  try {
    const products = await prisma.product.findMany({
      include: { variants: true },
      orderBy: { name: "asc" },
    });

    rows = products.flatMap((product) =>
      product.variants.map((variant) => ({
        variantId: variant.id,
        productId: product.id,
        product: product.name,
        productStatus: product.status || "active",
        category: product.category || "shoes",
        subcategory: product.subcategory || "General",
        brand: (product as any).brand || "DeRoma",
        sku: product.sku || "",
        size: variant.size,
        color: product.category?.toLowerCase() === "perfumes" ? "" : (product.color || ""),
        image: product.images && product.images.length > 0 ? product.images[0] : null,
        stock: variant.stock,
        price: Number(variant.price || product.price || 0),
        lowStockLimit: product.lowStockLimit || 2,
      }))
    );
  } catch (error) {
    console.error("Unable to query Prisma products for inventory page:", error);
    const products = await getActiveProducts();
    rows = products.flatMap((product) =>
      product.variants.map((variant) => ({
        variantId: variant.id,
        productId: product.id,
        product: product.name,
        productStatus: (product as any).status || "active",
        category: product.category || "shoes",
        subcategory: product.subcategory || "General",
        brand: (product as any).brand || "DeRoma",
        sku: product.sku || "",
        size: variant.size,
        color: product.category?.toLowerCase() === "perfumes" ? "" : (product.color || ""),
        image: product.images && product.images.length > 0 ? product.images[0] : null,
        stock: variant.stock,
        price: Number(variant.price || product.price || 0),
        lowStockLimit: 2,
      }))
    );
  }

  return <AdminInventoryClient initialRows={rows} />;
}
