export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  pending_payment: "Pending payment",
  paid: "Paid",
  confirmed: "Confirmed",
  preparing: "Preparing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

export const ORDER_STATUS_LABELS_AR: Record<string, string> = {
  pending: "قيد الانتظار",
  pending_payment: "بانتظار الدفع",
  paid: "تم الدفع",
  confirmed: "مؤكد",
  preparing: "جاري التجهيز",
  shipped: "تم الشحن",
  delivered: "تم التوصيل",
  cancelled: "ملغى",
  returned: "مسترجع",
};

export const COD_STATUS_PATH = ["pending", "confirmed", "preparing", "shipped", "delivered"];
export const PREPAID_STATUS_PATH = ["pending_payment", "paid", "preparing", "shipped", "delivered"];

export function isCashOnDelivery(paymentMethod?: string | null) {
  return !paymentMethod || paymentMethod === "cod" || paymentMethod === "cash_on_delivery";
}

export function getAllowedNextStatuses(status: string, paymentMethod?: string | null) {
  if (status === "cancelled" || status === "returned") return [];
  if (status === "delivered") return ["returned", "cancelled"];
  const path = isCashOnDelivery(paymentMethod) ? COD_STATUS_PATH : PREPAID_STATUS_PATH;
  const index = path.indexOf(status);
  const next = index >= 0 && index < path.length - 1 ? [path[index + 1]] : [];
  return [...next, "cancelled"];
}

export function getSelectableStatuses(status: string, paymentMethod?: string | null) {
  return [status, ...getAllowedNextStatuses(status, paymentMethod)];
}

export function getStatusLabel(status: string, lang: "ar" | "en" = "ar") {
  if (lang === "ar") {
    return ORDER_STATUS_LABELS_AR[status] || ORDER_STATUS_LABELS[status] || status;
  }
  return ORDER_STATUS_LABELS[status] || status;
}
