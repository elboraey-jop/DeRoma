"use client";

import Link from "next/link";
import {
  ClipboardList,
  Sparkles,
  ArrowUpRight,
  PackageCheck,
} from "lucide-react";
import AdminBackButton from "@/components/AdminBackButton";
import { useAdminI18n } from "@/providers/AdminI18nContext";

export type AuditLogItem = {
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
};

export default function AdminStockAuditsView({
  audits,
}: {
  audits: AuditLogItem[];
}) {
  const { lang, formatPrice, formatNumber } = useAdminI18n();
  const isRtl = lang === "ar";

  const totalAuditsCount = audits.length;
  const totalDiscrepancies = audits.reduce((sum, a) => sum + a.totalDiscrepancy, 0);
  const totalDiscrepancyVal = audits.reduce((sum, a) => sum + Number(a.discrepancyValue || 0), 0);

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="space-y-6 text-start">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#942E3A]/10 pb-5">
        <div className="flex items-center gap-3">
          <AdminBackButton
            fallbackHref="/admin/inventory"
            ariaLabel={isRtl ? "الرجوع للمخزون" : "Back to Inventory"}
          />
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#942E3A] text-[#FFF9EB] shadow-md">
              <ClipboardList className="h-5 w-5 text-[#D8B46A]" />
            </div>
            <div>
              <h1 className="font-playfair text-2xl sm:text-3xl font-black text-[#942E3A]">
                {isRtl ? "سجل جلسات جرد المخزون" : "Stock Audits Log"}
              </h1>
              <p className="text-xs text-[#6B1F2A]/65 font-medium">
                {isRtl
                  ? "مراجعة سجلات مطابقة وجرد المخزون السابقة والتحقق من الفروقات."
                  : "Review past inventory reconciliation logs and audit records."}
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/admin/inventory/audits/new"
          className="flex items-center justify-center gap-2 rounded-2xl bg-[#942E3A] px-5 py-3 text-xs font-bold text-[#FFF9EB] shadow-md transition hover:bg-[#802832] active:scale-95 shrink-0"
        >
          <Sparkles className="h-4 w-4 text-[#D8B46A]" />
          <span>{isRtl ? "جرد مخزون جديد" : "New Stock Audit"}</span>
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/55">
            {isRtl ? "إجمالي جلسات الجرد" : "Total Audits Completed"}
          </p>
          <p className="mt-1 font-playfair text-3xl font-black text-[#942E3A]">
            {formatNumber(totalAuditsCount)}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800/70">
            {isRtl ? "عدد الفروقات" : "Discrepancies Count"}
          </p>
          <p className="mt-1 font-playfair text-3xl font-black text-amber-900">
            {formatNumber(totalDiscrepancies)} {isRtl ? "وحدة" : "units"}
          </p>
        </div>

        <div className="rounded-2xl border border-[#D8B46A]/40 bg-[#fff7df] p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/55">
            {isRtl ? "صافي قيمة الفروقات" : "Net Discrepancy Value"}
          </p>
          <p className="mt-1 font-playfair text-2xl font-black text-[#942E3A]">
            {formatPrice(totalDiscrepancyVal)}
          </p>
        </div>
      </div>

      {/* Audits History Table */}
      <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-center justify-between border-b border-[#942E3A]/10 pb-4">
          <div className="flex items-center gap-2">
            <PackageCheck className="h-5 w-5 text-[#D8B46A]" />
            <h2 className="font-playfair text-xl font-bold text-[#942E3A]">
              {isRtl ? "سجل جلسات الجرد السابقة" : "Audit Sessions History"}
            </h2>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className={`w-full min-w-[650px] ${isRtl ? "text-right" : "text-left"} text-xs`}>
            <thead className="border-b border-[#942E3A]/10 text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
              <tr>
                <th className="pb-3">{isRtl ? "رقم الجرد" : "Audit #"}</th>
                <th className="pb-3">{isRtl ? "العنوان / النطاق" : "Title / Scope"}</th>
                <th className="pb-3">{isRtl ? "التاريخ" : "Date"}</th>
                <th className="pb-3">{isRtl ? "تم الجرد بواسطة" : "Audited By"}</th>
                <th className="pb-3 text-center">{isRtl ? "المتوقع / الفعلي" : "Expected / Actual"}</th>
                <th className="pb-3 text-center">{isRtl ? "الفرق" : "Discrepancy"}</th>
                <th className={`pb-3 ${isRtl ? "text-left" : "text-right"}`}>{isRtl ? "الإجراء" : "Action"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#942E3A]/8">
              {audits.map((audit) => (
                <tr key={audit.id} className="group hover:bg-[#FFF9EB]/60 transition">
                  <td className="py-3.5 font-mono font-bold text-[#942E3A]">
                    {audit.auditNumber}
                  </td>
                  <td className="py-3.5 font-bold text-[#6B1F2A]">
                    {audit.title || (isRtl ? "جرد شامل للمخزون" : "Full Stock Audit")}
                  </td>
                  <td className="py-3.5 text-[#6B1F2A]/70">
                    <span dir="ltr">
                      {new Date(audit.createdAt).toLocaleDateString(
                        isRtl ? "ar-EG-u-nu-latn" : "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                  </td>
                  <td className="py-3.5 font-medium text-[#6B1F2A]">
                    {audit.auditedBy || (isRtl ? "المسؤول" : "Admin")}
                  </td>
                  <td className="py-3.5 text-center font-semibold text-[#6B1F2A]">
                    {formatNumber(audit.totalExpected)} /{" "}
                    <span className="font-bold text-[#942E3A]">{formatNumber(audit.totalActual)}</span>
                  </td>
                  <td className="py-3.5 text-center">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        audit.totalDiscrepancy === 0
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {audit.totalDiscrepancy === 0
                        ? (isRtl ? "مطابق تماماً" : "Perfect Match")
                        : `${formatNumber(audit.totalDiscrepancy)} ${isRtl ? "فرق" : "diff"}`}
                    </span>
                  </td>
                  <td className={`py-3.5 ${isRtl ? "text-left" : "text-right"}`}>
                    <Link
                      href={`/admin/inventory/audits/${audit.id}`}
                      className="inline-flex items-center gap-1 rounded-xl bg-[#FFF9EB] border border-[#D8B46A]/40 px-3 py-1.5 text-[11px] font-bold text-[#942E3A] hover:bg-[#942E3A] hover:text-[#FFF9EB] transition"
                    >
                      <span>{isRtl ? "عرض التفاصيل" : "View Details"}</span>
                      <ArrowUpRight className={`h-3 w-3 ${isRtl ? "rotate-180" : ""}`} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {audits.length === 0 && (
            <div className="py-14 text-center">
              <ClipboardList className="mx-auto mb-2 h-8 w-8 text-[#D8B46A]/60" />
              <p className="text-xs font-bold text-[#942E3A]">
                {isRtl ? "لم يتم تسجيل جلسات جرد بعد." : "No stock audit sessions recorded yet."}
              </p>
              <p className="mt-1 text-[11px] text-[#6B1F2A]/50">
                {isRtl
                  ? "انقر على \"جرد مخزون جديد\" بالأعلى لبدء الجرد الفعلي للمخزون."
                  : "Click \"New Stock Audit\" above to run your first physical inventory count."}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
