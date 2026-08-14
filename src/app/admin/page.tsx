import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import AdminDashboardClient from "@/components/AdminDashboardClient";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  try {
    const [products, orders, pendingOrders, variants, revenue, recentOrders] =
      await Promise.all([
        prisma.product.count({ where: { status: "active" } }),
        prisma.order.count(),
        prisma.order.count({ where: { status: { in: ["pending", "pending_payment"] } } }),
        prisma.productVariant.findMany({
          select: { stock: true, product: { select: { status: true, lowStockLimit: true } } },
        }),
        prisma.order.aggregate({
          where: { status: "delivered" },
          _sum: { subtotalPrice: true, discountAmount: true },
        }),
        prisma.order.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            orderNumber: true,
            customerName: true,
            customerPhone: true,
            totalPrice: true,
            subtotalPrice: true,
            discountAmount: true,
            shippingCost: true,
            status: true,
            paymentMethod: true,
            createdAt: true,
          },
        }),
      ]);

    const lowStock = variants.filter(
      (variant) =>
        variant.product?.status === "active" &&
        variant.stock > 0 &&
        variant.stock <= (variant.product.lowStockLimit ?? 2),
    ).length;
    const outOfStock = variants.filter(
      (variant) => variant.product?.status === "active" && variant.stock <= 0,
    ).length;

    return {
      products,
      orders,
      pendingOrders,
      lowStock,
      outOfStock,
      revenue: Math.max(
        0,
        Number(revenue._sum.subtotalPrice || 0) - Number(revenue._sum.discountAmount || 0),
      ),
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        totalPrice: Number(order.totalPrice),
        status: order.status,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Failed to load admin dashboard data:", error);
    return {
      products: 0,
      orders: 0,
      pendingOrders: 0,
      lowStock: 0,
      outOfStock: 0,
      revenue: 0,
      recentOrders: [],
    };
  }
}

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const data = await getDashboardData();
  const now = new Date();
  const cairoHour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      hourCycle: "h23",
      timeZone: "Africa/Cairo",
    }).format(now),
  );

  return (
    <AdminDashboardClient
      data={data}
      adminName={admin.name?.split(" ")[0] || "Admin"}
      cairoHour={cairoHour}
    />
  );
}
