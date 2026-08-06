import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import AdminCopyButton from "@/components/AdminCopyButton";
import AdminCustomerModal from "@/components/AdminCustomerModal";

export const dynamic = "force-dynamic";

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
    return <div className="space-y-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">Customer intelligence</p><h1 className="mt-1 font-playfair text-3xl font-black">Customers</h1><p className="mt-1 text-xs text-[#6B1F2A]/65">A living view of customer history, repeat orders, and value.</p></div><AdminCustomerModal /></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-3"><div className="rounded-2xl border border-[#942E3A]/10 bg-white p-3"><p className="text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">Customers</p><p className="mt-1 font-playfair text-2xl font-black">{customers.length}</p></div><div className="rounded-2xl border border-[#942E3A]/10 bg-white p-3"><p className="text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">Repeat buyers</p><p className="mt-1 font-playfair text-2xl font-black">{customers.filter((customer) => customer.orders > 1).length}</p></div><div className="rounded-2xl border border-[#D8B46A]/35 bg-[#fff7df] p-3"><p className="text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">Customer value</p><p className="mt-1 font-playfair text-xl font-black">{formatCurrency(customers.reduce((sum, customer) => sum + customer.spent, 0))}</p></div></div><section className="rounded-3xl border border-[#942E3A]/10 bg-white p-4 shadow-sm sm:p-6"><div className="flex items-center gap-2"><Users className="h-4 w-4 text-[#D8B46A]" /><h2 className="font-playfair text-xl font-bold">Customer history</h2></div><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[650px] text-left text-xs"><thead className="border-b border-[#942E3A]/10 text-[10px] uppercase tracking-wide text-[#6B1F2A]/55"><tr><th className="pb-3">Customer</th><th className="pb-3">Phone</th><th className="pb-3">Orders</th><th className="pb-3">Last order</th><th className="pb-3 text-right">Lifetime value</th></tr></thead><tbody className="divide-y divide-[#942E3A]/8">{customers.map((customer) => <tr key={customer.phone}><td className="py-3 font-bold text-[#942E3A]"><Link href={`/admin/customers/${encodeURIComponent(customer.phone)}`} className="hover:underline">{customer.name}</Link></td><td className="py-3 text-[#6B1F2A]"><span className="inline-flex items-center gap-1">{customer.phone}<AdminCopyButton value={customer.phone} /></span></td><td className="py-3 text-[#6B1F2A]">{customer.orders}</td><td className="py-3 text-[#6B1F2A]/65">{customer.lastOrder ? customer.lastOrder.toLocaleDateString("en-US") : "No orders yet"}</td><td className="py-3 text-right font-bold text-[#942E3A]">{formatCurrency(customer.spent)}</td></tr>)}</tbody></table>{customers.length === 0 && <p className="py-12 text-center text-xs text-[#6B1F2A]/60">No customers yet.</p>}</div></section></div>;
  } catch (error) {
    console.error("Unable to load customers page data:", error);
    return <div className="p-8 text-center text-xs text-red-600">Failed to load customers data.</div>;
  }
}
