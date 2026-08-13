import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import AdminCopyButton from "@/components/AdminCopyButton";
import AdminCustomerModal from "@/components/AdminCustomerModal";

export const dynamic = "force-dynamic";

function formatCustomerDate(date: Date | null, mobile = false) {
  return date
    ? date.toLocaleDateString("en-US", mobile ? { dateStyle: "medium" } : undefined)
    : null;
}

export default async function CustomersPage() {
  await requireAdmin();
  try {
    const [profiles, orders] = await Promise.all([
      prisma.customer.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.order.findMany({ where: { status: { not: "cancelled" } }, orderBy: { createdAt: "desc" } }),
    ]);
    const map = new Map(profiles.map((customer) => [customer.phone, { ...customer, orders: 0, spent: 0, lastOrder: null as Date | null }]));
    for (const order of orders) { const current = map.get(order.customerPhone); if (current) { current.orders += 1; current.spent += Number(order.totalPrice); current.lastOrder ??= order.createdAt; } else map.set(order.customerPhone, { id: "", firstName: order.customerFirstName || order.customerName.split(" ")[0] || "", lastName: order.customerLastName || order.customerName.split(" ").slice(1).join(" ") || "", name: order.customerName, email: null, phone: order.customerPhone, phone2: null, governorate: order.governorate, city: order.city, address: order.address, notes: null, createdAt: order.createdAt, updatedAt: order.createdAt, orders: 1, spent: Number(order.totalPrice), lastOrder: order.createdAt }); }
    const customers = [...map.values()];
    return (
      <div className="space-y-5 sm:space-y-7">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 text-right">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">Customer intelligence</p>
            <h1 className="mt-0.5 font-playfair text-2xl font-black text-[#942E3A] sm:mt-1 sm:text-3xl">Customers</h1>
            <p className="mt-1 hidden max-w-xl text-xs leading-5 text-[#6B1F2A]/65 sm:block">A living view of customer history, repeat orders, and value.</p>
          </div>
          <AdminCustomerModal />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
          <div className="min-w-0 rounded-xl border border-[#942E3A]/10 bg-white p-3 shadow-xs sm:rounded-2xl sm:p-4">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wide text-[#6B1F2A]/55 truncate">Customers</p>
            <p dir="ltr" className="mt-0.5 text-right font-playfair text-xl font-black text-[#942E3A] sm:mt-1 sm:text-2xl">{customers.length}</p>
          </div>
          <div className="min-w-0 rounded-xl border border-[#942E3A]/10 bg-white p-3 shadow-xs sm:rounded-2xl sm:p-4">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wide text-[#6B1F2A]/55 truncate">Repeat buyers</p>
            <p dir="ltr" className="mt-0.5 text-right font-playfair text-xl font-black text-[#942E3A] sm:mt-1 sm:text-2xl">{customers.filter((customer) => customer.orders > 1).length}</p>
          </div>
          <div className="min-w-0 rounded-xl border border-[#D8B46A]/35 bg-[#fff7df] p-3 shadow-xs sm:rounded-2xl sm:p-4">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wide text-[#6B1F2A]/55 truncate">Customer value</p>
            <p dir="ltr" className="mt-0.5 truncate text-right font-playfair text-lg font-black text-[#942E3A] sm:mt-1 sm:text-2xl">{formatCurrency(customers.reduce((sum, customer) => sum + customer.spent, 0))}</p>
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-xs sm:rounded-3xl sm:p-6">
          <div className="flex items-center gap-2 text-right">
            <Users className="h-4 w-4 text-[#D8B46A]" />
            <h2 className="font-playfair text-base sm:text-xl font-bold">Customer history</h2>
          </div>

          {/* Desktop Table View */}
          <div className="mt-4 hidden overflow-x-auto overscroll-contain sm:block">
            <table className="w-full min-w-[650px] text-xs text-start">
              <thead className="border-b border-[#942E3A]/10 text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
                <tr>
                  <th className="pb-3 text-start">Customer</th>
                  <th className="pb-3 text-start">Phone</th>
                  <th className="pb-3 text-start">Orders</th>
                  <th className="pb-3 text-start">Last order</th>
                  <th className="pb-3 text-end">Lifetime value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#942E3A]/8">
                {customers.map((customer) => (
                  <tr key={customer.phone}>
                    <td className="py-3 font-bold text-[#942E3A]">
                      <Link dir="ltr" href={`/admin/customers/${encodeURIComponent(customer.phone)}`} className="inline-block max-w-[220px] truncate text-start hover:underline">{customer.name}</Link>
                    </td>
                    <td className="py-3 text-[#6B1F2A]">
                      <span dir="ltr" className="inline-flex items-center gap-1 whitespace-nowrap">{customer.phone}<AdminCopyButton value={customer.phone} /></span>
                    </td>
                    <td className="py-3 text-[#6B1F2A]">{customer.orders}</td>
                    <td dir="ltr" className="py-3 whitespace-nowrap text-[#6B1F2A]/65">{formatCustomerDate(customer.lastOrder) || "No orders yet"}</td>
                    <td dir="ltr" className="py-3 whitespace-nowrap text-end font-bold text-[#942E3A]">{formatCurrency(customer.spent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="mt-3 space-y-2.5 sm:hidden">
            {customers.map((customer) => (
              <div key={customer.phone} className="rounded-2xl border border-[#942E3A]/10 bg-[#FFF9EB]/40 p-3.5 text-xs space-y-2">
                <div className="flex items-start justify-between gap-2 border-b border-[#942E3A]/10 pb-2">
                  <div>
                    <Link href={`/admin/customers/${encodeURIComponent(customer.phone)}`} className="font-bold text-[#942E3A] hover:underline block text-xs">
                      {customer.name}
                    </Link>
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#6B1F2A]/70 mt-0.5">
                      <span dir="ltr">{customer.phone}</span>
                      <AdminCopyButton value={customer.phone} />
                    </span>
                  </div>
                  <span className="rounded-full bg-[#FFF9EB] border border-[#D8B46A]/30 px-2 py-0.5 text-[10px] font-bold text-[#942E3A] shrink-0">
                    {customer.orders} {customer.orders === 1 ? "order" : "orders"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-0.5">
                  <span className="text-[10px] text-[#6B1F2A]/60">
                    Last: {formatCustomerDate(customer.lastOrder, true) || "No orders"}
                  </span>
                  <span className="font-bold text-[#942E3A] text-xs">
                    <span dir="ltr">{formatCurrency(customer.spent)}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {customers.length === 0 && <p className="py-12 text-center text-xs text-[#6B1F2A]/60">No customers yet.</p>}
        </section>
      </div>
    );
  } catch (error) {
    console.error("Unable to load customers page data:", error);
    return <div className="p-8 text-center text-xs text-red-600">Failed to load customers data.</div>;
  }
}
