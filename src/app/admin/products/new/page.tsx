import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import AdminProductCreateForm from "@/components/AdminProductCreateForm";
import AdminBackButton from "@/components/AdminBackButton";

export const dynamic = "force-dynamic";

export default async function NewProductPage({ searchParams }: { searchParams: Promise<{ fromInvoice?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const [options, suppliers, products] = await Promise.all([
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
        select: { id: true, name: true, category: true, sku: true },
        orderBy: { name: "asc" },
      })
      .catch(() => []),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex items-center gap-3">
        <AdminBackButton fallbackHref="/admin/products" />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">
            Catalog management
          </p>
          <h1 className="mt-1 font-playfair text-3xl font-black">
            Add complete product
          </h1>
          <p className="mt-1 text-xs text-[#6B1F2A]/65">
            Create the product, gallery, stock and recommendations in one place.
          </p>
        </div>
      </div>
      <AdminProductCreateForm
        options={options}
        suppliers={suppliers}
        products={products}
        redirectTo={params.fromInvoice === "1" ? "/admin/suppliers/invoices/new" : undefined}
      />
    </div>
  );
}
