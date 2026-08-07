import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import AdminBackButton from "@/components/AdminBackButton";
import AdminManualOrderForm from "@/components/AdminManualOrderForm";

export const dynamic = "force-dynamic";

export default async function NewManualOrderPage() {
  await requireAdmin();
  const products = await prisma.product.findMany({
    where: { status: "active", variants: { some: { stock: { gt: 0 } } } },
    select: {
      id: true,
      name: true,
      category: true,
      images: true,
      color: true,
      price: true,
      variants: {
        where: { stock: { gt: 0 } },
        select: { id: true, size: true, stock: true },
      },
    },
    orderBy: { name: "asc" },
  });
  const customers = await prisma.customer.findMany({
    select: {
      id: true,
      name: true,
      phone: true,
      phone2: true,
      email: true,
      governorate: true,
      city: true,
      address: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 250,
  });

  const [shippingZones, shippingSettings] = await Promise.all([
    prisma.shippingZone.findMany({
      where: { active: true },
      include: { exceptions: true },
    }),
    prisma.shippingSettings.findUnique({
      where: { id: "default" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex items-center gap-3">
        <AdminBackButton fallbackHref="/admin/orders" />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">
            Operations
          </p>
          <h1 className="mt-1 font-playfair text-3xl font-black">
            Manual order
          </h1>
        </div>
      </div>
      <AdminManualOrderForm
        products={products.map((product) => ({
          ...product,
          price: Number(product.price),
        }))}
        customers={customers}
        shippingZones={shippingZones.map((zone) => ({
          id: zone.id,
          name: zone.name,
          governorates: zone.governorates,
          fee: Number(zone.fee),
          estimatedDays: zone.estimatedDays,
          freeShippingThreshold: zone.freeShippingThreshold ? Number(zone.freeShippingThreshold) : null,
          exceptions: zone.exceptions.map((e) => ({ city: e.city, fee: Number(e.fee) })),
        }))}
        shippingSettings={shippingSettings ? {
          freeShippingEnabled: shippingSettings.freeShippingEnabled,
          freeShippingThreshold: shippingSettings.freeShippingThreshold ? Number(shippingSettings.freeShippingThreshold) : null,
        } : null}
      />
    </div>
  );
}
