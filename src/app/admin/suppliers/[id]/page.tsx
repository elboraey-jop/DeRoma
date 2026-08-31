import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import AdminSupplierDetailsView from "@/components/AdminSupplierDetailsView";

export const dynamic = "force-dynamic";

export default async function SupplierDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      products: { include: { variants: { select: { stock: true } } }, orderBy: { name: "asc" } },
      invoices: { include: { items: true }, orderBy: { invoiceDate: "desc" } },
    },
  });
  if (!supplier) notFound();
  const totalPurchases = supplier.invoices.reduce((sum, invoice) => sum + Number(invoice.total), 0);
  const totalUnits = supplier.invoices.reduce((sum, invoice) => sum + invoice.items.reduce((items, item) => items + item.quantity, 0), 0);

  return (
    <AdminSupplierDetailsView
      supplier={{
        id: supplier.id,
        name: supplier.name,
        phone: supplier.phone,
        email: supplier.email,
        address: supplier.address,
        notes: supplier.notes,
        products: supplier.products.map((p) => ({
          id: p.id,
          name: p.name,
          stock: p.variants.reduce((sum, v) => sum + v.stock, 0),
        })),
        invoices: supplier.invoices.map((inv) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          invoiceDate: inv.invoiceDate.toISOString(),
          itemCount: inv.items.length,
          total: Number(inv.total),
        })),
      }}
      totalPurchases={totalPurchases}
      totalUnits={totalUnits}
    />
  );
}
