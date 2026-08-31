"use client";

import AdminBackButton from "@/components/AdminBackButton";
import AdminPurchaseInvoiceForm from "@/components/AdminPurchaseInvoiceForm";
import type { CatalogOption, RelatedProduct, Supplier } from "@/components/AdminProductCreateForm";
import { useAdminI18n } from "@/providers/AdminI18nContext";

export default function AdminNewPurchaseInvoiceView({
  suppliers,
  variants,
  productOptions,
  catalogProducts,
  initialVariantId,
}: {
  suppliers: Supplier[];
  variants: any[];
  productOptions: CatalogOption[];
  catalogProducts: RelatedProduct[];
  initialVariantId?: string;
}) {
  const { lang } = useAdminI18n();
  const isRtl = lang === "ar";

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="mx-auto max-w-6xl space-y-4 text-start sm:space-y-5">
      <div className="flex items-center gap-3">
        <AdminBackButton fallbackHref="/admin/suppliers" />
        <div>
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">
            {isRtl ? "المشتريات والتوريد" : "Procurement"}
          </p>
          <h1 className="mt-0.5 sm:mt-1 font-playfair text-2xl sm:text-3xl font-black">
            {isRtl ? "إنشاء فاتورة توريد جديدة" : "Create purchase invoice"}
          </h1>
          <p className="mt-1 hidden sm:block text-xs text-[#6B1F2A]/65">
            {isRtl
              ? "استلام المخزون، وحفظ سجل التكاليف، وإدارة أرصدة الموردين بدقة."
              : "Receive stock, preserve cost history, and keep supplier balances accurate."}
          </p>
        </div>
      </div>
      <AdminPurchaseInvoiceForm
        suppliers={suppliers}
        variants={variants}
        productOptions={productOptions}
        catalogProducts={catalogProducts}
        initialVariantId={initialVariantId}
      />
    </div>
  );
}
