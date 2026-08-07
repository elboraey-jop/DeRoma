import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { ClipboardCheck, PackageCheck, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { notFound } from "next/navigation";
import AdminBackButton from "@/components/AdminBackButton";

export const dynamic = "force-dynamic";

export default async function AuditDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  let audit: any = null;

  try {
    audit = await prisma.stockAudit.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });
  } catch (error) {
    console.warn("Unable to fetch audit details from Prisma:", error);
  }

  if (!audit) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-[#942E3A]/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <AdminBackButton fallbackHref="/admin/inventory/audits" ariaLabel="Back to Stock Audits Log" />
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#942E3A] text-[#FFF9EB] shadow-md">
              <ClipboardCheck className="h-5 w-5 text-[#D8B46A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-playfair text-2xl sm:text-3xl font-black text-[#942E3A]">
                  {audit.title || `Audit ${audit.auditNumber}`}
                </h1>
                <span className="rounded-full bg-[#FFF9EB] border border-[#D8B46A]/40 px-3 py-1 font-mono text-xs font-bold text-[#942E3A]">
                  {audit.auditNumber}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#6B1F2A]/65 font-medium">
                Conducted by <span className="font-bold text-[#942E3A]">{audit.auditedBy || "Admin"}</span> on{" "}
                {new Date(audit.createdAt).toLocaleDateString("en-US", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/55">
            System Expected
          </span>
          <span className="mt-1 block font-playfair text-2xl font-black text-[#942E3A]">
            {audit.totalExpected} units
          </span>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-800">
            Physical Counted
          </span>
          <span className="mt-1 block font-playfair text-2xl font-black text-emerald-900">
            {audit.totalActual} units
          </span>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-800">
            Discrepancies Count
          </span>
          <span className="mt-1 block font-playfair text-2xl font-black text-amber-900">
            {audit.totalDiscrepancy} units
          </span>
        </div>

        <div className="rounded-2xl border border-[#D8B46A]/40 bg-[#fff7df] p-4 shadow-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/55">
            Net Value Impact
          </span>
          <span className="mt-1 block font-playfair text-xl font-black text-[#942E3A]">
            {formatCurrency(Number(audit.discrepancyValue || 0))}
          </span>
        </div>
      </div>

      {/* Audit Notes */}
      {audit.notes && (
        <div className="rounded-2xl border border-[#D8B46A]/30 bg-[#FFF9EB] p-4 text-xs">
          <span className="font-bold text-[#942E3A] uppercase text-[10px]">Session Notes:</span>
          <p className="mt-1 text-[#6B1F2A]">{audit.notes}</p>
        </div>
      )}

      {/* Audit Detailed Items Table */}
      <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-center gap-2 border-b border-[#942E3A]/10 pb-4">
          <PackageCheck className="h-5 w-5 text-[#D8B46A]" />
          <h2 className="font-playfair text-xl font-bold text-[#942E3A]">
            Reconciliation Breakdown ({audit.items.length} items)
          </h2>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-xs">
            <thead className="border-b border-[#942E3A]/10 text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
              <tr>
                <th className="pb-3">Product Name</th>
                <th className="pb-3">SKU</th>
                <th className="pb-3">Variant</th>
                <th className="pb-3 text-center">Expected</th>
                <th className="pb-3 text-center">Actual</th>
                <th className="pb-3 text-center">Discrepancy</th>
                <th className="pb-3 text-right">Value Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#942E3A]/8">
              {audit.items.map((item: any) => {
                const diff = item.discrepancy;
                const isMatch = diff === 0;
                const isShortage = diff < 0;
                const isSurplus = diff > 0;
                const impact = diff * Number(item.unitPrice || 0);

                return (
                  <tr key={item.id} className="hover:bg-[#FFF9EB]/50 transition">
                    <td className="py-3 font-bold text-[#942E3A]">
                      {item.productName}
                    </td>
                    <td className="py-3 font-mono text-[10px] text-[#6B1F2A]/60">
                      {item.sku || "N/A"}
                    </td>
                    <td className="py-3 text-[#6B1F2A]">
                      {item.color ? `${item.color} · ` : ""}
                      <span className="font-bold">{item.size}</span>
                    </td>
                    <td className="py-3 text-center font-semibold text-[#6B1F2A]">
                      {item.expectedStock}
                    </td>
                    <td className="py-3 text-center font-bold text-[#942E3A]">
                      {item.actualStock}
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
                        {isMatch ? "0 (Match)" : isShortage ? `${diff} (Shortage)` : `+${diff} (Surplus)`}
                      </span>
                    </td>
                    <td
                      className={`py-3 text-right font-bold ${
                        isMatch
                          ? "text-[#6B1F2A]/60"
                          : isShortage
                          ? "text-rose-700"
                          : "text-blue-700"
                      }`}
                    >
                      {formatCurrency(impact)}
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
