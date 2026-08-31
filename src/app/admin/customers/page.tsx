import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import AdminCustomersView from "@/components/AdminCustomersView";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  await requireAdmin();
  try {
    const [profiles, orders] = await Promise.all([
      prisma.customer.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.order.findMany({ where: { status: { not: "cancelled" } }, orderBy: { createdAt: "desc" } }),
    ]);
    const map = new Map(profiles.map((customer) => [customer.phone, { ...customer, orders: 0, spent: 0, lastOrder: null as Date | null }]));
    for (const order of orders) {
      const orderSales = Number(order.totalPrice);
      const current = map.get(order.customerPhone);
      if (current) {
        current.orders += 1;
        current.spent += orderSales;
        current.lastOrder ??= order.createdAt;
      } else {
        map.set(order.customerPhone, {
          id: "",
          firstName: order.customerFirstName || order.customerName.split(" ")[0] || "",
          lastName: order.customerLastName || order.customerName.split(" ").slice(1).join(" ") || "",
          name: order.customerName,
          email: null,
          phone: order.customerPhone,
          phone2: null,
          governorate: order.governorate,
          city: order.city,
          address: order.address,
          notes: null,
          createdAt: order.createdAt,
          updatedAt: order.createdAt,
          orders: 1,
          spent: orderSales,
          lastOrder: order.createdAt,
        });
      }
    }
    const customers = [...map.values()];

    return (
      <AdminCustomersView
        customers={customers.map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          orders: c.orders,
          spent: c.spent,
          lastOrder: c.lastOrder ? c.lastOrder.toISOString() : null,
        }))}
      />
    );
  } catch (error) {
    console.error("Unable to load customers page data:", error);
    return <div className="p-8 text-center text-xs text-red-600">Failed to load customers data.</div>;
  }
}
