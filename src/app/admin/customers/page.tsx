import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  await requireAdmin();
  type Customer = {
    phone: string;
    name: string;
    orders: number;
    spent: number;
    lastOrder: Date;
  };
  const customerMap = new Map<string, Customer>();
  try {
    const orders = await prisma.order.findMany({
      where: { status: { not: "cancelled" } },
      orderBy: { createdAt: "desc" },
    });
    for (const order of orders) {
      const current = customerMap.get(order.customerPhone);
      if (current) {
        current.orders += 1;
        current.spent += Number(order.totalPrice);
      } else
        customerMap.set(order.customerPhone, {
          phone: order.customerPhone,
          name: order.customerName,
          orders: 1,
          spent: Number(order.totalPrice),
          lastOrder: order.createdAt,
        });
    }
  } catch (error) {
    console.warn("Unable to load customers", error);
  }
  const customers = [...customerMap.values()];
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">
          Customer intelligence
        </p>
        <h1 className="mt-1 font-playfair text-3xl font-black">Customers</h1>
        <p className="mt-1 text-xs text-[#6B1F2A]/65">
          A living view of customer history, repeat orders, and value.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-3">
          <p className="text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
            Customers
          </p>
          <p className="mt-1 font-playfair text-2xl font-black">
            {customers.length}
          </p>
        </div>
        <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-3">
          <p className="text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
            Repeat buyers
          </p>
          <p className="mt-1 font-playfair text-2xl font-black">
            {customers.filter((customer) => customer.orders > 1).length}
          </p>
        </div>
        <div className="rounded-2xl border border-[#D8B46A]/35 bg-[#fff7df] p-3">
          <p className="text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
            Customer value
          </p>
          <p className="mt-1 font-playfair text-xl font-black">
            {formatCurrency(
              customers.reduce((sum, customer) => sum + customer.spent, 0),
            )}
          </p>
        </div>
      </div>
      <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[#D8B46A]" />
          <h2 className="font-playfair text-xl font-bold">Customer history</h2>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-xs">
            <thead className="border-b border-[#942E3A]/10 text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
              <tr>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Phone</th>
                <th className="pb-3">Orders</th>
                <th className="pb-3">Last order</th>
                <th className="pb-3 text-right">Lifetime value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#942E3A]/8">
              {customers.map((customer) => (
                <tr key={customer.phone}>
                  <td className="py-3 font-bold text-[#942E3A]">
                    <Link href={`/admin/customers/${encodeURIComponent(customer.phone)}`} className="hover:underline">
                      {customer.name}
                    </Link>
                  </td>
                  <td className="py-3 text-[#6B1F2A]">{customer.phone}</td>
                  <td className="py-3 text-[#6B1F2A]">{customer.orders}</td>
                  <td className="py-3 text-[#6B1F2A]/65">
                    {customer.lastOrder.toLocaleDateString("en-US")}
                  </td>
                  <td className="py-3 text-right font-bold text-[#942E3A]">
                    {formatCurrency(customer.spent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {customers.length === 0 && (
            <p className="py-12 text-center text-xs text-[#6B1F2A]/60">
              No customers yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
