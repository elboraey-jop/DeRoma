"use client";

import Link from "next/link";
import { Eye, Mail, MessageCircle, Phone, ShoppingBag, UserRound } from "lucide-react";
import AdminBackButton from "@/components/AdminBackButton";
import AdminCopyButton from "@/components/AdminCopyButton";
import AdminCustomerModal, { CustomerFormValue } from "@/components/AdminCustomerModal";
import { getStatusLabel } from "@/lib/orderStatus";
import { useAdminI18n } from "@/providers/AdminI18nContext";

export type CustomerOrderData = {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  paymentMethod?: string | null;
  itemCount: number;
  totalPrice: number;
};

export type AdminCustomerDetailsViewProps = {
  customer: CustomerFormValue;
  orders: CustomerOrderData[];
  activeOrdersCount: number;
  lifetimeValue: number;
  itemCount: number;
};

function whatsappNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 11) return `20${digits.slice(1)}`;
  if (digits.startsWith("20")) return digits;
  return digits;
}

export default function AdminCustomerDetailsView({
  customer,
  orders,
  activeOrdersCount,
  lifetimeValue,
  itemCount,
}: AdminCustomerDetailsViewProps) {
  const { lang, formatPrice, formatNumber, formatDate } = useAdminI18n();
  const isRtl = lang === "ar";

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="mx-auto max-w-6xl space-y-4 text-start sm:space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <AdminBackButton fallbackHref="/admin/customers" />
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#D8B46A] sm:text-[10px]">
              {isRtl ? "بيانات العميل" : "Customer intelligence"}
            </p>
            <h1 className="mt-0.5 font-playfair text-2xl font-black sm:mt-1 sm:text-3xl">
              {customer.name}
            </h1>
            <p className="mt-1 hidden text-xs text-[#6B1F2A]/65 sm:block">
              {isRtl ? "الملف التعريفي للعميل وسجل الطلبات الكامل." : "Customer profile and complete order history."}
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <AdminCustomerModal customer={customer} />
        </div>
      </div>

      {/* Overview Cards */}
      <section className="grid gap-3 sm:gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-2xl bg-[#942E3A] p-4 text-[#FFF9EB] shadow-xs sm:rounded-3xl sm:p-8">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D8B46A] text-lg font-black text-[#942E3A] sm:h-14 sm:w-14 sm:rounded-2xl sm:text-xl">
              <UserRound className="h-5 w-5 sm:h-7 sm:w-7" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#D8B46A] sm:text-[10px]">
                {isRtl ? "العميل الرئيسي" : "Primary customer"}
              </p>
              <h2 className="mt-0.5 font-playfair text-xl font-black sm:text-3xl">
                {customer.name}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-3 sm:mt-2">
                <span className="inline-flex items-center gap-1">
                  <a
                    href={`tel:${customer.phone}`}
                    dir="ltr"
                    className="inline-flex items-center gap-1.5 text-xs text-white/80 transition hover:text-white sm:text-sm"
                  >
                    <Phone className="h-3.5 w-3.5 text-[#D8B46A]" />
                    {customer.phone}
                  </a>
                  <AdminCopyButton value={customer.phone} />
                </span>
                {customer.phone2 && (
                  <span className="inline-flex items-center gap-1">
                    <a
                      href={`tel:${customer.phone2}`}
                      dir="ltr"
                      className="inline-flex items-center gap-1.5 text-xs text-white/80 transition hover:text-white sm:text-sm"
                    >
                      <Phone className="h-3.5 w-3.5 text-[#D8B46A]" />
                      {customer.phone2}
                    </a>
                    <AdminCopyButton value={customer.phone2} />
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-2.5 text-xs sm:mt-7 sm:grid-cols-2 sm:gap-3">
            <div className="rounded-xl bg-white/10 p-3 sm:rounded-2xl sm:p-4">
              <p className="text-[11px] font-bold text-[#D8B46A] sm:text-xs">
                {isRtl ? "آخر عنوان" : "Latest address"}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-white/85 sm:mt-2 sm:text-xs">
                {customer.governorate || customer.city ? (
                  <>
                    {[customer.governorate, customer.city].filter(Boolean).join("، ")}
                    <br />
                  </>
                ) : null}
                {customer.address || (isRtl ? "لم يتم تسجيل عنوان تفصيلي" : "No address specified")}
              </p>
            </div>

            <div className="rounded-xl bg-white/10 p-3 sm:rounded-2xl sm:p-4">
              <p className="text-[11px] font-bold text-[#D8B46A] sm:text-xs">
                {isRtl ? "اختصارات التواصل" : "Contact shortcuts"}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
                <a
                  href={`tel:${customer.phone}`}
                  className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-white/20 sm:px-3 sm:py-1.5 sm:text-xs"
                >
                  <Phone className="h-3 w-3" />
                  <span>{isRtl ? "اتصال" : "Call"}</span>
                </a>
                <a
                  href={`https://wa.me/${whatsappNumber(customer.phone)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-white/20 sm:px-3 sm:py-1.5 sm:text-xs"
                >
                  <MessageCircle className="h-3 w-3 text-[#7CFFAA]" />
                  <span>{isRtl ? "واتساب" : "WhatsApp"}</span>
                </a>
                {Boolean(customer.email?.trim()) && (
                  <a
                    href={`mailto:${customer.email}?subject=DeRoma order`}
                    className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-white/20 sm:px-3 sm:py-1.5 sm:text-xs"
                  >
                    <Mail className="h-3 w-3" />
                    <span>{isRtl ? "بريد" : "Email"}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-3.5 shadow-xs sm:rounded-3xl sm:p-5">
            <ShoppingBag className="h-4 w-4 text-[#D8B46A] sm:h-5 sm:w-5" />
            <p className="mt-3 text-[9px] uppercase tracking-wide text-[#6B1F2A]/55 sm:mt-5 sm:text-[10px]">
              {isRtl ? "إجمالي الطلبات" : "Orders"}
            </p>
            <p className="mt-0.5 font-playfair text-xl font-black sm:text-3xl text-[#942E3A]">
              {formatNumber(activeOrdersCount)}
            </p>
          </div>

          <div className="rounded-2xl border border-[#D8B46A]/35 bg-[#fff7df] p-3.5 shadow-xs sm:rounded-3xl sm:p-5">
            <p className="text-[9px] uppercase tracking-wide text-[#6B1F2A]/55 sm:text-[10px]">
              {isRtl ? "القيمة الإجمالية" : "Lifetime value"}
            </p>
            <p className="mt-3 font-playfair text-base font-black text-[#942E3A] sm:text-xl">
              {formatPrice(lifetimeValue)}
            </p>
          </div>

          <div className="col-span-2 rounded-2xl border border-[#942E3A]/10 bg-white p-3.5 shadow-xs sm:rounded-3xl sm:p-5">
            <p className="text-[9px] uppercase tracking-wide text-[#6B1F2A]/55 sm:text-[10px]">
              {isRtl ? "إجمالي القطع المشتراة" : "Items purchased"}
            </p>
            <p className="mt-0.5 font-playfair text-xl font-black sm:text-3xl text-[#942E3A]">
              {formatNumber(itemCount)}
            </p>
          </div>
        </div>
      </section>

      {/* Orders Table Section */}
      <section className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-xs sm:rounded-3xl sm:p-7">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-[#D8B46A]" />
          <h2 className="font-playfair text-base font-bold sm:text-xl">
            {isRtl ? "سجل الطلبات" : "Order history"}
          </h2>
          <span className="rounded-full bg-[#FFF9EB] px-2 py-0.5 text-[10px] font-bold text-[#942E3A]">
            {formatNumber(orders.length)}
          </span>
        </div>

        {orders.length ? (
          <>
            {/* Desktop Table View */}
            <div className="mt-4 hidden sm:block overflow-x-auto">
              <table className="w-full min-w-[700px] text-xs">
                <thead className="border-b border-[#942E3A]/10 text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
                  <tr>
                    <th className={`w-[140px] px-4 pb-3 ${isRtl ? "text-right" : "text-left"}`}>
                      {isRtl ? "رقم الطلب" : "Order"}
                    </th>
                    <th className={`w-[150px] px-4 pb-3 ${isRtl ? "text-right" : "text-left"}`}>
                      {isRtl ? "التاريخ" : "Date"}
                    </th>
                    <th className={`w-[140px] px-4 pb-3 ${isRtl ? "text-right" : "text-left"}`}>
                      {isRtl ? "حالة الطلب" : "Status"}
                    </th>
                    <th className="w-[110px] px-4 pb-3 text-center">
                      {isRtl ? "عدد المنتجات" : "Items"}
                    </th>
                    <th className={`w-[130px] px-4 pb-3 ${isRtl ? "text-left" : "text-right"}`}>
                      {isRtl ? "الإجمالي" : "Total"}
                    </th>
                    <th className={`w-[90px] px-4 pb-3 ${isRtl ? "text-left" : "text-right"}`}>
                      {isRtl ? "الإجراء" : "Action"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#942E3A]/8">
                  {orders.map((order) => (
                    <tr key={order.id} className="transition hover:bg-[#FFF9EB]/40">
                      <td className={`px-4 py-3.5 font-bold text-[#942E3A] ${isRtl ? "text-right" : "text-left"}`}>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className={`px-4 py-3.5 whitespace-nowrap text-[#6B1F2A]/70 ${isRtl ? "text-right" : "text-left"}`}>
                        <span>{formatDate(order.createdAt)}</span>
                      </td>
                      <td className={`px-4 py-3.5 ${isRtl ? "text-right" : "text-left"}`}>
                        <span className="inline-flex items-center rounded-full bg-[#FFF9EB] border border-[#D8B46A]/30 px-2.5 py-1 text-[10px] font-bold text-[#942E3A]">
                          {getStatusLabel(order.status, lang)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-semibold text-[#6B1F2A]">
                        {formatNumber(order.itemCount)}
                      </td>
                      <td className={`px-4 py-3.5 font-bold text-[#942E3A] ${isRtl ? "text-left" : "text-right"}`}>
                        {formatPrice(order.totalPrice)}
                      </td>
                      <td className={`px-4 py-3.5 ${isRtl ? "text-left" : "text-right"}`}>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1 font-bold text-[#942E3A] hover:underline"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>{isRtl ? "عرض" : "View"}</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Order Cards View */}
            <div className="mt-3 space-y-2.5 sm:hidden">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="space-y-2.5 rounded-xl border border-[#942E3A]/10 bg-[#FFF9EB]/40 p-3.5 text-xs"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-[#942E3A]/10 pb-2">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-bold text-[#942E3A] hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                    <span className="rounded-full bg-[#FFF9EB] border border-[#D8B46A]/30 px-2.5 py-0.5 text-[9px] font-bold text-[#942E3A]">
                      {getStatusLabel(order.status, lang)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[10px] text-[#6B1F2A]/60">
                      <span>{formatDate(order.createdAt)}</span> · {formatNumber(order.itemCount)} {isRtl ? "قطع" : "items"}
                    </span>
                    <span className="font-bold text-[#942E3A] text-xs">
                      {formatPrice(order.totalPrice)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="py-8 text-center text-xs text-[#6B1F2A]/60">
            {isRtl ? "لا توجد طلبات لهذا العميل حتى الآن." : "No orders for this customer yet."}
          </p>
        )}
      </section>
    </div>
  );
}
