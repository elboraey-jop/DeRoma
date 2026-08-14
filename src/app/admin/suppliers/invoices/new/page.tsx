import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import AdminPurchaseInvoiceForm from "@/components/AdminPurchaseInvoiceForm";
import AdminBackButton from "@/components/AdminBackButton";

export const dynamic = "force-dynamic";

export default async function NewPurchaseInvoicePage({ searchParams }: { searchParams: Promise<{ productId?: string }> }) {
  await requireAdmin();
  const [suppliers, products, options] = await Promise.all([
    prisma.supplier.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.product.findMany({ include: { variants: true }, orderBy: { name: "asc" } }),
    prisma.catalogOption.findMany({
      where: { active: true },
      select: { category: true, type: true, name: true, value: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }).catch(() => []),
  ]);
  const params = await searchParams;
  const variants = products.flatMap((product) => {
    const sizes = product.category === "shoes"
      ? ["36", "37", "38", "39", "40", "41"]
      : product.variants.map((variant) => variant.size);
    return Array.from(new Set(sizes)).map((size) => {
      const variant = product.variants.find((item) => item.size === size);
      return { id: variant?.id || `new:${product.id}:${size}`, productId: product.id, productName: product.name, category: product.category, image: product.images[0] || null, label: `${product.color || "No color"} · ${size} · ${product.sku || "No SKU"}`, size, stock: variant?.stock || 0, wholesalePrice: Number(variant?.wholesalePrice ?? product.wholesalePrice ?? 0), retailPrice: Number(variant?.price ?? product.price) };
    });
  });
  return (
    <div className="mx-auto max-w-6xl space-y-4 sm:space-y-5">
      <div className="flex items-center gap-3">
        <AdminBackButton fallbackHref="/admin/suppliers" />
        <div>
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">Procurement</p>
          <h1 className="mt-0.5 sm:mt-1 font-playfair text-2xl sm:text-3xl font-black">Create purchase invoice</h1>
          <p className="mt-1 hidden sm:block text-xs text-[#6B1F2A]/65">Receive stock, preserve cost history, and keep supplier balances accurate.</p>
        </div>
      </div>
      <AdminPurchaseInvoiceForm
        suppliers={suppliers}
        variants={variants}
        productOptions={options}
        catalogProducts={products.map((product) => ({
          id: product.id,
          name: product.name,
          category: product.category,
          sku: product.sku,
          image: product.images[0] || null,
        }))}
        initialVariantId={params.productId ? products.find((product) => product.id === params.productId)?.variants[0]?.id : undefined}
      />
    </div>
  );
}
