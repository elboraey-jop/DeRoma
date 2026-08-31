"use client";

import Link from "next/link";
import { CalendarDays, ArrowUpRight } from "lucide-react";
import AdminDailyLogDatePicker, { DatePreset } from "@/components/AdminDailyLogDatePicker";
import AdminStatusSelect from "@/components/AdminStatusSelect";
import { useAdminI18n } from "@/providers/AdminI18nContext";

export type DailyLogOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string | null;
  status: string;
  paymentMethod: string | null;
  totalPrice: number;
  createdAt: string;
};

export default function AdminDailyLogView({
  orders,
  preset,
  startDate,
  endDate,
  revenue,
}: {
  orders: DailyLogOrder[];
  preset: DatePreset;
  startDate: string;
  endDate: string;
  revenue: number;
}) {
  const { lang, formatPrice, formatNumber } = useAdminI18n();
  const isRtl = lang === "ar";

  const isSingleDay = startDate === endDate;
  const isMultipleDays = !isSingleDay;

  const dateHeading = isSingleDay
    ? new Date(`${startDate}T12:00:00`).toLocaleDateString(isRtl ? "ar-EG-u-nu-latn" : "en-US", {
        dateStyle: "full",
      })
    : `${new Date(`${startDate}T12:00:00`).toLocaleDateString(isRtl ? "ar-EG-u-nu-latn" : "en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })} – ${new Date(`${endDate}T12:00:00`).toLocaleDateString(isRtl ? "ar-EG-u-nu-latn" : "en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;

  const pendingCount = orders.filter((order) => order.status === "pending").length;

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="space-y-4 text-start sm:space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center justify-between gap-3 sm:block">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#D8B46A] sm:text-[10px]">
              {isRtl ? "سجل العمليات اليومية" : "Operations journal"}
            </p>
            <h1 className="mt-0.5 font-playfair text-2xl font-black text-[#942E3A] sm:mt-1 sm:text-3xl">
              {isRtl ? "سجل اليومية" : "Daily log"}
            </h1>
            <p className="mt-1 hidden max-w-xl text-xs text-[#6B1F2A]/65 sm:block">
              {isRtl
                ? "متابعة طلبات المتجر، الأداء، والإيرادات عبر أي فترة زمنية محددة."
                : "Review store orders, performance, and revenue across any custom date range."}
            </p>
          </div>

          <div className="sm:hidden">
            <AdminDailyLogDatePicker
              currentPreset={preset}
              currentStartDate={startDate}
              currentEndDate={endDate}
            />
          </div>
        </div>

        {/* Custom Date Range Selector Component (Desktop) */}
        <div className="hidden sm:flex sm:items-center sm:gap-2">
          <AdminDailyLogDatePicker
            currentPreset={preset}
            currentStartDate={startDate}
            currentEndDate={endDate}
          />
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
        <div className="min-w-0 rounded-xl border border-[#942E3A]/10 bg-white p-2.5 shadow-xs transition hover:border-[#942E3A]/25 sm:rounded-2xl sm:p-4">
          <p className="truncate text-[9px] font-bold uppercase tracking-wider text-[#6B1F2A]/55 sm:text-[10px]">
            <span className="sm:hidden">{isRtl ? "الطلبات" : "Orders"}</span>
            <span className="hidden sm:inline">{isRtl ? "إجمالي الطلبات" : "Total Orders"}</span>
          </p>
          <p className="mt-0.5 truncate font-playfair text-base font-black text-[#942E3A] sm:mt-1 sm:text-2xl lg:text-3xl">
            {formatNumber(orders.length)}
          </p>
        </div>

        <div className="min-w-0 rounded-xl border border-[#D8B46A]/40 bg-[#fff7df] p-2.5 shadow-xs transition hover:border-[#D8B46A]/60 sm:rounded-2xl sm:p-4">
          <p className="truncate text-[9px] font-bold uppercase tracking-wider text-[#6B1F2A]/55 sm:text-[10px]">
            <span className="sm:hidden">{isRtl ? "الإيرادات" : "Revenue"}</span>
            <span className="hidden sm:inline">{isRtl ? "إجمالي الإيرادات" : "Total Revenue"}</span>
          </p>
          <p className="mt-0.5 truncate font-playfair text-xs font-black text-[#942E3A] sm:mt-1 sm:text-xl lg:text-2xl">
            {formatPrice(revenue)}
          </p>
        </div>

        <div className="min-w-0 rounded-xl border border-[#942E3A]/10 bg-white p-2.5 shadow-xs transition hover:border-[#942E3A]/25 sm:rounded-2xl sm:p-4">
          <p className="truncate text-[9px] font-bold uppercase tracking-wider text-[#6B1F2A]/55 sm:text-[10px]">
            <span className="sm:hidden">{isRtl ? "قيد الانتظار" : "Pending"}</span>
            <span className="hidden sm:inline">{isRtl ? "طلبات قيد الانتظار" : "Pending Orders"}</span>
          </p>
          <p className="mt-0.5 truncate font-playfair text-base font-black text-[#942E3A] sm:mt-1 sm:text-2xl lg:text-3xl">
            {formatNumber(pendingCount)}
          </p>
        </div>
      </div>

      {/* Orders Section */}
      <section className="rounded-2xl border border-[#942E3A]/10 bg-white p-3.5 shadow-xs sm:rounded-3xl sm:p-6">
        <div className="flex items-center justify-between gap-2 border-b border-[#942E3A]/10 pb-3 sm:pb-4">
          <div className="flex min-w-0 items-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0 text-[#D8B46A] sm:h-5 sm:w-5" />
            <h2 className="truncate font-playfair text-sm font-bold text-[#942E3A] sm:text-lg lg:text-xl">
              {isRtl
                ? `الطلبات ${isSingleDay ? `في ${dateHeading}` : `من ${dateHeading}`}`
                : `Orders ${isSingleDay ? `on ${dateHeading}` : `from ${dateHeading}`}`}
            </h2>
          </div>
          <span className="shrink-0 rounded-full border border-[#D8B46A]/30 bg-[#FFF9EB] px-2.5 py-0.5 text-[10px] font-bold text-[#942E3A] sm:px-3 sm:py-1">
            {formatNumber(orders.length)} {isRtl ? "طلب" : orders.length === 1 ? "order" : "orders"}
          </span>
        </div>

        <div className="mt-3 sm:mt-4">
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[560px] table-fixed text-center text-xs">
              <colgroup>
                <col className="w-[18%]" />
                <col className="w-[18%]" />
                <col className="w-[24%]" />
                <col className="w-[20%]" />
                <col className="w-[20%]" />
              </colgroup>
              <thead className="border-b border-[#942E3A]/10 text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
                <tr>
                  <th className="pb-3">{isMultipleDays ? (isRtl ? "التاريخ والوقت" : "Date & Time") : (isRtl ? "الوقت" : "Time")}</th>
                  <th className="pb-3">{isRtl ? "رقم الطلب" : "Order Number"}</th>
                  <th className="pb-3">{isRtl ? "العميل" : "Customer"}</th>
                  <th className="pb-3">{isRtl ? "الحالة" : "Status"}</th>
                  <th className="pb-3">{isRtl ? "الإجمالي" : "Total"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#942E3A]/8">
                {orders.map((order) => (
                  <tr key={order.orderNumber} className="group hover:bg-[#FFF9EB]/60 transition">
                    <td className="py-3.5 text-[#6B1F2A]/70">
                      <span dir="ltr">
                        {isMultipleDays
                          ? new Date(order.createdAt).toLocaleDateString(isRtl ? "ar-EG-u-nu-latn" : "en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })
                          : new Date(order.createdAt).toLocaleTimeString(isRtl ? "ar-EG-u-nu-latn" : "en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })}
                      </span>
                    </td>
                    <td className="py-3.5 font-bold text-[#942E3A]">
                      <Link
                        href={`/admin/orders/${order.id || order.orderNumber}`}
                        className="inline-flex items-center gap-1 hover:underline"
                      >
                        <span>{order.orderNumber}</span>
                        <ArrowUpRight className={`h-3 w-3 opacity-0 group-hover:opacity-100 transition text-[#D8B46A] ${isRtl ? "rotate-180" : ""}`} />
                      </Link>
                    </td>
                    <td className="py-3.5 font-medium text-[#6B1F2A]">
                      {order.customerPhone ? (
                        <Link
                          href={`/admin/customers/${encodeURIComponent(order.customerPhone)}`}
                          className="font-bold text-[#6B1F2A] hover:text-[#942E3A] hover:underline"
                        >
                          {order.customerName}
                        </Link>
                      ) : (
                        order.customerName
                      )}
                    </td>
                    <td className="py-3.5">
                      <AdminStatusSelect
                        orderId={order.id}
                        status={order.status}
                        paymentMethod={order.paymentMethod}
                      />
                    </td>
                    <td className="py-3.5 font-bold text-[#942E3A]">
                      <span dir="ltr" className="inline-block">
                        {formatPrice(order.totalPrice)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Compact Cards List */}
          <div className="space-y-2.5 sm:hidden">
            {orders.map((order) => (
              <div
                key={order.orderNumber}
                className="rounded-xl border border-[#942E3A]/10 bg-[#FFF9EB]/40 p-3 text-xs space-y-2"
              >
                <div className="flex items-center justify-between min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Link
                      href={`/admin/orders/${order.id || order.orderNumber}`}
                      className="font-bold text-[#942E3A] truncate hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </div>
                  <span className="font-bold text-[#942E3A]">
                    {formatPrice(order.totalPrice)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#6B1F2A]/70">
                  <span>
                    {order.customerPhone ? (
                      <Link
                        href={`/admin/customers/${encodeURIComponent(order.customerPhone)}`}
                        className="hover:underline"
                      >
                        {order.customerName}
                      </Link>
                    ) : (
                      order.customerName
                    )}
                  </span>
                  <span dir="ltr">
                    {new Date(order.createdAt).toLocaleTimeString(isRtl ? "ar-EG-u-nu-latn" : "en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </span>
                </div>

                <div className="pt-1">
                  <AdminStatusSelect
                    orderId={order.id}
                    status={order.status}
                    paymentMethod={order.paymentMethod}
                  />
                </div>
              </div>
            ))}
          </div>

          {orders.length === 0 && (
            <div className="py-12 text-center text-xs text-[#6B1F2A]/60">
              {isRtl
                ? "لا توجد طلبات مسجلة في هذا النطاق الزمني."
                : "No orders found for the selected period."}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
