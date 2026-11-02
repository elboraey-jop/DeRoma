import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/adminAuth";
import AdminBackButton from "@/components/AdminBackButton";
import AdminManualOrderForm, { type EditableOrderData } from "@/components/AdminManualOrderForm";
import AdminPageTranslationBoundary from "@/components/AdminPageTranslationBoundary";

export const dynamic = "force-dynamic";

export default async function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  const productIds = order.items.map((item) => item.productId);
  const variantIds = order.items.map((item) => item.variantId);
  const [products, customers, shippingZones, shippingSettings, customer] = await Promise.all([
    prisma.product.findMany({
      where: {
        OR: [{ status: "active" }, { id: { in: productIds } }],
        variants: { some: { OR: [{ stock: { gt: 0 } }, { id: { in: variantIds } }] } },
      },
      select: {
        id: true,
        name: true,
        category: true,
        images: true,
        color: true,
        price: true,
        variants: {
          where: { OR: [{ stock: { gt: 0 } }, { id: { in: variantIds } }] },
          select: { id: true, size: true, stock: true },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.customer.findMany({
      select: { id: true, name: true, phone: true, phone2: true, email: true, governorate: true, city: true, address: true },
      orderBy: { updatedAt: "desc" },
      take: 250,
    }),
    prisma.shippingZone.findMany({ where: { active: true }, include: { exceptions: true } }),
    prisma.shippingSettings.findUnique({ where: { id: "default" } }),
    prisma.customer.findUnique({ where: { phone: order.customerPhone }, select: { email: true } }),
  ]);

  const sourceMatch = order.notes?.match(/^Source:\s*([^\n]+)\n?/i);
  const source = ["whatsapp", "inreel", "instagram", "website"].includes(sourceMatch?.[1]?.trim().toLowerCase() || "")
    ? sourceMatch![1].trim().toLowerCase()
    : "whatsapp";
  const cleanNotes = order.notes?.replace(/^Source:\s*[^\n]+\n?/i, "") || "";
  const initialOrder: EditableOrderData = {
    id: order.id,
    status: order.status,
    customerFirstName: order.customerFirstName,
    customerLastName: order.customerLastName,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerPhone2: order.customerPhone2,
    customerEmail: customer?.email || null,
    governorate: order.governorate,
    city: order.city,
    address: order.address,
    notes: cleanNotes,
    subtotalPrice: Number(order.subtotalPrice),
    discountAmount: Number(order.discountAmount),
    shippingCost: Number(order.shippingCost),
    paymentMethod: order.paymentMethod,
    paymentSenderPhone: order.paymentSenderPhone,
    source,
    items: order.items.map((item) => ({ variantId: item.variantId, quantity: item.quantity, price: Number(item.price) })),
  };

  return (
    <AdminPageTranslationBoundary>
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex items-center gap-3">
          <AdminBackButton fallbackHref={`/admin/orders/${order.id}`} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">Operations</p>
            <h1 className="mt-1 font-playfair text-3xl font-black">Edit order {order.orderNumber}</h1>
          </div>
        </div>
        <AdminManualOrderForm
          initialOrder={initialOrder}
          products={products.map((product) => ({ ...product, price: Number(product.price) }))}
          customers={customers}
          shippingZones={shippingZones.map((zone) => ({
            id: zone.id,
            name: zone.name,
            governorates: zone.governorates,
            fee: Number(zone.fee),
            estimatedDays: zone.estimatedDays,
            freeShippingThreshold: zone.freeShippingThreshold ? Number(zone.freeShippingThreshold) : null,
            exceptions: zone.exceptions.map((exception) => ({ city: exception.city, fee: Number(exception.fee) })),
          }))}
          shippingSettings={shippingSettings ? {
            freeShippingEnabled: shippingSettings.freeShippingEnabled,
            freeShippingThreshold: shippingSettings.freeShippingThreshold ? Number(shippingSettings.freeShippingThreshold) : null,
          } : null}
        />
      </div>
    </AdminPageTranslationBoundary>
  );
}
