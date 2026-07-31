import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import AdminProductCreateForm from "@/components/AdminProductCreateForm";

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
        select: { id: true, name: true, category: true },
        orderBy: { name: "asc" },
      })
      .catch(() => []),
  ]);

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
          <h1 className="mt-1 font-playfair text-3xl font-black">
            Add complete product
          </h1>
          <p className="mt-1 text-xs text-[#6B1F2A]/65">
            Create the product, gallery, stock, reviews and recommendations in
            one place.
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
