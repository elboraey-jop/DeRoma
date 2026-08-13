"use client";

import Link from "next/link";
import { ArrowLeft, Boxes, CheckCircle2, FilePlus2, FileText, PackagePlus, Plus, Receipt, Trash2, Wallet, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPurchaseInvoiceAction } from "@/app/admin/suppliers/actions";
import { AdminProductPicker, AdminSupplierPicker, type ProcurementVariant } from "@/components/AdminProcurementPickers";
import AdminProductCreateForm, { type CatalogOption, type RelatedProduct, type Supplier } from "@/components/AdminProductCreateForm";
import { useAdminI18n } from "@/providers/AdminI18nContext";

type VariantOption = {
  id: string;
  label: string;
  productId: string;
  productName: string;
  wholesalePrice: number;
  retailPrice: number;
  category: string;
  image: string | null;
};

type InvoiceLine = VariantOption & {
  quantity: number;
  wholesalePrice: number;
  retailPrice: number;
  notes: string;
};

function IntakeStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#942E3A]/8 bg-[#FFF9EB]/55 px-3.5 py-3">
      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#6B1F2A]/50">{label}</p>
      <p className="mt-1 truncate font-playfair text-lg font-bold text-[#942E3A]">{value}</p>
    </div>
  );
}

export default function AdminPurchaseInvoiceForm({
  suppliers,
  variants,
  productOptions,
  catalogProducts,
  initialVariantId,
}: {
  suppliers: Supplier[];
  variants: VariantOption[];
  productOptions: CatalogOption[];
  catalogProducts: RelatedProduct[];
  initialVariantId?: string;
}) {
  const { lang, t, formatPrice, formatNumber } = useAdminI18n();
  const isRtl = lang === "ar";

  const [lines, setLines] = useState<InvoiceLine[]>([]);
  const [selectedVariant, setSelectedVariant] = useState(initialVariantId || "");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<"choice" | "batch" | "new">("choice");

  useEffect(() => {
    if (!addModalOpen) return;
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [addModalOpen]);

  const summary = useMemo(() => ({
    productTypes: lines.length,
    units: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: lines.reduce((sum, line) => sum + line.quantity * line.wholesalePrice, 0),
    retailValue: lines.reduce((sum, line) => sum + line.quantity * line.retailPrice, 0),
  }), [lines]);

  const addLine = () => {
    const variant = variants.find((item) => item.id === selectedVariant);
    if (!variant || lines.some((line) => line.id === variant.id)) return;
    setLines((current) => [...current, { ...variant, quantity: 1, notes: "" }]);
    setSelectedVariant("");
    setAddModalOpen(false);
    setAddMode("choice");
  };

  const openAddModal = () => {
    setAddMode("choice");
    setAddModalOpen(true);
  };

  const closeAddModal = () => {
    setAddModalOpen(false);
    setAddMode("choice");
  };

  const updateLine = (
    id: string,
    field: keyof Pick<InvoiceLine, "quantity" | "wholesalePrice" | "retailPrice" | "notes">,
    value: string,
  ) => {
    setLines((current) => current.map((line) => line.id === id
      ? { ...line, [field]: field === "notes" ? value : Number(value) }
      : line));
  };

  const serializedLines = JSON.stringify(lines.map(({ id, quantity, wholesalePrice, retailPrice, notes }) => ({
    variantId: id,
    quantity,
    wholesalePrice,
    retailPrice,
    notes,
  })));

  return (
    <form action={createPurchaseInvoiceAction} className="space-y-4 sm:space-y-5 text-right">
      <input type="hidden" name="items" value={serializedLines} />
      <input type="hidden" name="shippingCost" value="0" />
      <input type="hidden" name="discount" value="0" />
      <input type="hidden" name="amountPaid" value="0" />

      <div className="grid gap-4 lg:grid-cols-[1fr_0.7fr] sm:gap-5">
        <section className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-xs sm:rounded-3xl sm:p-7">
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
            {isRtl ? "بيانات فاتورة الشراء" : "Invoice information"}
          </p>
          <h2 className="mt-0.5 sm:mt-1 font-playfair text-lg sm:text-xl font-bold text-[#942E3A]">
            {isRtl ? "المورد وتاريخ الفاتورة" : "Supplier & invoice"}
          </h2>
          <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2 sm:gap-4">
            <label>
              <span className="field-label">{t("suppliers.supplierName")} *</span>
              <input type="hidden" name="supplierId" value={selectedSupplier} />
              <AdminSupplierPicker suppliers={suppliers} value={selectedSupplier} onChange={setSelectedSupplier} />
            </label>

            <label>
              <span className="field-label">{isRtl ? "تاريخ الفاتورة *" : "Invoice date *"}</span>
              <input name="invoiceDate" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="admin-input text-right" />
            </label>

            <label className="sm:col-span-2">
              <span className="field-label">{t("orders.notes")}</span>
              <textarea name="notes" rows={3} className="admin-input resize-y text-right" placeholder={isRtl ? "إضافة أية ملاحظات عن شحنة التوريد..." : "Add any notes about this purchase..."} />
            </label>
          </div>
        </section>

        <InvoiceSummary productTypes={summary.productTypes} units={summary.units} subtotal={summary.subtotal} retailValue={summary.retailValue} />
      </div>

      <section className="relative overflow-hidden rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-xs sm:rounded-3xl sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#D8B46A]/12 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
              {isRtl ? "استلام المخزون" : "Stock receipt"}
            </p>
            <h2 className="mt-1 font-playfair text-xl font-black text-[#942E3A] sm:text-2xl">
              {isRtl ? "المنتجات المسجلة بالفاتورة" : "Products on this invoice"}
            </h2>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:mt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#942E3A] px-4 py-3 text-xs font-bold text-[#FFF9EB] shadow-[0_10px_24px_rgba(148,46,58,0.2)] transition hover:-translate-y-0.5 hover:bg-[#7e2732]"
          >
            <Plus className="h-4 w-4 text-[#D8B46A]" />
            <span>{isRtl ? "إضافة المنتج للفاتورة" : "Add product"}</span>
          </button>
        </div>

        <div className="relative mt-5 grid gap-2 sm:grid-cols-3">
          <IntakeStat label={isRtl ? "Ø§Ù„Ø£ØµÙ†Ø§Ù" : "Products"} value={formatNumber(lines.length)} />
          <IntakeStat label={isRtl ? "Ø§Ù„Ù‚Ø·Ø¹" : "Units"} value={formatNumber(summary.units)} />
          <IntakeStat label={isRtl ? "Ø§Ù„Ø­Ø§Ù„Ø©" : "Status"} value={lines.length ? "In progress" : "Ready to add"} />
        </div>

        <div className="relative mt-4 space-y-3">
          {lines.map((line) => (
            <div key={line.id} className="rounded-2xl bg-[#FFF9EB]/70 p-3.5 sm:p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-[#942E3A] text-xs sm:text-sm">{line.productName}</p>
                  <p className="mt-0.5 text-[10px] text-[#6B1F2A]/60">{line.label}</p>
                </div>
                <button type="button" onClick={() => setLines((current) => current.filter((item) => item.id !== line.id))} className="text-red-600 p-1" aria-label="Remove product">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                <label>
                  <span className="field-label">{isRtl ? "الكمية" : "Quantity"}</span>
                  <input type="number" min="1" value={line.quantity} onChange={(event) => updateLine(line.id, "quantity", event.target.value)} className="admin-input text-right" />
                </label>

                <label>
                  <span className="field-label">{isRtl ? "سعر الشراء / للقطعة" : "Wholesale / unit"}</span>
                  <input type="number" min="0" step="0.01" value={line.wholesalePrice} onChange={(event) => updateLine(line.id, "wholesalePrice", event.target.value)} className="admin-input text-right" />
                </label>

                <label>
                  <span className="field-label">{isRtl ? "سعر البيع / للقطعة" : "Selling / unit"}</span>
                  <input type="number" min="0" step="0.01" value={line.retailPrice} onChange={(event) => updateLine(line.id, "retailPrice", event.target.value)} className="admin-input text-right" />
                </label>

                <div>
                  <span className="field-label">{isRtl ? "إجمالي البند" : "Line total"}</span>
                  <p className="admin-input flex items-center font-bold text-[#942E3A]">
                    {formatPrice(line.quantity * line.wholesalePrice)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {!lines.length && (
            <div className="rounded-2xl border border-dashed border-[#D8B46A]/60 py-8 text-center text-xs text-[#6B1F2A]/60 sm:py-12">
              {isRtl ? "اختر أحد منتجات الكتالوج أعلاه لإضافته للفاتورة." : "Choose a product variant above to start the invoice."}
            </div>
          )}
        </div>
      </section>

      {addModalOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[#2d1118]/60 p-3 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeAddModal();
          }}
        >
          <div className="admin-modal-scroll hide-scrollbar max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl overflow-y-auto overscroll-contain rounded-3xl border border-[#D8B46A]/35 bg-[#FFFDFC] p-4 shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">
                  Product intake
                </p>
                <h2 className="mt-1 font-playfair text-2xl font-black text-[#942E3A]">
                  {addMode === "choice"
                    ? "Add to this invoice"
                    : addMode === "batch"
                      ? "Add an existing batch"
                      : "Create a new product"}
                </h2>
                <p className="mt-1 text-xs text-[#6B1F2A]/60">
                  {addMode === "choice"
                    ? "Choose how you want to build the next stock line."
                    : addMode === "batch"
                      ? "Pick a catalog variant, then add its cost and quantity below."
                      : "Complete the product setup without leaving the invoice."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeAddModal}
                className="rounded-full p-2 text-[#942E3A] transition hover:bg-[#FFF9EB]"
                aria-label="Close add product modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {addMode === "choice" && (
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setAddMode("new")}
                  className="group rounded-3xl border border-[#942E3A]/12 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#D8B46A] sm:p-6"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#942E3A] text-[#D8B46A]">
                    <FilePlus2 className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-playfair text-xl font-bold text-[#942E3A]">
                    New product
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-[#6B1F2A]/65">
                    Create the complete product, variants, pricing and gallery in this modal.
                  </p>
                  <span className="mt-5 inline-flex text-[10px] font-bold uppercase tracking-wider text-[#942E3A]">
                    Open product editor →
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setAddMode("batch")}
                  className="group rounded-3xl border border-[#D8B46A]/50 bg-[#fff7df] p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#942E3A] sm:p-6"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#942E3A]">
                    <Boxes className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-playfair text-xl font-bold text-[#942E3A]">
                    Existing batch
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-[#6B1F2A]/65">
                    Select a product variant already in the catalog and add it to this invoice.
                  </p>
                  <span className="mt-5 inline-flex text-[10px] font-bold uppercase tracking-wider text-[#942E3A]">
                    Choose from catalog →
                  </span>
                </button>
              </div>
            )}

            {addMode === "batch" && (
              <div className="mt-6 space-y-4">
                <button
                  type="button"
                  onClick={() => setAddMode("choice")}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#942E3A]/12 bg-white px-3 py-2 text-xs font-bold text-[#942E3A]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>
                <div className="rounded-3xl border border-[#D8B46A]/40 bg-gradient-to-br from-[#FFF9EB] to-white p-4 sm:p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">Catalog batch</p>
                  <h3 className="mt-1 font-playfair text-xl font-bold text-[#942E3A]">Choose a product variant</h3>
                  <div className="mt-4">
                    <AdminProductPicker variants={variants as ProcurementVariant[]} value={selectedVariant} onChange={setSelectedVariant} />
                  </div>
                  {selectedVariant && (
                    <div className="mt-4 rounded-2xl border border-[#942E3A]/10 bg-white p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/50">Selected line</p>
                      <p className="mt-1 font-playfair text-lg font-bold text-[#942E3A]">
                        {variants.find((variant) => variant.id === selectedVariant)?.productName}
                      </p>
                      <p className="mt-1 text-xs text-[#6B1F2A]/60">
                        {variants.find((variant) => variant.id === selectedVariant)?.label}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={addLine}
                    disabled={!selectedVariant || lines.some((line) => line.id === selectedVariant)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#942E3A] px-5 py-3 text-xs font-bold text-[#FFF9EB] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <PackagePlus className="h-4 w-4 text-[#D8B46A]" /> Add to invoice
                  </button>
                </div>
              </div>
            )}

            {addMode === "new" && (
              <div className="mt-6">
                <AdminProductCreateForm
                  options={productOptions}
                  suppliers={suppliers}
                  products={catalogProducts}
                  redirectTo="/admin/suppliers/invoices/new"
                  embedded
                  onCancel={closeAddModal}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <Link href="/admin/suppliers" className="rounded-xl border border-[#942E3A]/15 bg-white px-4 py-2.5 text-center text-xs font-bold text-[#942E3A] shrink-0 sm:px-5 sm:py-3">
          {t("common.cancel")}
        </Link>
        <button
          type="submit"
          disabled={!lines.length}
          className="rounded-xl bg-[#942E3A] px-4 py-2.5 text-xs font-bold text-[#FFF9EB] disabled:cursor-not-allowed disabled:opacity-40 sm:px-6 sm:py-3"
        >
          {isRtl ? "حفظ الفاتورة وتأكيد استلام المخزون" : "Save invoice & receive stock"}
        </button>
      </div>
    </form>
  );
}

function InvoiceSummary({ productTypes, units, subtotal, retailValue }: { productTypes: number; units: number; subtotal: number; retailValue: number }) {
  const { lang, formatPrice, formatNumber } = useAdminI18n();
  const isRtl = lang === "ar";

  return (
    <section className="rounded-3xl border border-[#D8B46A]/35 bg-[#fff7df] p-5 shadow-xs sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
            {isRtl ? "ملخص الشراء" : "Live overview"}
          </p>
          <h2 className="mt-1 font-playfair text-xl font-bold text-[#942E3A]">
            {isRtl ? "إجمالي الفاتورة" : "Invoice summary"}
          </h2>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70 text-[#942E3A]">
          <Receipt className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <SummaryMetric icon={<FileText />} label={isRtl ? "الأصناف" : "Products"} value={formatNumber(productTypes)} />
        <SummaryMetric icon={<PackageIcon />} label={isRtl ? "القطع" : "Units"} value={formatNumber(units)} />
      </div>

      <div className="mt-3 space-y-3 rounded-2xl bg-white/65 p-4 text-xs text-[#6B1F2A]">
        <p className="flex items-center justify-between gap-3">
          <span>{isRtl ? "إجمالي الشراء بالجملة" : "Purchase total"}</span>
          <strong className="font-playfair text-xl text-[#942E3A]">{formatPrice(subtotal)}</strong>
        </p>

        <p className="flex items-center justify-between gap-3 border-t border-[#942E3A]/10 pt-3">
          <span>{isRtl ? "القيمة البيعية المتوقعة" : "Expected retail value"}</span>
          <strong className="text-[#942E3A]">{formatPrice(retailValue)}</strong>
        </p>

        <p className="flex items-center gap-2 pt-1 text-[10px] font-bold text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>{isRtl ? "جاهز لإضافة القطع فور الحفظ" : "Ready to receive stock"}</span>
        </p>
      </div>
    </section>
  );
}

function SummaryMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/65 p-3">
      <div className="text-[#D8B46A]">{icon}</div>
      <p className="mt-3 text-[9px] uppercase tracking-wide text-[#6B1F2A]/55">{label}</p>
      <p className="mt-1 font-playfair text-2xl font-black text-[#942E3A]">{value}</p>
    </div>
  );
}

function PackageIcon() {
  return <Wallet className="h-4 w-4" />;
}
