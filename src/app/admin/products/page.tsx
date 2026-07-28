import { requireAdmin } from "@/lib/adminAuth";
import AdminProductsClient from "@/components/AdminProductsClient";
import { getActiveProducts } from "@/lib/products";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdmin();
  try {
    const products = await prisma.product.findMany({ include: { variants: { select: { stock: true } } }, orderBy: { createdAt: "desc" } });
    return <AdminProductsClient products={products.map((product) => ({ id: product.id, name: product.name, category: product.category, price: Number(product.price), compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null, status: product.status, image: product.images[0] || null, stock: product.variants.reduce((total, variant) => total + variant.stock, 0) }))} />;
  } catch {
    const products = await getActiveProducts();
    return <AdminProductsClient products={products.map((product) => ({ id: product.id, name: product.name, category: product.category, price: Number(product.price), compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null, status: "active", image: product.images[0] || null, stock: product.variants.reduce((total, variant) => total + variant.stock, 0) }))} />;
  }
}
