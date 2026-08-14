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

  type InvoiceItem = (typeof invoice.items)[number];
  const groupedProducts = new Map<string, { product: InvoiceItem["product"]; items: InvoiceItem[] }>();
  for (const item of invoice.items) {
    const group = groupedProducts.get(item.productId);
    if (group) group.items.push(item);
    else groupedProducts.set(item.productId, { product: item.product, items: [item] });
  }
  const productGroups = Array.from(groupedProducts.values());

  return (
    <div className="mx-auto max-w-6xl space-y-4 sm:space-y-5">
      <div className="flex items-center gap-3">
        <AdminBackButton fallbackHref="/admin/suppliers" />
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#D8B46A] sm:text-[10px]">Purchase invoice</p>
          <h1 className="mt-0.5 font-playfair text-2xl font-black sm:mt-1 sm:text-3xl">{invoice.invoiceNumber}</h1>
        </div>
      </div>

      <section className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-xs sm:rounded-3xl sm:p-7">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-[#D8B46A]" />
          <h2 className="font-playfair text-base font-bold sm:text-xl">Received products</h2>
        </div>

        <div className="mt-4 hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="border-b border-[#942E3A]/10 text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
              <tr>
                <th className="pb-3">Product</th>
                <th className="pb-3">Sizes / quantities</th>
                <th className="pb-3">Wholesale</th>
                <th className="pb-3">Selling</th>
                <th className="pb-3">Remaining</th>
                <th className="pb-3 text-right">Product total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#942E3A]/8">
              {productGroups.map(({ product, items }) => {
                const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
                const totalRemaining = items.reduce((sum, item) => sum + (item.lot?.remaining ?? item.quantity), 0);
                const totalLine = items.reduce((sum, item) => sum + Number(item.lineTotal), 0);
                return (
                  <tr key={product.id}>
                    <td className="py-4 font-bold text-[#942E3A]">
                      <Link href={`/admin/products/${product.id}`} className="flex items-center gap-3 hover:underline">
                        {product.images[0] ? <img src={product.images[0]} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" /> : <span className="h-11 w-11 shrink-0 rounded-xl bg-[#F2DFC0]" />}
                        <span><span className="block">{product.name}</span><span className="mt-1 block text-[10px] font-normal text-[#6B1F2A]/60">{product.color || "No color"} · {product.sku || "No SKU"}</span></span>
                      </Link>
                    </td>
                    <td className="py-4 text-[#6B1F2A]/70"><div className="space-y-1.5">{items.map((item) => <div key={item.id}><span className="font-bold text-[#942E3A]">{item.variant.size}</span><span className="ml-2">× {item.quantity}</span></div>)}</div></td>
                    <td className="py-4"><div className="space-y-1.5">{items.map((item) => <div key={item.id}>{formatCurrency(Number(item.wholesalePrice))}</div>)}</div></td>
                    <td className="py-4"><div className="space-y-1.5">{items.map((item) => <div key={item.id}>{formatCurrency(Number(item.retailPrice))}</div>)}</div></td>
                    <td className="py-4 font-bold text-[#D8B46A]">{totalRemaining}</td>
                    <td className="py-4 text-right font-bold text-[#942E3A]">{formatCurrency(totalLine)}<span className="mt-1 block text-[10px] font-normal text-[#6B1F2A]/55">{totalQuantity} units</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-3 space-y-2.5 sm:hidden">
          {productGroups.map(({ product, items }) => {
            const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
            const totalRemaining = items.reduce((sum, item) => sum + (item.lot?.remaining ?? item.quantity), 0);
            const totalLine = items.reduce((sum, item) => sum + Number(item.lineTotal), 0);
            return (
              <div key={product.id} className="space-y-2 rounded-xl border border-[#942E3A]/10 bg-[#FFF9EB]/40 p-3 text-xs">
                <div className="flex items-start justify-between gap-2 border-b border-[#942E3A]/10 pb-2">
                  <div className="flex min-w-0 items-center gap-2">
                    {product.images[0] ? <img src={product.images[0]} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" /> : <span className="h-10 w-10 shrink-0 rounded-lg bg-[#F2DFC0]" />}
                    <div className="min-w-0"><Link href={`/admin/products/${product.id}`} className="block truncate font-bold text-[#942E3A] hover:underline">{product.name}</Link><p className="mt-0.5 text-[10px] text-[#6B1F2A]/60">{product.color || "No color"} · {product.sku || "No SKU"}</p></div>
                  </div>
                  <span className="shrink-0 font-mono text-xs font-bold text-[#942E3A]">{formatCurrency(totalLine)}</span>
                </div>
                <div className="space-y-1.5 border-b border-[#942E3A]/10 pb-2 text-[11px]">{items.map((item) => <div key={item.id} className="grid grid-cols-[1fr_auto] gap-2"><span className="font-bold text-[#942E3A]">Size {item.variant.size} · Qty {item.quantity}</span><span>{formatCurrency(Number(item.wholesalePrice))} / {formatCurrency(Number(item.retailPrice))}</span></div>)}</div>
                <div className="flex items-center justify-between text-[10px] text-[#6B1F2A]/60"><span>{totalQuantity} units · {totalRemaining} remaining</span><span className="font-bold text-[#942E3A]">Product total</span></div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-[#FFF9EB] p-3 text-xs text-[#6B1F2A]/75 sm:mt-5 sm:rounded-2xl sm:p-4">
          <span>Total Invoice Paid</span>
          <strong className="font-playfair text-base font-bold text-[#942E3A] sm:text-lg">{formatCurrency(Number(invoice.total))}</strong>
        </div>
      </section>
    </div>
  );
}
