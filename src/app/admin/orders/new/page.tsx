import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import AdminManualOrderForm from "@/components/AdminManualOrderForm";

export const dynamic = "force-dynamic";

export default async function NewManualOrderPage() {
  await requireAdmin();
  const products = await prisma.product.findMany({
    where: { status: "active", variants: { some: { stock: { gt: 0 } } } },
    select: {
      id: true,
      name: true,
      color: true,
      price: true,
      variants: {
        where: { stock: { gt: 0 } },
        select: { id: true, size: true, stock: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/orders"
          className="rounded-xl border border-[#942E3A]/15 bg-white p-2 text-[#942E3A]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">
            Operations
          </p>
          <h1 className="mt-1 font-playfair text-3xl font-black">
            Manual order
          </h1>
        </div>
      </div>
      <AdminManualOrderForm
        products={products.map((product) => ({
          ...product,
          price: Number(product.price),
        }))}
      />
    </div>
  );
}
