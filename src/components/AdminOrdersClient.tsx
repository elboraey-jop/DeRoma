"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Eye, Search, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import AdminStatusSelect from "@/components/AdminStatusSelect";
import AdminCopyButton from "@/components/AdminCopyButton";
import { getStatusLabel } from "@/lib/orderStatus";

export interface AdminOrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  governorate: string;
  city: string;
  totalPrice: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

const statuses = [
  "all",
  "pending",
  "pending_payment",
  "paid",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

export default function AdminOrdersClient({ orders }: { orders: AdminOrderRow[] }) {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam && statuses.includes(statusParam)) {
      setStatus(statusParam);
    }
  }, [searchParams]);

  const orderCountByStatus = (value: string) =>
    value === "all" ? orders.length : orders.filter((order) => order.status === value).length;

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = status === "all" || order.status === status;
      const query = search.toLowerCase();
      return (
        matchesStatus &&
        (!query ||
          order.orderNumber.toLowerCase().includes(query) ||
          order.customerName.toLowerCase().includes(query) ||
          order.customerPhone.includes(query))
      );
    });
  }, [orders, search, status]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">
            Operations
          </p>
          <h1 className="mt-1 font-playfair text-3xl font-black">Orders</h1>
          <p className="mt-1 text-xs text-[#6B1F2A]/65">
            Review, update, and prepare every customer order.
          </p>
        </div>
        <Link
          href="/admin/orders/new"
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#942E3A] px-3 py-2.5 text-xs font-bold text-[#FFF9EB]"
        >
          <Plus className="h-4 w-4 text-[#D8B46A]" /> Manual order
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-3">
          <p className="text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">All orders</p>
          <p className="mt-1 font-playfair text-2xl font-black">{orders.length}</p>
        </div>
        <div className="rounded-2xl border border-[#D8B46A]/35 bg-[#fff7df] p-3">
          <p className="text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">Pending</p>
          <p className="mt-1 font-playfair text-2xl font-black">
            {orders.filter((o) => o.status === "pending").length}
          </p>
        </div>
        <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-3">
          <p className="text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">Delivered</p>
          <p className="mt-1 font-playfair text-2xl font-black">
            {orders.filter((o) => o.status === "delivered").length}
          </p>
        </div>
        <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-3">
          <p className="text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">Filtered</p>
          <p className="mt-1 font-playfair text-2xl font-black">{filtered.length}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-[#942E3A]/10 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1 pb-1">
            {statuses.map((item) => {
              const count = orderCountByStatus(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setStatus(item)}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2 text-[10px] font-bold capitalize ${
                    status === item
                      ? "bg-[#942E3A] text-[#FFF9EB]"
                      : "bg-[#FFF9EB] text-[#942E3A]/70"
                  }`}
                >
                  {item === "all" ? "All orders" : getStatusLabel(item)}
                  {count > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[9px] leading-none ${
                        status === item
                          ? "bg-[#FFF9EB]/20 text-[#FFF9EB]"
                          : "bg-[#942E3A]/10 text-[#942E3A]"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <label className="relative block lg:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D8B46A]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order, customer, phone"
              className="w-full rounded-xl border border-[#942E3A]/10 bg-[#FFF9EB]/60 py-2.5 pl-9 pr-3 text-xs outline-none focus:border-[#942E3A]"
            />
          </label>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-xs">
            <thead className="border-b border-[#942E3A]/10 text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
              <tr>
                <th className="pb-3">Order</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Phone</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Status</th>
                <th className="w-[180px] max-w-[180px] pb-3">Address</th>
                <th className="w-[110px] pb-3 text-right">Total</th>
                <th className="pb-3 text-right">Open</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#942E3A]/8">
              {filtered.map((order) => (
                <tr key={order.id}>
                  <td className="py-3 font-bold text-[#942E3A]">
                    <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="py-3">
                    <Link
                      href={`/admin/customers/${encodeURIComponent(order.customerPhone)}`}
                      className="font-bold text-[#942E3A] hover:underline"
                    >
                      {order.customerName}
                    </Link>
                  </td>
                  <td className="py-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[#6B1F2A]/70">
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="hover:text-[#942E3A] hover:underline"
                      >
                        {order.customerPhone}
                      </a>
                      <AdminCopyButton value={order.customerPhone} />
                    </span>
                  </td>
                  <td className="py-3 whitespace-nowrap text-[#6B1F2A]/65">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-3">
                    <AdminStatusSelect
                      orderId={order.id}
                      status={order.status}
                      paymentMethod={order.paymentMethod}
                    />
                  </td>
                  <td className="w-[180px] max-w-[180px] py-3 whitespace-nowrap text-[10px] text-[#6B1F2A]/65">
                    <span className="font-semibold text-[#6B1F2A]">{order.governorate}</span>
                    <span className="mx-1 text-[#D8B46A]">·</span>
                    {order.city}
                  </td>
                  <td className="w-[110px] py-3 text-right font-bold text-[#942E3A]">
                    {formatCurrency(order.totalPrice)}
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex items-center gap-1 font-bold text-[#942E3A] hover:underline"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ClipboardList className="h-7 w-7 text-[#D8B46A]" />
              <p className="mt-2 text-sm font-bold">No orders found</p>
              <p className="mt-1 text-xs text-[#6B1F2A]/60">New orders will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
