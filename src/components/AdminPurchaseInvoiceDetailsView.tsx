"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import AdminBackButton from "@/components/AdminBackButton";
import { useAdminI18n } from "@/providers/AdminI18nContext";

export type PurchaseInvoiceDetailsProps = {
  invoice: {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    total: number;
    supplier: {
      id: string;
      name: string;
    };
    productGroups: Array<{
      product: {
        id: string;
        name: string;
        color: string | null;
        sku: string | null;
        image: string | null;
      };
      items: Array<{
        id: string;
        size: string;
        quantity: number;
        remaining: number;
        wholesalePrice: number;
        retailPrice: number;
        lineTotal: number;
      }>;
    }>;
  };
};

export default function AdminPurchaseInvoiceDetailsView({
  invoice,
}: PurchaseInvoiceDetailsProps) {
  const { lang, formatPrice, formatNumber } = useAdminI18n();
  const isRtl = lang === "ar";

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="mx-auto max-w-6xl space-y-4 text-start sm:space-y-5">
      <div className="flex items-center gap-3">
        <AdminBackButton fallbackHref="/admin/suppliers" />
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#D8B46A] sm:text-[10px]">
            {isRtl ? "فاتورة شراء" : "Purchase invoice"}
          </p>
          <h1 className="mt-0.5 font-playfair text-2xl font-black sm:mt-1 sm:text-3xl">
            {invoice.invoiceNumber}
          </h1>
        </div>
      </div>

      <section className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-xs sm:rounded-3xl sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-[#D8B46A]" />
            <h2 className="font-playfair text-base font-bold sm:text-xl">
              {isRtl ? "الأصناف المستلمة" : "Received products"}
            </h2>
          </div>
          <Link
            href={`/admin/suppliers/${invoice.supplier.id}`}
            className="rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB] px-3 py-1.5 text-[10px] font-bold text-[#942E3A] transition hover:bg-[#F2DFC0]"
          >
            {invoice.supplier.name}
          </Link>
        </div>

        <div className="mt-4 hidden overflow-x-auto sm:block">
          <table className={`w-full min-w-[900px] ${isRtl ? "text-right" : "text-left"} text-xs`}>
            <thead className="border-b border-[#942E3A]/10 text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
              <tr>
                <th className="pb-3">{isRtl ? "المنتج" : "Product"}</th>
                <th className="pb-3">{isRtl ? "المقاسات / الكميات" : "Sizes / quantities"}</th>
                <th className="pb-3">{isRtl ? "سعر الجملة" : "Wholesale"}</th>
                <th className="pb-3">{isRtl ? "سعر البيع" : "Selling"}</th>
                <th className="pb-3">{isRtl ? "المتبقي" : "Remaining"}</th>
                <th className={`pb-3 ${isRtl ? "text-left" : "text-right"}`}>{isRtl ? "إجمالي المنتج" : "Product total"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#942E3A]/8">
              {invoice.productGroups.map(({ product, items }) => {
                const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
                const totalRemaining = items.reduce((sum, item) => sum + item.remaining, 0);
                const totalLine = items.reduce((sum, item) => sum + item.lineTotal, 0);
                return (
                  <tr key={product.id}>
                    <td className="py-4 font-bold text-[#942E3A]">
                      <Link href={`/admin/products/${product.id}`} className="flex items-center gap-3 hover:underline">
                        {product.image ? (
                          <img src={product.image} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
                        ) : (
                          <span className="h-11 w-11 shrink-0 rounded-xl bg-[#F2DFC0]" />
                        )}
                        <span>
                          <span className="block">{product.name}</span>
                          <span className="mt-1 block text-[10px] font-normal text-[#6B1F2A]/60">
                            {product.color || (isRtl ? "بدون لون" : "No color")} · {product.sku || (isRtl ? "بدون كود" : "No SKU")}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="py-4 text-[#6B1F2A]/70">
                      <div className="space-y-1.5">
                        {items.map((item) => (
                          <div key={item.id}>
                            <span className="font-bold text-[#942E3A]">{item.size}</span>
                            <span className={isRtl ? "mr-2" : "ml-2"}>× {formatNumber(item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="space-y-1.5">
                        {items.map((item) => (
                          <div key={item.id}>{formatPrice(item.wholesalePrice)}</div>
                        ))}
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="space-y-1.5">
                        {items.map((item) => (
                          <div key={item.id}>{formatPrice(item.retailPrice)}</div>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 font-bold text-[#D8B46A]">
                      {formatNumber(totalRemaining)}
                    </td>
                    <td className={`py-4 ${isRtl ? "text-left" : "text-right"} font-bold text-[#942E3A]`}>
                      {formatPrice(totalLine)}
                      <span className="mt-1 block text-[10px] font-normal text-[#6B1F2A]/55">
                        {formatNumber(totalQuantity)} {isRtl ? "قطعة" : "units"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-3 space-y-2.5 sm:hidden">
          {invoice.productGroups.map(({ product, items }) => {
            const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
            const totalRemaining = items.reduce((sum, item) => sum + item.remaining, 0);
            const totalLine = items.reduce((sum, item) => sum + item.lineTotal, 0);
            return (
              <div key={product.id} className="space-y-2 rounded-xl border border-[#942E3A]/10 bg-[#FFF9EB]/40 p-3 text-xs">
                <div className="flex items-start justify-between gap-2 border-b border-[#942E3A]/10 pb-2">
                  <div className="flex min-w-0 items-center gap-2">
                    {product.image ? (
                      <img src={product.image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <span className="h-10 w-10 shrink-0 rounded-lg bg-[#F2DFC0]" />
                    )}
                    <div className="min-w-0">
                      <Link href={`/admin/products/${product.id}`} className="block truncate font-bold text-[#942E3A] hover:underline">
                        {product.name}
                      </Link>
                      <p className="mt-0.5 text-[10px] text-[#6B1F2A]/60">
                        {product.color || (isRtl ? "بدون لون" : "No color")} · {product.sku || (isRtl ? "بدون كود" : "No SKU")}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 font-mono text-xs font-bold text-[#942E3A]">
                    {formatPrice(totalLine)}
                  </span>
                </div>
                <div className="space-y-1.5 border-b border-[#942E3A]/10 pb-2 text-[11px]">
                  {items.map((item) => (
                    <div key={item.id} className="grid grid-cols-[1fr_auto] gap-2">
                      <span className="font-bold text-[#942E3A]">
                        {isRtl ? `مقاس ${item.size} · كمية ${formatNumber(item.quantity)}` : `Size ${item.size} · Qty ${item.quantity}`}
                      </span>
                      <span>
                        {formatPrice(item.wholesalePrice)} / {formatPrice(item.retailPrice)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#6B1F2A]/60">
                  <span>
                    {formatNumber(totalQuantity)} {isRtl ? "قطعة" : "units"} · {formatNumber(totalRemaining)} {isRtl ? "متبقي" : "remaining"}
                  </span>
                  <span className="font-bold text-[#942E3A]">
                    {isRtl ? "إجمالي المنتج" : "Product total"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-[#FFF9EB] p-3 text-xs text-[#6B1F2A]/75 sm:mt-5 sm:rounded-2xl sm:p-4">
          <span>{isRtl ? "إجمالي الفاتورة المدفوع" : "Total Invoice Paid"}</span>
          <strong className="font-playfair text-base font-bold text-[#942E3A] sm:text-lg">
            {formatPrice(invoice.total)}
          </strong>
        </div>
      </section>
    </div>
  );
}
