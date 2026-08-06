"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Banknote, Check, ChevronDown, CircleDollarSign, ClipboardCheck, Instagram,
  MapPin, MessageCircle, PackagePlus, Phone, Plus, ReceiptText, Search, ShoppingBag,
  Trash2, UserRound, Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CENTERS_BY_GOVERNORATE, GOVERNORATES } from "@/lib/locations";
import { createManualOrderAction } from "@/app/admin/orders/actions";

import {
  calculateShippingFee,
  ShippingSettingsData,
  ShippingZoneData,
} from "@/lib/shippingHelper";

interface Product { id: string; name: string; category: string; images: string[]; price: number; color: string | null; variants: Array<{ id: string; size: string; stock: number }>; }
interface Customer { id: string; name: string; phone: string; phone2: string | null; email: string | null; governorate: string; city: string; address: string; }
interface Line { variantId: string; quantity: number; }

const money = new Intl.NumberFormat("en-EG", { maximumFractionDigits: 0 });
const sourceOptions = [
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle }, { value: "inreel", label: "Inreel", icon: UserRound },
  { value: "instagram", label: "Instagram", icon: Instagram }, { value: "website", label: "Website", icon: ShoppingBag },
];
const paymentOptions = [
  { value: "cod", label: "Cash on delivery", icon: Banknote }, { value: "instapay", label: "InstaPay", icon: CircleDollarSign },
  { value: "wallet", label: "Wallet", icon: Wallet },
];
const orderSteps: Array<{ number: number; label: string; icon: LucideIcon }> = [
  { number: 1, label: "Customer", icon: UserRound },
  { number: 2, label: "Items", icon: ShoppingBag },
  { number: 3, label: "Review", icon: ClipboardCheck },
];

