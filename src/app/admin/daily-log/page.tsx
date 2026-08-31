import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import AdminDailyLogView from "@/components/AdminDailyLogView";
import { DatePreset } from "@/components/AdminDailyLogDatePicker";

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
      const day = now.getDay();
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

  return (
    <AdminDailyLogView
      orders={orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        status: order.status,
        paymentMethod: order.paymentMethod,
        totalPrice: Number(order.totalPrice || 0),
        createdAt: order.createdAt.toISOString(),
      }))}
      preset={preset}
      startDate={startDate}
      endDate={endDate}
      revenue={revenue}
    />
  );
}
