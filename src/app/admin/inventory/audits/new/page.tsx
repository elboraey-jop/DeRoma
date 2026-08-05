import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { getActiveProducts } from "@/lib/products";
import AdminNewAuditClient, { AuditItemSource } from "@/components/AdminNewAuditClient";

export const dynamic = "force-dynamic";

export default async function NewAuditPage() {
  await requireAdmin();
  let sourceItems: AuditItemSource[] = [];

  try {
    const products = await prisma.product.findMany({
      include: { variants: true },
      orderBy: { name: "asc" },
    });

    sourceItems = products.flatMap((product) =>
      product.variants.map((variant) => ({
        variantId: variant.id,
        productId: product.id,
        productName: product.name,
        sku: product.sku || "",
        size: variant.size,
        color: product.color || "",
        category: product.category || "shoes",
        image: product.images && product.images.length > 0 ? product.images[0] : null,
        systemStock: variant.stock,
        price: Number(variant.price || product.price || 0),
      }))
    );
  } catch (error) {
    console.warn("Unable to fetch products for new audit from Prisma:", error);
    const products = await getActiveProducts();
    sourceItems = products.flatMap((product) =>
      product.variants.map((variant) => ({
        variantId: variant.id,
        productId: product.id,
        productName: product.name,
        sku: product.sku || "",
        size: variant.size,
        color: product.color || "",
        category: product.category || "shoes",
        image: product.images && product.images.length > 0 ? product.images[0] : null,
        systemStock: variant.stock,
        price: Number(variant.price || product.price || 0),
      }))
    );
  }

  return <AdminNewAuditClient sourceItems={sourceItems} />;
}
