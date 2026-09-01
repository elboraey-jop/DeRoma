"use client";

import React, { useState } from "react";
import { FileText } from "lucide-react";
import AdminInvoiceModal from "@/components/AdminInvoiceModal";
import { InvoiceOrderData } from "@/components/AdminInvoiceDocument";
import { useAdminI18n } from "@/providers/AdminI18nContext";

interface AdminInvoiceButtonProps {
  order: any; // Order data from prisma query
}

export default function AdminInvoiceButton({ order }: AdminInvoiceButtonProps) {
  const { lang } = useAdminI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Normalize order data for the invoice document
  const invoiceData: InvoiceOrderData = {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerPhone2: order.customerPhone2 || null,
    governorate: order.governorate,
    city: order.city,
    address: order.address,
    notes: order.notes || null,
    paymentMethod: order.paymentMethod,
    paymentSenderPhone: order.paymentSenderPhone || null,
    paymentProofStatus: order.paymentProofStatus,
    subtotalPrice: Number(order.subtotalPrice),
    discountAmount: Number(order.discountAmount || 0),
    shippingCost: Number(order.shippingCost),
    totalPrice: Number(order.totalPrice),
    status: order.status,
    createdAt: order.createdAt,
    items: (order.items || []).map((item: any) => ({
      id: item.id,
      productName: item.productName,
      color: item.color,
      size: item.size,
      quantity: item.quantity,
      price: Number(item.price),
      product: item.product
        ? {
            images: item.product.images || [],
          }
        : null,
    })),
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-[#7C69BA] border border-[#6D5AA8] px-3.5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#6C59A7] active:scale-95 shrink-0 cursor-pointer"
        title={lang === "ar" ? "تصدير وتحميل الفاتورة" : "Export & download invoice"}
      >
        <FileText className="h-4 w-4 text-white" />
        <span>{lang === "ar" ? "الفاتورة" : "Invoice"}</span>
      </button>

      <AdminInvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={invoiceData}
      />
    </>
  );
}
