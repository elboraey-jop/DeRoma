"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  ClipboardList,
  DollarSign,
  ShoppingBag,
} from "lucide-react";
import { useAdminI18n } from "@/providers/AdminI18nContext";
import AdminStatusSelect from "@/components/AdminStatusSelect";

interface DashboardData {
  products: number;
  orders: number;
  pendingOrders: number;
  lowStock: number;
  outOfStock: number;
  revenue: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    totalPrice: number;
    status: string;
    paymentMethod: string;
    createdAt: Date | string;
  }>;
}

export default function AdminDashboardClient({
  data,
  adminName,
  cairoHour,
}: {
  data: DashboardData;
  adminName: string;
  cairoHour: number;
}) {
  const { lang, t, formatPrice, formatNumber } = useAdminI18n();
  const isRtl = lang === "ar";

  const greeting =
    cairoHour < 12
      ? t("dashboard.greetingMorning")
      : cairoHour < 18
      ? t("dashboard.greetingAfternoon")
      : t("dashboard.greetingEvening");

  const todayDateLabel = new Date().toLocaleDateString(isRtl ? "ar-EG" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const stats = [
    {
      label: t("dashboard.totalRevenue"),
      value: formatPrice(data.revenue),
      note: isRtl ? "جميع الطلبات غير الملغاة" : "All non-cancelled orders",
      icon: DollarSign,
      tone: "bg-[#942E3A] text-[#FFF9EB]",
      href: "/admin/analytics",
    },
    {
      label: t("dashboard.totalOrders"),
      value: formatNumber(data.orders),
      note: isRtl
        ? `${formatNumber(data.pendingOrders)} طلب بحاجة لمتابعة`
        : `${formatNumber(data.pendingOrders)} need attention`,
      icon: ClipboardList,
      tone: "bg-white text-[#942E3A]",
      href: "/admin/orders",
    },
    {
      label: t("dashboard.activeProducts"),
      value: formatNumber(data.products),
      note: isRtl ? "معروضة للعملاء في المتجر" : "Published in storefront",
      icon: ShoppingBag,
      tone: "bg-white text-[#942E3A]",
      href: "/admin/products",
    },
    {
      label: t("dashboard.lowStockAlert"),
      value: formatNumber(data.lowStock + data.outOfStock),
      note: isRtl
        ? `${formatNumber(data.outOfStock)} منتج نفد بالكامل`
        : `${formatNumber(data.outOfStock)} out of stock`,
      icon: AlertTriangle,
      tone: "bg-[#fff7df] text-[#942E3A]",
      href: "/admin/inventory?filter=low",
    },
  ];

  return (
    <div className="w-full min-w-0 space-y-4 sm:space-y-6">
      {/* Welcome Banner */}
      <section className="flex min-w-0 flex-col justify-between gap-3 rounded-3xl bg-[#942E3A] p-4 text-[#FFF9EB] shadow-lg sm:flex-row sm:items-end sm:gap-4 sm:p-7">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#D8B46A]">
            {todayDateLabel} · {isRtl ? "نظرة عامة على المتجر" : "Store overview"}
          </p>
          <h1 className="mt-2 font-playfair text-2xl font-black sm:text-4xl">
            {greeting}، {adminName}.
          </h1>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-white/75 sm:text-sm">
            {t("dashboard.subtitle")}
          </p>
        </div>
      </section>

      {/* KPI Stats Grid */}
      <section className="grid min-w-0 grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`min-w-0 rounded-2xl border border-[#942E3A]/10 p-3 shadow-xs transition-transform hover:-translate-y-0.5 sm:p-4 ${stat.tone}`}
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
          </Link>
        ))}
      </section>

      {/* Recent Orders & Quick Actions Section */}
      <section className="grid min-w-0 gap-4 xl:grid-cols-[1.35fr_0.65fr] xl:gap-6">
        {/* Recent Orders Card */}
        <div className="min-w-0 rounded-3xl border border-[#942E3A]/10 bg-white p-4 shadow-xs sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
                {isRtl ? "متابعة فورية" : "Live activity"}
              </p>
              <h2 className="mt-1 font-playfair text-xl font-bold">
                {t("dashboard.recentOrders")}
              </h2>
            </div>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#942E3A] hover:underline"
            >
              <span>{t("dashboard.viewAllOrders")}</span>
              <ArrowUpRight className={`h-3.5 w-3.5 ${isRtl ? "rotate-270" : ""}`} />
            </Link>
          </div>

          <div className="mt-4 min-w-0 sm:mt-5">
            {/* Desktop Table */}
            <table className="hidden w-full table-fixed text-xs sm:table">
              <thead className="border-b border-[#942E3A]/10 text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
                <tr>
                  <th className={`w-[24%] pb-3 font-bold ${isRtl ? "text-right" : "text-left"}`}>
                    {t("dashboard.orderNumber")}
                  </th>
                  <th className={`w-[27%] pb-3 font-bold ${isRtl ? "text-right" : "text-left"}`}>
                    {t("dashboard.customer")}
                  </th>
                  <th className={`w-[16%] pb-3 font-bold ${isRtl ? "text-right" : "text-left"}`}>
                    {t("common.date")}
                  </th>
                  <th className={`w-[18%] pb-3 font-bold ${isRtl ? "text-right" : "text-left"}`}>
                    {t("common.status")}
                  </th>
                  <th className={`w-[15%] pb-3 font-bold ${isRtl ? "text-left" : "text-right"}`}>
                    {t("dashboard.amount")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#942E3A]/8">
                {data.recentOrders.length ? (
                  data.recentOrders.map((order) => (
                    <tr key={order.orderNumber}>
                      <td className="truncate py-3 font-bold text-[#942E3A]">
                        <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="truncate py-3 text-[#6B1F2A]">
                        <Link
                          href={`/admin/customers/${encodeURIComponent(order.customerPhone)}`}
                          className="hover:underline"
                        >
                          {order.customerName}
                        </Link>
                      </td>
                      <td className="truncate py-3 text-[#6B1F2A]/65">
                        {new Date(order.createdAt).toLocaleDateString(isRtl ? "ar-EG" : "en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-3">
                        <AdminStatusSelect
                          orderId={order.id}
                          status={order.status}
                          paymentMethod={order.paymentMethod}
                        />
                      </td>
                      <td
                        className={`truncate py-3 font-bold text-[#942E3A] ${
                          isRtl ? "text-left" : "text-right"
                        }`}
                      >
                        {formatPrice(order.totalPrice)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-xs text-[#6B1F2A]/60">
                      {t("common.noResults")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="space-y-2 sm:hidden">
              {data.recentOrders.length ? (
                data.recentOrders.map((order) => (
                  <div
                    key={order.orderNumber}
                    className="rounded-2xl border border-[#942E3A]/10 bg-[#FFF9EB]/45 p-3"
                  >
                    <div className="flex min-w-0 items-center justify-between gap-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="min-w-0 truncate text-[11px] font-bold text-[#942E3A] hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                      <span className="shrink-0 text-[10px] text-[#6B1F2A]/55">
                        {new Date(order.createdAt).toLocaleDateString(isRtl ? "ar-EG" : "en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="mt-3 flex min-w-0 items-center justify-between gap-3">
                      <Link
                        href={`/admin/customers/${encodeURIComponent(order.customerPhone)}`}
                        className="min-w-0 truncate text-[11px] font-semibold text-[#6B1F2A] hover:underline"
                      >
                        {order.customerName}
                      </Link>
                      <span className="shrink-0 text-[11px] font-bold text-[#942E3A]">
                        {formatPrice(order.totalPrice)}
                      </span>
                    </div>
                    <div className="mt-3 border-t border-[#942E3A]/10 pt-3">
                      <AdminStatusSelect
                        orderId={order.id}
                        status={order.status}
                        paymentMethod={order.paymentMethod}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-10 text-center text-xs text-[#6B1F2A]/60">
                  {t("common.noResults")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions & Attention Box */}
        <div className="min-w-0 space-y-4 sm:space-y-6">
          <div className="min-w-0 rounded-3xl border border-[#942E3A]/10 bg-white p-4 shadow-xs sm:p-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#D8B46A]" />
              <h2 className="font-playfair text-xl font-bold">{t("dashboard.quickActions")}</h2>
            </div>
            <div className="mt-3 grid min-w-0 grid-cols-2 gap-2 sm:mt-4">
              <Link
                href="/admin/orders/new"
                className="min-w-0 truncate rounded-xl bg-[#942E3A] px-2 py-2.5 text-center text-[10px] font-bold text-[#FFF9EB] sm:px-3 sm:py-3 hover:bg-[#6B1F2A] transition-colors"
              >
                {t("orders.createManualOrder")}
              </Link>
              <Link
                href="/admin/suppliers/invoices/new"
                className="min-w-0 truncate rounded-xl border border-[#942E3A]/15 px-2 py-2.5 text-center text-[10px] font-bold text-[#942E3A] sm:px-3 sm:py-3 hover:bg-[#FFF9EB] transition-colors"
              >
                {t("dailyLog.newInvoice")}
              </Link>
              <Link
                href="/admin/promotions"
                className="min-w-0 truncate rounded-xl border border-[#942E3A]/15 px-2 py-2.5 text-center text-[10px] font-bold text-[#942E3A] sm:px-3 sm:py-3 hover:bg-[#FFF9EB] transition-colors"
              >
                {t("promotions.addCoupon")}
              </Link>
              <Link
                href="/admin/analytics"
                className="min-w-0 truncate rounded-xl border border-[#942E3A]/15 px-2 py-2.5 text-center text-[10px] font-bold text-[#942E3A] sm:px-3 sm:py-3 hover:bg-[#FFF9EB] transition-colors"
              >
                {t("navigation.analytics")}
              </Link>
            </div>
          </div>

          <div className="min-w-0 rounded-3xl border border-[#D8B46A]/35 bg-[#fff7df] p-4 shadow-xs sm:p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[#942E3A]" />
              <h2 className="font-playfair text-xl font-bold">
                {isRtl ? "تحتاج متابعة واهتمام" : "Needs attention"}
              </h2>
            </div>
            <div className="mt-3 space-y-2 text-xs sm:mt-4">
              <Link
                href="/admin/orders?status=pending"
                className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2.5 font-semibold text-[#942E3A] hover:bg-white transition-colors"
              >
                <span>
                  {isRtl
                    ? `${formatNumber(data.pendingOrders)} طلبات قيد الانتظار`
                    : `${formatNumber(data.pendingOrders)} pending orders`}
                </span>
                <ArrowUpRight className={`h-3.5 w-3.5 ${isRtl ? "rotate-270" : ""}`} />
              </Link>
              <Link
                href="/admin/inventory?filter=low"
                className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2.5 font-semibold text-[#942E3A] hover:bg-white transition-colors"
              >
                <span>
                  {isRtl
                    ? `${formatNumber(data.lowStock)} منتجات قربت تخلص`
                    : `${formatNumber(data.lowStock)} low-stock variants`}
                </span>
                <ArrowUpRight className={`h-3.5 w-3.5 ${isRtl ? "rotate-270" : ""}`} />
              </Link>
              <Link
                href="/admin/inventory?filter=out"
                className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2.5 font-semibold text-[#942E3A] hover:bg-white transition-colors"
              >
                <span>
                  {isRtl
                    ? `${formatNumber(data.outOfStock)} منتجات نفدت بالكامل`
                    : `${formatNumber(data.outOfStock)} out of stock variants`}
                </span>
                <ArrowUpRight className={`h-3.5 w-3.5 ${isRtl ? "rotate-270" : ""}`} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
