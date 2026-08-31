import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import AdminPurchaseInvoiceDetailsView from "@/components/AdminPurchaseInvoiceDetailsView";

export const dynamic = "force-dynamic";

export default async function PurchaseInvoiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const invoice = await prisma.purchaseInvoice.findUnique({
    where: { id },
    include: { supplier: true, items: { include: { product: true, variant: true, lot: true } } },
  });
  if (!invoice) notFound();

  type InvoiceItem = (typeof invoice.items)[number];
  const groupedProducts = new Map<string, { product: InvoiceItem["product"]; items: InvoiceItem[] }>();
  for (const item of invoice.items) {
    const group = groupedProducts.get(item.productId);
    if (group) group.items.push(item);
    else groupedProducts.set(item.productId, { product: item.product, items: [item] });
  }
  const productGroups = Array.from(groupedProducts.values());

  return (
    <AdminPurchaseInvoiceDetailsView
      invoice={{
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate.toISOString(),
        total: Number(invoice.total),
        supplier: {
          id: invoice.supplier.id,
          name: invoice.supplier.name,
        },
        productGroups: productGroups.map(({ product, items }) => ({
          product: {
            id: product.id,
            name: product.name,
            color: product.color,
            sku: product.sku,
            image: product.images[0] || null,
          },
          items: items.map((item) => ({
            id: item.id,
            size: item.variant.size,
            quantity: item.quantity,
            remaining: item.lot?.remaining ?? item.quantity,
            wholesalePrice: Number(item.wholesalePrice),
            retailPrice: Number(item.retailPrice),
            lineTotal: Number(item.lineTotal),
          })),
        })),
      }}
    />
  );
}
