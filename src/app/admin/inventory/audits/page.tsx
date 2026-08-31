import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import AdminStockAuditsView from "@/components/AdminStockAuditsView";

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

  return (
    <AdminStockAuditsView
      audits={audits.map((audit) => ({
        id: audit.id,
        auditNumber: audit.auditNumber,
        title: audit.title,
        status: audit.status,
        notes: audit.notes,
        totalExpected: audit.totalExpected,
        totalActual: audit.totalActual,
        totalDiscrepancy: audit.totalDiscrepancy,
        discrepancyValue: Number(audit.discrepancyValue || 0),
        auditedBy: audit.auditedBy,
        createdAt: audit.createdAt.toISOString(),
      }))}
    />
  );
}
