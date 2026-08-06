"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Layers3,
  Package,
  Palette,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tags,
  Trash2,
  X,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/providers/ToastProvider";
import {
  createCatalogOptionAction,
  deleteCatalogOptionAction,
} from "@/app/admin/products/categories/actions";

interface Option {
  id: string;
  category: string;
  type: string;
  name: string;
}

interface ProductPreview {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  subcategory: string | null;
  material: string | null;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  color: string | null;
  variants: Array<{ size: string; stock: number }>;
}

const categories = [
  {
    key: "shoes",
    label: "Shoes",
    description: "Sneakers, runners and everyday pairs",
    types: [
      { key: "brand", label: "Brands", icon: Sparkles },
      { key: "color", label: "Colors", icon: Palette },
      { key: "size", label: "Sizes", icon: SlidersHorizontal },
    ],
  },
  {
    key: "bags",
    label: "Bags",
    description: "Carryalls, crossbody and essentials",
    types: [
      { key: "subcategory", label: "Bag categories", icon: Layers3 },
      { key: "brand", label: "Brands", icon: Sparkles },
      { key: "color", label: "Colors", icon: Palette },
    ],
  },
  {
    key: "perfumes",
    label: "Perfumes",
    description: "Fragrance houses and bottle sizes",
    types: [
      { key: "brand", label: "Brands", icon: Sparkles },
      { key: "volume", label: "Sizes / ml", icon: SlidersHorizontal },
    ],
  },
  {
    key: "accessories",
    label: "Accessories",
    description: "Finishing touches for every look",
    types: [
      { key: "subcategory", label: "Categories", icon: Layers3 },
      { key: "brand", label: "Brands", icon: Sparkles },
      { key: "material", label: "Materials", icon: Package },
    ],
  },
];

const colorSwatches: Record<string, string> = {
  white: "#FFFFFF",
  beige: "#D8C3A5",
  black: "#171717",
  grey: "#8C8C8C",
  gray: "#8C8C8C",
  pink: "#E7A6B7",
  brown: "#8B5E3C",
  burgundy: "#7B263A",
  navy: "#1D3557",
  blue: "#3B82F6",
  red: "#C2414B",
  green: "#4F805C",
  yellow: "#E2B93B",
  orange: "#D97732",
  purple: "#7C5AA6",
  silver: "#B8BDC5",
  gold: "#D8B46A",
};

function getColorSwatch(name: string) {
  const normalized = name.trim().toLowerCase();
  return colorSwatches[normalized] || "#D8B46A";
}

