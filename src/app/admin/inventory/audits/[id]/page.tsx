import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { notFound } from "next/navigation";
import AdminAuditDetailsView from "@/components/AdminAuditDetailsView";

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
    <AdminAuditDetailsView
      audit={{
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
        items: audit.items.map((item: any) => ({
          id: item.id,
          productName: item.productName,
          sku: item.sku,
          size: item.size,
          color: item.color,
          expectedStock: item.expectedStock,
          actualStock: item.actualStock,
          discrepancy: item.discrepancy,
          unitPrice: Number(item.unitPrice || 0),
        })),
      }}
    />
  );
}
