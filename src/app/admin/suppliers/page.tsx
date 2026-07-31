import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import AdminSuppliersWorkspace from "@/components/AdminSuppliersWorkspace";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  await requireAdmin();
  const [suppliers, invoices] = await Promise.all([
    prisma.supplier.findMany({ include: { _count: { select: { products: true, invoices: true } }, invoices: { select: { total: true } } }, orderBy: { name: "asc" } }),
    prisma.purchaseInvoice.findMany({ include: { supplier: { select: { name: true } }, items: { select: { id: true } } }, orderBy: { invoiceDate: "desc" } }),
  ]);

  return <AdminSuppliersWorkspace suppliers={suppliers.map((supplier) => ({ id: supplier.id, name: supplier.name, phone: supplier.phone, email: supplier.email, address: supplier.address, notes: supplier.notes, productCount: supplier._count.products, invoiceCount: supplier._count.invoices, invoiceTotal: supplier.invoices.reduce((sum, invoice) => sum + Number(invoice.total), 0) }))} invoices={invoices.map((invoice) => ({ id: invoice.id, invoiceNumber: invoice.invoiceNumber, supplierId: invoice.supplierId, supplierName: invoice.supplier.name, invoiceDate: invoice.invoiceDate.toISOString(), status: invoice.status, total: Number(invoice.total), itemCount: invoice.items.length }))} />;
}