export default function AdminCategoriesClient({
  options,
  products,
}: {
  options: Option[];
  products: ProductPreview[];
}) {
  const { toast } = useToast();
  const [category, setCategory] = useState("shoes");
  const [search, setSearch] = useState("");
  const [optionType, setOptionType] = useState("brand");
  const [optionMenuOpen, setOptionMenuOpen] = useState(false);
  const [activeOption, setActiveOption] = useState<Option | null>(null);
  const optionMenuRef = useRef<HTMLDivElement>(null);
  const selected =
    categories.find((item) => item.key === category) || categories[0];
  const selectedType =
    selected.types.find((type) => type.key === optionType) || selected.types[0];

  useEffect(() => {
    if (!optionMenuOpen) return;
    const closeMenu = (event: MouseEvent) => {
      if (!optionMenuRef.current?.contains(event.target as Node)) {
        setOptionMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, [optionMenuOpen]);
  const selectedOptions = options.filter((option) => option.category === category);
  const visibleOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return selectedOptions;
    return selectedOptions.filter(
      (option) =>
        option.name.toLowerCase().includes(query) ||
        option.type.toLowerCase().includes(query),
    );
  }, [search, selectedOptions]);
  const totalGroups = new Set(selectedOptions.map((option) => option.type)).size;
  const matchingProducts = activeOption
    ? products.filter((product) => {
        const value = activeOption.name.trim().toLowerCase();
        const matches = (candidate: string | null | undefined) =>
          candidate?.trim().toLowerCase() === value;
        if (activeOption.type === "brand") return matches(product.brand);
        if (activeOption.type === "color") return matches(product.color);
        if (activeOption.type === "size" || activeOption.type === "volume") {
          return product.variants.some((variant) => matches(variant.size));
        }
        if (activeOption.type === "subcategory") return matches(product.subcategory);
        if (activeOption.type === "material") return matches(product.material);
        return false;
      })
    : [];

  return (
    <div className="space-y-5 pb-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">
            <span>Catalog intelligence</span>
            <span className="h-1 w-1 rounded-full bg-[#D8B46A]" />
            <span>Control center</span>
          </div>
          <h1 className="mt-1 font-playfair text-3xl font-black text-[#942E3A] sm:text-4xl">
            Categories & options
          </h1>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-[#6B1F2A]/65">
            Build the reusable vocabulary behind your catalog. Every option here
            powers cleaner product creation and sharper storefront filters.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#942E3A] px-4 py-3 text-xs font-bold text-[#FFF9EB] shadow-[0_8px_20px_rgba(148,46,58,0.16)] transition hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4 text-[#D8B46A]" /> Add product
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <nav
        className="flex w-fit gap-1 rounded-2xl border border-[#942E3A]/10 bg-white p-1 shadow-sm"
        aria-label="Product management tabs"
      >
        <Link
          href="/admin/products"
          className="rounded-xl px-4 py-2.5 text-xs font-bold text-[#942E3A]/65 hover:bg-[#FFF9EB] hover:text-[#942E3A]"
        >
          Products
        </Link>
        <Link
          href="/admin/products/categories"
          aria-current="page"
          className="rounded-xl bg-[#942E3A] px-4 py-2.5 text-xs font-bold text-[#FFF9EB]"
        >
          Categories & options
        </Link>
      </nav>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6B1F2A]/50">
              Active options
            </p>
            <Tags className="h-4 w-4 text-[#D8B46A]" />
          </div>
          <p className="mt-2 font-playfair text-2xl font-black text-[#942E3A]">
            {selectedOptions.length}
          </p>
          <p className="mt-1 text-[10px] text-[#6B1F2A]/55">in {selected.label.toLowerCase()}</p>
        </div>
        <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6B1F2A]/50">
              Option groups
            </p>
            <Layers3 className="h-4 w-4 text-[#D8B46A]" />
          </div>
          <p className="mt-2 font-playfair text-2xl font-black text-[#942E3A]">{totalGroups}</p>
          <p className="mt-1 text-[10px] text-[#6B1F2A]/55">available to products</p>
        </div>
        <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6B1F2A]/50">
              Catalog coverage
            </p>
            <Check className="h-4 w-4 text-[#D8B46A]" />
          </div>
          <p className="mt-2 font-playfair text-2xl font-black text-[#942E3A]">
            {Math.round((selectedOptions.length / Math.max(selected.types.length, 1)) * 10) / 10}
          </p>
          <p className="mt-1 text-[10px] text-[#6B1F2A]/55">options per group</p>
        </div>
        <div className="rounded-2xl border border-[#D8B46A]/35 bg-[#fff7df] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6B1F2A]/50">
              Library total
            </p>
            <Package className="h-4 w-4 text-[#D8B46A]" />
          </div>
          <p className="mt-2 font-playfair text-2xl font-black text-[#942E3A]">{options.length}</p>
          <p className="mt-1 text-[10px] text-[#6B1F2A]/55">across all categories</p>
        </div>
      </section>

      <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((item) => {
            const count = options.filter((option) => option.category === item.key).length;
            const isSelected = category === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setCategory(item.key);
                  setOptionType(item.types[0].key);
                  setSearch("");
                }}
                className={`group min-w-[145px] rounded-2xl border px-3 py-3 text-left transition ${isSelected ? "border-[#942E3A] bg-[#942E3A] text-[#FFF9EB] shadow-[0_7px_18px_rgba(148,46,58,0.17)]" : "border-transparent bg-[#FFF9EB]/80 text-[#942E3A] hover:border-[#D8B46A]/50"}`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold">{item.label}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${isSelected ? "bg-[#FFF9EB]/15 text-[#D8B46A]" : "bg-white text-[#942E3A]/65"}`}>
                    {count}
                  </span>
                </span>
                <span className={`mt-1 block truncate text-[9px] ${isSelected ? "text-[#FFF9EB]/65" : "text-[#6B1F2A]/55"}`}>
                  {item.description}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(280px,0.72fr)_minmax(0,1.55fr)]">
        <section className="relative overflow-hidden rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-[#D8B46A]/10 blur-2xl" />
          <div className="relative">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">Library builder</p>
                <h2 className="mt-1 font-playfair text-2xl font-black text-[#942E3A]">Add an option</h2>
                <p className="mt-1 text-xs leading-5 text-[#6B1F2A]/60">Create a reusable value for this category.</p>
              </div>
              <div className="rounded-2xl bg-[#FFF9EB] p-3 text-[#D8B46A]"><Plus className="h-5 w-5" /></div>
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-2xl border border-[#D8B46A]/25 bg-[#fff7df] px-3 py-2.5">
              <span className="h-2 w-2 rounded-full bg-[#942E3A]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#942E3A]">Editing {selected.label}</span>
            </div>
            <form action={createCatalogOptionAction} className="mt-5 space-y-4">
              <input type="hidden" name="category" value={category} />
              <input type="hidden" name="type" value={selectedType.key} />
              <label className="block">
                <span className="field-label">Option group</span>
                <div ref={optionMenuRef} className="relative mt-1">
                  <button
                    type="button"
                    onClick={() => setOptionMenuOpen((open) => !open)}
                    aria-expanded={optionMenuOpen}
                    aria-haspopup="listbox"
                    className="admin-input flex w-full items-center justify-between gap-3 text-left font-semibold text-[#942E3A] transition hover:border-[#942E3A] focus:border-[#942E3A] focus:ring-2 focus:ring-[#D8B46A]/25"
                  >
                    <span className="flex items-center gap-2">
                      <selectedType.icon className="h-4 w-4 text-[#D8B46A]" />
                      {selectedType.label}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-[#D8B46A] transition-transform ${optionMenuOpen ? "rotate-180" : ""}`} />
                  </button>
                  {optionMenuOpen && (
                    <div
                      role="listbox"
                      aria-label="Option group"
                      className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-2xl border border-[#D8B46A]/40 bg-[#FFF9EB] p-1.5 shadow-[0_16px_35px_rgba(67,25,31,0.18)]"
                    >
                      {selected.types.map((type) => {
                        const TypeIcon = type.icon;
                        const isActive = type.key === selectedType.key;
                        return (
                          <button
                            key={type.key}
                            type="button"
                            role="option"
                            aria-selected={isActive}
                            onClick={() => {
                              setOptionType(type.key);
                              setOptionMenuOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-bold transition ${isActive ? "bg-[#942E3A] text-[#FFF9EB]" : "text-[#942E3A] hover:bg-[#F2DFC0]"}`}
                          >
                            <span className="flex items-center gap-2">
                              <TypeIcon className={`h-4 w-4 ${isActive ? "text-[#D8B46A]" : "text-[#D8B46A]"}`} />
                              {type.label}
                            </span>
                            {isActive && <Check className="h-3.5 w-3.5 text-[#D8B46A]" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </label>
              <label className="block">
                <span className="field-label">Display name</span>
                <input required name="name" placeholder="e.g. Nike or Burgundy" className="admin-input mt-1" />
              </label>

              <button
                type="submit"
                onClick={() => {
                  toast.success(`New option added to ${selected.label}!`, "CATEGORY UPDATED");
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#942E3A] px-4 py-3 text-xs font-bold text-[#FFF9EB] shadow-[0_8px_18px_rgba(148,46,58,0.14)] transition hover:-translate-y-0.5"
              >
                <Plus className="h-4 w-4 text-[#D8B46A]" /> Save to {selected.label}
              </button>
            </form>
            <div className="mt-5 border-t border-[#942E3A]/8 pt-4 text-[10px] leading-5 text-[#6B1F2A]/55">
              Tip: use consistent names and keep values short. These options become easier to filter and reuse across your catalog.
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">Option library</p>
              <h2 className="mt-1 font-playfair text-2xl font-black text-[#942E3A]">{selected.label} options</h2>
              <p className="mt-1 text-xs text-[#6B1F2A]/60">Manage the values your team can select while creating products.</p>
            </div>
            <label className="relative block sm:w-60">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D8B46A]" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search this library" className="admin-input pl-9" />
            </label>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {selected.types.map((type) => {
              const TypeIcon = type.icon;
              const typeOptions = visibleOptions.filter((option) => option.type === type.key);
              const totalTypeOptions = selectedOptions.filter((option) => option.type === type.key).length;
              return (
                <div key={type.key} className="overflow-hidden rounded-2xl border border-[#D8B46A]/20 bg-[#FFF9EB]/65">
                  <div className="flex items-center justify-between border-b border-[#D8B46A]/15 px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-white p-1.5 text-[#D8B46A]"><TypeIcon className="h-3.5 w-3.5" /></span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#942E3A]">{type.label}</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#6B1F2A]/50">{totalTypeOptions} values</span>
                  </div>
                  <div
                    onWheel={(event) => event.stopPropagation()}
                    className="hide-scrollbar max-h-72 space-y-1.5 overflow-y-auto overscroll-contain p-2.5 [touch-action:pan-y]"
                  >
                    {typeOptions.map((option) => (
                      <div key={option.id} className="group flex items-center gap-2 rounded-xl border border-transparent bg-white px-2.5 py-2.5 text-xs transition hover:border-[#D8B46A]/40 hover:shadow-sm">
                        <button type="button" onClick={() => setActiveOption(option)} className="flex min-w-0 flex-1 items-center gap-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#D8B46A]">
                          {type.key === "color" && (
                            <span aria-hidden="true" className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-[#942E3A]/15 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)]" style={{ backgroundColor: getColorSwatch(option.name) }} />
                          )}
                          <span className="truncate font-bold text-[#6B1F2A]">{option.name}</span>
                          <ArrowUpRight className="ml-auto h-3.5 w-3.5 shrink-0 text-[#D8B46A] opacity-0 transition group-hover:opacity-100" />
                        </button>
                        <form action={deleteCatalogOptionAction}>
                          <input type="hidden" name="id" value={option.id} />
                          <button type="submit" aria-label={`Delete ${option.name}`} className="rounded-lg p-1.5 text-[#6B1F2A]/30 transition hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </form>
                      </div>
                    ))}
                    {!typeOptions.length && <p className="py-8 text-center text-[10px] text-[#6B1F2A]/50">{search ? "No matching options" : "No options yet"}</p>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-[#942E3A]/8 bg-white px-3 py-3 text-[10px] text-[#6B1F2A]/55">
            <Tags className="h-4 w-4 shrink-0 text-[#D8B46A]" />
            <span>Showing {visibleOptions.length} of {selectedOptions.length} options in this category.</span>
          </div>
        </section>
      </div>
      {activeOption && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#43191F]/35 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveOption(null); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="option-products-title" className="max-h-[86vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-[#D8B46A]/35 bg-[#FFF9EB] shadow-[0_24px_80px_rgba(67,25,31,0.28)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#942E3A]/10 bg-white px-5 py-5 sm:px-7">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">Catalog connection</p>
                <h2 id="option-products-title" className="mt-1 font-playfair text-2xl font-black text-[#942E3A]">Products using {activeOption.name}</h2>
                <p className="mt-1 text-xs text-[#6B1F2A]/60">{matchingProducts.length} {matchingProducts.length === 1 ? "product" : "products"} connected to this {activeOption.type} option.</p>
              </div>
              <button type="button" onClick={() => setActiveOption(null)} aria-label="Close products dialog" className="rounded-full p-2 text-[#942E3A]/60 hover:bg-[#F2DFC0] hover:text-[#942E3A]"><X className="h-4 w-4" /></button>
            </div>
            <div
              onWheel={(event) => event.stopPropagation()}
              onTouchMove={(event) => event.stopPropagation()}
              className="hide-scrollbar max-h-[calc(86vh-125px)] overflow-y-auto overscroll-contain p-5 [touch-action:pan-y] sm:p-7"
            >
              {matchingProducts.length ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {matchingProducts.map((product) => (
                    <Link key={product.id} href={`/admin/products/${product.id}`} onClick={() => setActiveOption(null)} className="group overflow-hidden rounded-2xl border border-[#942E3A]/10 bg-white transition hover:-translate-y-0.5 hover:border-[#D8B46A]/50 hover:shadow-lg">
                      <div className="flex h-36 items-center justify-center bg-[#FFF9EB]">
                        {product.images[0] ? <img src={product.images[0]} alt="" className="h-full w-full object-cover" /> : <Package className="h-8 w-8 text-[#D8B46A]" />}
                      </div>
                      <div className="p-3">
                        <p className="truncate text-xs font-bold text-[#942E3A]">{product.name}</p>
                        <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-[#6B1F2A]/60">
                          <span className="capitalize">{product.category}</span>
                          <span className="font-bold text-[#942E3A]">{formatCurrency(product.price)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#D8B46A]/45 bg-white px-5 py-16 text-center">
                  <Package className="h-9 w-9 text-[#D8B46A]" />
                  <p className="mt-3 font-playfair text-lg font-bold text-[#942E3A]">No products connected yet</p>
                  <p className="mt-1 max-w-sm text-xs leading-5 text-[#6B1F2A]/60">Products using this option will appear here once their details match this value.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
