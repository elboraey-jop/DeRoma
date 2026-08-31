"use client";

import { ClipboardCheck, PackageCheck } from "lucide-react";
import AdminBackButton from "@/components/AdminBackButton";
import { useAdminI18n } from "@/providers/AdminI18nContext";

export type AuditDetailItem = {
  id: string;
  productName: string;
  sku: string | null;
  size: string;
  color: string | null;
  expectedStock: number;
  actualStock: number;
  discrepancy: number;
  unitPrice: number;
};

export type AuditDetailProps = {
  audit: {
    id: string;
    auditNumber: string;
    title: string | null;
    status: string;
    notes: string | null;
    totalExpected: number;
    totalActual: number;
    totalDiscrepancy: number;
    discrepancyValue: number;
    auditedBy: string | null;
    createdAt: string;
    items: AuditDetailItem[];
  };
};

export default function AdminAuditDetailsView({ audit }: AuditDetailProps) {
  const { lang, formatPrice, formatNumber } = useAdminI18n();
  const isRtl = lang === "ar";

  const dateStr = new Date(audit.createdAt).toLocaleString(isRtl ? "ar-EG-u-nu-latn" : "en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="space-y-6 text-start">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-[#942E3A]/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <AdminBackButton
            fallbackHref="/admin/inventory/audits"
            ariaLabel={isRtl ? "الرجوع لسجل جلسات الجرد" : "Back to Stock Audits Log"}
          />
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#942E3A] text-[#FFF9EB] shadow-md">
              <ClipboardCheck className="h-5 w-5 text-[#D8B46A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-playfair text-2xl sm:text-3xl font-black text-[#942E3A]">
                  {audit.title || (isRtl ? `جلسة جرد ${audit.auditNumber}` : `Audit ${audit.auditNumber}`)}
                </h1>
                <span className="rounded-full bg-[#FFF9EB] border border-[#D8B46A]/40 px-3 py-1 font-mono text-xs font-bold text-[#942E3A]">
                  {audit.auditNumber}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#6B1F2A]/65 font-medium">
                {isRtl ? "تمت بواسطة " : "Conducted by "}
                <span className="font-bold text-[#942E3A]">
                  {audit.auditedBy || (isRtl ? "المسؤول" : "Admin")}
                </span>{" "}
                {isRtl ? "في " : "on "}
                <span dir="ltr">{dateStr}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/55">
            {isRtl ? "المتوقع بالنظام" : "System Expected"}
          </span>
          <span className="mt-1 block font-playfair text-2xl font-black text-[#942E3A]">
            {formatNumber(audit.totalExpected)} {isRtl ? "قطعة" : "units"}
          </span>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-800">
            {isRtl ? "الفعلي المحصور" : "Physical Counted"}
          </span>
          <span className="mt-1 block font-playfair text-2xl font-black text-emerald-900">
            {formatNumber(audit.totalActual)} {isRtl ? "قطعة" : "units"}
          </span>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-800">
            {isRtl ? "عدد الفروقات" : "Discrepancies Count"}
          </span>
          <span className="mt-1 block font-playfair text-2xl font-black text-amber-900">
            {formatNumber(audit.totalDiscrepancy)} {isRtl ? "قطعة" : "units"}
          </span>
        </div>

        <div className="rounded-2xl border border-[#D8B46A]/40 bg-[#fff7df] p-4 shadow-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/55">
            {isRtl ? "أثر القيمة الصافي" : "Net Value Impact"}
          </span>
          <span className="mt-1 block font-playfair text-xl font-black text-[#942E3A]">
            {formatPrice(audit.discrepancyValue)}
          </span>
        </div>
      </div>

      {/* Audit Notes */}
      {audit.notes && (
        <div className="rounded-2xl border border-[#D8B46A]/30 bg-[#FFF9EB] p-4 text-xs">
          <span className="font-bold text-[#942E3A] uppercase text-[10px]">
            {isRtl ? "ملاحظات الجلسة:" : "Session Notes:"}
          </span>
          <p className="mt-1 text-[#6B1F2A]">{audit.notes}</p>
        </div>
      )}

      {/* Audit Detailed Items Table */}
      <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-center gap-2 border-b border-[#942E3A]/10 pb-4">
          <PackageCheck className="h-5 w-5 text-[#D8B46A]" />
          <h2 className="font-playfair text-xl font-bold text-[#942E3A]">
            {isRtl
              ? `تفاصيل مطابقة الأصناف (${formatNumber(audit.items.length)} صنف)`
              : `Reconciliation Breakdown (${audit.items.length} items)`}
          </h2>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className={`w-full min-w-[650px] ${isRtl ? "text-right" : "text-left"} text-xs`}>
            <thead className="border-b border-[#942E3A]/10 text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
              <tr>
                <th className="pb-3">{isRtl ? "اسم المنتج" : "Product Name"}</th>
                <th className="pb-3">{isRtl ? "كود SKU" : "SKU"}</th>
                <th className="pb-3">{isRtl ? "الموديل / المقاس" : "Variant"}</th>
                <th className="pb-3 text-center">{isRtl ? "المتوقع" : "Expected"}</th>
                <th className="pb-3 text-center">{isRtl ? "الفعلي" : "Actual"}</th>
                <th className="pb-3 text-center">{isRtl ? "الفرق" : "Discrepancy"}</th>
                <th className={`pb-3 ${isRtl ? "text-left" : "text-right"}`}>{isRtl ? "أثر القيمة" : "Value Impact"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#942E3A]/8">
              {audit.items.map((item) => {
                const diff = item.discrepancy;
                const isMatch = diff === 0;
                const isShortage = diff < 0;
                const impact = diff * item.unitPrice;

                return (
                  <tr key={item.id} className="hover:bg-[#FFF9EB]/50 transition">
                    <td className="py-3 font-bold text-[#942E3A]">
                      {item.productName}
                    </td>
                    <td className="py-3 font-mono text-[10px] text-[#6B1F2A]/60">
                      {item.sku || (isRtl ? "بدون كود" : "N/A")}
                    </td>
                    <td className="py-3 text-[#6B1F2A]">
                      {item.color ? `${item.color} · ` : ""}
                      <span className="font-bold">{item.size}</span>
                    </td>
                    <td className="py-3 text-center font-semibold text-[#6B1F2A]">
                      {formatNumber(item.expectedStock)}
                    </td>
                    <td className="py-3 text-center font-bold text-[#942E3A]">
                      {formatNumber(item.actualStock)}
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          isMatch
                            ? "bg-emerald-100 text-emerald-800"
                            : isShortage
                            ? "bg-rose-100 text-rose-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {isMatch
                          ? (isRtl ? "0 (مطابق)" : "0 (Match)")
                          : isShortage
                          ? `${formatNumber(diff)} (${isRtl ? "عجز" : "Shortage"})`
                          : `+${formatNumber(diff)} (${isRtl ? "زيادة" : "Surplus"})`}
                      </span>
                    </td>
                    <td
                      className={`py-3 ${isRtl ? "text-left" : "text-right"} font-bold ${
                        isMatch
                          ? "text-[#6B1F2A]/60"
                          : isShortage
                          ? "text-rose-700"
                          : "text-blue-700"
                      }`}
                    >
                      {formatPrice(impact)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
