import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import AdminProductCreateForm from "@/components/AdminProductCreateForm";
import AdminAddProductModal from "@/components/AdminAddProductModal";
import { deleteProductAction } from "@/app/admin/products/[id]/actions";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [product, options, suppliers, relatedProducts] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        relatedFrom: { select: { relatedProductId: true } },
        reviews: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    }),
    prisma.catalogOption
      .findMany({
        where: { active: true },
        select: { category: true, type: true, name: true, value: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      })
      .catch(() => []),
    prisma.supplier
      .findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } })
      .catch(() => []),
    prisma.product
      .findMany({
        where: { id: { not: id } },
        select: { id: true, name: true, category: true, sku: true },
        orderBy: { name: "asc" },
      })
      .catch(() => []),
  ]);
  if (!product) notFound();
  const initialProduct = {
    id: product.id,
    name: product.name,
    sku: product.sku,
    category: product.category,
    status: product.status,
    description: product.description,
    brand: product.brand,
    color: product.color,
    subcategory: product.subcategory,
    material: product.material,
    images: product.images,
    price: Number(product.price),
    compareAtPrice:
      product.compareAtPrice == null ? null : Number(product.compareAtPrice),
    wholesalePrice:
      product.wholesalePrice == null ? null : Number(product.wholesalePrice),
    additionalCost:
      product.additionalCost == null ? null : Number(product.additionalCost),
    supplierId: product.supplierId,
    lowStockLimit: product.lowStockLimit,
    featured: product.featured,
    bestSeller: product.bestSeller,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      size: variant.size,
      stock: variant.stock,
      price: variant.price == null ? null : Number(variant.price),
      compareAtPrice:
        variant.compareAtPrice == null ? null : Number(variant.compareAtPrice),
      wholesalePrice:
        variant.wholesalePrice == null ? null : Number(variant.wholesalePrice),
      additionalCost:
        variant.additionalCost == null ? null : Number(variant.additionalCost),
    })),
    relatedIds: product.relatedFrom.map(
      (relation) => relation.relatedProductId,
    ),
    reviews: product.reviews.map((review) => ({
      id: review.id,
      customerName: review.customerName,
      rating: review.rating,
      body: review.body,
    })),
  };
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="rounded-xl border border-[#942E3A]/15 bg-white p-2 text-[#942E3A]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">
            Catalog management
          </p>
          <h1 className="mt-1 font-playfair text-3xl font-black text-[#942E3A]">
            Edit complete product
          </h1>
          <p className="mt-1 text-xs text-[#6B1F2A]/65">
            The same workspace as product creation, prefilled for editing.
          </p>
        </div>
      </div>
      <AdminProductCreateForm
        options={options}
        suppliers={suppliers}
        products={relatedProducts}
        initialProduct={initialProduct}
      />
      <AdminAddProductModal
        products={[
          {
            id: product.id,
            name: product.name,
            category: product.category,
            image: product.images[0] || null,
            price: Number(product.price),
            wholesalePrice:
              product.wholesalePrice == null
                ? null
                : Number(product.wholesalePrice),
            supplierId: product.supplierId,
            variants: product.variants.map((variant) => ({
              id: variant.id,
              size: variant.size,
              stock: variant.stock,
              price: variant.price == null ? null : Number(variant.price),
              wholesalePrice:
                variant.wholesalePrice == null
                  ? null
                  : Number(variant.wholesalePrice),
              label: `${variant.size} · ${product.sku || "No SKU"}`,
            })),
          },
        ]}
        suppliers={suppliers}
      />
      <section className="rounded-3xl border border-red-200 bg-red-50 p-5 sm:p-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600">
          Danger zone
        </p>
        <h2 className="mt-1 font-playfair text-xl font-bold text-red-800">
          Delete product
        </h2>
        <form action={deleteProductAction} className="mt-4">
          <input type="hidden" name="productId" value={product.id} />
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2.5 text-xs font-bold text-white"
          >
            <Trash2 className="h-4 w-4" /> Delete product
          </button>
        </form>
      </section>
    </div>
  );
}
