import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import AdminOrdersClient, { type AdminOrderRow } from "@/components/AdminOrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdmin();
  let orders: AdminOrderRow[] = [];
  try {
    const rows = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });
    orders = rows.map((order) => ({ id: order.id, orderNumber: order.orderNumber, customerName: order.customerName, customerPhone: order.customerPhone, governorate: order.governorate, city: order.city, totalPrice: Number(order.totalPrice), status: order.status, paymentMethod: order.paymentMethod, createdAt: order.createdAt.toISOString() }));
  } catch (error) {
    console.error("Unable to load admin orders:", error);
  }
  return <AdminOrdersClient orders={orders} />;
}
