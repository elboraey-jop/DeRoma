export type AnalyticsCartItem = {
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  quantity?: number;
  category?: string;
  color?: string;
  size?: string;
};

type EcommercePayload = {
  currency?: string;
  value?: number;
  items?: AnalyticsCartItem[];
  item_list_name?: string;
  transaction_id?: string;
  shipping?: number;
  coupon?: string;
  payment_type?: string;
  shipping_tier?: string;
  event_id?: string;
  google_enhanced_conversion_data?: Record<string, unknown>;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

const DEFAULT_CURRENCY = "EGP";

function toGaItems(items: AnalyticsCartItem[] = []) {
  return items.map((item) => ({
    item_id: item.productId,
    item_name: item.name,
    item_variant: item.variantId,
    item_category: item.category,
    item_color: item.color,
    item_size: item.size,
    price: item.price,
    quantity: item.quantity ?? 1,
  }));
}

function toMetaContents(items: AnalyticsCartItem[] = []) {
  return items.map((item) => ({
    id: item.productId,
    quantity: item.quantity ?? 1,
    item_price: item.price,
  }));
}

function trackClarityEvent(name: string, payload?: Record<string, string | number | boolean | undefined>) {
  if (typeof window === "undefined" || !window.clarity) return;

  window.clarity("event", name);

  if (!payload) return;
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined) {
      window.clarity?.("set", key, String(value));
    }
  });
}

function trackGaEvent(name: string, payload: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("event", name, payload);
}

function trackMetaEvent(name: string, payload: Record<string, unknown>, eventId?: string) {
  if (typeof window === "undefined" || !window.fbq) return;

  if (eventId) {
    window.fbq("track", name, payload, { eventID: eventId });
  } else {
    window.fbq("track", name, payload);
  }
}

function setGoogleUserData(payload: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("set", "user_data", payload);
}

export function trackViewItem(item: AnalyticsCartItem) {
  const value = item.price * (item.quantity ?? 1);
  trackGaEvent("view_item", {
    currency: DEFAULT_CURRENCY,
    value,
    items: toGaItems([item]),
  });
  trackMetaEvent("ViewContent", {
    content_ids: [item.productId],
    content_name: item.name,
    content_type: "product",
    contents: toMetaContents([item]),
    currency: DEFAULT_CURRENCY,
    value,
  });
  trackClarityEvent("view_item", { product_id: item.productId, value });
}

export function trackSelectItem(item: AnalyticsCartItem, itemListName = "Product list") {
  trackGaEvent("select_item", {
    item_list_name: itemListName,
    items: toGaItems([item]),
  });
  trackClarityEvent("select_item", { product_id: item.productId, list: itemListName });
}

export function trackViewItemList(item: AnalyticsCartItem, itemListName = "Product list") {
  trackGaEvent("view_item_list", {
    item_list_name: itemListName,
    items: toGaItems([item]),
  });
  trackClarityEvent("view_item_list", { product_id: item.productId, list: itemListName });
}

export function trackAddToCart(item: AnalyticsCartItem) {
  const value = item.price * (item.quantity ?? 1);
  trackGaEvent("add_to_cart", {
    currency: DEFAULT_CURRENCY,
    value,
    items: toGaItems([item]),
  });
  trackMetaEvent("AddToCart", {
    content_ids: [item.productId],
    content_name: item.name,
    content_type: "product",
    contents: toMetaContents([item]),
    currency: DEFAULT_CURRENCY,
    value,
  });
  trackClarityEvent("add_to_cart", { product_id: item.productId, value });
}

export function trackRemoveFromCart(item: AnalyticsCartItem) {
  const value = item.price * (item.quantity ?? 1);
  trackGaEvent("remove_from_cart", {
    currency: DEFAULT_CURRENCY,
    value,
    items: toGaItems([item]),
  });
  trackClarityEvent("remove_from_cart", { product_id: item.productId, value });
}

