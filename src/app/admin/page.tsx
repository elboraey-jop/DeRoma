import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  Package,
  Plus,
  ShoppingBag,
  Truck,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  try {
    const [products, orders, pendingOrders, variants, revenue, recentOrders] =
      await Promise.all([
        prisma.product.count({ where: { status: "active" } }),
        prisma.order.count(),
        prisma.order.count({ where: { status: "pending" } }),
        prisma.productVariant.findMany({
          select: { stock: true, product: { select: { lowStockLimit: true } } },
        }),
        prisma.order.aggregate({
          where: { status: { not: "cancelled" } },
          _sum: { totalPrice: true },
        }),
        prisma.order.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            orderNumber: true,
            customerName: true,
            totalPrice: true,
            status: true,
            createdAt: true,
          },
        }),
      ]);

    const lowStock = variants.filter(
      (variant) =>
        variant.stock > 0 && variant.stock <= variant.product.lowStockLimit,
    ).length;
    const outOfStock = variants.filter((variant) => variant.stock === 0).length;
    return {
      products,
      orders,
      pendingOrders,
      lowStock,
      outOfStock,
      revenue: Number(revenue._sum.totalPrice || 0),
      recentOrders,
    };
  } catch {
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

const statusLabels: Record<string, string> = {
  pending: "Pending",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const data = await getDashboardData();
  const now = new Date();
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "Africa/Cairo",
  }).format(now);
  const cairoHour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      hourCycle: "h23",
      timeZone: "Africa/Cairo",
    }).format(now),
  );
  const greeting =
    cairoHour < 12
      ? "Good morning"
      : cairoHour < 18
        ? "Good afternoon"
        : "Good evening";
  const stats = [
    {
      label: "Total revenue",
      value: formatCurrency(data.revenue),
      note: "All non-cancelled orders",
      icon: DollarSign,
      tone: "bg-[#942E3A] text-[#FFF9EB]",
    },
    {
      label: "Orders",
      value: data.orders.toString(),
      note: `${data.pendingOrders} need attention`,
      icon: ClipboardList,
      tone: "bg-white text-[#942E3A]",
    },
    {
      label: "Active products",
      value: data.products.toString(),
      note: "Published in storefront",
      icon: ShoppingBag,
      tone: "bg-white text-[#942E3A]",
    },
    {
      label: "Stock alerts",
      value: (data.lowStock + data.outOfStock).toString(),
      note: `${data.outOfStock} out of stock`,
      icon: AlertTriangle,
      tone: "bg-[#fff7df] text-[#942E3A]",
    },
  ];

  return (
    <div className="w-full min-w-0 space-y-4 sm:space-y-6">
      <section className="flex min-w-0 flex-col justify-between gap-3 rounded-3xl bg-[#942E3A] p-4 text-[#FFF9EB] shadow-lg sm:flex-row sm:items-end sm:gap-4 sm:p-7">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#D8B46A]">
            {dateLabel} · Store overview
          </p>
          <h1 className="mt-2 font-playfair text-2xl font-black sm:text-4xl">
            {greeting}, {admin.name?.split(" ")[0] || "Admin"}.
          </h1>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-white/75 sm:text-sm">
            Here&apos;s what&apos;s happening across DeRoma today. Keep the
            boutique moving beautifully.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex w-fit items-center gap-2 rounded-full bg-[#D8B46A] px-4 py-2.5 text-xs font-bold text-[#942E3A] transition-colors hover:bg-[#e6c982]"
        >
          <Plus className="h-4 w-4" /> Add product
        </Link>
      </section>

      <section className="grid min-w-0 grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`min-w-0 rounded-2xl border border-[#942E3A]/10 p-3 shadow-sm sm:p-4 ${stat.tone}`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-wide opacity-70">
                {stat.label}
              </p>
              <stat.icon className="h-4 w-4 text-[#D8B46A]" />
            </div>
            <p className="mt-2 break-words font-playfair text-xl font-black sm:mt-3 sm:text-2xl">
              {stat.value}
            </p>
            <p className="mt-1 text-[10px] opacity-60">{stat.note}</p>
          </div>
        ))}
      </section>

      <section className="grid min-w-0 gap-4 xl:grid-cols-[1.35fr_0.65fr] xl:gap-6">
        <div className="min-w-0 rounded-3xl border border-[#942E3A]/10 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
                Live activity
              </p>
              <h2 className="mt-1 font-playfair text-xl font-bold">
                Recent orders
              </h2>
            </div>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#942E3A]"
            >
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4 min-w-0 overflow-hidden sm:mt-5">
            <table className="w-full table-fixed text-left text-xs">
              <thead className="border-b border-[#942E3A]/10 text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
                <tr>
                  <th className="w-[24%] pb-3 font-bold">Order</th>
                  <th className="w-[27%] pb-3 font-bold">Customer</th>
                  <th className="w-[16%] pb-3 font-bold">Date</th>
                  <th className="w-[18%] pb-3 font-bold">Status</th>
                  <th className="w-[15%] pb-3 text-right font-bold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#942E3A]/8">
                {data.recentOrders.length ? (
                  data.recentOrders.map((order) => (
                    <tr key={order.orderNumber}>
                      <td className="truncate py-3 font-bold text-[#942E3A]">
                        {order.orderNumber}
                      </td>
                      <td className="truncate py-3 text-[#6B1F2A]">
                        {order.customerName}
                      </td>
                      <td className="truncate py-3 text-[#6B1F2A]/65">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-3">
                        <span className="inline-block max-w-full truncate rounded-full bg-[#FFF9EB] px-2 py-1 text-[10px] font-bold text-[#942E3A]">
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                      <td className="truncate py-3 text-right font-bold text-[#942E3A]">
                        {formatCurrency(Number(order.totalPrice))}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-center text-xs text-[#6B1F2A]/60"
                    >
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="min-w-0 space-y-4 sm:space-y-6">
          <div className="min-w-0 rounded-3xl border border-[#942E3A]/10 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#D8B46A]" />
              <h2 className="font-playfair text-xl font-bold">Quick actions</h2>
            </div>
            <div className="mt-3 grid min-w-0 grid-cols-2 gap-2 sm:mt-4">
              <Link
                href="/admin/orders/new"
                className="min-w-0 truncate rounded-xl bg-[#942E3A] px-2 py-2.5 text-center text-[10px] font-bold text-[#FFF9EB] sm:px-3 sm:py-3"
              >
                Manual order
              </Link>
              <Link
                href="/admin/inventory"
                className="min-w-0 truncate rounded-xl border border-[#942E3A]/15 px-2 py-2.5 text-center text-[10px] font-bold text-[#942E3A] sm:px-3 sm:py-3"
              >
                Check inventory
              </Link>
              <Link
                href="/admin/promotions"
                className="min-w-0 truncate rounded-xl border border-[#942E3A]/15 px-2 py-2.5 text-center text-[10px] font-bold text-[#942E3A] sm:px-3 sm:py-3"
              >
                Create offer
              </Link>
              <Link
                href="/admin/analytics"
                className="min-w-0 truncate rounded-xl border border-[#942E3A]/15 px-2 py-2.5 text-center text-[10px] font-bold text-[#942E3A] sm:px-3 sm:py-3"
              >
                View analytics
              </Link>
            </div>
          </div>
          <div className="min-w-0 rounded-3xl border border-[#D8B46A]/35 bg-[#fff7df] p-4 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[#942E3A]" />
              <h2 className="font-playfair text-xl font-bold">
                Needs attention
              </h2>
            </div>
            <div className="mt-3 space-y-2 text-xs sm:mt-4">
              <Link
                href="/admin/orders?status=pending"
                className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2.5 font-semibold text-[#942E3A]"
              >
                <span>{data.pendingOrders} pending orders</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/admin/inventory?filter=low"
                className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2.5 font-semibold text-[#942E3A]"
              >
                <span>{data.lowStock} low-stock variants</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/admin/inventory?filter=out"
                className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2.5 font-semibold text-[#942E3A]"
              >
                <span>{data.outOfStock} out of stock variants</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
