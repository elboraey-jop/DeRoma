type OrderAmounts = {
  subtotalPrice?: unknown;
  discountAmount?: unknown;
  totalPrice?: unknown;
  shippingCost?: unknown;
};

/**
 * Sales that belong to the store. Customer shipping money is passed through
 * to the courier and must not be included in store revenue or profit.
 * The fallback keeps older orders with missing subtotal fields usable.
 */
export function getOrderProductSales(order: OrderAmounts): number {
  const subtotal = Number(order.subtotalPrice || 0);
  const discount = Number(order.discountAmount || 0);

  if (subtotal !== 0 || discount !== 0) {
    return Math.max(0, subtotal - discount);
  }

  return Math.max(
    0,
    Number(order.totalPrice || 0) - Number(order.shippingCost || 0),
  );
}
