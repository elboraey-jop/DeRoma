"use client";

import Link from "next/link";
import { Building2, FileText, Mail, MapPin, Phone, Package, Plus } from "lucide-react";
import AdminBackButton from "@/components/AdminBackButton";
import { useAdminI18n } from "@/providers/AdminI18nContext";

export type SupplierDetailsProps = {
  supplier: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    notes: string | null;
    products: Array<{
      id: string;
      name: string;
      stock: number;
    }>;
    invoices: Array<{
      id: string;
      invoiceNumber: string;
      invoiceDate: string;
      itemCount: number;
      total: number;
    }>;
  };
  totalPurchases: number;
  totalUnits: number;
};

export default function AdminSupplierDetailsView({
  supplier,
  totalPurchases,
  totalUnits,
}: SupplierDetailsProps) {
  const { lang, formatPrice, formatNumber } = useAdminI18n();
  const isRtl = lang === "ar";

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="mx-auto max-w-6xl space-y-4 text-start sm:space-y-5">
      <div className="flex items-center gap-3">
        <AdminBackButton fallbackHref="/admin/suppliers" />
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#D8B46A] sm:text-[10px]">
            {isRtl ? "ملف التوريد" : "Procurement profile"}
          </p>
          <h1 className="mt-0.5 font-playfair text-2xl font-black sm:mt-1 sm:text-3xl">
            {supplier.name}
          </h1>
        </div>
      </div>

      <section className="grid gap-3 sm:gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl bg-[#942E3A] p-4 text-[#FFF9EB] sm:rounded-3xl sm:p-8">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D8B46A] text-[#942E3A] sm:h-14 sm:w-14 sm:rounded-2xl">
              <Building2 className="h-5 w-5 sm:h-7 sm:w-7" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#D8B46A] sm:text-[10px]">
                {isRtl ? "حساب المورد" : "Supplier account"}
              </p>
              <h2 className="mt-0.5 font-playfair text-xl font-black sm:text-3xl">
                {supplier.name}
              </h2>
            </div>
          </div>

          <div className="mt-4 grid gap-2.5 text-xs sm:mt-7 sm:grid-cols-2 sm:gap-3">
            <div className="space-y-2 rounded-xl bg-white/10 p-3 sm:space-y-3 sm:rounded-2xl sm:p-4">
              <p className="flex items-center gap-2 text-[11px] sm:text-xs">
                <Phone className="h-3.5 w-3.5 shrink-0 text-[#D8B46A]" />
                <span dir="ltr" className={isRtl ? "text-right" : "text-left"}>
                  {supplier.phone || (isRtl ? "لم يحدد رقم هاتف" : "No phone")}
                </span>
              </p>
              <p className="flex items-center gap-2 text-[11px] sm:text-xs break-all">
                <Mail className="h-3.5 w-3.5 shrink-0 text-[#D8B46A]" />
                <span dir="ltr" className={isRtl ? "text-right" : "text-left"}>
                  {supplier.email || (isRtl ? "لم يحدد بريد إلكتروني" : "No email")}
                </span>
              </p>
              <p className="flex items-center gap-2 text-[11px] sm:text-xs">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[#D8B46A]" />
                <span>{supplier.address || (isRtl ? "لم يحدد عنوان" : "No address")}</span>
              </p>
            </div>

            <div className="rounded-xl bg-white/10 p-3 sm:rounded-2xl sm:p-4">
              <p className="text-[11px] font-bold text-[#D8B46A] sm:text-xs">
                {isRtl ? "ملاحظات" : "Notes"}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-white/80 sm:mt-2 sm:text-xs">
                {supplier.notes || (isRtl ? "لا توجد ملاحظات توريد مسجلة حتى الآن." : "No purchasing notes added yet.")}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-3.5 sm:rounded-3xl sm:p-5">
            <FileText className="h-4 w-4 text-[#D8B46A] sm:h-5 sm:w-5" />
            <p className="mt-3 text-[9px] uppercase tracking-wide text-[#6B1F2A]/55 sm:mt-5 sm:text-[10px]">
              {isRtl ? "الفواتير" : "Invoices"}
            </p>
            <p className="mt-0.5 font-playfair text-xl font-black text-[#942E3A] sm:mt-1 sm:text-3xl">
              {formatNumber(supplier.invoices.length)}
            </p>
          </div>

          <div className="rounded-2xl border border-[#D8B46A]/35 bg-[#fff7df] p-3.5 sm:rounded-3xl sm:p-5">
            <p className="text-[9px] uppercase tracking-wide text-[#6B1F2A]/55 sm:text-[10px]">
              {isRtl ? "إجمالي المشتريات" : "Purchases"}
            </p>
            <p className="mt-3 font-playfair text-base font-black text-[#942E3A] sm:mt-5 sm:text-xl">
              {formatPrice(totalPurchases)}
            </p>
          </div>

          <div className="col-span-2 rounded-2xl border border-[#942E3A]/10 bg-white p-3.5 sm:rounded-3xl sm:p-5">
            <p className="text-[9px] uppercase tracking-wide text-[#6B1F2A]/55 sm:text-[10px]">
              {isRtl ? "إجمالي القطع المستلمة" : "Units received"}
            </p>
            <p className="mt-0.5 font-playfair text-xl font-black text-[#942E3A] sm:mt-1 sm:text-3xl">
              {formatNumber(totalUnits)}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-xs sm:rounded-3xl sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#D8B46A]" />
            <h2 className="font-playfair text-base font-bold sm:text-xl">
              {isRtl ? "فواتير المورد" : "Supplier invoices"}
            </h2>
          </div>
          <Link
            href="/admin/suppliers/invoices/new"
            className="inline-flex items-center gap-1 rounded-xl bg-[#942E3A] px-3 py-1.5 text-[10px] font-bold text-[#FFF9EB] sm:px-3 sm:py-2"
          >
            <Plus className="h-3.5 w-3.5 text-[#D8B46A]" />
            <span>{isRtl ? "فاتورة جديدة" : "New invoice"}</span>
          </Link>
        </div>

        <div className="mt-3 space-y-2 sm:mt-4">
          {supplier.invoices.length ? (
            supplier.invoices.map((invoice) => (
              <Link
                href={`/admin/suppliers/invoices/${invoice.id}`}
                key={invoice.id}
                className="flex items-center justify-between rounded-xl border border-[#942E3A]/10 p-3 transition hover:border-[#D8B46A] sm:rounded-2xl sm:p-4"
              >
                <div>
                  <p className="text-xs font-bold text-[#942E3A] sm:text-sm">
                    {invoice.invoiceNumber}
                  </p>
                  <p className="mt-0.5 text-[10px] text-[#6B1F2A]/60">
                    <span dir="ltr">
                      {new Date(invoice.invoiceDate).toLocaleDateString(
                        isRtl ? "ar-EG-u-nu-latn" : "en-US",
                        { dateStyle: "medium" },
                      )}
                    </span>{" "}
                    · {formatNumber(invoice.itemCount)} {isRtl ? "منتج" : "products"}
                  </p>
                </div>
                <div className={isRtl ? "text-left" : "text-right"}>
                  <p className="font-playfair text-sm font-bold text-[#942E3A] sm:text-lg">
                    {formatPrice(invoice.total)}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <p className="py-8 text-center text-xs text-[#6B1F2A]/60">
              {isRtl ? "لا توجد فواتير لهذا المورد حتى الآن." : "No invoices for this supplier yet."}
            </p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-xs sm:rounded-3xl sm:p-7">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-[#D8B46A]" />
          <h2 className="font-playfair text-base font-bold sm:text-xl">
            {isRtl ? "كتالوج المنتجات المرتبطة" : "Linked product catalog"}
          </h2>
        </div>
        <div className="mt-3 grid gap-2 sm:mt-4 sm:grid-cols-2">
          {supplier.products.length ? (
            supplier.products.map((product) => (
              <Link
                key={product.id}
                href={`/admin/products/${product.id}`}
                className="flex items-center justify-between rounded-xl bg-[#FFF9EB] px-3.5 py-2.5 text-xs sm:rounded-2xl sm:px-4 sm:py-3"
              >
                <span className="font-bold text-[#942E3A] truncate">
                  {product.name}
                </span>
                <span className={`text-[10px] sm:text-xs text-[#6B1F2A]/60 shrink-0 ${isRtl ? "mr-2" : "ml-2"}`}>
                  {formatNumber(product.stock)} {isRtl ? "في المخزون" : "in stock"}
                </span>
              </Link>
            ))
          ) : (
            <p className="py-6 text-center text-xs text-[#6B1F2A]/60">
              {isRtl ? "لا توجد منتجات مرتبطة بهذا المورد حتى الآن." : "No products linked yet."}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
