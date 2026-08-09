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
import { useAdminI18n } from "@/providers/AdminI18nContext";

interface Product { id: string; name: string; category: string; images: string[]; price: number; color: string | null; variants: Array<{ id: string; size: string; stock: number }>; }
interface Customer { id: string; name: string; phone: string; phone2: string | null; email: string | null; governorate: string; city: string; address: string; }
interface Line { variantId: string; quantity: number; }

const sourceOptions = [
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle }, { value: "inreel", label: "Inreel", icon: UserRound },
  { value: "instagram", label: "Instagram", icon: Instagram }, { value: "website", label: "Website", icon: ShoppingBag },
];
const paymentOptions = [
  { value: "cod", label: "الدفع عند الاستلام", icon: Banknote }, { value: "instapay", label: "InstaPay", icon: CircleDollarSign },
  { value: "wallet", label: "المحفظة الإلكترونية", icon: Wallet },
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
  const { lang, t, formatPrice, formatNumber } = useAdminI18n();
  const isRtl = lang === "ar";

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

  const orderSteps: Array<{ number: number; label: string; icon: LucideIcon }> = [
    { number: 1, label: isRtl ? "العميل والتوصيل" : "Customer", icon: UserRound },
    { number: 2, label: isRtl ? "أصناف الطلب" : "Items", icon: ShoppingBag },
    { number: 3, label: isRtl ? "المراجعة والدفع" : "Review", icon: ClipboardCheck },
  ];

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
    <form action={createManualOrderAction} className="pb-24 lg:pb-8 text-right" noValidate>
      <input type="hidden" name="itemsJson" value={JSON.stringify(lines)} />
      <input type="hidden" name="paymentMethod" value={payment} />
      <input type="hidden" name="orderSource" value={source} />

      <nav aria-label="Order creation progress" className="mb-5 rounded-2xl border border-[#942E3A]/10 bg-white p-2 shadow-xs sm:mb-6 sm:p-3 md:hidden">
        <div className="grid grid-cols-3 gap-1">
          {orderSteps.map(({ number, label, icon: Icon }) => (
            <button key={number} type="button" onClick={() => setStep(number)} className={`flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-[10px] font-bold transition sm:text-xs ${step === number ? "bg-[#942E3A] text-[#FFF9EB] shadow-xs" : "text-[#6B1F2A]/55 hover:bg-[#FFF9EB]"}`}>
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] ${step > number ? "bg-[#D8B46A] text-[#6B1F2A]" : step === number ? "bg-white/15" : "bg-[#942E3A]/8"}`}>{step > number ? <Check className="h-3 w-3" /> : formatNumber(number)}</span>
              <Icon className="hidden h-3.5 w-3.5 sm:block" /><span className="truncate">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <div className="space-y-5">
          <section id="manual-step-1" className={`${step === 1 ? "" : "hidden md:block"} manual-order-card scroll-mt-5`}>
            <SectionHeading step="01" title={isRtl ? "بيانات العميل والتوصيل" : "Customer & delivery"} icon={UserRound} subtitle={isRtl ? "تسجيل أرقام التواصل وعنوان التسليم التفصيلي." : "Capture contact details and the exact delivery destination."} />
            <div className="mb-5 grid grid-cols-2 rounded-xl border border-[#942E3A]/10 bg-[#FFF9EB]/70 p-1">
              {(["new", "existing"] as const).map((mode) => (
                <button key={mode} type="button" onClick={() => setCustomerMode(mode)} className={`rounded-lg px-3 py-2 text-[11px] font-bold transition ${customerMode === mode ? "bg-white text-[#942E3A] shadow-xs" : "text-[#6B1F2A]/50"}`}>
                  {mode === "new" ? (isRtl ? "عميل جديد" : "New customer") : (isRtl ? "عميل مسجل سابقاً" : "Returning customer")}
                </button>
              ))}
            </div>
            {customerMode === "existing" && <Field label={isRtl ? "اختر عميلاً مسجلاً" : "Choose a saved customer"} icon={UserRound}><CustomerPicker value={selectedCustomer} customers={customers} onChange={selectCustomer} /></Field>}
            <div key={customerKey} className="grid gap-3 sm:grid-cols-2">
              <Field label={isRtl ? "الاسم الأول *" : "First name"} icon={UserRound}><input required name="customerFirstName" defaultValue={activeCustomer?.name?.split(" ")[0] || ""} placeholder={isRtl ? "الاسم الأول" : "Customer first name"} className="manual-order-input text-right" /></Field>
              <Field label={isRtl ? "اسم العائلة *" : "Second name"} icon={UserRound}><input required name="customerLastName" defaultValue={activeCustomer?.name?.split(" ").slice(1).join(" ") || ""} placeholder={isRtl ? "اسم العائلة" : "Customer second name"} className="manual-order-input text-right" /></Field>
              <Field label={isRtl ? "رقم الهاتف الأساسي *" : "Primary phone"} icon={Phone}><input required name="customerPhone" type="tel" defaultValue={activeCustomer?.phone} placeholder="01012345678" className="manual-order-input text-right" /></Field>
              <Field label={isRtl ? "رقم هاتف إضافي" : "Alternative phone"} optional icon={Phone}><input name="customerPhone2" type="tel" defaultValue={activeCustomer?.phone2 || ""} placeholder="01112345678" className="manual-order-input text-right" /></Field>
              <Field label={isRtl ? "البريد الإلكتروني" : "Email"} optional icon={ReceiptText}><input name="customerEmail" type="email" defaultValue={activeCustomer?.email || ""} placeholder="name@example.com" className="manual-order-input text-right" /></Field>
              <Field label={isRtl ? "المحافظة *" : "Governorate"} icon={MapPin}><LocationPicker name="governorate" value={governorate} options={[...GOVERNORATES]} placeholder={isRtl ? "اختر المحافظة" : "Select governorate"} onChange={(value) => { setGovernorate(value); setCity(""); }} /></Field>
              <Field label={isRtl ? "المدينة / المركز *" : "City / area"} icon={MapPin}><LocationPicker name="city" value={city} options={CENTERS_BY_GOVERNORATE[governorate] || []} placeholder={governorate ? (isRtl ? "اختر المدينة" : "Select city or area") : (isRtl ? "اختر المحافظة أولاً" : "Choose governorate first")} disabled={!governorate} onChange={setCity} /></Field>
              <div className="sm:col-span-2"><Field label={isRtl ? "العنوان بالتفصيل *" : "Detailed address"} icon={MapPin}><textarea required name="address" rows={2} defaultValue={activeCustomer?.address} placeholder={isRtl ? "الشارع، رقم العمارة، رقم الشقة، علامة مميزة..." : "Building, street, landmark, floor…"} className="manual-order-input min-h-[76px] resize-y text-right" /></Field></div>
            </div>
          </section>

          <section id="manual-step-2" className={`${step === 2 ? "" : "hidden md:block"} manual-order-card scroll-mt-5`}>
            <SectionHeading step="02" title={isRtl ? "منتجات الطلب" : "Order items"} icon={PackagePlus} subtitle={isRtl ? "اختر المنتجات وتحديد المقاس واللون لإضافتها للطلب." : "Choose products and pick their variant to add them to the order."} />
            <ProductPicker options={productChoices} onAddVariant={addVariantToOrder} />
            <div className="mt-4 space-y-2">
              {selectedLines.length ? selectedLines.map(({ variantId, quantity, product, variant }) => (
                <article key={variantId} className="flex items-center gap-3 rounded-2xl border border-[#942E3A]/10 bg-[#FFF9EB]/45 p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#942E3A] text-[#D8B46A]">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-[#6B1F2A]">{product?.name}</p>
                    <p className="mt-0.5 text-[10px] text-[#6B1F2A]/55">
                      {product?.color || "قياسي"} · مقاس {variant?.size} · المتبقي {formatNumber(variant?.stock || 0)}
                    </p>
                    <p className="mt-1 text-xs font-bold text-[#942E3A]">
                      {formatPrice((product?.price || 0) * quantity)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center rounded-xl border border-[#942E3A]/12 bg-white p-0.5">
                    <button type="button" onClick={() => setLines((current) => current.map((item) => item.variantId === variantId ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item))} className="h-7 w-7 rounded-lg text-sm font-bold text-[#942E3A]">−</button>
                    <span className="w-6 text-center text-xs font-bold text-[#6B1F2A]">{formatNumber(quantity)}</span>
                    <button type="button" disabled={quantity >= (variant?.stock || 0)} onClick={() => setLines((current) => current.map((item) => item.variantId === variantId ? { ...item, quantity: item.quantity + 1 } : item))} className="h-7 w-7 rounded-lg bg-[#FFF9EB] text-sm font-bold text-[#942E3A] disabled:opacity-30">+</button>
                  </div>
                  <button type="button" onClick={() => setLines((current) => current.filter((item) => item.variantId !== variantId))} aria-label={`Remove ${product?.name}`} className="rounded-lg p-2 text-[#942E3A]/45 transition hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </article>
              )) : (
                <div className="rounded-2xl border border-dashed border-[#942E3A]/18 bg-[#FFF9EB]/40 px-4 py-8 text-center">
                  <ShoppingBag className="mx-auto h-5 w-5 text-[#D8B46A]" />
                  <p className="mt-2 text-xs font-bold text-[#6B1F2A]/65">{isRtl ? "الطلب فارغ تماماً" : "Your order is empty"}</p>
                  <p className="mt-1 text-[10px] text-[#6B1F2A]/45">{isRtl ? "اختر المنتجات من القائمة أعلاه لإضافتها." : "Choose a product from the dropdown above to get started."}</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className={`${step === 3 ? "" : "hidden md:block"} manual-order-sidebar xl:sticky xl:top-5`}>
          <div className="mb-5 overflow-hidden rounded-3xl bg-[#942E3A] p-5 text-[#FFF9EB] shadow-xs">
            <div className="flex items-center gap-2 text-[#D8B46A]">
              <ReceiptText className="h-4 w-4" />
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]">{isRtl ? "ملخص الحساب" : "Order summary"}</p>
            </div>
            <div className="mt-5 space-y-3 text-xs">
              <SummaryRow label={isRtl ? "مجموع المنتجات" : "Products"} value={formatPrice(subtotal)} />
              <SummaryRow label={isRtl ? "رسوم الشحن" : "Shipping"} value={formatPrice(shipping)} />
              <SummaryRow label={isRtl ? "قيمة الخصم" : "Discount"} value={`−${formatPrice(Math.min(discount, subtotal))}`} muted={!discount} />
              <div className="border-t border-white/15 pt-3">
                <SummaryRow label={isRtl ? "الإجمالي المستحق" : "Total due"} value={formatPrice(total)} total />
              </div>
            </div>
          </div>
          <section className="mb-5 manual-order-card">
            <SectionHeading step="03" title={isRtl ? "تفاصيل الدفع" : "Payment details"} icon={ReceiptText} compact />
            <OrderDetails payment={payment} setPayment={setPayment} source={source} setSource={setSource} />
          </section>
          <section className="mb-5 manual-order-card">
            <p className="field-label">{isRtl ? "تعديل المبالغ" : "Order totals"}</p>
            <div className="grid grid-cols-2 gap-2">
              <Field label={isRtl ? "تكلفة الشحن" : "Shipping fee"}>
                <input name="shippingCost" type="number" min="0" step="1" value={shipping || ""} onChange={(event) => setShipping(Number(event.target.value) || 0)} placeholder="0" className="manual-order-input text-right" />
              </Field>
              <Field label={isRtl ? "مبلغ الخصم" : "Discount"}>
                <input name="discount" type="number" min="0" max={subtotal} step="1" value={discount || ""} onChange={(event) => setDiscount(Number(event.target.value) || 0)} placeholder="0" className="manual-order-input text-right" />
              </Field>
            </div>
          </section>
          <button type="submit" disabled={!lines.length} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#942E3A] px-4 py-3.5 text-xs font-bold text-[#FFF9EB] shadow-xs transition hover:bg-[#7c2430] disabled:cursor-not-allowed disabled:opacity-40">
            <Check className="h-4 w-4 text-[#D8B46A]" />
            <span>{isRtl ? "تأكيد وإنشاء الطلب اليدوي" : "Create manual order"}</span>
          </button>
        </aside>
      </div>
    </form>
  );
}

function SectionHeading({ step, title, subtitle, icon: Icon, compact = false }: { step: string; title: string; subtitle?: string; icon: LucideIcon; compact?: boolean }) {
  return (
    <div className={`flex items-start gap-3 ${compact ? "mb-3" : "mb-5 border-b border-[#942E3A]/10 pb-4"}`}>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#942E3A] text-[10px] font-black text-[#D8B46A]">{step}</span>
      <div>
        <h2 className="font-playfair text-lg font-bold text-[#942E3A] flex items-center gap-1.5"><Icon className="h-4 w-4 text-[#D8B46A]" />{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-[#6B1F2A]/60">{subtitle}</p>}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, muted, total }: { label: string; value: string; muted?: boolean; total?: boolean }) {
  return (
    <div className={`flex justify-between items-center ${total ? "text-sm font-black" : muted ? "opacity-60" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Field({ label, optional, icon: Icon, children }: { label: string; optional?: boolean; icon?: typeof UserRound; children: React.ReactNode }) { return <label className="block"><span className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6B1F2A]/62">{Icon && <Icon className="h-3 w-3 text-[#D8B46A]" />}{label}{optional && <em className="mr-auto normal-case tracking-normal text-[#6B1F2A]/35">اختياري</em>}</span>{children}</label>; }

function ProductPicker({ options, onAddVariant }: { options: Array<{ id: string; name: string; category: string; image: string; variants: Array<{ id: string; size: string; stock: number }> }>; onAddVariant: (variantId: string) => void }) {
  const { lang, t, formatNumber } = useAdminI18n();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const isRtl = lang === "ar";

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
    <button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => { setOpen((current) => !current); setSearch(""); }} className="manual-order-select flex items-center justify-between text-right">
      <span className="text-[#6B1F2A]/55">{isRtl ? "اختر منتجاً لإضافته للطلب..." : "Choose a product…"}</span><ChevronDown className={`h-4 w-4 text-[#942E3A]/50 transition-transform ${open ? "rotate-180" : ""}`} />
    </button>
    {open && <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border border-[#942E3A]/12 bg-[#fffdf8] shadow-2xl" role="listbox" onWheel={(event) => event.stopPropagation()}><div className="border-b border-[#942E3A]/10 bg-[#fffaf0] p-2.5"><div className="relative"><Search className={`absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#942E3A]/40 ${isRtl ? "right-3" : "left-3"}`} /><input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("common.search")} aria-label="Search products" className={`h-9 w-full rounded-xl border border-[#942E3A]/10 bg-white text-xs text-[#6B1F2A] outline-none focus:border-[#D8B46A] ${isRtl ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left"}`} onClick={(event) => event.stopPropagation()} /></div></div><div className="max-h-72 space-y-1.5 overflow-y-auto overscroll-contain p-1.5">{filtered.map((option) => { const isExpanded = expandedProductId === option.id; return <div key={option.id} className={`overflow-hidden rounded-xl border transition ${isExpanded ? "border-[#942E3A] bg-[#FFF9EB]/90 shadow-xs" : "border-[#942E3A]/8 bg-white hover:border-[#D8B46A] hover:bg-[#FFF9EB]/30"}`}><button type="button" role="option" aria-expanded={isExpanded} onClick={() => handleProductClick(option)} className="flex w-full items-center gap-3 px-3 py-2.5 text-right"><span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f7e9d8] text-xs font-bold text-[#942E3A]">{option.image ? <img src={option.image} alt="" className="h-full w-full object-cover" /> : option.name.charAt(0)}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold text-[#942E3A]">{option.name}</span></span><ChevronDown className={`h-4 w-4 shrink-0 text-[#942E3A]/60 transition-transform duration-200 ${isExpanded ? "rotate-180 text-[#942E3A]" : ""}`} /></button>{isExpanded && <div className="border-t border-[#942E3A]/10 bg-white/80 p-3"><p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/60">{isRtl ? "اختر المقاس:" : "Select size:"}</p><div className="flex flex-wrap gap-1.5">{option.variants.map((variant) => { const isSelected = selectedVariantId === variant.id; return <button key={variant.id} type="button" onClick={(e) => { e.stopPropagation(); setSelectedVariantId(variant.id); }} className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-bold transition ${isSelected ? "border-[#942E3A] bg-[#942E3A] text-[#FFF9EB] shadow-xs" : "border-[#942E3A]/15 bg-white text-[#6B1F2A]/70 hover:border-[#D8B46A]"}`}>مقاس {variant.size} · متبقي {formatNumber(variant.stock)}</button>; })}</div><div className="mt-3 flex justify-end"><button type="button" disabled={!selectedVariantId} onClick={(e) => { e.stopPropagation(); if (selectedVariantId) handleAdd(selectedVariantId); }} className="inline-flex items-center gap-1.5 rounded-xl bg-[#942E3A] px-3.5 py-2 text-xs font-bold text-[#FFF9EB] shadow-xs transition hover:bg-[#7c2430] disabled:opacity-40"><Plus className="h-3.5 w-3.5 text-[#D8B46A]" /> {isRtl ? "إضافة للطلب" : "Add to order"}</button></div></div>}</div>; })}{filtered.length === 0 && <p className="px-3 py-5 text-center text-xs text-[#6B1F2A]/55">{t("common.noResults")}</p>}</div></div>}
  </div>;
}

function LocationPicker({ name, value, options, placeholder, disabled, onChange }: { name: string; value: string; options: string[]; placeholder: string; disabled?: boolean; onChange: (value: string) => void }) {
  const { lang, t } = useAdminI18n();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isRtl = lang === "ar";
  const filtered = options.filter((item) => item.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    const close = (event: PointerEvent) => { if (!dropdownRef.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <input type="hidden" name={name} value={value} />
      <button type="button" disabled={disabled} onClick={() => setOpen((c) => !c)} className={`manual-order-select flex items-center justify-between text-right ${value ? "text-[#6B1F2A]" : "text-[#6B1F2A]/40"} disabled:opacity-50`}>
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#942E3A] transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute inset-x-0 top-[calc(100%+0.35rem)] z-30 overflow-hidden rounded-2xl border border-[#eadfd6] bg-[#fffdfa] p-2 shadow-xl">
          <div className="relative">
            <Search className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-[#D8B46A] ${isRtl ? "right-3" : "left-3"}`} />
            <input autoFocus type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("common.search")} className={`h-9 w-full rounded-xl border border-[#eadfd6] bg-[#fffaf0] text-xs text-[#481827] outline-none focus:border-[#942E3A] ${isRtl ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left"}`} />
          </div>
          <div className="hide-scrollbar mt-2 max-h-48 overflow-y-auto">
            {filtered.map((item) => (
              <button key={item} type="button" onClick={() => { onChange(item); setOpen(false); setSearch(""); }} className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-right text-xs transition ${item === value ? "bg-[#942E3A] font-bold text-white" : "text-[#481827] hover:bg-[#fff5e8]"}`}>
                <span>{item}</span>
                {item === value && <Check className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CustomerPicker({ value, customers, onChange }: { value: string; customers: Customer[]; onChange: (id: string) => void }) {
  const { lang, t } = useAdminI18n();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isRtl = lang === "ar";
  const selected = customers.find((c) => c.id === value);
  const filtered = customers.filter((c) => `${c.name} ${c.phone}`.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    const close = (event: PointerEvent) => { if (!dropdownRef.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button type="button" onClick={() => setOpen((c) => !c)} className={`manual-order-select flex items-center justify-between text-right ${selected ? "text-[#6B1F2A]" : "text-[#6B1F2A]/40"}`}>
        <span className="truncate">{selected ? `${selected.name} (${selected.phone})` : (isRtl ? "ابحث عن عميل مسجل..." : "Search customer...")}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#942E3A] transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute inset-x-0 top-[calc(100%+0.35rem)] z-30 overflow-hidden rounded-2xl border border-[#eadfd6] bg-[#fffdfa] p-2 shadow-xl">
          <div className="relative">
            <Search className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-[#D8B46A] ${isRtl ? "right-3" : "left-3"}`} />
            <input autoFocus type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("common.search")} className={`h-9 w-full rounded-xl border border-[#eadfd6] bg-[#fffaf0] text-xs text-[#481827] outline-none focus:border-[#942E3A] ${isRtl ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left"}`} />
          </div>
          <div className="hide-scrollbar mt-2 max-h-48 overflow-y-auto">
            {filtered.map((c) => (
              <button key={c.id} type="button" onClick={() => { onChange(c.id); setOpen(false); setSearch(""); }} className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-right text-xs transition ${c.id === value ? "bg-[#942E3A] font-bold text-white" : "text-[#481827] hover:bg-[#fff5e8]"}`}>
                <span>{c.name} - {c.phone}</span>
                {c.id === value && <Check className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OrderDetails({ payment, setPayment, source, setSource }: { payment: string; setPayment: (p: string) => void; source: string; setSource: (s: string) => void }) {
  const { lang } = useAdminI18n();
  const isRtl = lang === "ar";

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/60">{isRtl ? "طريقة الدفع" : "Payment method"}</label>
        <div className="grid grid-cols-3 gap-1.5">
          {paymentOptions.map((opt) => (
            <button key={opt.value} type="button" onClick={() => setPayment(opt.value)} className={`flex flex-col items-center justify-center rounded-xl border p-2 text-center transition ${payment === opt.value ? "border-[#942E3A] bg-[#942E3A] text-white shadow-xs" : "border-[#942E3A]/10 bg-white text-[#6B1F2A] hover:bg-[#FFF9EB]"}`}>
              <opt.icon className="h-4 w-4 mb-1 text-[#D8B46A]" />
              <span className="text-[10px] font-bold leading-tight">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/60">{isRtl ? "مصدر الطلب" : "Order source"}</label>
        <div className="grid grid-cols-2 gap-1.5">
          {sourceOptions.map((opt) => (
            <button key={opt.value} type="button" onClick={() => setSource(opt.value)} className={`flex items-center justify-center gap-1.5 rounded-xl border p-2 text-center transition ${source === opt.value ? "border-[#942E3A] bg-[#942E3A] text-white shadow-xs" : "border-[#942E3A]/10 bg-white text-[#6B1F2A] hover:bg-[#FFF9EB]"}`}>
              <opt.icon className="h-3.5 w-3.5 text-[#D8B46A]" />
              <span className="text-[10px] font-bold">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
