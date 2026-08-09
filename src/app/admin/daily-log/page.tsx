import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { CalendarDays, ClipboardList, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import AdminDailyLogDatePicker, { DatePreset } from "@/components/AdminDailyLogDatePicker";
import AdminStatusSelect from "@/components/AdminStatusSelect";
import AdminPageTranslationBoundary from "@/components/AdminPageTranslationBoundary";

export const dynamic = "force-dynamic";

function formatDateYYYYMMDD(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function computeDateRange(params: {
  preset?: string;
  startDate?: string;
  endDate?: string;
  date?: string;
}): { preset: DatePreset; startDate: string; endDate: string } {
  const now = new Date();
  const todayStr = formatDateYYYYMMDD(now);

  const preset = (params.preset as DatePreset) || (params.startDate || params.endDate || params.date ? "custom" : "today");

  if (params.startDate && params.endDate) {
    return { preset: "custom", startDate: params.startDate, endDate: params.endDate };
  }

  if (params.date) {
    return { preset: "custom", startDate: params.date, endDate: params.date };
  }

  switch (preset) {
    case "today":
      return { preset: "today", startDate: todayStr, endDate: todayStr };

    case "this_week": {
      const day = now.getDay(); // 0 is Sun
      const diffToMon = day === 0 ? -6 : 1 - day;
      const mon = new Date(now);
      mon.setDate(now.getDate() + diffToMon);
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);
      return {
        preset: "this_week",
        startDate: formatDateYYYYMMDD(mon),
        endDate: formatDateYYYYMMDD(sun),
      };
    }

    case "last_week": {
      const day = now.getDay();
      const diffToMon = (day === 0 ? -6 : 1 - day) - 7;
      const mon = new Date(now);
      mon.setDate(now.getDate() + diffToMon);
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);
      return {
        preset: "last_week",
        startDate: formatDateYYYYMMDD(mon),
        endDate: formatDateYYYYMMDD(sun),
      };
    }

    case "this_month": {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return {
        preset: "this_month",
        startDate: formatDateYYYYMMDD(first),
        endDate: formatDateYYYYMMDD(last),
      };
    }

    case "last_month": {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        preset: "last_month",
        startDate: formatDateYYYYMMDD(first),
        endDate: formatDateYYYYMMDD(last),
      };
    }

    case "this_year": {
      const first = new Date(now.getFullYear(), 0, 1);
      const last = new Date(now.getFullYear(), 11, 31);
      return {
        preset: "this_year",
        startDate: formatDateYYYYMMDD(first),
        endDate: formatDateYYYYMMDD(last),
      };
    }

    case "last_year": {
      const first = new Date(now.getFullYear() - 1, 0, 1);
      const last = new Date(now.getFullYear() - 1, 11, 31);
      return {
        preset: "last_year",
        startDate: formatDateYYYYMMDD(first),
        endDate: formatDateYYYYMMDD(last),
      };
    }

    case "custom":
    default: {
      const start = params.startDate || todayStr;
      const end = params.endDate || todayStr;
      return { preset: "custom", startDate: start, endDate: end };
    }
  }
}

