import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import AdminPurchaseInvoiceForm from "@/components/AdminPurchaseInvoiceForm";

export const dynamic = "force-dynamic";

export default async function NewPurchaseInvoicePage() {
  await requireAdmin();
  const [suppliers, products] = await Promise.all([
    prisma.supplier.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.product.findMany({ include: { variants: true }, orderBy: { name: "asc" } }),
  ]);
  const variants = products.flatMap((product) => product.variants.map((variant) => ({ id: variant.id, productId: product.id, productName: product.name, category: product.category, image: product.images[0] || null, label: `${product.color || "No color"} · ${variant.size} · ${product.sku || "No SKU"}`, wholesalePrice: Number(product.wholesalePrice || 0), retailPrice: Number(product.price) })));
  return <div className="mx-auto max-w-6xl space-y-5"><div className="flex items-center gap-3"><Link href="/admin/suppliers" className="rounded-xl border border-[#942E3A]/15 bg-white p-2 text-[#942E3A]"><ArrowLeft className="h-4 w-4" /></Link><div><p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">Procurement</p><h1 className="mt-1 font-playfair text-3xl font-black">Create purchase invoice</h1><p className="mt-1 text-xs text-[#6B1F2A]/65">Receive stock, preserve cost history, and keep supplier balances accurate.</p></div></div><AdminPurchaseInvoiceForm suppliers={suppliers} variants={variants} /></div>;
}
