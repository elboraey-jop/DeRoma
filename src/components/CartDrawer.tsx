"use client";

import { useCart } from "@/lib/cartStore";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft, Truck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useStoreI18n } from "@/providers/StoreI18nContext";
import { cn } from "@/lib/utils";

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setCartOpen,
    updateQuantity,
    removeItem,
    cartTotal,
    cartCount,
  } = useCart();
  const { t, formatPrice, formatNumber, dir } = useStoreI18n();

  const [shippingSettings, setShippingSettings] = useState<{
    freeShippingEnabled: boolean;
    freeShippingThreshold: number | null;
  } | null>(null);

  useEffect(() => {
    fetch("/api/shipping")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings) {
          setShippingSettings(data.settings);
        }
      })
      .catch(() => null);
  }, [isCartOpen]);

  const isFreeShippingActive = Boolean(
    shippingSettings?.freeShippingEnabled &&
      shippingSettings.freeShippingThreshold !== null &&
      shippingSettings.freeShippingThreshold > 0
  );
  const freeShippingThreshold = shippingSettings?.freeShippingThreshold || 0;
  const progressToFreeShipping = freeShippingThreshold > 0
    ? Math.min(100, (cartTotal / freeShippingThreshold) * 100)
    : 0;
  const amountLeftForFreeShipping = freeShippingThreshold > 0
    ? Math.max(0, freeShippingThreshold - cartTotal)
    : 0;

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  const slideX = dir === "rtl" ? "-100%" : "100%";

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 z-[70] bg-black/40"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: slideX }}
            animate={{ x: 0 }}
            exit={{ x: slideX }}
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
            className={cn(
              "fixed inset-y-0 z-[75] flex h-full w-[85vw] max-w-[340px] sm:w-full sm:max-w-md flex-col bg-[#FFF9EB] shadow-2xl overflow-hidden",
              dir === "rtl" ? "left-0 rounded-r-[1.75rem]" : "right-0 rounded-l-[1.75rem]"
            )}
            dir={dir}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#D8B46A]/40 bg-[#942E3A] px-5 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-[#D8B46A]" />
                <h2 className="text-base font-bold text-[#FFF9EB] font-playfair">{t("cart.title")}</h2>
                <span className="rounded-full bg-[#D8B46A] px-2.5 py-0.5 text-[10px] font-bold text-[#942E3A]">
                  {formatNumber(cartCount)}
                </span>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="rounded-full p-2 text-[#FFF9EB] hover:bg-white/10 hover:text-[#D8B46A] transition-colors"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Free Shipping Progress Bar */}
            {isFreeShippingActive && (
              <div className="bg-[#F2E7D5]/60 border-b border-[#D8B46A]/40 px-5 py-3.5 text-xs font-medium text-[#942E3A]">
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Truck className="w-4 h-4 text-[#D8B46A] shrink-0" />
                    {amountLeftForFreeShipping > 0 ? (
                      <span className="truncate">
                        {t("cart.awayFromFreeShipping")}: <b>{formatPrice(amountLeftForFreeShipping)}</b>
                      </span>
                    ) : (
                      <span className="font-bold text-emerald-700 truncate">{t("cart.freeShippingQualified")}</span>
                    )}
                  </div>
                  <span className="text-[10px] font-extrabold text-[#942E3A]/80 shrink-0">
                    {formatPrice(freeShippingThreshold)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#942E3A]/15 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#D8B46A] transition-all duration-500 rounded-full"
                    style={{ width: `${progressToFreeShipping}%` }}
                  />
                </div>
              </div>
            )}

            {/* Cart Items List */}
            <div className="hide-scrollbar flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center p-6">
                  <div className="rounded-full bg-[#F2E7D5] p-6 mb-4">
                    <ShoppingBag className="h-10 w-10 text-[#D8B46A]" />
                  </div>
                  <h3 className="text-base font-bold text-[#942E3A] font-playfair mb-1">{t("cart.emptyTitle")}</h3>
                  <p className="text-xs text-[#D8B46A] max-w-[240px] mb-6">
                    {t("cart.emptyDesc")}
                  </p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="inline-flex items-center justify-center rounded-full bg-[#942E3A] px-6 py-3 text-xs font-bold text-white hover:bg-[#802832] transition-all shadow-md"
                  >
                    {t("cart.startShopping")}
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.variantId}
                    className="flex gap-3 bg-white/90 p-3 rounded-[1.35rem] border border-[#D8B46A]/50 shadow-[0_8px_20px_rgba(148,46,58,0.06)]"
                  >
                    {/* Item Image */}
                    <div className="relative h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-[1rem] bg-[#F2E7D5]/60 border border-[#D8B46A]/60 flex items-center justify-center">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover p-0"
                        sizes="72px"
                      />
                    </div>

                    {/* Item Info */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-playfair text-[12px] font-extrabold text-[#942E3A] leading-tight">
                            {item.name}
                          </h4>
                          <button
                            onClick={() => removeItem(item.variantId)}
                            className="text-[#D8B46A] hover:text-rose-600 transition-colors ml-2 rtl:ml-0 rtl:mr-2 p-1"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-1 flex flex-wrap gap-x-1.5 text-[10px] text-[#D8B46A]">
                          <span>{t("cart.color")}: {item.color}</span>
                          <span>&bull;</span>
                          <span>{t("cart.size")}: <span>{formatNumber(item.size)}</span></span>
                        </div>
                      </div>

                      {/* Quantity & Total Price */}
                      <div className="flex items-center justify-between mt-2 pt-1">
                        <span className="text-sm font-extrabold text-[#942E3A]">
                          {formatPrice(item.price * item.quantity)}
                        </span>

                        <div className="flex items-center rounded-full border border-[#D8B46A]/70 bg-[#FFF9EB] px-1.5 py-0.5">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="p-1 text-[#D8B46A] hover:text-[#942E3A]"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-[#942E3A]">
                            {formatNumber(item.quantity)}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            disabled={typeof item.availableStock === "number" && item.quantity >= item.availableStock}
                            className="p-1 text-[#D8B46A] hover:text-[#942E3A] disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        {typeof item.availableStock === "number" && (
                          <span className="text-[9px] font-semibold text-[#6B1F2A]/55">
                            {formatNumber(item.availableStock)} {dir === "rtl" ? "متبقي" : "left"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {cart.length > 0 && (
              <div className="border-t border-[#D8B46A]/40 bg-white/95 px-5 py-4 space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] font-bold text-[#D8B46A] uppercase tracking-[0.16em]">
                    {t("cart.subtotal")}
                  </span>
                  <span className="text-xl font-extrabold text-[#942E3A] leading-none">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
                <p className="text-[10px]">
                  {isFreeShippingActive && amountLeftForFreeShipping === 0 ? (
                    <span className="font-bold text-emerald-700">{t("cart.freeShippingQualified")}</span>
                  ) : (
                    <span className="text-[#D8B46A]">{t("cart.calculatedAtCheckout")}</span>
                  )}
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href="/checkout"
                    onClick={() => setCartOpen(false)}
                    className="order-2 flex flex-[1.8] items-center justify-center gap-2 rounded-full bg-[#D8B46A] py-3 text-xs font-bold text-[#FFF9EB] shadow-[0_8px_16px_rgba(216,180,106,0.25)] hover:bg-[#B8934A] active:scale-98 transition-all"
                  >
                    <span>{t("cart.checkoutButton")}</span>
                    {dir === "rtl" ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                  </Link>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="order-1 flex flex-[1.2] items-center justify-center whitespace-nowrap rounded-full border border-[#D8B46A] py-3 text-[10px] font-semibold text-[#D8B46A] hover:border-[#942E3A] hover:text-[#942E3A] transition-colors sm:text-xs"
                  >
                    {t("nav.shop")}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
