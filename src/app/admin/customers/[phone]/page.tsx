import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MessageCircle, Phone, ShoppingBag, UserRound } from "lucide-react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { formatCurrency } from "@/lib/utils";
import { getStatusLabel } from "@/lib/orderStatus";
import AdminCopyButton from "@/components/AdminCopyButton";
import AdminCustomerModal from "@/components/AdminCustomerModal";

export const dynamic = "force-dynamic";

function whatsappNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 11) return `20${digits.slice(1)}`;
  if (digits.startsWith("20")) return digits;
  return digits;
}

export default async function CustomerDetailsPage({
  params,
}: {
  params: Promise<{ phone: string }>;
}) {
  await requireAdmin();
  const { phone: encodedPhone } = await params;
  const phone = decodeURIComponent(encodedPhone);
  const [profile, orders] = await Promise.all([
    prisma.customer.findUnique({ where: { phone } }),
    prisma.order.findMany({
      where: { customerPhone: phone },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  if (!profile && !orders.length) notFound();
  const source = profile || orders[0];
  if (!source) notFound();
  const activeOrders = orders.filter((order) => order.status !== "cancelled");
  const lifetimeValue = activeOrders.reduce(
    (sum, order) => sum + Number(order.totalPrice),
    0,
  );
  const itemCount = activeOrders.reduce(
    (sum, order) =>
      sum + order.items.reduce((items, item) => items + item.quantity, 0),
    0,
  );
  const customer = {
    id: profile?.id,
    name:
      profile?.name ||
      ("customerName" in source ? source.customerName : "Customer"),
    email: profile?.email,
    phone: profile?.phone || phone,
    phone2: profile?.phone2,
    governorate:
      profile?.governorate ||
      ("governorate" in source ? source.governorate : ""),
    city: profile?.city || ("city" in source ? source.city : ""),
    address: profile?.address || ("address" in source ? source.address : ""),
    notes: profile?.notes,
  };
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/customers"
          className="rounded-xl border border-[#942E3A]/15 bg-white p-2 text-[#942E3A]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">
            Customer intelligence
          </p>
          <h1 className="mt-1 font-playfair text-3xl font-black">
            {customer.name}
          </h1>
          <p className="mt-1 text-xs text-[#6B1F2A]/65">
            Customer profile and complete order history.
          </p>
        </div>
        <div className="ml-auto">
          <AdminCustomerModal
            customer={customer}
            triggerLabel="Edit customer"
          />
        </div>
      </div>
      <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-3xl bg-[#942E3A] p-6 text-[#FFF9EB] shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D8B46A] text-xl font-black text-[#942E3A]">
              <UserRound />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
                Primary customer
              </p>
              <h2 className="mt-1 font-playfair text-3xl font-black">
                {customer.name}
              </h2>
              <span className="mt-2 inline-flex items-center gap-1">
                <a
                  href={`tel:${customer.phone}`}
                  className="inline-flex items-center gap-2 text-sm text-white/80"
                >
                  <Phone className="h-4 w-4 text-[#D8B46A]" />
                  {customer.phone}
                </a>
                <AdminCopyButton value={customer.phone} />
              </span>
            </div>
          </div>
          <div className="mt-7 grid gap-3 text-xs sm:grid-cols-2">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-[#D8B46A]">Latest address</p>
              <p className="mt-2 leading-relaxed text-white/85">
                {customer.governorate}, {customer.city}
                <br />
                {customer.address}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-[#D8B46A]">Contact shortcuts</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <a
                  href={`tel:${customer.phone}`}
                  className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 font-bold"
                >
                  <Phone className="h-3 w-3" /> Call
                </a>
                <a
                  href={`https://wa.me/${whatsappNumber(customer.phone)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 font-bold"
                >
                  <MessageCircle className="h-3 w-3 text-[#7CFFAA]" /> WhatsApp
                </a>
                <a
                  href="mailto:?subject=DeRoma order"
                  className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 font-bold"
                >
                  <Mail className="h-3 w-3" /> Email
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm">
            <ShoppingBag className="h-5 w-5 text-[#D8B46A]" />
            <p className="mt-5 text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
              Orders
            </p>
            <p className="mt-1 font-playfair text-3xl font-black">
              {activeOrders.length}
            </p>
          </div>
          <div className="rounded-3xl border border-[#D8B46A]/35 bg-[#fff7df] p-5 shadow-sm">
            <p className="text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
              Lifetime value
            </p>
            <p className="mt-5 font-playfair text-xl font-black text-[#942E3A]">
              {formatCurrency(lifetimeValue)}
            </p>
          </div>
          <div className="col-span-2 rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm">
            <p className="text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
              Items purchased
            </p>
            <p className="mt-1 font-playfair text-3xl font-black">
              {itemCount}
            </p>
          </div>
        </div>
      </section>
      <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-[#D8B46A]" />
          <h2 className="font-playfair text-xl font-bold">Order history</h2>
        </div>
        {orders.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-xs">
              <thead className="border-b border-[#942E3A]/10 text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
                <tr>
                  <th className="pb-3">Order</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Items</th>
                  <th className="pb-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#942E3A]/8">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-3 font-bold text-[#942E3A]">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 text-[#6B1F2A]/65">
                      {order.createdAt.toLocaleDateString("en-US", {
                        dateStyle: "medium",
                      })}
                    </td>
                    <td className="py-3">
                      <span className="rounded-full bg-[#FFF9EB] px-2.5 py-1 text-[10px] font-bold text-[#942E3A]">
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="py-3 text-[#6B1F2A]">
                      {order.items.reduce(
                        (sum, item) => sum + item.quantity,
                        0,
                      )}
                    </td>
                    <td className="py-3 text-right font-bold text-[#942E3A]">
                      {formatCurrency(Number(order.totalPrice))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-10 text-center text-xs text-[#6B1F2A]/60">
            No orders for this customer yet.
          </p>
        )}
      </section>
    </div>
  );
}
