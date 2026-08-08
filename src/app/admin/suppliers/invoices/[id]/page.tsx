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
    <div className="mx-auto max-w-6xl space-y-4 sm:space-y-5">
      <div className="flex items-center gap-3">
        <AdminBackButton fallbackHref="/admin/suppliers" />
        <div>
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">Purchase invoice</p>
          <h1 className="mt-0.5 sm:mt-1 font-playfair text-2xl sm:text-3xl font-black">{invoice.invoiceNumber}</h1>
        </div>
      </div>
      <section className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-xs sm:rounded-3xl sm:p-7">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-[#D8B46A]" />
          <h2 className="font-playfair text-base sm:text-xl font-bold">Received products</h2>
        </div>
        
        {/* Desktop Table View */}
        <div className="mt-4 hidden sm:block overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="border-b border-[#942E3A]/10 text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
              <tr>
                <th className="pb-3">Product</th>
                <th className="pb-3">Variant / SKU</th>
                <th className="pb-3">Quantity</th>
                <th className="pb-3">Wholesale unit</th>
                <th className="pb-3">Selling unit</th>
                <th className="pb-3">Remaining</th>
                <th className="pb-3 text-right">Line total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#942E3A]/8">
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-4 font-bold text-[#942E3A]">
                    <Link href={`/admin/products/${item.productId}`} className="hover:underline">{item.product.name}</Link>
                  </td>
                  <td className="py-4 text-[#6B1F2A]/70">
                    {item.product.color || "No color"} · {item.variant.size}<br />
                    <span className="text-[10px]">{item.product.sku || "No SKU"}</span>
                  </td>
                  <td className="py-4">{item.quantity}</td>
                  <td className="py-4">{formatCurrency(Number(item.wholesalePrice))}</td>
                  <td className="py-4">{formatCurrency(Number(item.retailPrice))}</td>
                  <td className="py-4 font-bold text-[#D8B46A]">{item.lot?.remaining ?? item.quantity}</td>
                  <td className="py-4 text-right font-bold text-[#942E3A]">{formatCurrency(Number(item.lineTotal))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="mt-3 space-y-2.5 sm:hidden">
          {invoice.items.map((item) => (
            <div key={item.id} className="rounded-xl border border-[#942E3A]/10 bg-[#FFF9EB]/40 p-3 text-xs space-y-2">
              <div className="flex items-start justify-between gap-2 border-b border-[#942E3A]/10 pb-2">
                <div>
                  <Link href={`/admin/products/${item.productId}`} className="font-bold text-[#942E3A] hover:underline block text-xs">
                    {item.product.name}
                  </Link>
                  <p className="mt-0.5 text-[10px] text-[#6B1F2A]/60">
                    {item.product.color || "No color"} · {item.variant.size} ({item.product.sku || "No SKU"})
                  </p>
                </div>
                <span className="font-mono font-bold text-[#942E3A] text-xs shrink-0">
                  {formatCurrency(Number(item.lineTotal))}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[9px] uppercase text-[#6B1F2A]/50 block">Quantity</span>
                  <span className="font-bold text-[#942E3A]">{item.quantity} units</span> (Remaining: {item.lot?.remaining ?? item.quantity})
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase text-[#6B1F2A]/50 block">Wholesale / Selling</span>
                  <span className="font-bold text-[#942E3A]">{formatCurrency(Number(item.wholesalePrice))}</span> / {formatCurrency(Number(item.retailPrice))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl bg-[#FFF9EB] p-3 text-xs text-[#6B1F2A]/75 sm:mt-5 sm:rounded-2xl sm:p-4 flex items-center justify-between">
          <span>Total Invoice Paid</span>
          <strong className="font-playfair text-base font-bold text-[#942E3A] sm:text-lg">{formatCurrency(Number(invoice.total))}</strong>
        </div>
      </section>
    </div>
  );
}
