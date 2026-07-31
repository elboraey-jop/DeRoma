"use client";

import { Check, ChevronDown, Search, SlidersHorizontal, Store } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export type ProcurementVariant = {
  id: string;
  label: string;
  productName: string;
  category: string;
  image: string | null;
  wholesalePrice: number;
  retailPrice: number;
};

function useOutsideClose(ref: React.RefObject<HTMLDivElement | null>, close: () => void) {
  useEffect(() => {
    const handle = (event: MouseEvent) => { if (!ref.current?.contains(event.target as Node)) close(); };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [close, ref]);
}

export function AdminSupplierPicker({ suppliers, value, onChange }: { suppliers: { id: string; name: string }[]; value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClose(ref, () => setOpen(false));
  const selected = suppliers.find((supplier) => supplier.id === value);
  const filtered = suppliers.filter((supplier) => supplier.name.toLowerCase().includes(query.toLowerCase()));
  return <div ref={ref} className="relative"><button type="button" onClick={() => setOpen((current) => !current)} className="admin-input flex min-h-[54px] items-center justify-between gap-3 text-left"><span className={selected ? "font-semibold text-[#942E3A]" : "text-[#6B1F2A]/65"}>{selected?.name || "Choose supplier"}</span><ChevronDown className={`h-4 w-4 shrink-0 text-[#D8B46A] transition-transform ${open ? "rotate-180" : ""}`} /></button>{open && <div className="absolute left-0 top-[calc(100%+8px)] z-40 w-full min-w-[240px] overflow-hidden rounded-2xl border border-[#D8B46A]/45 bg-[#FFF9EB] p-2 shadow-[0_18px_40px_rgba(67,25,31,0.2)]"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D8B46A]" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search supplier..." className="w-full rounded-xl border border-[#942E3A]/10 bg-white px-9 py-2.5 text-xs text-[#942E3A] outline-none focus:border-[#942E3A]" /></div><div onWheel={(event) => event.stopPropagation()} className="hide-scrollbar mt-2 max-h-56 space-y-1 overflow-y-auto overscroll-contain">{filtered.map((supplier) => <button type="button" key={supplier.id} onClick={() => { onChange(supplier.id); setOpen(false); setQuery(""); }} className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-bold transition ${supplier.id === value ? "bg-[#942E3A] text-[#FFF9EB]" : "text-[#942E3A] hover:bg-[#F2DFC0]"}`}><span className="flex items-center gap-2"><Store className="h-3.5 w-3.5 text-[#D8B46A]" />{supplier.name}</span>{supplier.id === value && <Check className="h-3.5 w-3.5 text-[#D8B46A]" />}</button>)}{!filtered.length && <p className="px-3 py-5 text-center text-xs text-[#6B1F2A]/60">No suppliers found.</p>}</div></div>}</div>;
}

export function AdminProductPicker({ variants, value, onChange }: { variants: ProcurementVariant[]; value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClose(ref, () => setOpen(false));
  const selected = variants.find((variant) => variant.id === value);
  const categories = ["all", ...Array.from(new Set(variants.map((variant) => variant.category)))];
  const filtered = useMemo(() => variants.filter((variant) => {
    const text = `${variant.productName} ${variant.label}`.toLowerCase();
    return (category === "all" || variant.category === category) && text.includes(query.toLowerCase());
  }), [category, query, variants]);
  return <div ref={ref} className="relative flex-1"><button type="button" onClick={() => setOpen((current) => !current)} className="admin-input flex min-h-[54px] items-center gap-3 text-left"><span className="flex min-w-0 flex-1 items-center gap-3">{selected?.image ? <img src={selected.image} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" /> : <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F2DFC0] text-[#D8B46A]"><SlidersHorizontal className="h-4 w-4" /></span>}<span className={`min-w-0 truncate ${selected ? "font-semibold text-[#942E3A]" : "text-[#6B1F2A]/65"}`}>{selected ? `${selected.productName} · ${selected.label}` : "Choose product variant to add"}</span></span><ChevronDown className={`h-4 w-4 shrink-0 text-[#D8B46A] transition-transform ${open ? "rotate-180" : ""}`} /></button>{open && <div className="absolute left-0 top-[calc(100%+8px)] z-40 w-full min-w-[300px] overflow-hidden rounded-2xl border border-[#D8B46A]/45 bg-[#FFF9EB] p-2 shadow-[0_18px_40px_rgba(67,25,31,0.2)]"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D8B46A]" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search product, color, size or SKU..." className="w-full rounded-xl border border-[#942E3A]/10 bg-white px-9 py-2.5 text-xs text-[#942E3A] outline-none focus:border-[#942E3A]" /></div><div className="mt-2 flex gap-1 overflow-x-auto pb-1">{categories.map((item) => <button type="button" key={item} onClick={() => setCategory(item)} className={`whitespace-nowrap rounded-full px-2.5 py-1.5 text-[9px] font-bold capitalize ${category === item ? "bg-[#942E3A] text-[#FFF9EB]" : "bg-white text-[#942E3A]/70"}`}>{item}</button>)}</div><div onWheel={(event) => event.stopPropagation()} className="hide-scrollbar mt-1 max-h-72 space-y-1 overflow-y-auto overscroll-contain">{filtered.map((variant) => <button type="button" key={variant.id} onClick={() => { onChange(variant.id); setOpen(false); setQuery(""); }} className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition ${variant.id === value ? "bg-[#942E3A] text-[#FFF9EB]" : "text-[#942E3A] hover:bg-[#F2DFC0]"}`}>{variant.image ? <img src={variant.image} alt="" className="h-11 w-11 shrink-0 rounded-lg bg-white object-cover" /> : <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-[#D8B46A]"><Store className="h-4 w-4" /></span>}<span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold">{variant.productName}</span><span className="mt-0.5 block truncate text-[10px] opacity-70">{variant.label}</span></span>{variant.id === value && <Check className="h-4 w-4 shrink-0 text-[#D8B46A]" />}</button>)}{!filtered.length && <p className="px-3 py-5 text-center text-xs text-[#6B1F2A]/60">No matching products.</p>}</div></div>}</div>;
}
