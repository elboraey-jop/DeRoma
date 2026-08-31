import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import AdminCustomerDetailsView from "@/components/AdminCustomerDetailsView";

export const dynamic = "force-dynamic";

export default async function CustomerDetailsPage({
  params,
}: {
  params: Promise<{ phone: string }>;
}) {
  await requireAdmin();
  const { phone: encodedPhone } = await params;
  const phone = decodeURIComponent(encodedPhone);

  const [profile, orders] = await Promise.all([
    prisma.customer.findUnique({ where: { phone } }),
    prisma.order.findMany({
      where: { customerPhone: phone },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!profile && !orders.length) notFound();
  const source = profile || orders[0];
  if (!source) notFound();

  const activeOrders = orders.filter((order) => order.status !== "cancelled");
  const lifetimeValue = activeOrders.reduce(
    (sum, order) => sum + Number(order.totalPrice),
    0,
  );
  const itemCount = activeOrders.reduce(
    (sum, order) =>
      sum + order.items.reduce((items, item) => items + item.quantity, 0),
    0,
  );

  const customer = {
    id: profile?.id,
    name:
      profile?.name ||
      ("customerName" in source ? source.customerName : "Customer"),
    email: profile?.email,
    phone: profile?.phone || phone,
    phone2: profile?.phone2,
    governorate:
      profile?.governorate ||
      ("governorate" in source ? source.governorate : ""),
    city: profile?.city || ("city" in source ? source.city : ""),
    address: profile?.address || ("address" in source ? source.address : ""),
    notes: profile?.notes,
  };

  return (
    <AdminCustomerDetailsView
      customer={customer}
      orders={orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt.toISOString(),
        status: order.status,
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: Number(order.totalPrice || 0),
      }))}
      activeOrdersCount={activeOrders.length}
      lifetimeValue={lifetimeValue}
      itemCount={itemCount}
    />
  );
}