export default function AdminManualOrderForm({
  products,
  customers,
  shippingZones = [],
  shippingSettings = null,
}: {
  products: Product[];
  customers: Customer[];
  shippingZones?: ShippingZoneData[];
  shippingSettings?: ShippingSettingsData;
}) {
  const [lines, setLines] = useState<Line[]>([]);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [city, setCity] = useState("");
  const [customerMode, setCustomerMode] = useState<"new" | "existing">("new");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [payment, setPayment] = useState("cod");
  const [source, setSource] = useState("whatsapp");
  const [step, setStep] = useState(1);
  const [customerKey, setCustomerKey] = useState(0);

  const selectedLines = useMemo(() => lines.map((line) => {
    const product = products.find((item) => item.variants.some((variant) => variant.id === line.variantId));
    const variant = product?.variants.find((item) => item.id === line.variantId);
    return { ...line, product, variant };
  }), [lines, products]);
  const subtotal = selectedLines.reduce((sum, line) => sum + (line.product?.price || 0) * line.quantity, 0);
  const total = Math.max(0, subtotal - Math.min(discount, subtotal) + shipping);

  useEffect(() => {
    if (!governorate) return;
    const fee = calculateShippingFee({
      governorate,
      city,
      subtotal,
      zones: shippingZones,
      settings: shippingSettings,
    });
    setShipping(fee);
  }, [governorate, city, subtotal, shippingZones, shippingSettings]);

  const productChoices = products.filter((product) => product.variants.some((variant) => variant.stock > 0)).map((product) => ({ id: product.id, name: product.name, category: product.category, image: product.images[0] || "", variants: product.variants.filter((variant) => variant.stock > 0) }));
  const selectedChoice = productChoices.find((choice) => choice.id === selectedProductId);

  const addVariantToOrder = (variantId: string) => {
    if (!variantId) return;
    setLines((current) => {
      const existing = current.find((item) => item.variantId === variantId);
      if (existing) {
        return current.map((item) => item.variantId === variantId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...current, { variantId, quantity: 1 }];
    });
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    const choice = productChoices.find((item) => item.id === productId);
    const variantId = choice?.variants[0]?.id;
    if (variantId) {
      setSelectedVariant(variantId);
      addVariantToOrder(variantId);
    }
  };

  const handleSizeClick = (variantId: string) => {
    setSelectedVariant(variantId);
    addVariantToOrder(variantId);
  };

  const selectCustomer = (id: string) => {
    setSelectedCustomer(id);
    const customer = customers.find((item) => item.id === id);
    if (!customer) return;
    setGovernorate(customer.governorate);
    setCity(customer.city);
    setCustomerKey((value) => value + 1);
  };
  const activeCustomer = customers.find((item) => item.id === selectedCustomer);

  return (
    <form action={createManualOrderAction} className="pb-24 lg:pb-8" noValidate>
      <input type="hidden" name="itemsJson" value={JSON.stringify(lines)} />
      <input type="hidden" name="paymentMethod" value={payment} />
      <input type="hidden" name="orderSource" value={source} />

      <nav aria-label="Order creation progress" className="mb-5 rounded-2xl border border-[#942E3A]/10 bg-white p-2 shadow-[0_8px_24px_rgba(67,25,31,0.04)] sm:mb-6 sm:p-3 md:hidden">
        <div className="grid grid-cols-3 gap-1">
          {orderSteps.map(({ number, label, icon: Icon }) => (
            <button key={number} type="button" onClick={() => setStep(number)} className={`flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-[10px] font-bold transition sm:text-xs ${step === number ? "bg-[#942E3A] text-[#FFF9EB] shadow-sm" : "text-[#6B1F2A]/55 hover:bg-[#FFF9EB]"}`}>
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] ${step > number ? "bg-[#D8B46A] text-[#6B1F2A]" : step === number ? "bg-white/15" : "bg-[#942E3A]/8"}`}>{step > number ? <Check className="h-3 w-3" /> : number}</span>
              <Icon className="hidden h-3.5 w-3.5 sm:block" /><span className="truncate">{label as string}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <div className="space-y-5">
          <section id="manual-step-1" className={`${step === 1 ? "" : "hidden md:block"} manual-order-card scroll-mt-5`}>
            <SectionHeading step="01" title="Customer & delivery" icon={UserRound} subtitle="Capture contact details and the exact delivery destination." />
            <div className="mb-5 grid grid-cols-2 rounded-xl border border-[#942E3A]/10 bg-[#FFF9EB]/70 p-1">
              {(["new", "existing"] as const).map((mode) => <button key={mode} type="button" onClick={() => setCustomerMode(mode)} className={`rounded-lg px-3 py-2 text-[11px] font-bold transition ${customerMode === mode ? "bg-white text-[#942E3A] shadow-sm" : "text-[#6B1F2A]/50"}`}>{mode === "new" ? "New customer" : "Returning customer"}</button>)}
            </div>
            {customerMode === "existing" && <Field label="Choose a saved customer" icon={UserRound}><CustomerPicker value={selectedCustomer} customers={customers} onChange={selectCustomer} /></Field>}
            <div key={customerKey} className="grid gap-3 sm:grid-cols-2">
              <Field label="First name" icon={UserRound}><input required name="customerFirstName" defaultValue={activeCustomer?.name?.split(" ")[0] || ""} placeholder="Customer first name" className="manual-order-input" /></Field>
              <Field label="Second name" icon={UserRound}><input required name="customerLastName" defaultValue={activeCustomer?.name?.split(" ").slice(1).join(" ") || ""} placeholder="Customer second name" className="manual-order-input" /></Field>
              <Field label="Primary phone" icon={Phone}><input required name="customerPhone" type="tel" defaultValue={activeCustomer?.phone} placeholder="01X XXX XXXX" className="manual-order-input" /></Field>
              <Field label="Alternative phone" optional icon={Phone}><input name="customerPhone2" type="tel" defaultValue={activeCustomer?.phone2 || ""} placeholder="Optional backup number" className="manual-order-input" /></Field>
              <Field label="Email" optional icon={ReceiptText}><input name="customerEmail" type="email" defaultValue={activeCustomer?.email || ""} placeholder="Optional email" className="manual-order-input" /></Field>
              <Field label="Governorate" icon={MapPin}><LocationPicker name="governorate" value={governorate} options={[...GOVERNORATES]} placeholder="Select governorate" onChange={(value) => { setGovernorate(value); setCity(""); }} /></Field>
              <Field label="City / area" icon={MapPin}><LocationPicker name="city" value={city} options={CENTERS_BY_GOVERNORATE[governorate] || []} placeholder={governorate ? "Select city or area" : "Choose governorate first"} disabled={!governorate} onChange={setCity} /></Field>
              <div className="sm:col-span-2"><Field label="Detailed address" icon={MapPin}><textarea required name="address" rows={2} defaultValue={activeCustomer?.address} placeholder="Building, street, landmark, floor…" className="manual-order-input min-h-[76px] resize-y" /></Field></div>
            </div>
          </section>          <section id="manual-step-2" className={`${step === 2 ? "" : "hidden md:block"} manual-order-card scroll-mt-5`}>
            <SectionHeading step="02" title="Order items" icon={PackagePlus} subtitle="Choose products and pick their variant to add them to the order." />
            <ProductPicker options={productChoices} onAddVariant={addVariantToOrder} />
            <div className="mt-4 space-y-2">{selectedLines.length ? selectedLines.map(({ variantId, quantity, product, variant }) => <article key={variantId} className="flex items-center gap-3 rounded-2xl border border-[#942E3A]/10 bg-[#FFF9EB]/45 p-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#942E3A] text-[#D8B46A]"><ShoppingBag className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-[#6B1F2A]">{product?.name}</p><p className="mt-0.5 text-[10px] text-[#6B1F2A]/55">{product?.color || "Standard"} · Size {variant?.size} · {variant?.stock} in stock</p><p className="mt-1 text-xs font-bold text-[#942E3A]">{money.format((product?.price || 0) * quantity)} EGP</p></div><div className="flex shrink-0 items-center rounded-xl border border-[#942E3A]/12 bg-white p-0.5"><button type="button" onClick={() => setLines((current) => current.map((item) => item.variantId === variantId ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item))} className="h-7 w-7 rounded-lg text-sm font-bold text-[#942E3A]">−</button><span className="w-6 text-center text-xs font-bold text-[#6B1F2A]">{quantity}</span><button type="button" disabled={quantity >= (variant?.stock || 0)} onClick={() => setLines((current) => current.map((item) => item.variantId === variantId ? { ...item, quantity: item.quantity + 1 } : item))} className="h-7 w-7 rounded-lg bg-[#FFF9EB] text-sm font-bold text-[#942E3A] disabled:opacity-30">+</button></div><button type="button" onClick={() => setLines((current) => current.filter((item) => item.variantId !== variantId))} aria-label={`Remove ${product?.name}`} className="rounded-lg p-2 text-[#942E3A]/45 transition hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></article>) : <div className="rounded-2xl border border-dashed border-[#942E3A]/18 bg-[#FFF9EB]/40 px-4 py-8 text-center"><ShoppingBag className="mx-auto h-5 w-5 text-[#D8B46A]" /><p className="mt-2 text-xs font-bold text-[#6B1F2A]/65">Your order is empty</p><p className="mt-1 text-[10px] text-[#6B1F2A]/45">Choose a product from the dropdown above to get started.</p></div>}</div>
          </section>

        </div>

        <aside className={`${step === 3 ? "" : "hidden md:block"} manual-order-sidebar xl:sticky xl:top-5`}>
          <div className="mb-5 overflow-hidden rounded-3xl bg-[#942E3A] p-5 text-[#FFF9EB] shadow-[0_16px_35px_rgba(107,31,42,0.18)]"><div className="flex items-center gap-2 text-[#D8B46A]"><ReceiptText className="h-4 w-4" /><p className="text-[10px] font-bold uppercase tracking-[0.18em]">Order summary</p></div><div className="mt-5 space-y-3 text-xs"><SummaryRow label="Products" value={`${money.format(subtotal)} EGP`} /><SummaryRow label="Shipping" value={`${money.format(shipping)} EGP`} /><SummaryRow label="Discount" value={`−${money.format(Math.min(discount, subtotal))} EGP`} muted={!discount} /><div className="border-t border-white/15 pt-3"><SummaryRow label="Total due" value={`${money.format(total)} EGP`} total /></div></div><p className="mt-4 rounded-xl bg-white/10 px-3 py-2 text-[10px] leading-relaxed text-white/65">Inventory is reserved as soon as this order is created.</p></div>
          <section className="mb-5 manual-order-card"><SectionHeading step="03" title="Payment details" icon={ReceiptText} compact /><OrderDetails payment={payment} setPayment={setPayment} source={source} setSource={setSource} /></section>
          <section className="mb-5 manual-order-card"><p className="field-label">Order totals</p><div className="grid grid-cols-2 gap-2"><Field label="Shipping fee"><input name="shippingCost" type="number" min="0" step="1" value={shipping || ""} onChange={(event) => setShipping(Number(event.target.value) || 0)} placeholder="0" className="manual-order-input" /></Field><Field label="Discount"><input name="discount" type="number" min="0" max={subtotal} step="1" value={discount || ""} onChange={(event) => setDiscount(Number(event.target.value) || 0)} placeholder="0" className="manual-order-input" /></Field></div></section>
          <button type="submit" disabled={!lines.length} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#942E3A] px-4 py-3.5 text-xs font-bold text-[#FFF9EB] shadow-[0_10px_22px_rgba(107,31,42,0.16)] transition hover:bg-[#7c2430] disabled:cursor-not-allowed disabled:opacity-40"><Check className="h-4 w-4 text-[#D8B46A]" /> Create manual order</button>
        </aside>
      </div>
    </form>
  );
}

function Field({ label, optional, icon: Icon, children }: { label: string; optional?: boolean; icon?: typeof UserRound; children: React.ReactNode }) { return <label className="block"><span className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6B1F2A]/62">{Icon && <Icon className="h-3 w-3 text-[#D8B46A]" />}{label}{optional && <em className="ml-auto normal-case tracking-normal text-[#6B1F2A]/35">Optional</em>}</span>{children}</label>; }
function ProductPicker({ options, onAddVariant }: { options: Array<{ id: string; name: string; category: string; image: string; variants: Array<{ id: string; size: string; stock: number }> }>; onAddVariant: (variantId: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const categories = ["all", ...Array.from(new Set(options.map((option) => option.category))).sort()];
  const filtered = options.filter((option) => filter === "all" || option.category === filter).filter((option) => option.name.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleProductClick = (option: typeof options[0]) => {
    if (expandedProductId === option.id) {
      setExpandedProductId(null);
    } else {
      setExpandedProductId(option.id);
      setSelectedVariantId(option.variants[0]?.id || null);
    }
  };

  const handleAdd = (variantId: string) => {
    if (!variantId) return;
    onAddVariant(variantId);
    setOpen(false);
    setExpandedProductId(null);
  };

  return <div ref={pickerRef} className="relative">
    <button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => { setOpen((current) => !current); setSearch(""); }} className="manual-order-select flex items-center justify-between text-left">
      <span className="text-[#6B1F2A]/55">Choose a product…</span><ChevronDown className={`h-4 w-4 text-[#942E3A]/50 transition-transform ${open ? "rotate-180" : ""}`} />
    </button>
    {open && <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border border-[#942E3A]/12 bg-[#fffdf8] shadow-2xl" role="listbox" onWheel={(event) => event.stopPropagation()}><div className="border-b border-[#942E3A]/10 bg-[#fffaf0] p-2.5"><div className="relative"><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#942E3A]/40" /><input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products..." aria-label="Search products" className="h-9 w-full rounded-xl border border-[#942E3A]/10 bg-white pl-9 pr-3 text-xs text-[#6B1F2A] outline-none focus:border-[#D8B46A]" onClick={(event) => event.stopPropagation()} /></div><div className="mt-2 flex gap-1 overflow-x-auto pb-0.5"><button type="button" onClick={() => setFilter("all")} className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[10px] font-bold capitalize ${filter === "all" ? "bg-[#942E3A] text-[#fff9eb]" : "bg-white text-[#942E3A]/60"}`}>All</button>{categories.filter((category) => category !== "all").map((category) => <button type="button" key={category} onClick={() => setFilter(category)} className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[10px] font-bold capitalize ${filter === category ? "bg-[#942E3A] text-[#fff9eb]" : "bg-white text-[#942E3A]/60"}`}>{category}</button>)}</div></div><div className="max-h-72 space-y-1.5 overflow-y-auto overscroll-contain p-1.5">{filtered.map((option) => { const isExpanded = expandedProductId === option.id; return <div key={option.id} className={`overflow-hidden rounded-xl border transition ${isExpanded ? "border-[#942E3A] bg-[#FFF9EB]/90 shadow-sm" : "border-[#942E3A]/8 bg-white hover:border-[#D8B46A] hover:bg-[#FFF9EB]/30"}`}><button type="button" role="option" aria-expanded={isExpanded} onClick={() => handleProductClick(option)} className="flex w-full items-center gap-3 px-3 py-2.5 text-left"><span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f7e9d8] text-xs font-bold text-[#942E3A]">{option.image ? <img src={option.image} alt="" className="h-full w-full object-cover" /> : option.name.charAt(0)}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold text-[#942E3A]">{option.name}</span><span className="mt-0.5 block text-[10px] capitalize text-[#6B1F2A]/50">{option.category} · {option.variants.length} size{option.variants.length > 1 ? "s" : ""}</span></span><ChevronDown className={`h-4 w-4 shrink-0 text-[#942E3A]/60 transition-transform duration-200 ${isExpanded ? "rotate-180 text-[#942E3A]" : ""}`} /></button>{isExpanded && <div className="border-t border-[#942E3A]/10 bg-white/80 p-3"><p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/60">Select size:</p><div className="flex flex-wrap gap-1.5">{option.variants.map((variant) => { const isSelected = selectedVariantId === variant.id; return <button key={variant.id} type="button" onClick={(e) => { e.stopPropagation(); setSelectedVariantId(variant.id); }} className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-bold transition ${isSelected ? "border-[#942E3A] bg-[#942E3A] text-[#FFF9EB] shadow-sm" : "border-[#942E3A]/15 bg-white text-[#6B1F2A]/70 hover:border-[#D8B46A]"}`}>Size {variant.size} · {variant.stock} left</button>; })}</div><div className="mt-3 flex justify-end"><button type="button" disabled={!selectedVariantId} onClick={(e) => { e.stopPropagation(); if (selectedVariantId) handleAdd(selectedVariantId); }} className="inline-flex items-center gap-1.5 rounded-xl bg-[#942E3A] px-3.5 py-2 text-xs font-bold text-[#FFF9EB] shadow-sm transition hover:bg-[#7c2430] disabled:opacity-40"><Plus className="h-3.5 w-3.5 text-[#D8B46A]" /> Add to order</button></div></div>}</div>; })}{filtered.length === 0 && <p className="px-3 py-5 text-center text-xs text-[#6B1F2A]/55">No products match your search.</p>}</div></div>}
  </div>;
}
function LocationPicker({ name, value, options, placeholder, disabled, onChange }: { name: string; value: string; options: string[]; placeholder: string; disabled?: boolean; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);
  const filtered = options.filter((item) => item.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return <div ref={pickerRef} className="relative">
    <input type="hidden" name={name} value={value} />
    <button type="button" disabled={disabled} aria-haspopup="listbox" aria-expanded={open} onClick={() => { setOpen((current) => !current); setSearch(""); }} className={`manual-order-select flex min-w-0 items-center justify-between gap-3 text-left ${value ? "text-[#6B1F2A]" : "text-[#6B1F2A]/35"} disabled:cursor-not-allowed disabled:bg-[#FFF9EB] disabled:text-[#6B1F2A]/30`}>
      <span className="truncate">{value || placeholder}</span><ChevronDown className={`h-3.5 w-3.5 shrink-0 text-[#942E3A]/55 transition ${open ? "rotate-180" : ""}`} />
    </button>
    {open && !disabled && <div role="listbox" aria-label={name} onWheel={(event) => event.stopPropagation()} onTouchMove={(event) => event.stopPropagation()} className="hide-scrollbar absolute left-0 right-0 z-50 mt-2 max-h-64 touch-pan-y overscroll-contain overflow-y-scroll rounded-2xl border border-[#eadfd6] bg-white p-1.5 shadow-[0_18px_40px_rgba(73,24,39,0.16)]" style={{ WebkitOverflowScrolling: "touch" }}>
      <div className="relative mb-1.5"><Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#D8B46A]" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} onClick={(event) => event.stopPropagation()} placeholder={`Search ${name === "city" ? "city" : "governorate"}...`} aria-label={`Search ${name}`} className="h-10 w-full rounded-xl border border-[#eadfd6] bg-[#fffaf0] pl-9 pr-3 text-xs text-[#481827] outline-none placeholder:text-[#a99ca0] focus:border-[#942e3a] focus:ring-2 focus:ring-[#942e3a]/10" /></div>
      {!search && <button type="button" role="option" aria-selected={!value} onClick={() => { onChange(""); setOpen(false); }} className={`w-full rounded-xl px-3 py-2.5 text-left text-xs transition ${!value ? "bg-[#942e3a] font-bold text-white" : "text-[#806e73] hover:bg-[#fff5e8] hover:text-[#942e3a]"}`}>{placeholder}</button>}
      {filtered.map((item) => <button key={item} type="button" role="option" aria-selected={item === value} onClick={() => { onChange(item); setOpen(false); setSearch(""); }} className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-xs transition ${item === value ? "bg-[#942e3a] font-bold text-white" : "text-[#481827] hover:bg-[#fff5e8] hover:text-[#942e3a]"}`}>{item}</button>)}
      {!filtered.length && <p className="px-3 py-3 text-center text-xs text-[#806e73]">No {name === "city" ? "city" : "governorate"} found</p>}
    </div>}
  </div>;
}
function SectionHeading({ step, title, icon: Icon, subtitle, compact }: { step: string; title: string; icon: typeof UserRound; subtitle?: string; compact?: boolean }) { return <div className={compact ? "mb-4 flex items-center gap-2" : "mb-5 flex gap-3"}><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF9EB] text-[#942E3A]"><Icon className="h-4 w-4" /></span><div><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#D8B46A]">Step {step}</p><h2 className="mt-0.5 font-playfair text-xl font-black text-[#942E3A]">{title}</h2>{subtitle && <p className="mt-1 text-[10px] leading-relaxed text-[#6B1F2A]/52">{subtitle}</p>}</div></div>; }
function SummaryRow({ label, value, total, muted }: { label: string; value: string; total?: boolean; muted?: boolean }) { return <div className={`flex items-center justify-between gap-3 ${total ? "text-base font-bold" : "text-white/70"} ${muted ? "opacity-45" : ""}`}><span>{label}</span><span className={total ? "font-playfair text-xl font-black text-white" : "font-bold text-white"}>{value}</span></div>; }
function OrderDetails({ payment, setPayment, source, setSource }: { payment: string; setPayment: (value: string) => void; source: string; setSource: (value: string) => void }) { return <div className="space-y-5"><ChoiceGroup label="Order source" value={source} onChange={setSource} options={sourceOptions} /><ChoiceGroup label="Payment method" value={payment} onChange={setPayment} options={paymentOptions} /></div>; }
function ChoiceGroup({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string; icon: typeof UserRound }> }) { return <fieldset><legend className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6B1F2A]/62">{label}</legend><div className="grid grid-cols-2 gap-2">{options.map(({ value: optionValue, label: optionLabel, icon: Icon }) => <button key={optionValue} type="button" onClick={() => onChange(optionValue)} className={`flex min-w-0 items-center gap-2 rounded-xl border px-2.5 py-2.5 text-left text-[10px] font-bold transition ${value === optionValue ? "border-[#942E3A] bg-[#FFF9EB] text-[#942E3A] shadow-sm" : "border-[#942E3A]/10 bg-white text-[#6B1F2A]/55 hover:border-[#D8B46A]"}`}><span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${value === optionValue ? "bg-[#942E3A] text-[#D8B46A]" : "bg-[#FFF9EB] text-[#6B1F2A]/45"}`}><Icon className="h-3 w-3" /></span><span className="truncate">{optionLabel}</span></button>)}</div></fieldset>; }
function CustomerPicker({ value, customers, onChange }: { value: string; customers: Customer[]; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);
  const selected = customers.find((c) => c.id === value);
  const filtered = customers.filter((c) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q) || (c.phone2 && c.phone2.toLowerCase().includes(q)) || (c.email && c.email.toLowerCase().includes(q));
  });

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div ref={pickerRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => { setOpen((current) => !current); setSearch(""); }}
        className={`manual-order-select flex min-w-0 items-center justify-between gap-3 text-left ${selected ? "text-[#6B1F2A]" : "text-[#6B1F2A]/35"}`}
      >
        <span className="truncate">{selected ? `${selected.name} · ${selected.phone}` : "Search by name or phone..."}</span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-[#942E3A]/55 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Choose customer"
          onWheel={(event) => event.stopPropagation()}
          onTouchMove={(event) => event.stopPropagation()}
          className="hide-scrollbar absolute left-0 right-0 z-50 mt-2 max-h-72 touch-pan-y overscroll-contain overflow-y-scroll rounded-2xl border border-[#eadfd6] bg-white p-1.5 shadow-[0_18px_40px_rgba(73,24,39,0.16)]"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="relative mb-1.5">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#D8B46A]" />
            <input
              type="search"
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onClick={(event) => event.stopPropagation()}
              placeholder="Search by name or phone..."
              aria-label="Search customers"
              className="h-10 w-full rounded-xl border border-[#eadfd6] bg-[#fffaf0] pl-9 pr-3 text-xs text-[#481827] outline-none placeholder:text-[#a99ca0] focus:border-[#942e3a] focus:ring-2 focus:ring-[#942e3a]/10"
            />
          </div>

          {!search && (
            <button
              type="button"
              role="option"
              aria-selected={!value}
              onClick={() => { onChange(""); setOpen(false); }}
              className={`mb-1 w-full rounded-xl px-3 py-2 text-left text-xs transition ${!value ? "bg-[#942e3a] font-bold text-white" : "text-[#806e73] hover:bg-[#fff5e8] hover:text-[#942e3a]"}`}
            >
              Search by name or phone...
            </button>
          )}

          {filtered.map((customer) => (
            <button
              key={customer.id}
              type="button"
              role="option"
              aria-selected={customer.id === value}
              onClick={() => { onChange(customer.id); setOpen(false); setSearch(""); }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs transition ${
                customer.id === value
                  ? "bg-[#942e3a] font-bold text-white"
                  : "text-[#481827] hover:bg-[#fff5e8] hover:text-[#942e3a]"
              }`}
            >
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${customer.id === value ? "bg-white/20 text-white" : "bg-[#FFF9EB] text-[#942E3A]"}`}>
                <UserRound className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`truncate font-bold ${customer.id === value ? "text-white" : "text-[#6B1F2A]"}`}>{customer.name}</p>
                <p className={`mt-0.5 truncate text-[10px] ${customer.id === value ? "text-white/80" : "text-[#6B1F2A]/50"}`}>
                  {customer.phone} {customer.governorate ? `· ${customer.governorate}` : ""}
                </p>
              </div>
              {customer.id === value && <Check className="h-4 w-4 shrink-0 text-white" />}
            </button>
          ))}

          {!filtered.length && (
            <p className="px-3 py-4 text-center text-xs text-[#806e73]">No customer found matching "{search}"</p>
          )}
        </div>
      )}
    </div>
  );
}
