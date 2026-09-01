import React from "react";

export interface InvoiceItem {
  id: string;
  productName: string;
  color: string;
  size: string;
  quantity: number;
  price: number | string | { toString(): string };
  product?: {
    images?: string[];
  } | null;
}

export interface InvoiceOrderData {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerPhone2?: string | null;
  governorate: string;
  city: string;
  address: string;
  notes?: string | null;
  paymentMethod: string;
  paymentSenderPhone?: string | null;
  paymentProofStatus?: string;
  subtotalPrice: number | string | { toString(): string };
  discountAmount?: number | string | { toString(): string };
  shippingCost: number | string | { toString(): string };
  totalPrice: number | string | { toString(): string };
  status: string;
  createdAt: Date | string;
  items: InvoiceItem[];
}

interface AdminInvoiceDocumentProps {
  order: InvoiceOrderData;
  lang?: "ar" | "en";
  documentRef?: React.RefObject<HTMLDivElement | null>;
  itemImagesBase64?: Record<string, string>;
}

export default function AdminInvoiceDocument({
  order,
  lang = "ar",
  documentRef,
  itemImagesBase64 = {},
}: AdminInvoiceDocumentProps) {
  const isAr = lang === "ar";

  const formattedDate = isAr
    ? new Date(order.createdAt).toLocaleDateString("ar-EG", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date(order.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

  const getPaymentMethodLabel = (method: string) => {
    const m = method?.toLowerCase() || "";
    if (isAr) {
      if (m === "cod") return "الدفع عند الاستلام (COD)";
      if (m === "instapay") return "تحويل إنستاباي (InstaPay)";
      if (m === "wallet") return "محفظة إلكترونية (Wallet)";
      if (m === "card") return "بطاقة بنكية / فيزا";
      return method || "الدفع عند الاستلام";
    } else {
      if (m === "cod") return "Cash on Delivery (COD)";
      if (m === "instapay") return "InstaPay Transfer";
      if (m === "wallet") return "Mobile Wallet";
      if (m === "card") return "Credit / Debit Card";
      return method?.toUpperCase() || "COD";
    }
  };

  const formatPrice = (amount: number) => {
    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

    return isAr ? `${formatted} ج.م` : `EGP ${formatted}`;
  };

  const subtotal = Number(order.subtotalPrice || 0);
  const discount = Number(order.discountAmount || 0);
  const shipping = Number(order.shippingCost || 0);
  const total = Number(order.totalPrice || 0);

  return (
    <div
      ref={documentRef}
      id="deroma-invoice-document"
      dir={isAr ? "rtl" : "ltr"}
      style={{ width: "760px", minHeight: "960px" }}
      className={`relative mx-auto flex flex-col justify-between bg-[#FFFDF9] p-8 text-[#2D264B] antialiased box-border border border-[#8B7CC7]/20 shadow-sm rounded-3xl ${
        isAr ? "font-sans text-right" : "font-sans text-left"
      }`}
    >
      <div>
        {/* HERO HEADER BANNER */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#7C69BA] via-[#715EA8] to-[#58488E] p-6 text-white shadow-md border border-[#FFEBBF]/30">
          {/* Decorative background glow */}
          <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-[#FFEBBF]/15 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between">
            {/* Brand details */}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-3xl font-black tracking-wider text-[#FFEBBF]">
                  DeRoma
                </span>
              </div>
              <p className="mt-1 text-[11px] font-bold tracking-[0.2em] uppercase text-[#EAE5F8]">
                {isAr ? "أحذية وأزياء راقية" : "LUXURY FOOTWEAR & FASHION"}
              </p>
            </div>

            {/* Invoice meta */}
            <div className={isAr ? "text-left" : "text-right"}>
              <h1 className="text-2xl font-black tracking-widest text-white uppercase">
                {isAr ? "فاتورة شراء" : "INVOICE"}
              </h1>
              <p className="mt-1 text-sm font-bold tracking-wide text-[#FFEBBF] font-mono">
                #{order.orderNumber}
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-[#EAE5F8]">
                {isAr ? `التاريخ: ${formattedDate}` : `Date: ${formattedDate}`}
              </p>
            </div>
          </div>
        </div>

        {/* BILLED TO / CUSTOMER INFORMATION */}
        <div className="mt-7">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#58488E]">
            {isAr ? "بيانات العميل:" : "BILLED TO:"}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-2.5 rounded-2xl bg-[#F8F5FF] border border-[#E8E2F4] p-4 text-xs">
            <div className="flex items-baseline gap-2">
              <span className="w-24 shrink-0 font-bold text-[#8277A8]">
                {isAr ? "الاسم:" : "Name:"}
              </span>
              <span className="font-bold text-[#2D264B] text-sm">{order.customerName}</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="w-24 shrink-0 font-bold text-[#8277A8]">
                {isAr ? "طريقة الدفع:" : "Payment:"}
              </span>
              <span className="font-semibold text-[#2D264B]">
                {getPaymentMethodLabel(order.paymentMethod)}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="w-24 shrink-0 font-bold text-[#8277A8]">
                {isAr ? "رقم الهاتف:" : "Phone:"}
              </span>
              <span className="font-semibold text-[#2D264B] font-mono">{order.customerPhone}</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="w-24 shrink-0 font-bold text-[#8277A8]">
                {isAr ? "هاتف بديل:" : "Alt Phone:"}
              </span>
              <span className="font-semibold text-[#2D264B] font-mono">
                {order.customerPhone2 || "—"}
              </span>
            </div>

            <div className="col-span-2 flex items-baseline gap-2 border-t border-[#E8E2F4] pt-2">
              <span className="w-24 shrink-0 font-bold text-[#8277A8]">
                {isAr ? "عنوان الشحن:" : "Address:"}
              </span>
              <span className="font-medium text-[#2D264B] leading-relaxed">
                {[order.governorate, order.city, order.address].filter(Boolean).join(" - ")}
              </span>
            </div>

            {order.notes ? (
              <div className="col-span-2 flex items-baseline gap-2 border-t border-[#E8E2F4] pt-2">
                <span className="w-24 shrink-0 font-bold text-[#8277A8]">
                  {isAr ? "ملاحظات:" : "Notes:"}
                </span>
                <span className="font-medium text-[#58488E] italic">{order.notes}</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* ITEMS TABLE */}
        <div className="mt-7">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-[#8B7CC7]/25 pb-2 text-[11px] font-black uppercase tracking-wider text-[#58488E]">
                <th className={`pb-3 w-14 ${isAr ? "text-right" : "text-left"}`}>
                  {isAr ? "الصورة" : "IMAGE"}
                </th>
                <th className={`pb-3 ${isAr ? "text-right" : "text-left"}`}>
                  {isAr ? "المنتج" : "ITEM"}
                </th>
                <th className="pb-3 text-center w-16">{isAr ? "الكمية" : "QTY"}</th>
                <th className={`pb-3 w-28 ${isAr ? "text-left" : "text-right"}`}>
                  {isAr ? "السعر" : "PRICE"}
                </th>
                <th className={`pb-3 w-28 ${isAr ? "text-left" : "text-right"}`}>
                  {isAr ? "الإجمالي" : "TOTAL"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2F4]">
              {order.items.map((item) => {
                const itemImage =
                  itemImagesBase64[item.id] ||
                  (item.product?.images && item.product.images[0]) ||
                  null;

                const itemPriceNum = Number(item.price || 0);
                const lineTotal = itemPriceNum * item.quantity;

                return (
                  <tr key={item.id} className="align-middle">
                    <td className={`py-3.5 ${isAr ? "pl-3" : "pr-3"}`}>
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[#8B7CC7]/20 bg-[#F8F5FF] flex items-center justify-center">
                        {itemImage ? (
                          <img
                            src={itemImage}
                            alt={item.productName}
                            crossOrigin="anonymous"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] font-bold text-[#8B7CC7]">DeRoma</span>
                        )}
                      </div>
                    </td>
                    <td className={`py-3.5 ${isAr ? "pl-4 text-right" : "pr-4 text-left"}`}>
                      <p className="font-bold text-[#2D264B] text-sm">{item.productName}</p>
                      <p className="mt-0.5 text-[11px] text-[#8277A8] font-medium">
                        {isAr ? (
                          <>
                            اللون: {item.color} &nbsp;·&nbsp; المقاس: {item.size}
                          </>
                        ) : (
                          <>
                            Color: {item.color} &nbsp;·&nbsp; Size: {item.size}
                          </>
                        )}
                      </p>
                    </td>
                    <td className="py-3.5 text-center font-bold text-[#58488E] text-sm">
                      {item.quantity}
                    </td>
                    <td
                      className={`py-3.5 font-medium text-[#2D264B]/80 text-xs ${
                        isAr ? "text-left" : "text-right"
                      }`}
                    >
                      {formatPrice(itemPriceNum)}
                    </td>
                    <td
                      className={`py-3.5 font-bold text-[#2D264B] text-sm ${
                        isAr ? "text-left" : "text-right"
                      }`}
                    >
                      {formatPrice(lineTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* FINANCIAL TOTALS SECTION */}
        <div className={`mt-6 flex ${isAr ? "justify-start" : "justify-end"}`}>
          <div className="w-72 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-[#E8E2F4] text-[#8277A8] font-semibold">
              <span>{isAr ? "المجموع الفرعي" : "Subtotal"}</span>
              <span className="text-[#2D264B] font-bold">{formatPrice(subtotal)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between py-1 border-b border-[#E8E2F4] text-emerald-700 font-semibold">
                <span>{isAr ? "الخصم" : "Discount"}</span>
                <span className="font-bold">-{formatPrice(discount)}</span>
              </div>
            )}

            <div className="flex justify-between py-1 border-b border-[#E8E2F4] text-[#8277A8] font-semibold">
              <span>{isAr ? "مصاريف الشحن" : "Shipping"}</span>
              <span className="text-[#2D264B] font-bold">{formatPrice(shipping)}</span>
            </div>

            {/* GRAND TOTAL PILL */}
            <div className="mt-3 flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#58488E] to-[#453775] px-5 py-3.5 text-white shadow-md border border-[#FFEBBF]/30">
              <span className="text-base font-bold tracking-wide">
                {isAr ? "الإجمالي الكلي" : "Total"}
              </span>
              <span className="text-xl font-black tracking-tight text-[#FFEBBF]">
                {formatPrice(total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER & POLICY NOTE */}
      <div className="mt-10 border-t border-[#E8E2F4] pt-5 text-center text-[#2D264B]">
        <p className="font-serif text-base font-bold text-[#58488E]">
          {isAr ? "شكراً لتسوقكم مع DeRoma!" : "Thank you for shopping with DeRoma!"}
        </p>
        <p className="mt-1 text-[11px] font-medium text-[#8277A8]">
          {isAr
            ? "يرجى العلم أن سياسة الاستبدال والاسترجاع تسري خلال 14 يوماً من تاريخ الاستلام في حال وجود أي مشكلة."
            : "Please note that a 14-day exchange and return policy applies to all orders in case of any issues."}
        </p>
        <p className="mt-0.5 text-[10px] text-[#8277A8]/80">
          {isAr
            ? "لأي استفسارات أو للمساعدة، يرجى التواصل معنا عبر الواتساب."
            : "For inquiries or support, please contact us on WhatsApp."}
        </p>
      </div>
    </div>
  );
}
