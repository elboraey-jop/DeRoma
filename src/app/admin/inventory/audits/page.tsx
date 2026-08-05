import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import Link from "next/link";
import {
  ArrowLeft,
  ClipboardList,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  Search,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StockAuditsPage() {
  await requireAdmin();

  let audits: Array<{
    id: string;
    auditNumber: string;
    title: string | null;
    status: string;
    notes: string | null;
    totalExpected: number;
    totalActual: number;
    totalDiscrepancy: number;
    discrepancyValue: unknown;
    auditedBy: string | null;
    createdAt: Date;
  }> = [];

  try {
    audits = await prisma.stockAudit.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.warn("Unable to fetch stock audits from Prisma:", error);
  }

  const totalAuditsCount = audits.length;
  const totalDiscrepancies = audits.reduce((sum, a) => sum + a.totalDiscrepancy, 0);
  const totalDiscrepancyVal = audits.reduce((sum, a) => sum + Number(a.discrepancyValue || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#942E3A]/10 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/inventory"
            className="rounded-xl border border-[#942E3A]/15 bg-white p-2.5 text-[#942E3A] transition hover:border-[#D8B46A] shadow-sm shrink-0"
            aria-label="Back to Inventory"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#942E3A] text-[#FFF9EB] shadow-md">
              <ClipboardList className="h-5 w-5 text-[#D8B46A]" />
            </div>
            <div>
              <h1 className="font-playfair text-2xl sm:text-3xl font-black text-[#942E3A]">
                Stock Audits Log
              </h1>
              <p className="text-xs text-[#6B1F2A]/65 font-medium">
                Review past inventory reconciliation logs and audit records.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/admin/inventory/audits/new"
          className="flex items-center gap-2 rounded-2xl bg-[#942E3A] px-5 py-3 text-xs font-bold text-[#FFF9EB] shadow-md transition hover:bg-[#802832] active:scale-95"
        >
          <Sparkles className="h-4 w-4 text-[#D8B46A]" />
          <span>New Stock Audit</span>
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/55">
            Total Audits Completed
          </p>
          <p className="mt-1 font-playfair text-3xl font-black text-[#942E3A]">
            {totalAuditsCount}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800/70">
            Discrepancies Count
          </p>
          <p className="mt-1 font-playfair text-3xl font-black text-amber-900">
            {totalDiscrepancies} units
          </p>
        </div>

        <div className="rounded-2xl border border-[#D8B46A]/40 bg-[#fff7df] p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/55">
            Net Discrepancy Value
          </p>
          <p className="mt-1 font-playfair text-2xl font-black text-[#942E3A]">
            {formatCurrency(totalDiscrepancyVal)}
          </p>
        </div>
      </div>

      {/* Audits History Table */}
      <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-center justify-between border-b border-[#942E3A]/10 pb-4">
          <div className="flex items-center gap-2">
            <PackageCheck className="h-5 w-5 text-[#D8B46A]" />
            <h2 className="font-playfair text-xl font-bold text-[#942E3A]">
              Audit Sessions History
            </h2>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-xs">
            <thead className="border-b border-[#942E3A]/10 text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
              <tr>
                <th className="pb-3">Audit #</th>
                <th className="pb-3">Title / Scope</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Audited By</th>
                <th className="pb-3 text-center">Expected / Actual</th>
                <th className="pb-3 text-center">Discrepancy</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#942E3A]/8">
              {audits.map((audit) => (
                <tr key={audit.id} className="group hover:bg-[#FFF9EB]/60 transition">
                  <td className="py-3.5 font-mono font-bold text-[#942E3A]">
                    {audit.auditNumber}
                  </td>
                  <td className="py-3.5 font-bold text-[#6B1F2A]">
                    {audit.title || "Full Stock Audit"}
                  </td>
                  <td className="py-3.5 text-[#6B1F2A]/70">
                    {audit.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-3.5 font-medium text-[#6B1F2A]">
                    {audit.auditedBy || "Admin"}
                  </td>
                  <td className="py-3.5 text-center font-semibold text-[#6B1F2A]">
                    {audit.totalExpected} / <span className="font-bold text-[#942E3A]">{audit.totalActual}</span>
                  </td>
                  <td className="py-3.5 text-center">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        audit.totalDiscrepancy === 0
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {audit.totalDiscrepancy === 0 ? "Perfect Match" : `${audit.totalDiscrepancy} diff`}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <Link
                      href={`/admin/inventory/audits/${audit.id}`}
                      className="inline-flex items-center gap-1 rounded-xl bg-[#FFF9EB] border border-[#D8B46A]/40 px-3 py-1.5 text-[11px] font-bold text-[#942E3A] hover:bg-[#942E3A] hover:text-[#FFF9EB] transition"
                    >
                      <span>View Details</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {audits.length === 0 && (
            <div className="py-14 text-center">
              <ClipboardList className="mx-auto mb-2 h-8 w-8 text-[#D8B46A]/60" />
              <p className="text-xs font-bold text-[#942E3A]">No stock audit sessions recorded yet.</p>
              <p className="mt-1 text-[11px] text-[#6B1F2A]/50">
                Click &quot;New Stock Audit&quot; above to run your first physical inventory count.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
