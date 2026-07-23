"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle2, ShoppingBag, Truck, Calendar, Sparkles } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { useEffect, useState, Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  
  const orderNumber = searchParams.get("orderNumber") || "DR-XXXX";
  const name = searchParams.get("name") || "";
  const total = searchParams.get("total") || "0";
  const shipping = searchParams.get("shipping") || "0";
  const gov = searchParams.get("gov") || "";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-8" dir="ltr">
      
      {/* Checkmark Animation & Success Title */}
      <div className="space-y-3">
        <div className="relative inline-flex items-center justify-center rounded-full bg-emerald-50 p-4 text-emerald-600 animate-bounce">
          <CheckCircle2 className="h-16 w-16" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-indigo-950 font-playfair leading-tight">
          Order Placed Successfully! 🎉
        </h1>
        <p className="text-sm text-stone-500 max-w-md mx-auto font-sans">
          Thank you for shopping at DeRoma. Your order has been registered and is being processed for shipping.
        </p>
      </div>

      {/* Order Info Card */}
      <div className="bg-white border border-purple-100/60 p-6 rounded-[2rem] shadow-sm text-left space-y-4">
        <h2 className="text-sm font-bold text-indigo-955 pb-2 border-b border-purple-50 flex items-center justify-between font-playfair">
          <span>Order Details:</span>
          <span className="text-amber-600 font-extrabold font-sans">{orderNumber}</span>
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-655 text-stone-600 font-sans">
          {name && (
            <div>
              <strong>Recipient Name:</strong> <span className="text-indigo-950 font-bold">{name}</span>
            </div>
          )}
          {gov && (
            <div>
              <strong>Governorate:</strong> <span className="text-indigo-955 font-bold">{gov}</span>
            </div>
          )}
          <div>
            <strong>Payment Method:</strong> <span className="text-indigo-955 font-bold">Cash on Delivery (COD)</span>
          </div>
          <div>
            <strong>Total Amount Paid:</strong>{" "}
            <span className="text-indigo-955 font-bold">{formatCurrency(Number(total))}</span>{" "}
            <span className="text-[10px] text-stone-400 font-sans">(includes shipping {shipping} EGP)</span>
          </div>
        </div>
      </div>

      {/* Shipping Information Box */}
      <div className="rounded-[2rem] border border-purple-100 bg-white p-6 text-left space-y-4 shadow-sm">
        <h3 className="text-xs font-bold text-indigo-955 flex items-center gap-x-2 font-playfair uppercase tracking-wider">
          <Truck className="h-4 w-4 text-purple-500" />
          <span>Important Delivery Info:</span>
        </h3>
        <ul className="text-xs text-stone-600 space-y-2.5 list-disc list-inside font-sans">
          <li><strong>Delivery Time:</strong> Your package will be delivered to your address within 24-48 working hours.</li>
          <li><strong>Try On & Inspect:</strong> You have the right to open the package and try the fit/quality in front of the courier before paying.</li>
          <li><strong>Delivery Coordinate:</strong> The shipping courier will contact you by phone to coordinate the delivery time. Please keep your phone available.</li>
        </ul>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 max-w-md mx-auto">
        <Link
          href="/"
          className="flex-1 flex items-center justify-center gap-x-2 rounded-full bg-indigo-955 bg-indigo-950 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-900"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
        <Link
          href="/shop"
          className="flex-1 flex items-center justify-center rounded-full border border-stone-200 bg-white py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50"
        >
          <span>Continue Shopping</span>
        </Link>
      </div>

    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#FAF7F2]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-950 border-t-transparent" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
