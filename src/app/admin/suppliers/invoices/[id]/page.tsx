import Link from "next/link";
import { Package } from "lucide-react";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { formatCurrency } from "@/lib/utils";
import AdminBackButton from "@/components/AdminBackButton";

export const dynamic = "force-dynamic";

export default async function PurchaseInvoiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const invoice = await prisma.purchaseInvoice.findUnique({
    where: { id },
    include: { supplier: true, items: { include: { product: true, variant: true, lot: true } } },
  });
  if (!invoice) notFound();
  const balance = Number(invoice.total) - Number(invoice.amountPaid);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex items-center gap-3">
        <AdminBackButton fallbackHref="/admin/suppliers" />
        <div><p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">Purchase invoice</p><h1 className="mt-1 font-playfair text-3xl font-black">{invoice.invoiceNumber}</h1></div>
      </div>
      <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-2"><Package className="h-4 w-4 text-[#D8B46A]" /><h2 className="font-playfair text-xl font-bold">Received products</h2></div>
        <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="border-b border-[#942E3A]/10 text-[10px] uppercase tracking-wide text-[#6B1F2A]/55"><tr><th className="pb-3">Product</th><th className="pb-3">Variant / SKU</th><th className="pb-3">Quantity</th><th className="pb-3">Wholesale unit</th><th className="pb-3">Selling unit</th><th className="pb-3">Remaining</th><th className="pb-3 text-right">Line total</th></tr></thead><tbody className="divide-y divide-[#942E3A]/8">{invoice.items.map((item) => <tr key={item.id}><td className="py-4 font-bold text-[#942E3A]"><Link href={`/admin/products/${item.productId}`} className="hover:underline">{item.product.name}</Link></td><td className="py-4 text-[#6B1F2A]/70">{item.product.color || "No color"} · {item.variant.size}<br /><span className="text-[10px]">{item.product.sku || "No SKU"}</span></td><td className="py-4">{item.quantity}</td><td className="py-4">{formatCurrency(Number(item.wholesalePrice))}</td><td className="py-4">{formatCurrency(Number(item.retailPrice))}</td><td className="py-4 font-bold text-[#D8B46A]">{item.lot?.remaining ?? item.quantity}</td><td className="py-4 text-right font-bold text-[#942E3A]">{formatCurrency(Number(item.lineTotal))}</td></tr>)}</tbody></table></div>
        <div className="mt-5 rounded-2xl bg-[#FFF9EB] p-4 text-xs text-[#6B1F2A]/75"><p>Total Paid: <strong>{formatCurrency(Number(invoice.total))}</strong></p></div>
      </section>
    </div>
  );
}
