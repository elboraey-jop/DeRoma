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
import { useToast } from "@/providers/ToastProvider";
import {
  createCatalogOptionAction,
  deleteCatalogOptionAction,
} from "@/app/admin/products/categories/actions";
import { useAdminI18n } from "@/providers/AdminI18nContext";

interface Option {
  id: string;
  category: string;
  type: string;
  name: string;
  value: string | null;
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
  red: "#EF4444",
  green: "#10B981",
};

export default function AdminCategoriesClient({
  options,
  products,
}: {
  options: Option[];
  products: ProductPreview[];
}) {
  const { lang, t, formatPrice, formatNumber } = useAdminI18n();
  const isRtl = lang === "ar";

  const categories = [
    {
      key: "shoes",
      label: isRtl ? "الأحذية" : "Shoes",
      description: isRtl ? "الأحذية الرياضية والفاخرة واليومية" : "Sneakers, runners and everyday pairs",
      types: [
        { key: "brand", label: isRtl ? "الماركات" : "Brands", icon: Sparkles },
        { key: "color", label: isRtl ? "الألوان" : "Colors", icon: Palette },
        { key: "size", label: isRtl ? "المقاسات" : "Sizes", icon: SlidersHorizontal },
      ],
    },
    {
      key: "bags",
      label: isRtl ? "الحقائب" : "Bags",
      description: isRtl ? "حقائب اليد والكتف والمناسبات" : "Carryalls, crossbody and essentials",
      types: [
        { key: "subcategory", label: isRtl ? "أنواع الحقائب" : "Bag categories", icon: Layers3 },
        { key: "brand", label: isRtl ? "الماركات" : "Brands", icon: Sparkles },
        { key: "color", label: isRtl ? "الألوان" : "Colors", icon: Palette },
      ],
    },
    {
      key: "perfumes",
      label: isRtl ? "العطور" : "Perfumes",
      description: isRtl ? "دور العطور وسعات الزجاجات" : "Fragrance houses and bottle sizes",
      types: [
        { key: "brand", label: isRtl ? "الماركات" : "Brands", icon: Sparkles },
        { key: "volume", label: isRtl ? "السعة / مل" : "Sizes / ml", icon: SlidersHorizontal },
      ],
    },
    {
      key: "accessories",
      label: isRtl ? "الإكسسوارات" : "Accessories",
      description: isRtl ? "اللمسات الأخيرة الفاخرة لكل إطلالة" : "Finishing touches for every look",
      types: [
        { key: "subcategory", label: isRtl ? "الفئات الفرعية" : "Categories", icon: Layers3 },
        { key: "brand", label: isRtl ? "الماركات" : "Brands", icon: Sparkles },
        { key: "material", label: isRtl ? "الخامات" : "Materials", icon: Package },
      ],
    },
  ];

  const { toast } = useToast();
  const [category, setCategory] = useState("shoes");
  const [optionType, setOptionType] = useState("brand");
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [optionMenuOpen, setOptionMenuOpen] = useState(false);
  const [activeOption, setActiveOption] = useState<Option | null>(null);
  const [newColorValue, setNewColorValue] = useState("#942E3A");
  const optionMenuRef = useRef<HTMLDivElement>(null);

  const selected = categories.find((item) => item.key === category) || categories[0];
  const activeType = selected.types.find((item) => item.key === optionType) || selected.types[0];

  const selectedOptions = useMemo(
    () => options.filter((item) => item.category === category),
    [options, category],
  );

  const filteredOptions = useMemo(
    () => selectedOptions.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())),
    [selectedOptions, search],
  );

  useEffect(() => {
    if (!optionMenuOpen) return;
    const closeMenu = (event: MouseEvent) => {
      if (!optionMenuRef.current?.contains(event.target as Node)) setOptionMenuOpen(false);
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, [optionMenuOpen]);

  const matchingProducts = useMemo(() => {
    if (!activeOption) return [];
    const target = activeOption.name.trim().toLowerCase();
    const matches = (value: string | null | undefined) => value?.trim().toLowerCase() === target;
    return products.filter((product) => {
      if (product.category !== activeOption.category) return false;
      if (activeOption.type === "brand") return matches(product.brand);
      if (activeOption.type === "color") return matches(product.color);
      if (activeOption.type === "size" || activeOption.type === "volume") return product.variants.some((variant) => matches(variant.size));
      if (activeOption.type === "subcategory") return matches(product.subcategory);
      if (activeOption.type === "material") return matches(product.material);
      return false;
    });
  }, [activeOption, products]);

  const totalGroups = selected.types.length;

  const renderOptionCard = (opt: Option) => (
    <div key={opt.id} onClick={() => setActiveOption(opt)} className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-[#942E3A]/10 bg-white px-2.5 py-2.5 transition hover:border-[#D8B46A]/60">
      <div className="flex min-w-0 items-center gap-2">
        {opt.type === "color" && <span className="h-4 w-4 shrink-0 rounded-full border border-black/15 shadow-xs" style={{ backgroundColor: opt.value || colorSwatches[opt.name.toLowerCase()] || "#D8B46A" }} />}
        <span className="truncate text-xs font-bold text-[#942E3A]">{opt.name}</span>
      </div>
      <form onClick={(event) => event.stopPropagation()} action={async (formData) => {
        setPendingId(opt.id);
        try {
          await deleteCatalogOptionAction(formData);
          toast.success(isRtl ? "Option deleted successfully!" : "Option deleted successfully!");
        } catch (error: any) {
          toast.error(error?.message || "Failed to delete option");
        } finally {
          setPendingId(null);
        }
      }}>
        <input type="hidden" name="id" value={opt.id} />
        <button type="submit" disabled={pendingId === opt.id} className="rounded-lg p-1.5 text-stone-400 transition hover:bg-red-50 hover:text-red-600" title={t("common.delete")}><Trash2 className="h-3.5 w-3.5" /></button>
      </form>
    </div>
  );

  return (
    <div className="space-y-6 text-right">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#D8B46A]">
            {isRtl ? "كتالوج منتجات دي روما" : "Product catalog engine"}
          </p>

          <h1 className="mt-1 font-playfair text-3xl font-black text-[#942E3A]">
            {isRtl ? "أقسام وخيارات الكتالوج" : "Categories & Attributes"}
          </h1>
          <p className="mt-1 text-xs text-[#6B1F2A]/65">
            {isRtl ? "إدارة الماركات، الألوان، المقاسات وخامات المنتجات بكل سهولة." : "Manage brands, colors, sizes, and materials for every category."}
          </p>
        </div>
      </div>

      <nav
        aria-label="Catalog pages"
        className="inline-flex rounded-2xl border border-[#942E3A]/10 bg-white p-1 shadow-xs"
      >
        <Link
          href="/admin/products"
          className="rounded-xl px-4 py-2.5 text-xs font-bold text-[#942E3A]/65 hover:bg-[#FFF9EB] hover:text-[#942E3A]"
        >
          {isRtl ? "قائمة المنتجات" : "Products"}
        </Link>
        <Link
          href="/admin/products/categories"
          aria-current="page"
          className="rounded-xl bg-[#942E3A] px-4 py-2.5 text-xs font-bold text-[#FFF9EB]"
        >
          {isRtl ? "الأقسام والخيارات" : "Categories & options"}
        </Link>
      </nav>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6B1F2A]/50">
              {isRtl ? "الخيارات النشطة" : "Active options"}
            </p>
            <Tags className="h-4 w-4 text-[#D8B46A]" />
          </div>
          <p className="mt-2 font-playfair text-2xl font-black text-[#942E3A]">
            {formatNumber(selectedOptions.length)}
          </p>
          <p className="mt-1 text-[10px] text-[#6B1F2A]/55">
            {isRtl ? `في قسم ${selected.label}` : `in ${selected.label.toLowerCase()}`}
          </p>
        </div>

        <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6B1F2A]/50">
              {isRtl ? "مجموعات الخيارات" : "Option groups"}
            </p>
            <Layers3 className="h-4 w-4 text-[#D8B46A]" />
          </div>
          <p className="mt-2 font-playfair text-2xl font-black text-[#942E3A]">{formatNumber(totalGroups)}</p>
          <p className="mt-1 text-[10px] text-[#6B1F2A]/55">{isRtl ? "متاحة لمنتجات القسم" : "available to products"}</p>
        </div>

        <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6B1F2A]/50">
              {isRtl ? "تغطية الخيارات" : "Catalog coverage"}
            </p>
            <Check className="h-4 w-4 text-[#D8B46A]" />
          </div>
          <p className="mt-2 font-playfair text-2xl font-black text-[#942E3A]">
            {formatNumber(Math.round((selectedOptions.length / Math.max(selected.types.length, 1)) * 10) / 10)}
          </p>
          <p className="mt-1 text-[10px] text-[#6B1F2A]/55">{isRtl ? "خيار لكل مجموعة" : "options per group"}</p>
        </div>

        <div className="rounded-2xl border border-[#D8B46A]/35 bg-[#fff7df] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6B1F2A]/50">
              {isRtl ? "إجمالي المكتبة" : "Library total"}
            </p>
            <Package className="h-4 w-4 text-[#D8B46A]" />
          </div>
          <p className="mt-2 font-playfair text-2xl font-black text-[#942E3A]">{formatNumber(options.length)}</p>
          <p className="mt-1 text-[10px] text-[#6B1F2A]/55">{isRtl ? "في جميع الأقسام" : "across all categories"}</p>
        </div>
      </section>

      <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-3 shadow-xs sm:p-4">
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
                className={`group min-w-[145px] rounded-2xl border px-3 py-3 text-right transition ${isSelected ? "border-[#942E3A] bg-[#942E3A] text-[#FFF9EB] shadow-xs" : "border-[#D8B46A]/35 bg-[#FFF9EB]/80 text-[#942E3A] hover:border-[#D8B46A] hover:bg-white"}`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold">{item.label}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${isSelected ? "bg-[#FFF9EB]/15 text-[#D8B46A]" : "bg-white text-[#942E3A]/65"}`}>
                    {formatNumber(count)}
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
        <section className="relative overflow-hidden rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-xs sm:p-6">
          <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-[#D8B46A]/10 blur-2xl" />
          <div className="relative">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
                  {isRtl ? "مُنشئ الخيارات" : "Library builder"}
                </p>
                <h2 className="mt-1 font-playfair text-2xl font-bold text-[#942E3A]">
                  {isRtl ? "إضافة خيار جديد" : "Add new option"}
                </h2>
                <p className="mt-1 text-xs text-[#6B1F2A]/60">
                  {isRtl ? "إضافة ماركة، لون، مقاس أو خامة جديدة لإتاحتها فوراً للمنتجات." : "Add a brand, color, size or material to make it available to products."}
                </p>
              </div>
            </div>

            <form
              action={async (formData) => {
                try {
                  await createCatalogOptionAction(formData);
                  toast.success(isRtl ? "تمت إضافة الخيار بنجاح!" : "Option created successfully!");
                } catch (e: any) {
                  toast.error(e?.message || (isRtl ? "حدث خطأ أثناء الإضافة" : "Failed to create option"));
                }
              }}
              className="mt-6 space-y-4"
            >
              <input type="hidden" name="category" value={category} />
              <input type="hidden" name="type" value={activeType.key} />
              {activeType.key === "color" && <input type="hidden" name="value" value={newColorValue} />}

              <div>
                <label className="field-label">{isRtl ? "القسم المختار" : "Category"}</label>
                <input
                  readOnly
                  value={selected.label}
                  className="admin-input bg-[#FFF9EB]/60 font-semibold cursor-default text-right"
                />
              </div>

              <div>
                <label className="field-label">{isRtl ? "نوع الخيار" : "Option type"}</label>
                <div ref={optionMenuRef} className="relative mt-1">
                  <button type="button" onClick={() => setOptionMenuOpen((open) => !open)} aria-expanded={optionMenuOpen} className="admin-input flex w-full items-center justify-between gap-3 text-left font-semibold text-[#942E3A]">
                    <span className="flex items-center gap-2"><activeType.icon className="h-4 w-4 text-[#D8B46A]" />{activeType.label}</span>
                    <ChevronDown className={`h-4 w-4 text-[#D8B46A] transition-transform ${optionMenuOpen ? "rotate-180" : ""}`} />
                  </button>
                  {optionMenuOpen && (
                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-2xl border border-[#D8B46A]/40 bg-[#FFF9EB] p-1.5 shadow-[0_16px_35px_rgba(67,25,31,0.18)]">
                      {selected.types.map((type) => {
                        const TypeIcon = type.icon;
                        const isActive = type.key === activeType.key;
                        return <button key={type.key} type="button" onClick={() => { setOptionType(type.key); setOptionMenuOpen(false); setSearch(""); }} className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-bold ${isActive ? "bg-[#942E3A] text-[#FFF9EB]" : "text-[#942E3A] hover:bg-[#F2DFC0]"}`}><span className="flex items-center gap-2"><TypeIcon className="h-4 w-4 text-[#D8B46A]" />{type.label}</span>{isActive && <Check className="h-3.5 w-3.5 text-[#D8B46A]" />}</button>;
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="field-label">{isRtl ? "اسم الخيار" : "Option name"} *</label>
                <input
                  required
                  name="name"
                  placeholder={isRtl ? `أدخل اسم ${activeType.label}...` : `Enter ${activeType.label.toLowerCase()} name…`}
                  className="admin-input text-right"
                />
              </div>

              {activeType.key === "color" && (
                <div>
                  <label className="field-label">{isRtl ? "اختار اللون" : "Choose color"}</label>
                  <div className="mt-1 flex items-center gap-3 rounded-xl border border-[#942E3A]/15 bg-white px-3 py-2.5">
                    <input
                      type="color"
                      value={newColorValue}
                      onChange={(event) => setNewColorValue(event.target.value)}
                      className="h-10 w-14 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                      aria-label="Choose color"
                    />
                    <span className="h-8 w-8 rounded-full border border-[#942E3A]/15" style={{ backgroundColor: newColorValue }} />
                    <span className="font-mono text-xs font-bold uppercase text-[#942E3A]">{newColorValue}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#942E3A] px-4 py-3 text-xs font-bold text-[#FFF9EB] shadow-xs transition hover:bg-[#7e2531]"
              >
                <Plus className="h-4 w-4 text-[#D8B46A]" />
                <span>{isRtl ? "حفظ وإضافة الخيار" : "Create option"}</span>
              </button>
            </form>
          </div>
        </section>

        <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-xs sm:p-6">
          <div className="flex flex-col gap-3 border-b border-[#942E3A]/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-[#D8B46A]" />
              <h2 className="font-playfair text-xl font-bold text-[#942E3A]">
                {isRtl ? "خيارات الكاتيجوري" : "Category options"} ({formatNumber(filteredOptions.length)})
              </h2>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className={`pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#D8B46A] ${isRtl ? "right-3" : "left-3"}`} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("common.search")}
                className={`h-9 w-full rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB]/50 text-xs outline-none focus:border-[#942E3A] ${isRtl ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left"}`}
              />
            </div>
          </div>

          <div className="hidden">
            {filteredOptions.map((opt) => (
              <div
                key={opt.id}
                onClick={() => setActiveOption(opt)}
                className="flex cursor-pointer items-center justify-between gap-2 rounded-2xl border border-[#942E3A]/10 bg-[#FFF9EB]/30 p-3 transition hover:border-[#D8B46A]/60"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {opt.type === "color" && (
                    <span
                      className="h-4 w-4 shrink-0 rounded-full border border-black/15 shadow-xs"
                      style={{ backgroundColor: colorSwatches[opt.name.toLowerCase()] || "#D8B46A" }}
                    />
                  )}
                  <span className="min-w-0"><span className="block truncate text-xs font-bold text-[#942E3A]">{opt.name}</span><span className="mt-0.5 block text-[9px] uppercase tracking-wide text-[#6B1F2A]/50">{opt.type}</span></span>
                </div>

                <form
                  onClick={(event) => event.stopPropagation()}
                  action={async (formData) => {
                    setPendingId(opt.id);
                    try {
                      await deleteCatalogOptionAction(formData);
                      toast.success(isRtl ? "تم حذف الخيار بنجاح!" : "Option deleted successfully!");
                    } catch (e: any) {
                      toast.error(e?.message || (isRtl ? "حدث خطأ أثناء الحذف" : "Failed to delete option"));
                    } finally {
                      setPendingId(null);
                    }
                  }}
                >
                  <input type="hidden" name="id" value={opt.id} />
                  <button
                    disabled={pendingId === opt.id}
                    className="rounded-lg p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600 transition"
                    title={t("common.delete")}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            ))}

            {filteredOptions.length === 0 && (
              <div className="col-span-full py-12 text-center text-xs text-[#6B1F2A]/60">
                <Tags className="mx-auto h-7 w-7 text-[#D8B46A] mb-2" />
                <p className="font-bold">{t("common.noResults")}</p>
              </div>
            )}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {selected.types.map((type) => {
              const TypeIcon = type.icon;
              const typeOptions = filteredOptions.filter((option) => option.type === type.key);
              const totalTypeOptions = selectedOptions.filter((option) => option.type === type.key).length;
              return (
                <div key={type.key} className="overflow-hidden rounded-2xl border border-[#D8B46A]/20 bg-[#FFF9EB]/65">
                  <div className="flex items-center justify-between border-b border-[#D8B46A]/15 px-3 py-3"><div className="flex items-center gap-2"><span className="rounded-lg bg-white p-1.5 text-[#D8B46A]"><TypeIcon className="h-3.5 w-3.5" /></span><span className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#942E3A]">{type.label}</span></div><span className="text-[10px] font-bold text-[#6B1F2A]/50">{totalTypeOptions} values</span></div>
                  <div onWheel={(event) => event.stopPropagation()} className="hide-scrollbar max-h-72 space-y-1.5 overflow-y-auto overscroll-contain p-2.5">
                    {typeOptions.map(renderOptionCard)}
                    {!typeOptions.length && <p className="py-8 text-center text-[10px] text-[#6B1F2A]/50">{search ? "No matching options" : "No options yet"}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {activeOption && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#8B7CC7]/30 p-4 backdrop-blur-[2px]"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveOption(null);
          }}
        >
          <div role="dialog" aria-modal="true" aria-labelledby="option-products-title" className="flex h-[86vh] max-h-[760px] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[#D8B46A]/35 bg-[#FFF9EB] shadow-[0_24px_80px_rgba(67,25,31,0.28)]">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#942E3A]/10 bg-white px-5 py-5 sm:px-7">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">Catalog connection</p>
                <h2 id="option-products-title" className="mt-1 font-playfair text-2xl font-black text-[#942E3A]">Products using {activeOption.name}</h2>
                <p className="mt-1 text-xs text-[#6B1F2A]/60">{matchingProducts.length} {matchingProducts.length === 1 ? "product" : "products"} connected to this {activeOption.type} option.</p>
              </div>
              <button type="button" onClick={() => setActiveOption(null)} aria-label="Close products dialog" className="rounded-full p-2 text-[#942E3A]/60 hover:bg-[#F2DFC0] hover:text-[#942E3A]"><X className="h-4 w-4" /></button>
            </div>
            <div onWheel={(event) => event.stopPropagation()} className="hide-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-7">
              {matchingProducts.length ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {matchingProducts.map((product) => (
                    <Link key={product.id} href={`/admin/products/${product.id}`} onClick={() => setActiveOption(null)} className="group overflow-hidden rounded-2xl border border-[#942E3A]/10 bg-white transition hover:-translate-y-0.5 hover:border-[#D8B46A]/50 hover:shadow-lg">
                      <div className="flex h-36 items-center justify-center bg-[#FFF9EB]">
                        {product.images[0] ? <img src={product.images[0]} alt="" className="h-full w-full object-cover" /> : <Package className="h-8 w-8 text-[#D8B46A]" />}
                      </div>
                      <div className="p-3">
                        <p className="truncate text-xs font-bold text-[#942E3A]">{product.name}</p>
                        <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-[#6B1F2A]/60"><span className="capitalize">{product.category}</span><span className="font-bold text-[#942E3A]">{formatPrice(product.price)}</span></div>
                        <p className="mt-2 text-[10px] text-[#6B1F2A]/65">{product.color ? `Color: ${product.color}` : "No color"} · {product.variants.length} sizes</p>
                        <div className="mt-2 flex flex-wrap gap-1">{product.variants.slice(0, 8).map((variant) => <span key={variant.size} className="rounded-md bg-[#FFF9EB] px-1.5 py-1 text-[9px] font-bold text-[#942E3A]">{variant.size}: {variant.stock}</span>)}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#D8B46A]/45 bg-white px-5 py-16 text-center"><Package className="h-9 w-9 text-[#D8B46A]" /><p className="mt-3 font-playfair text-lg font-bold text-[#942E3A]">No products connected yet</p><p className="mt-1 max-w-sm text-xs leading-5 text-[#6B1F2A]/60">Products using this option will appear here once their details match this value.</p></div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
