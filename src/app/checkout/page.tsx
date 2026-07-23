"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/lib/cartStore";
import { formatCurrency } from "@/lib/utils";
import { createOrder } from "@/app/actions";
import { useRouter } from "next/navigation";
import { ShoppingBag, ArrowRight, Truck, CreditCard, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface GovItem {
  en: string;
  ar: string;
  fee: number;
}

const GOVERNORATES: GovItem[] = [
  { en: "Cairo", ar: "القاهرة", fee: 50 },
  { en: "Giza", ar: "الجيزة", fee: 50 },
  { en: "Alexandria", ar: "الإسكندرية", fee: 60 },
  { en: "Qalyubia", ar: "القليوبية", fee: 70 },
  { en: "Sharqia", ar: "الشرقية", fee: 70 },
  { en: "Dakahlia", ar: "الدقهلية", fee: 70 },
  { en: "Monufia", ar: "المنوفية", fee: 70 },
  { en: "Gharbia", ar: "الغربية", fee: 70 },
  { en: "Kafr El Sheikh", ar: "كفر الشيخ", fee: 70 },
  { en: "Damietta", ar: "دمياط", fee: 70 },
  { en: "Port Said", ar: "بورسعيد", fee: 70 },
  { en: "Ismailia", ar: "الإسماعيلية", fee: 70 },
  { en: "Suez", ar: "السويس", fee: 70 },
  { en: "Fayoum", ar: "الفيوم", fee: 90 },
  { en: "Beni Suef", ar: "بني سويف", fee: 90 },
  { en: "Minya", ar: "المنيا", fee: 90 },
  { en: "Asyut", ar: "أسيوط", fee: 90 },
  { en: "Sohag", ar: "سوهاج", fee: 90 },
  { en: "Qena", ar: "قنا", fee: 90 },
  { en: "Luxor", ar: "الأقصر", fee: 90 },
  { en: "Aswan", ar: "أسوان", fee: 90 },
  { en: "Red Sea", ar: "البحر الأحمر", fee: 120 },
  { en: "New Valley", ar: "الوادي الجديد", fee: 120 },
  { en: "Matrouh", ar: "مطروح", fee: 120 },
  { en: "North Sinai", ar: "شمال سيناء", fee: 120 },
  { en: "South Sinai", ar: "جنوب سيناء", fee: 120 },
];

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phone2, setPhone2] = useState("");
  const [selectedGovEn, setSelectedGovEn] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // Find selected governorate object
  const activeGov = GOVERNORATES.find((g) => g.en === selectedGovEn);
  const shippingCost = activeGov ? activeGov.fee : 0;
  const grandTotal = cartTotal + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !phone || !selectedGovEn || !city || !address) {
      setError("Please fill in all required fields marked with *.");
      return;
    }

    if (cart.length === 0) {
      setError("Your bag is empty. Please add items to checkout.");
      return;
    }

    setLoading(true);

    try {
      const itemsInput = cart.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      }));

      // Send the Arabic governorate name to the backend to match shipping fees logic
      const govArabicName = activeGov?.ar || "";

      const res = await createOrder({
        customerName: name,
        customerPhone: phone,
        customerPhone2: phone2,
        governorate: govArabicName, // Sent in Arabic to maintain DB consistency
        city,
        address,
        notes,
        items: itemsInput,
      });

      if (res.success && res.orderNumber) {
        clearCart();
        router.push(
          `/checkout/success?orderNumber=${res.orderNumber}&name=${encodeURIComponent(
            name
          )}&total=${grandTotal}&shipping=${shippingCost}&gov=${encodeURIComponent(
            selectedGovEn
          )}`
        );
      } else {
        setError(res.error || "An unexpected error occurred. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Server connection failed. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center space-y-6" dir="ltr">
        <div className="rounded-full bg-purple-55 bg-purple-50 p-8 w-fit mx-auto">
          <ShoppingBag className="h-16 w-16 text-indigo-950/60" />
        </div>
        <h1 className="text-xl font-bold text-indigo-950 font-playfair">Your Shopping Bag is Empty</h1>
        <p className="text-sm text-stone-500 max-w-sm mx-auto font-sans">
          You haven't added any products to checkout yet. Browse the shop and find your perfect pair.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center gap-x-2 rounded-full bg-indigo-950 px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-900"
        >
          <ArrowRight className="h-4 w-4" />
          <span>Go to Shop</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8" dir="ltr">
      {/* Page Title */}
      <div className="mb-8 text-left">
        <h1 className="text-2xl font-black text-indigo-950 font-playfair">Quick Checkout</h1>
        <p className="text-xs text-stone-505 text-stone-500 mt-1">Please enter your delivery details carefully to ensure fast shipping.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 border border-red-100 p-4 text-sm font-bold text-red-650 text-left">
          ⚠️ {error}
        </div>
      )}

      {/* Checkout layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form panel */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white p-6 rounded-3xl border border-purple-100/60 shadow-sm space-y-6 text-left">
          <h2 className="text-base font-bold text-indigo-955 border-b border-purple-50 pb-2 font-playfair">Shipping Details</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Yasmin Mohamed"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-sm text-indigo-950 placeholder-stone-400 outline-none focus:border-indigo-950 focus:bg-white transition-all font-sans"
              />
            </div>

            {/* Phone Number 1 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Primary Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="e.g. 01012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-sm text-indigo-950 placeholder-stone-400 outline-none focus:border-indigo-950 focus:bg-white transition-all font-sans"
              />
            </div>

            {/* Phone Number 2 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Alternative Phone Number (Optional)</label>
              <input
                type="tel"
                placeholder="Alternative number in case primary is busy"
                value={phone2}
                onChange={(e) => setPhone2(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-sm text-indigo-950 placeholder-stone-400 outline-none focus:border-indigo-950 focus:bg-white transition-all font-sans"
              />
            </div>

            {/* Governorate Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Governorate *</label>
              <select
                required
                value={selectedGovEn}
                onChange={(e) => setSelectedGovEn(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-sm text-indigo-950 outline-none focus:border-indigo-950 focus:bg-white transition-all cursor-pointer appearance-none"
              >
                <option value="" disabled>-- Select Governorate --</option>
                {GOVERNORATES.map((gov) => (
                  <option key={gov.en} value={gov.en}>
                    {gov.en} (+{gov.fee} EGP shipping)
                  </option>
                ))}
              </select>
            </div>

            {/* City / Area */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-stone-700">City / District / Area *</label>
              <input
                type="text"
                required
                placeholder="e.g. Fifth Settlement, University District, Moharam Bek"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-sm text-indigo-950 placeholder-stone-400 outline-none focus:border-indigo-950 focus:bg-white transition-all font-sans"
              />
            </div>

            {/* Detailed Address */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-stone-700">Detailed Address (Street, Building no, Apt no) *</label>
              <textarea
                required
                rows={3}
                placeholder="Please enter your detailed shipping address to help our courier find your location easily"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-sm text-indigo-950 placeholder-stone-400 outline-none focus:border-indigo-950 focus:bg-white transition-all resize-none font-sans"
              />
            </div>

            {/* Order Notes */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-stone-700">Order / Shipping Notes (Optional)</label>
              <textarea
                rows={2}
                placeholder="e.g. Please call before delivery, leave with guard, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-sm text-indigo-950 placeholder-stone-400 outline-none focus:border-indigo-950 focus:bg-white transition-all resize-none font-sans"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="rounded-2xl border border-purple-100 bg-purple-50/30 p-4 mt-6">
            <div className="flex items-center gap-x-3 text-indigo-950">
              <div className="rounded-xl bg-purple-55 bg-purple-100 p-2 text-indigo-950">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-playfair">Cash on Delivery (COD)</h4>
                <p className="text-[11px] text-stone-500 mt-0.5 font-sans">Pay cash to the courier after inspecting the shoes, trying them on, and verifying the fit.</p>
              </div>
            </div>
          </div>
        </form>

        {/* Order Summary panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-purple-100/60 shadow-sm text-left space-y-4">
            <h2 className="text-base font-bold text-indigo-955 border-b border-purple-50 pb-2 font-playfair">Order Summary</h2>

            {/* Products List */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {cart.map((item) => (
                <div key={item.variantId} className="flex gap-x-3 items-center">
                  <div className="relative h-12 w-12 rounded-lg bg-stone-100 border overflow-hidden flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-indigo-955 truncate">{item.name}</h4>
                    <p className="text-[10px] text-stone-500 mt-0.5 font-sans">
                      {item.color} | Size {item.size} | {item.quantity} {item.quantity === 1 ? "pair" : "pairs"}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-indigo-955 font-sans whitespace-nowrap">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-purple-50 pt-4 space-y-2.5 text-xs text-stone-600 font-sans">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-indigo-950">{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-bold text-indigo-950">
                  {selectedGovEn ? `${shippingCost} EGP` : "Select governorate to calculate"}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-indigo-955 border-t border-purple-50 pt-3">
                <span>Total Amount</span>
                <span className="text-lg font-bold text-indigo-950 font-sans">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full flex h-12 items-center justify-center gap-x-2 rounded-full bg-indigo-950 text-sm font-bold text-white hover:bg-indigo-900 disabled:bg-stone-300 disabled:cursor-not-allowed shadow-md transition-all mt-4"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  <span>Place Order</span>
                </>
              )}
            </button>
          </div>

          {/* Secure details card */}
          <div className="bg-purple-50/20 p-5 rounded-3xl border border-purple-100 text-xs text-stone-600 flex items-start gap-x-3 leading-relaxed">
            <ShieldCheck className="h-6 w-6 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-indigo-950 font-playfair">Safe & Transparent Delivery</h4>
              <p className="mt-1 font-sans">We believe your satisfaction is paramount. Try on the shoes at your doorstep before you pay. If they don't fit, you can return them with the courier and pay only the shipping fee.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
