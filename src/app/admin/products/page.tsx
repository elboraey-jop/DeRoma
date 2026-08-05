import { requireAdmin } from "@/lib/adminAuth";
import AdminProductsClient from "@/components/AdminProductsClient";
import { getActiveProducts } from "@/lib/products";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdmin();
  try {
    const [products, suppliers] = await Promise.all([
      prisma.product.findMany({
        include: { variants: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.supplier.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ]);
    return (
      <AdminProductsClient
        products={products.map((product) => ({
          id: product.id,
          name: product.name,
          category: product.category,
          price: Number(product.price),
          wholesalePrice: product.wholesalePrice
            ? Number(product.wholesalePrice)
            : null,
          supplierId: product.supplierId,
          compareAtPrice: product.compareAtPrice
            ? Number(product.compareAtPrice)
            : null,
          status: product.status,
          lowStockLimit: product.lowStockLimit || 2,
          image: product.images[0] || null,
          stock: product.variants.reduce(
            (total, variant) => total + variant.stock,
            0,
          ),
          variants: product.variants.map((variant) => ({
            id: variant.id,
            size: variant.size,
            stock: variant.stock,
            price: variant.price == null ? null : Number(variant.price),
            wholesalePrice:
              variant.wholesalePrice == null
                ? null
                : Number(variant.wholesalePrice),
            label: `${product.color || "No color"} · ${variant.size} · ${product.sku || "No SKU"}`,
          })),
        }))}
        suppliers={suppliers}
      />
    );
  } catch (error) {
    console.error("Failed to load admin products:", error);
    const products = await getActiveProducts();
    return (
      <AdminProductsClient
        products={products.map((product) => ({
          id: product.id,
          name: product.name,
          category: product.category,
          price: Number(product.price),
          wholesalePrice: null,
          supplierId: null,
          compareAtPrice: product.compareAtPrice
            ? Number(product.compareAtPrice)
            : null,
          status: "active",
          lowStockLimit: (product as any).lowStockLimit || 2,
          image: product.images[0] || null,
          stock: product.variants.reduce(
            (total, variant) => total + variant.stock,
            0,
          ),
          variants: product.variants.map((variant) => ({
            id: variant.id,
            size: variant.size,
            stock: variant.stock,
            price: variant.price == null ? null : Number(variant.price),
            wholesalePrice:
              variant.wholesalePrice == null
                ? null
                : Number(variant.wholesalePrice),
            label: `${product.color || "No color"} · ${variant.size} · ${product.sku || "No SKU"}`,
          })),
        }))}
        suppliers={[]}
      />
    );
  }
}