export default async function DailyLogPage({
  searchParams,
}: {
  searchParams: Promise<{ preset?: string; startDate?: string; endDate?: string; date?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const { preset, startDate, endDate } = computeDateRange(params);

  const startFilter = new Date(`${startDate}T00:00:00.000`);
  const endFilter = new Date(`${endDate}T23:59:59.999`);

  let orders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string | null;
    status: string;
    paymentMethod: string | null;
    totalPrice: unknown;
    createdAt: Date;
  }> = [];

  try {
    orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startFilter,
          lte: endFilter,
        },
      },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerPhone: true,
        status: true,
        paymentMethod: true,
        totalPrice: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Unable to load daily log orders:", error);
  }

  const revenue = orders
    .filter((order) => order.status !== "cancelled" && order.status !== "returned")
    .reduce((sum, order) => sum + Number(order.totalPrice), 0);


  const isSingleDay = startDate === endDate;
  const isMultipleDays = !isSingleDay;

  const dateHeading = isSingleDay
    ? new Date(`${startDate}T12:00:00`).toLocaleDateString("en-US", { dateStyle: "full" })
    : `${new Date(`${startDate}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} – ${new Date(`${endDate}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <AdminPageTranslationBoundary>
    <div className="space-y-4 sm:space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center justify-between gap-3 sm:block">
          <div>
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">
              Operations journal
            </p>
            <h1 className="mt-0.5 sm:mt-1 font-playfair text-2xl sm:text-3xl font-black text-[#942E3A]">
              Daily log
            </h1>
            <p className="mt-1 hidden sm:block text-xs text-[#6B1F2A]/65 max-w-xl">
              Review store orders, performance, and revenue across any custom date range.
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

      {/* Summary Stat Cards - 3 Columns Side by Side on Mobile */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
        <div className="rounded-xl sm:rounded-2xl border border-[#942E3A]/10 bg-white p-2.5 sm:p-4 shadow-xs transition hover:border-[#942E3A]/25 min-w-0">
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/55 truncate">
            <span className="sm:hidden">Orders</span>
            <span className="hidden sm:inline">Total Orders</span>
          </p>
          <p className="mt-0.5 sm:mt-1 font-playfair text-base sm:text-2xl lg:text-3xl font-black text-[#942E3A] truncate">
            {orders.length}
          </p>
        </div>

        <div className="rounded-xl sm:rounded-2xl border border-[#D8B46A]/40 bg-[#fff7df] p-2.5 sm:p-4 shadow-xs transition hover:border-[#D8B46A]/60 min-w-0">
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/55 truncate">
            <span className="sm:hidden">Revenue</span>
            <span className="hidden sm:inline">Total Revenue</span>
          </p>
          <p className="mt-0.5 sm:mt-1 font-playfair text-xs sm:text-xl lg:text-2xl font-black text-[#942E3A] truncate">
            {formatCurrency(revenue)}
          </p>
        </div>

        <div className="rounded-xl sm:rounded-2xl border border-[#942E3A]/10 bg-white p-2.5 sm:p-4 shadow-xs transition hover:border-[#942E3A]/25 min-w-0">
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/55 truncate">
            <span className="sm:hidden">Pending</span>
            <span className="hidden sm:inline">Pending Orders</span>
          </p>
          <p className="mt-0.5 sm:mt-1 font-playfair text-base sm:text-2xl lg:text-3xl font-black text-[#942E3A] truncate">
            {orders.filter((order) => order.status === "pending").length}
          </p>
        </div>
      </div>

      {/* Orders Section */}
      <section className="rounded-2xl sm:rounded-3xl border border-[#942E3A]/10 bg-white p-3.5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between gap-2 border-b border-[#942E3A]/10 pb-3 sm:pb-4">
          <div className="flex items-center gap-2 min-w-0">
            <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-[#D8B46A] shrink-0" />
            <h2 className="font-playfair text-sm sm:text-lg lg:text-xl font-bold text-[#942E3A] truncate">
              Orders {isSingleDay ? `on ${dateHeading}` : `from ${dateHeading}`}
            </h2>
          </div>
          <span className="rounded-full bg-[#FFF9EB] px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] font-bold text-[#942E3A] border border-[#D8B46A]/30 shrink-0">
            {orders.length} {orders.length === 1 ? "order" : "orders"}
          </span>
        </div>

        <div className="mt-3 sm:mt-4">
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-xs">
              <thead className="border-b border-[#942E3A]/10 text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
                <tr>
                  <th className="pb-3">{isMultipleDays ? "Date & Time" : "Time"}</th>
                  <th className="pb-3">Order Number</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#942E3A]/8">
                {orders.map((order) => (
                  <tr key={order.orderNumber} className="group hover:bg-[#FFF9EB]/60 transition">
                    <td className="py-3.5 text-[#6B1F2A]/70">
                      {isMultipleDays
                        ? order.createdAt.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : order.createdAt.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                    </td>
                    <td className="py-3.5 font-bold text-[#942E3A]">
                      <Link
                        href={`/admin/orders/${order.id || order.orderNumber}`}
                        className="inline-flex items-center gap-1 hover:underline"
                      >
                        <span>{order.orderNumber}</span>
                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition text-[#D8B46A]" />
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
                    <td className="py-3.5 text-right font-bold text-[#942E3A]">
                      {formatCurrency(Number(order.totalPrice))}
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
                      className="font-bold text-[#942E3A] hover:underline truncate"
                    >
                      {order.orderNumber}
                    </Link>
                    <span className="text-[10px] text-[#6B1F2A]/50">
                      • {isMultipleDays
                        ? order.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                        : order.createdAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <span className="font-extrabold text-[#942E3A] shrink-0 text-xs">
                    {formatCurrency(Number(order.totalPrice))}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 min-w-0 pt-0.5">
                  <div className="truncate text-[#6B1F2A]">
                    <span className="text-[10px] text-[#6B1F2A]/50 block">Customer</span>
                    {order.customerPhone ? (
                      <Link
                        href={`/admin/customers/${encodeURIComponent(order.customerPhone)}`}
                        className="font-bold text-[#6B1F2A] hover:text-[#942E3A] hover:underline"
                      >
                        {order.customerName}
                      </Link>
                    ) : (
                      <span className="font-bold">{order.customerName}</span>
                    )}
                  </div>

                  <div className="shrink-0">
                    <AdminStatusSelect
                      orderId={order.id}
                      status={order.status}
                      paymentMethod={order.paymentMethod}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {orders.length === 0 && (
            <div className="py-10 text-center">
              <ClipboardList className="mx-auto mb-2 h-7 w-7 text-[#D8B46A]/60" />
              <p className="text-xs font-bold text-[#942E3A]">No orders found for this date range.</p>
              <p className="mt-1 text-[11px] text-[#6B1F2A]/50">
                Try selecting a different preset or custom range from the filter menu above.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
    </AdminPageTranslationBoundary>
  );
}
