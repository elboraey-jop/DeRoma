import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { BarChart3, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  await requireAdmin();
  let orders: Array<{ totalPrice: unknown; status: string; createdAt: Date }> =
    [];
  try {
    orders = await prisma.order.findMany({
      select: { totalPrice: true, status: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    console.warn("Unable to load analytics", error);
  }
  const valid = orders.filter((order) => order.status !== "cancelled");
  const revenue = valid.reduce(
    (sum, order) => sum + Number(order.totalPrice),
    0,
  );
  const averageOrder = valid.length ? revenue / valid.length : 0;
  const statusCounts = ["pending", "shipped", "delivered", "cancelled"].map(
    (status) => ({
      status,
      count: orders.filter((order) => order.status === status).length,
    }),
  );
  const monthMap = new Map<string, number>();
  for (const order of valid) {
    const key = `${order.createdAt.getUTCFullYear()}-${String(order.createdAt.getUTCMonth() + 1).padStart(2, "0")}`;
    monthMap.set(key, (monthMap.get(key) || 0) + Number(order.totalPrice));
  }
  const monthRows = [...monthMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6);
  const maxMonth = Math.max(...monthRows.map(([, value]) => value), 1);
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">
          Business intelligence
        </p>
        <h1 className="mt-1 font-playfair text-3xl font-black">Analytics</h1>
        <p className="mt-1 text-xs text-[#6B1F2A]/65">
          Understand revenue, order flow, and the operational health of the
          boutique.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-[#942E3A] p-4 text-[#FFF9EB]">
          <p className="text-[10px] uppercase tracking-wide text-[#D8B46A]">
            Revenue
          </p>
          <p className="mt-2 font-playfair text-2xl font-black">
            {formatCurrency(revenue)}
          </p>
        </div>
        <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-4">
          <p className="text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
            Valid orders
          </p>
          <p className="mt-2 font-playfair text-2xl font-black">
            {valid.length}
          </p>
        </div>
        <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-4">
          <p className="text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
            Average order
          </p>
          <p className="mt-2 font-playfair text-2xl font-black">
            {formatCurrency(averageOrder)}
          </p>
        </div>
        <div className="rounded-2xl border border-[#D8B46A]/35 bg-[#fff7df] p-4">
          <p className="text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
            Cancellation rate
          </p>
          <p className="mt-2 font-playfair text-2xl font-black">
            {orders.length
              ? Math.round(
                  (orders.filter((o) => o.status === "cancelled").length /
                    orders.length) *
                    100,
                )
              : 0}
            %
          </p>
        </div>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#D8B46A]" />
            <h2 className="font-playfair text-xl font-bold">
              Revenue by month
            </h2>
          </div>
          <div className="mt-6 flex h-56 items-end gap-3 border-b border-l border-[#942E3A]/10 px-3 pb-0 pt-4">
            {monthRows.map(([month, value]) => (
              <div
                key={month}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <div
                  className="w-full max-w-12 rounded-t-xl bg-[#942E3A] transition-all"
                  style={{ height: `${Math.max((value / maxMonth) * 85, 5)}%` }}
                  title={formatCurrency(value)}
                />
                <span className="text-center text-[10px] font-bold text-[#6B1F2A]/60">
                  {new Date(`${month}-01T00:00:00Z`).toLocaleDateString(
                    "en-US",
                    { month: "short", year: "2-digit", timeZone: "UTC" },
                  )}
                </span>
              </div>
            ))}
            {monthRows.length === 0 && (
              <p className="m-auto text-xs text-[#6B1F2A]/60">
                Revenue data will appear after orders arrive.
              </p>
            )}
          </div>
        </section>
        <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[#D8B46A]" />
            <h2 className="font-playfair text-xl font-bold">Order pipeline</h2>
          </div>
          <div className="mt-5 space-y-3">
            {statusCounts.map((item) => (
              <div key={item.status}>
                <div className="flex justify-between text-xs">
                  <span className="capitalize text-[#6B1F2A]">
                    {item.status}
                  </span>
                  <strong className="text-[#942E3A]">{item.count}</strong>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#FFF9EB]">
                  <div
                    className="h-full rounded-full bg-[#D8B46A]"
                    style={{
                      width: `${orders.length ? (item.count / orders.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
