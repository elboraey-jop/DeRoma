"use client";

import { useCart } from "@/lib/cartStore";
import { formatCurrency } from "@/lib/utils";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, Truck, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

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

  const FREE_SHIPPING_THRESHOLD = 150;
  const progressToFreeShipping = Math.min(100, (cartTotal / FREE_SHIPPING_THRESHOLD) * 100);
  const amountLeftForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);

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
            className="fixed inset-0 z-50 bg-[#942E3A]/50 backdrop-blur-xs"
          />

          {/* Drawer Panel - Navy & Burgundy Theme */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
            className="fixed inset-y-0 right-0 z-50 flex h-full w-[82vw] max-w-[340px] sm:w-full sm:max-w-md flex-col bg-[#FFF9EB] shadow-2xl border-l border-[#D8B46A]/20 rounded-l-[1.75rem] overflow-hidden"
            dir="ltr"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#942E3A] bg-white px-5 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-[#942E3A]" />
                <h2 className="text-base font-bold text-[#942E3A] font-playfair">Shopping Bag</h2>
                <span className="rounded-full bg-[#942E3A] px-2.5 py-0.5 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="rounded-full p-2 text-[#942E3A] hover:bg-[#FFF9EB] hover:text-[#942E3A] transition-colors"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Free Shipping Progress Bar */}
            <div className="bg-[#FFF9EB] border-b border-[#942E3A] px-5 py-3 text-xs font-medium text-[#942E3A]">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#942E3A]" />
                  {amountLeftForFreeShipping > 0 ? (
                    <span>Add <b>{formatCurrency(amountLeftForFreeShipping)}</b> more for <b>Free Delivery</b></span>
                  ) : (
                    <span className="font-bold text-[#942E3A]">🎉 You unlocked Free Express Delivery!</span>
                  )}
                </div>
              </div>
              <div className="w-full h-1.5 bg-[#942E3A] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#942E3A] transition-all duration-500 rounded-full"
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center p-6">
                  <div className="rounded-full bg-[#FFF9EB] p-6 mb-4">
                    <ShoppingBag className="h-10 w-10 text-[#D8B46A]" />
                  </div>
                  <h3 className="text-base font-bold text-[#942E3A] font-playfair mb-1">Your bag is empty</h3>
                  <p className="text-xs text-[#D8B46A] max-w-[240px] mb-6">
                    Explore our handcrafted women's collection and pick your favorite pair.
                  </p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="inline-flex items-center justify-center rounded-full bg-[#942E3A] px-6 py-3 text-xs font-bold text-white hover:bg-[#802832] transition-all shadow-md"
                  >
                    Browse Boutique
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.variantId}
                    className="flex gap-4 bg-white p-3.5 rounded-2xl border border-[#D8B46A] shadow-xs"
                  >
                    {/* Item Image */}
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-[#FFF9EB] border border-[#D8B46A] flex items-center justify-center">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-1"
                        sizes="80px"
                      />
                    </div>

                    {/* Item Info */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-bold text-[#942E3A] leading-tight">
                            {item.name}
                          </h4>
                          <button
                            onClick={() => removeItem(item.variantId)}
                            className="text-[#D8B46A] hover:text-rose-600 transition-colors ml-2 p-1"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-1 flex gap-2 text-[11px] text-[#D8B46A]">
                          <span>Color: {item.color}</span>
                          <span>&bull;</span>
                          <span>Size: {item.size}</span>
                        </div>
                      </div>

                      {/* Quantity & Total Price */}
                      <div className="flex items-center justify-between mt-2 pt-1">
                        <span className="text-xs font-extrabold text-[#942E3A]">
                          {formatCurrency(item.price * item.quantity)}
                        </span>

                        <div className="flex items-center rounded-full border border-[#D8B46A] bg-[#FFF9EB] px-2 py-0.5">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="p-1 text-[#D8B46A] hover:text-[#942E3A]"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-[#942E3A]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="p-1 text-[#D8B46A] hover:text-[#942E3A]"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {cart.length > 0 && (
              <div className="border-t border-[#D8B46A] bg-white px-5 py-5 space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold text-[#D8B46A] uppercase tracking-wider">Subtotal</span>
                  <span className="text-xl font-extrabold text-[#942E3A]">
                    {formatCurrency(cartTotal)}
                  </span>
                </div>
                <p className="text-[11px] text-[#D8B46A]">
                  Taxes and doorstep try-on options calculated at checkout.
                </p>

                <div className="space-y-2 pt-1">
                  <Link
                    href="/checkout"
                    onClick={() => setCartOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#D8B46A] py-3.5 text-xs font-bold text-[#FFF9EB] shadow-md hover:bg-[#B8934A] active:scale-98 transition-all"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="w-full text-center py-2 text-xs font-semibold text-[#D8B46A] hover:text-[#942E3A] transition-colors"
                  >
                    Continue Shopping
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
