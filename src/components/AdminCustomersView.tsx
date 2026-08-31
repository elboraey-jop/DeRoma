"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import AdminCopyButton from "@/components/AdminCopyButton";
import AdminCustomerModal from "@/components/AdminCustomerModal";
import { useAdminI18n } from "@/providers/AdminI18nContext";

export type CustomerSummaryItem = {
  id: string;
  name: string;
  phone: string;
  orders: number;
  spent: number;
  lastOrder: string | null;
};

export default function AdminCustomersView({
  customers,
}: {
  customers: CustomerSummaryItem[];
}) {
  const { lang, formatPrice, formatNumber, formatDate } = useAdminI18n();
  const isRtl = lang === "ar";

  const repeatBuyers = customers.filter((c) => c.orders > 1).length;
  const totalValue = customers.reduce((sum, c) => sum + c.spent, 0);

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="space-y-5 sm:space-y-7 text-start">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">
            {isRtl ? "بيانات العملاء" : "Customer intelligence"}
          </p>
          <h1 className="mt-0.5 font-playfair text-2xl font-black text-[#942E3A] sm:mt-1 sm:text-3xl">
            {isRtl ? "قاعدة العملاء" : "Customers"}
          </h1>
          <p className="mt-1 hidden max-w-xl text-xs leading-5 text-[#6B1F2A]/65 sm:block">
            {isRtl
              ? "عرض شامل لسجل العملاء، تكرار الطلبات، والقيمة الشرائية."
              : "A living view of customer history, repeat orders, and value."}
          </p>
        </div>
        <AdminCustomerModal />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
        <div className="min-w-0 rounded-xl border border-[#942E3A]/10 bg-white p-3 shadow-xs sm:rounded-2xl sm:p-4">
          <p className="truncate text-[9px] font-bold uppercase tracking-wide text-[#6B1F2A]/55 sm:text-[10px]">
            {isRtl ? "إجمالي العملاء" : "Customers"}
          </p>
          <p className="mt-0.5 font-playfair text-xl font-black text-[#942E3A] sm:mt-1 sm:text-2xl">
            {formatNumber(customers.length)}
          </p>
        </div>
        <div className="min-w-0 rounded-xl border border-[#942E3A]/10 bg-white p-3 shadow-xs sm:rounded-2xl sm:p-4">
          <p className="truncate text-[9px] font-bold uppercase tracking-wide text-[#6B1F2A]/55 sm:text-[10px]">
            {isRtl ? "العملاء المتكررون" : "Repeat buyers"}
          </p>
          <p className="mt-0.5 font-playfair text-xl font-black text-[#942E3A] sm:mt-1 sm:text-2xl">
            {formatNumber(repeatBuyers)}
          </p>
        </div>
        <div className="min-w-0 rounded-xl border border-[#D8B46A]/35 bg-[#fff7df] p-3 shadow-xs sm:rounded-2xl sm:p-4">
          <p className="truncate text-[9px] font-bold uppercase tracking-wide text-[#6B1F2A]/55 sm:text-[10px]">
            {isRtl ? "إجمالي مشتريات العملاء" : "Customer value"}
          </p>
          <p className="mt-0.5 truncate font-playfair text-lg font-black text-[#942E3A] sm:mt-1 sm:text-2xl">
            {formatPrice(totalValue)}
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-xs sm:rounded-3xl sm:p-6">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[#D8B46A]" />
          <h2 className="font-playfair text-base sm:text-xl font-bold text-[#942E3A]">
            {isRtl ? "سجل العملاء" : "Customer history"}
          </h2>
        </div>

        {/* Desktop Table View */}
        <div className="mt-4 hidden overflow-x-auto sm:block">
          <table className={`w-full min-w-[650px] ${isRtl ? "text-right" : "text-left"} text-xs`}>
            <thead className="border-b border-[#942E3A]/10 text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
              <tr>
                <th className="pb-3">{isRtl ? "العميل" : "Customer"}</th>
                <th className="pb-3">{isRtl ? "رقم الهاتف" : "Phone"}</th>
                <th className="pb-3">{isRtl ? "عدد الطلبات" : "Orders"}</th>
                <th className="pb-3">{isRtl ? "آخر طلب" : "Last order"}</th>
                <th className={`pb-3 ${isRtl ? "text-left" : "text-right"}`}>{isRtl ? "إجمالي المشتريات" : "Lifetime value"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#942E3A]/8">
              {customers.map((customer) => (
                <tr key={customer.phone} className="hover:bg-[#FFF9EB]/60 transition">
                  <td className="py-3 font-bold text-[#942E3A]">
                    <Link
                      href={`/admin/customers/${encodeURIComponent(customer.phone)}`}
                      className="inline-block max-w-[220px] truncate hover:underline"
                    >
                      {customer.name}
                    </Link>
                  </td>
                  <td className="py-3 text-[#6B1F2A]">
                    <span dir="ltr" className="inline-flex items-center gap-1 whitespace-nowrap">
                      {customer.phone}
                      <AdminCopyButton value={customer.phone} />
                    </span>
                  </td>
                  <td className="py-3 text-[#6B1F2A]">
                    {formatNumber(customer.orders)}
                  </td>
                  <td className="py-3 whitespace-nowrap text-[#6B1F2A]/65">
                    {customer.lastOrder ? (
                      <span>{formatDate(customer.lastOrder)}</span>
                    ) : (
                      isRtl ? "لا توجد طلبات بعد" : "No orders yet"
                    )}
                  </td>
                  <td className={`py-3 whitespace-nowrap ${isRtl ? "text-left" : "text-right"} font-bold text-[#942E3A]`}>
                    {formatPrice(customer.spent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="mt-3 space-y-2.5 sm:hidden">
          {customers.map((customer) => (
            <div key={customer.phone} className="space-y-2 rounded-2xl border border-[#942E3A]/10 bg-[#FFF9EB]/40 p-3.5 text-xs">
              <div className="flex items-start justify-between gap-2 border-b border-[#942E3A]/10 pb-2">
                <div>
                  <Link
                    href={`/admin/customers/${encodeURIComponent(customer.phone)}`}
                    className="block font-bold text-[#942E3A] hover:underline text-xs"
                  >
                    {customer.name}
                  </Link>
                  <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-[#6B1F2A]/70">
                    <span dir="ltr">{customer.phone}</span>
                    <AdminCopyButton value={customer.phone} />
                  </span>
                </div>
                <span className="shrink-0 rounded-full border border-[#D8B46A]/30 bg-[#FFF9EB] px-2 py-0.5 text-[10px] font-bold text-[#942E3A]">
                  {formatNumber(customer.orders)} {isRtl ? "طلب" : customer.orders === 1 ? "order" : "orders"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-0.5">
                <span className="text-[10px] text-[#6B1F2A]/60">
                  {isRtl ? "آخر طلب: " : "Last: "}
                  {customer.lastOrder ? (
                    <span>{formatDate(customer.lastOrder)}</span>
                  ) : (
                    isRtl ? "لا توجد طلبات" : "No orders"
                  )}
                </span>
                <span className="font-bold text-[#942E3A] text-xs">
                  {formatPrice(customer.spent)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {customers.length === 0 && (
          <p className="py-12 text-center text-xs text-[#6B1F2A]/60">
            {isRtl ? "لا يوجد عملاء مسجلين حتى الآن." : "No customers yet."}
          </p>
        )}
      </section>
    </div>
  );
}