export function trackAddToWishlist(item: AnalyticsCartItem) {
  const value = item.price * (item.quantity ?? 1);
  trackGaEvent("add_to_wishlist", {
    currency: DEFAULT_CURRENCY,
    value,
    items: toGaItems([item]),
  });
  trackMetaEvent("AddToWishlist", {
    content_ids: [item.productId],
    content_name: item.name,
    content_type: "product",
    contents: toMetaContents([item]),
    currency: DEFAULT_CURRENCY,
    value,
  });
  trackClarityEvent("add_to_wishlist", { product_id: item.productId, value });
}

export function trackBeginCheckout(payload: EcommercePayload) {
  const items = payload.items ?? [];
  trackGaEvent("begin_checkout", {
    currency: payload.currency ?? DEFAULT_CURRENCY,
    value: payload.value,
    coupon: payload.coupon,
    items: toGaItems(items),
  });
  trackMetaEvent("InitiateCheckout", {
    content_ids: items.map((item) => item.productId),
    content_type: "product",
    contents: toMetaContents(items),
    currency: payload.currency ?? DEFAULT_CURRENCY,
    num_items: items.reduce((sum, item) => sum + (item.quantity ?? 1), 0),
    value: payload.value,
  });
  trackClarityEvent("begin_checkout", { value: payload.value, items: items.length });
}

export function trackAddShippingInfo(payload: EcommercePayload) {
  trackGaEvent("add_shipping_info", {
    currency: payload.currency ?? DEFAULT_CURRENCY,
    value: payload.value,
    coupon: payload.coupon,
    shipping_tier: payload.shipping_tier,
    items: toGaItems(payload.items),
  });
  trackClarityEvent("add_shipping_info", {
    value: payload.value,
    shipping_tier: payload.shipping_tier,
  });
}

export function trackAddPaymentInfo(payload: EcommercePayload) {
  trackGaEvent("add_payment_info", {
    currency: payload.currency ?? DEFAULT_CURRENCY,
    value: payload.value,
    coupon: payload.coupon,
    payment_type: payload.payment_type,
    items: toGaItems(payload.items),
  });
  trackClarityEvent("add_payment_info", {
    value: payload.value,
    payment_type: payload.payment_type,
  });
}

export function trackPurchase(payload: EcommercePayload) {
  const items = payload.items ?? [];
  trackGaEvent("purchase", {
    transaction_id: payload.transaction_id,
    currency: payload.currency ?? DEFAULT_CURRENCY,
    value: payload.value,
    shipping: payload.shipping,
    coupon: payload.coupon,
    items: toGaItems(items),
  });
  if (payload.google_enhanced_conversion_data) {
    setGoogleUserData(payload.google_enhanced_conversion_data);
  }

  trackMetaEvent("Purchase", {
    content_ids: items.map((item) => item.productId),
    content_type: "product",
    contents: toMetaContents(items),
    currency: payload.currency ?? DEFAULT_CURRENCY,
    num_items: items.reduce((sum, item) => sum + (item.quantity ?? 1), 0),
    value: payload.value,
  }, payload.event_id);

  const adsConversionId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID;
  const adsPurchaseLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL;
  if (adsConversionId && adsPurchaseLabel) {
    trackGaEvent("conversion", {
      send_to: `${adsConversionId}/${adsPurchaseLabel}`,
      value: payload.value,
      currency: payload.currency ?? DEFAULT_CURRENCY,
      transaction_id: payload.transaction_id,
    });
  }
  trackClarityEvent("purchase", {
    order_number: payload.transaction_id,
    value: payload.value,
    shipping: payload.shipping,
  });
}

export function trackPromoCodeApplied(code: string, discount: number) {
  trackGaEvent("select_promotion", {
    promotion_id: code,
    promotion_name: code,
  });
  trackClarityEvent("promo_code_applied", { code, discount });
}

export function trackCheckoutError(reason: string, step = "checkout") {
  trackGaEvent("checkout_error", {
    checkout_step: step,
    error_reason: reason,
  });
  trackClarityEvent("checkout_error", { step, reason });
}
