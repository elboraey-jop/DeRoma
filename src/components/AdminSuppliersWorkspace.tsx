"use client";

import Link from "next/link";
import { Building2, FileText, Mail, MapPin, Phone, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { createSupplierAction, deleteSupplierAction } from "@/app/admin/suppliers/actions";
import { useAdminI18n } from "@/providers/AdminI18nContext";

export type SupplierCard = { id: string; name: string; phone: string | null; email: string | null; address: string | null; notes: string | null; productCount: number; invoiceCount: number; invoiceTotal: number };
export type InvoiceCard = { id: string; invoiceNumber: string; supplierId: string; supplierName: string; invoiceDate: string; status: string; total: number; itemCount: number };

const tabs = ["suppliers", "invoices"] as const;

export default function AdminSuppliersWorkspace({ suppliers, invoices }: { suppliers: SupplierCard[]; invoices: InvoiceCard[] }) {
  const { lang, t, formatPrice, formatNumber } = useAdminI18n();
  const isRtl = lang === "ar";
  const [tab, setTab] = useState<(typeof tabs)[number]>("suppliers");
  const [showModal, setShowModal] = useState(false);
  const isInvoices = tab === "invoices";

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="space-y-4 text-start sm:space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">
            {isRtl ? "المشتريات والتوريد" : "Procurement"}
          </p>
          <h1 className="mt-0.5 sm:mt-1 font-playfair text-2xl sm:text-3xl font-black">
            {isInvoices ? (isRtl ? "فواتير التوريد" : "Purchase invoices") : t("suppliers.title")}
          </h1>
          <p className="mt-1 hidden sm:block text-xs text-[#6B1F2A]/65">
            {isInvoices ? (isRtl ? "متابعة فواتير الشراء، الشحنات، والتكلفة." : "Track every shipment, cost, payment, and stock receipt.") : t("suppliers.subtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => isInvoices ? window.location.assign("/admin/suppliers/invoices/new") : setShowModal(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#942E3A] px-3 py-2 text-[11px] font-bold text-[#FFF9EB] shadow-xs transition hover:bg-[#7e2732] shrink-0 sm:px-4 sm:py-3 sm:text-xs"
        >
          <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#D8B46A]" />
          <span>{isInvoices ? (isRtl ? "فاتورة توريد جديدة" : "New invoice") : t("suppliers.addSupplier")}</span>
        </button>
      </div>

      <div className="flex w-full gap-1.5 rounded-2xl border border-[#942E3A]/10 bg-white p-1.5 shadow-xs sm:w-fit">
        <button
          type="button"
          onClick={() => setTab("suppliers")}
          className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition sm:flex-none sm:px-5 sm:py-2.5 ${!isInvoices ? "bg-[#942E3A] text-[#FFF9EB]" : "text-[#942E3A]/65 hover:bg-[#FFF9EB]"}`}
        >
          <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>{isRtl ? "قائمة الموردين" : "Suppliers"}</span>
          <span className="rounded-full bg-[#D8B46A]/25 px-1.5 text-[9px]">{formatNumber(suppliers.length)}</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("invoices")}
          className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition sm:flex-none sm:px-5 sm:py-2.5 ${isInvoices ? "bg-[#942E3A] text-[#FFF9EB]" : "text-[#942E3A]/65 hover:bg-[#FFF9EB]"}`}
        >
          <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>{isRtl ? "فواتير الشراء" : "Invoices"}</span>
          <span className="rounded-full bg-[#D8B46A]/25 px-1.5 text-[9px]">{formatNumber(invoices.length)}</span>
        </button>
      </div>

      {!isInvoices ? <SupplierGrid suppliers={suppliers} /> : <InvoiceGrid invoices={invoices} />}

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2c1018]/55 p-4"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setShowModal(false); }}
        >
          <div dir={isRtl ? "rtl" : "ltr"} className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-[#D8B46A]/35 bg-[#FFF9EB] p-5 text-start shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#D8B46A]">
                  {isRtl ? "مورد جديد" : "New relationship"}
                </p>
                <h2 className="mt-1 font-playfair text-2xl font-black text-[#942E3A]">
                  {t("suppliers.addSupplier")}
                </h2>
                <p className="mt-1 text-xs text-[#6B1F2A]/60">
                  {isRtl ? "حفظ بيانات التواصل وعنوان التوريد الخاص بالمورد." : "Save the contact and purchasing details you will need later."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-full p-2 text-[#942E3A] hover:bg-[#942E3A]/10"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form action={createSupplierAction} className="mt-6 grid gap-3 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="field-label">{t("suppliers.supplierName")} *</span>
                <input required name="name" className="admin-input text-start" placeholder={isRtl ? "اسم المورد أو الشركة" : "Supplier or company name"} />
              </label>

              <label>
                <span className="field-label">{t("team.phone")}</span>
                <input name="phone" dir="ltr" className="admin-input text-left" placeholder="01012345678" />
              </label>

              <label>
                <span className="field-label">{t("team.email")}</span>
                <input name="email" type="email" dir="ltr" className="admin-input text-left" placeholder="name@company.com" />
              </label>

              <label className="sm:col-span-2">
                <span className="field-label">{isRtl ? "العنوان والمقر" : "Address"}</span>
                <input name="address" className="admin-input text-right" placeholder={isRtl ? "المحافظة، المنطقة، عنوان المخزن..." : "City, area, warehouse address"} />
              </label>

              <label className="sm:col-span-2">
                <span className="field-label">{t("orders.notes")}</span>
                <textarea name="notes" rows={4} className="admin-input resize-y text-right" placeholder={isRtl ? "شروط الدفع والتسليم والتخصصات..." : "Payment terms, delivery habits, product specialties..."} />
              </label>

              <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-[#942E3A]/15 bg-white px-4 py-2.5 text-xs font-bold text-[#942E3A]"
                >
                  {t("common.cancel")}
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-[#942E3A] px-4 py-2.5 text-xs font-bold text-[#FFF9EB]"
                >
                  {t("common.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SupplierGrid({ suppliers }: { suppliers: SupplierCard[] }) {
  const { lang, formatPrice, formatNumber } = useAdminI18n();
  const isRtl = lang === "ar";

  if (!suppliers.length) return <EmptyState icon={<Building2 />} title={isRtl ? "لا يوجد موردين مسجلين" : "No suppliers yet"} text={isRtl ? "أضف أول مورد لبدء تتبع أوامر الشراء والمشتريات." : "Add your first supplier to start tracking procurement."} />;

  return (
    <div className="grid gap-2.5 sm:gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {suppliers.map((supplier) => (
        <div key={supplier.id} className="group relative rounded-2xl border border-[#942E3A]/10 bg-white p-3.5 shadow-xs transition hover:border-[#D8B46A]/60 sm:rounded-3xl sm:p-5">
          <Link href={`/admin/suppliers/${supplier.id}`} className="absolute inset-0 rounded-2xl sm:rounded-3xl" aria-label={`Open ${supplier.name}`} />
          <div className="relative pointer-events-none flex items-start justify-between gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#942E3A] text-[#D8B46A] sm:h-11 sm:w-11 sm:rounded-2xl">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>

            <form action={deleteSupplierAction} className="pointer-events-auto">
              <input type="hidden" name="id" value={supplier.id} />
              <button
                type="submit"
                aria-label={`Delete ${supplier.name}`}
                className="rounded-lg p-1.5 text-red-600 opacity-70 transition hover:bg-red-50 hover:opacity-100"
                onClick={(e) => { if (!confirm(isRtl ? "هل أنت تأكد من إزالة هذا المورد؟" : "Delete supplier?")) e.preventDefault(); }}
              >
                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </form>
          </div>

          <h2 className="relative mt-3 font-playfair text-base font-bold text-[#942E3A] truncate sm:mt-5 sm:text-xl">
            {supplier.name}
          </h2>

          <div className="relative mt-2 space-y-1 text-[10px] text-[#6B1F2A]/65 sm:mt-3 sm:space-y-1.5 sm:text-[11px]">
            <p dir="ltr" className="flex items-center gap-1.5 text-left">
              <Phone className="h-3 w-3 shrink-0 text-[#D8B46A] sm:h-3.5 sm:w-3.5" />
              <span>{supplier.phone || (isRtl ? "لم يحدد رقم هاتف" : "No phone added")}</span>
            </p>
            <p dir="ltr" className="flex items-center gap-1.5 truncate text-left">
              <Mail className="h-3 w-3 shrink-0 text-[#D8B46A] sm:h-3.5 sm:w-3.5" />
              <span>{supplier.email || (isRtl ? "لم يحدد بريد إلكتروني" : "No email added")}</span>
            </p>
            <p className="flex items-center gap-1.5 truncate">
              <MapPin className="h-3 w-3 shrink-0 text-[#D8B46A] sm:h-3.5 sm:w-3.5" />
              <span>{supplier.address || (isRtl ? "لم يحدد عنوان" : "No address added")}</span>
            </p>
          </div>

          <div className="relative mt-3 grid grid-cols-2 gap-2 sm:mt-5">
            <div className="rounded-xl bg-[#FFF9EB] p-2.5 sm:rounded-2xl sm:p-3">
              <p className="text-[8px] uppercase tracking-wide text-[#6B1F2A]/50 sm:text-[9px]">{isRtl ? "المنتجات" : "Products"}</p>
              <p className="mt-0.5 font-playfair text-base font-black text-[#942E3A] sm:mt-1 sm:text-xl">{formatNumber(supplier.productCount)}</p>
            </div>
            <div className="rounded-xl bg-[#fff7df] p-2.5 sm:rounded-2xl sm:p-3">
              <p className="text-[8px] uppercase tracking-wide text-[#6B1F2A]/50 sm:text-[9px]">{isRtl ? "الفواتير" : "Invoices"}</p>
              <p className="mt-0.5 font-playfair text-base font-black text-[#942E3A] sm:mt-1 sm:text-xl">{formatNumber(supplier.invoiceCount)}</p>
            </div>
          </div>

          <p className="relative mt-3 text-[10px] font-bold text-[#D8B46A] sm:mt-4">
            {isRtl ? "إجمالي المشتريات: " : "Purchases: "} {formatPrice(supplier.invoiceTotal)}
          </p>
        </div>
      ))}
    </div>
  );
}

function InvoiceGrid({ invoices }: { invoices: InvoiceCard[] }) {
  const { lang, formatPrice, formatNumber } = useAdminI18n();
  const isRtl = lang === "ar";

  if (!invoices.length) return <EmptyState icon={<FileText />} title={isRtl ? "لا توجد فواتير توريد" : "No invoices yet"} text={isRtl ? "قم بإنشاء فاتورة توريد جديدة لإضافة وتعديل المخزون." : "Create a purchase invoice to receive stock and record its cost."} />;

  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
      {invoices.map((invoice) => (
        <Link
          key={invoice.id}
          href={`/admin/suppliers/invoices/${invoice.id}`}
          className="rounded-2xl border border-[#942E3A]/10 bg-white p-3.5 shadow-xs transition hover:border-[#D8B46A]/60 sm:rounded-3xl sm:p-5"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff7df] text-[#942E3A] sm:h-11 sm:w-11 sm:rounded-2xl">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] font-bold text-emerald-700 sm:px-2.5 sm:py-1 sm:text-[9px]">
              {isRtl ? "مدفوعة" : "Paid"}
            </span>
          </div>

          <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.18em] text-[#D8B46A] truncate sm:mt-5 sm:text-[10px]">
            {invoice.invoiceNumber}
          </p>

          <h2 className="mt-0.5 font-playfair text-sm font-bold text-[#942E3A] truncate sm:mt-1 sm:text-xl">
            {invoice.supplierName}
          </h2>

          <p className="mt-1 text-[10px] text-[#6B1F2A]/60 truncate sm:mt-2 sm:text-xs">
            <span dir={isRtl ? "rtl" : "ltr"}>{new Date(invoice.invoiceDate).toLocaleDateString(isRtl ? "ar-EG-u-nu-latn" : "en-US", { dateStyle: "medium" })}</span> · {formatNumber(invoice.itemCount)} {isRtl ? "صنف" : "items"}
          </p>

          <div className="mt-3 flex items-end justify-between border-t border-[#942E3A]/10 pt-2.5 sm:mt-5 sm:pt-4">
            <span className="text-[9px] uppercase tracking-wide text-[#6B1F2A]/50 sm:text-[10px]">{isRtl ? "الإجمالي" : "Total"}</span>
            <strong className="font-playfair text-base text-[#942E3A] sm:text-xl">{formatPrice(invoice.total)}</strong>
          </div>
        </Link>
      ))}
    </div>
  );
}

function EmptyState({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-[#D8B46A]/60 bg-white p-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff7df] text-[#D8B46A]">
        {icon}
      </div>
      <h2 className="mt-4 font-playfair text-xl font-bold text-[#942E3A]">{title}</h2>
      <p className="mt-1 text-xs text-[#6B1F2A]/60">{text}</p>
    </div>
  );
}
