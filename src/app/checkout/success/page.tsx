"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Home,
  MapPin,
  PackageCheck,
  PhoneCall,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber") || "DR-XXXX";
  const name = searchParams.get("name") || "there";
  const total = Number(searchParams.get("total") || 0);
  const shipping = searchParams.get("shipping") || "0";
  const gov = searchParams.get("gov") || "your selected address";

  return (
    <main className="min-h-[calc(100vh-90px)] bg-[#fffaf0] px-4 py-6 text-[#481827] sm:px-6 sm:py-8 lg:px-8" dir="ltr">
      <div className="mx-auto max-w-lg">
        <div className="overflow-hidden rounded-2xl border border-[#eadfd6] bg-white shadow-[0_15px_40px_rgba(73,24,39,0.06)]">
          <div className="relative overflow-hidden bg-[#942e3a] px-4 py-6 text-center text-[#fffaf0] sm:px-6 sm:py-8">
            <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full border border-[#d8b46a]/20" />
            <div className="pointer-events-none absolute -bottom-32 -right-16 h-72 w-72 rounded-full border border-[#d8b46a]/20" />
            <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#d8b46a] text-[#481827] shadow-[0_0_0_6px_rgba(216,180,106,0.16)]">
              <CheckCircle2 className="h-7 w-7" strokeWidth={1.8} />
            </div>
            <p className="relative mt-4 text-[9px] font-bold uppercase tracking-[0.32em] text-[#d8b46a]">Thank you for choosing DeRoma</p>
            <h1 className="relative mt-1.5 font-playfair text-2xl font-semibold leading-tight sm:text-3xl">Order confirmed</h1>
            <p className="relative mx-auto mt-2 max-w-sm text-xs leading-relaxed text-white/75">Thank you, {name}. Your order is safely registered and our team is preparing it for delivery.</p>
            <div className="relative mx-auto mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold"><span className="text-white/60">Order</span><span className="text-[#d8b46a]">{orderNumber}</span></div>
          </div>

          <div className="px-4 py-5 sm:px-6 sm:py-6">
            <div className="grid grid-cols-3 gap-2">
              {[{ icon: Check, label: "Confirmed", active: true }, { icon: PackageCheck, label: "Preparing", active: false }, { icon: Truck, label: "On the way", active: false }].map(({ icon: Icon, label, active }, index) => (
                <div key={label} className="relative text-center">
                  {index < 2 && <span className="absolute left-[calc(50%+15px)] right-[calc(-50%+15px)] top-3 h-px bg-[#eadfd6]" />}
                  <span className={`relative mx-auto flex h-6 w-6 items-center justify-center rounded-full text-xs ${active ? "bg-[#942e3a] text-white" : "border border-[#eadfd6] bg-[#fffaf0] text-[#a99ca0]"}`}><Icon className="h-3 w-3" /></span>
                  <span className={`mt-1.5 block text-[9px] font-bold uppercase tracking-[0.12em] ${active ? "text-[#942e3a]" : "text-[#a99ca0]"}`}>{label}</span>
                </div>
              ))}
            </div>

            <div className="my-5 h-px bg-[#eadfd6]" />

            <div className="grid gap-3 sm:grid-cols-2">
              <section className="rounded-xl border border-[#eadfd6] bg-[#fffaf0] p-3.5">
                <div className="flex items-center gap-2.5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#942e3a]/10 text-[#942e3a]"><MapPin className="h-3.5 w-3.5" /></span><div><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#c49a50]">Delivering to</p><p className="mt-0.5 text-xs font-bold">{gov}</p></div></div>
              </section>
              <section className="rounded-xl border border-[#eadfd6] bg-[#fffaf0] p-3.5">
                <div className="flex items-center gap-2.5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#d8b46a]/20 text-[#9a742b]"><Clock3 className="h-3.5 w-3.5" /></span><div><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#c49a50]">Estimated delivery</p><p className="mt-0.5 text-xs font-bold">24–48 working hours</p></div></div>
              </section>
            </div>

            <section className="mt-3 rounded-xl border border-[#eadfd6] p-3.5">
              <div className="flex items-center justify-between gap-4"><div><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#c49a50]">Payment method</p><p className="mt-0.5 text-xs font-bold">Cash on delivery</p></div><div className="text-right"><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#c49a50]">Total amount</p><p className="mt-0.5 font-playfair text-lg font-bold text-[#942e3a]">{formatCurrency(total)}</p></div></div>
              <p className="mt-2.5 border-t border-[#eadfd6] pt-2.5 text-[10px] text-[#806e73]">Includes {shipping} EGP delivery fee.</p>
            </section>

            <section className="mt-3 rounded-xl bg-[#942e3a] p-3.5 text-[#fffaf0]">
              <div className="flex items-start gap-2.5"><Truck className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#d8b46a]" /><div><h2 className="text-xs font-bold">A little note about delivery</h2><p className="mt-1 text-[11px] leading-4 text-white/70">Our delivery team will call you to coordinate the exact time for your delivery.</p></div></div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-white/15 pt-3 text-[9px] font-bold uppercase tracking-[0.1em] text-[#d8b46a]"><span className="inline-flex items-center gap-1"><PackageCheck className="h-3 w-3" /> Fast delivery</span><span className="inline-flex items-center gap-1"><PhoneCall className="h-3 w-3" /> Courier will call</span></div>
            </section>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Link href="/" className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#942e3a] px-5 text-xs font-bold text-white shadow-md shadow-[#942e3a]/10 transition hover:bg-[#76232d]"><Home className="h-3.5 w-3.5" /> Back to home</Link>
              <Link href="/shop" className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#eadfd6] bg-white px-5 text-xs font-bold text-[#942e3a] transition hover:border-[#942e3a] hover:bg-[#fffaf0]">Continue shopping <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#a99ca0]">DeRoma · Everyday comfort, beautifully delivered</p>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return <Suspense fallback={<div className="flex min-h-[70vh] items-center justify-center bg-[#fffaf0]"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#942e3a] border-t-transparent" /></div>}><SuccessContent /></Suspense>;
}
