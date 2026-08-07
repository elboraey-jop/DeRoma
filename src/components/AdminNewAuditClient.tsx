"use client";

import { useState, useMemo, useTransition, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminBackButton from "@/components/AdminBackButton";
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  AlertTriangle,
  Package,
  Plus,
  Minus,
  Check,
  RotateCcw,
  Sparkles,
  ClipboardCheck,
  Layers,
  ChevronDown,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { createStockAuditAction } from "@/app/admin/inventory/actions";

export interface AuditItemSource {
  variantId: string;
  productId: string;
  productName: string;
  sku: string;
  size: string;
  color: string;
  category: string;
  image: string | null;
  systemStock: number;
  price: number;
}

const CATEGORY_OPTIONS = [
  { id: "all", label: "All Categories" },
  { id: "shoes", label: "Shoes" },
  { id: "perfumes", label: "Perfumes" },
  { id: "bags", label: "Bags" },
  { id: "accessories", label: "Accessories" },
];

function AdminCategorySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selectedLabel =
    CATEGORY_OPTIONS.find((opt) => opt.id === value.toLowerCase())?.label ||
    "All Categories";

  return (
    <div ref={ref} className="relative shrink-0 text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group flex h-10 min-w-[140px] items-center justify-between gap-2 rounded-xl border border-[#942E3A]/15 bg-white px-3 py-2 text-xs font-bold text-[#942E3A] shadow-sm transition hover:border-[#D8B46A] hover:bg-[#FFF9EB]"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#D8B46A] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[160px] overflow-hidden rounded-2xl border border-[#D8B46A]/45 bg-[#FFF9EB] p-1.5 shadow-[0_16px_36px_rgba(67,25,31,0.18)] animate-in fade-in zoom-in-95">
          <div className="space-y-0.5">
            {CATEGORY_OPTIONS.map((opt) => {
              const isSelected = value.toLowerCase() === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition ${
                    isSelected
                      ? "bg-[#942E3A] text-[#FFF9EB] font-bold"
                      : "text-[#6B1F2A] hover:bg-[#F2DFC0]/60 hover:text-[#942E3A]"
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-[#D8B46A]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminNewAuditClient({
  sourceItems,
}: {
  sourceItems: AuditItemSource[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCatParam = searchParams.get("category") || "all";
  const isScopedCategory = initialCatParam.toLowerCase() !== "all";

  const categoryName = useMemo(() => {
    if (!isScopedCategory) return "";
    return initialCatParam.charAt(0).toUpperCase() + initialCatParam.slice(1);
  }, [initialCatParam, isScopedCategory]);

  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(() => {
    const formattedDate = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return isScopedCategory
      ? `${categoryName} Stock Audit - ${formattedDate}`
      : `Full Stock Audit - ${formattedDate}`;
  });

  const [notes, setNotes] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCatParam);
  const [searchQuery, setSearchQuery] = useState("");

  // Scope audit source items exclusively to category if category param is present
  const auditScopedItems = useMemo(() => {
    if (!isScopedCategory) return sourceItems;
    return sourceItems.filter(
      (item) => item.category.toLowerCase() === initialCatParam.toLowerCase()
    );
  }, [sourceItems, isScopedCategory, initialCatParam]);

  // Map of actual physical counts keyed by variantId
  const [actualCounts, setActualCounts] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    auditScopedItems.forEach((item) => {
      init[item.variantId] = item.systemStock; // default to system stock
    });
    return init;
  });

  // Map of item notes
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});

  // Filtered items based on search & category
  const filteredItems = useMemo(() => {
    return auditScopedItems.filter((item) => {
      const text = `${item.productName} ${item.sku} ${item.color} ${item.size}`
        .toLowerCase();
      const matchesSearch = text.includes(searchQuery.toLowerCase());
      const matchesCat =
        selectedCategory === "all" ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCat;
    });
  }, [auditScopedItems, searchQuery, selectedCategory]);

  // Category-scoped overall audit stats
  const auditSummary = useMemo(() => {
    let totalExpected = 0;
    let totalActual = 0;
    let matchesCount = 0;
    let shortageCount = 0;
    let shortageValue = 0;
    let surplusCount = 0;
    let surplusValue = 0;

    auditScopedItems.forEach((item) => {
      const actual = actualCounts[item.variantId] ?? item.systemStock;
      const diff = actual - item.systemStock;

      totalExpected += item.systemStock;
      totalActual += actual;

      if (diff === 0) {
        matchesCount++;
      } else if (diff < 0) {
        shortageCount += Math.abs(diff);
        shortageValue += Math.abs(diff) * item.price;
      } else {
        surplusCount += diff;
        surplusValue += diff * item.price;
      }
    });

    return {
      totalExpected,
      totalActual,
      matchesCount,
      shortageCount,
      shortageValue,
      surplusCount,
      surplusValue,
      hasDiscrepancies: shortageCount > 0 || surplusCount > 0,
    };
  }, [auditScopedItems, actualCounts]);

  const handleSetActual = (variantId: string, count: number) => {
    setActualCounts((prev) => ({
      ...prev,
      [variantId]: Math.max(0, count),
    }));
  };

  const handleMatchSystem = (variantId: string, systemStock: number) => {
    setActualCounts((prev) => ({
      ...prev,
      [variantId]: systemStock,
    }));
  };

  const handleMatchAllFiltered = () => {
    setActualCounts((prev) => {
      const next = { ...prev };
      filteredItems.forEach((item) => {
        next[item.variantId] = item.systemStock;
      });
      return next;
    });
  };

  const handleSubmitAudit = () => {
    const payloadItems = auditScopedItems.map((item) => ({
      variantId: item.variantId,
      productName: item.productName,
      sku: item.sku,
      size: item.size,
      color: item.color,
      expectedStock: item.systemStock,
      actualStock: actualCounts[item.variantId] ?? item.systemStock,
      unitPrice: item.price,
      notes: itemNotes[item.variantId] || "",
    }));

    startTransition(async () => {
      const res = await createStockAuditAction({
        title,
        notes,
        items: payloadItems,
      });

      if (res.success) {
        router.push("/admin/inventory/audits");
      } else {
        alert(res.error || "Failed to save stock audit.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Standard Admin Header & Back Button */}
      <div className="flex flex-col gap-4 border-b border-[#942E3A]/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <AdminBackButton
            fallbackHref={
              isScopedCategory
                ? `/admin/inventory/category/${initialCatParam.toLowerCase()}`
                : "/admin/inventory/audits"
            }
          />
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#942E3A] text-[#FFF9EB] shadow-md">
              <Sparkles className="h-5 w-5 text-[#D8B46A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-playfair text-2xl sm:text-3xl font-black text-[#942E3A]">
                  Smart Stock Audit
                </h1>
                {isScopedCategory && (
                  <span className="rounded-full border border-[#D8B46A]/40 bg-[#FFF9EB] px-3 py-0.5 text-xs font-bold text-[#942E3A]">
                    {categoryName} Only
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B1F2A]/65 font-medium">
                {isScopedCategory
                  ? `Physical inventory counting & stock reconciliation for ${categoryName} items.`
                  : "Physical inventory counting & instant automated stock reconciliation."}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmitAudit}
          disabled={isPending}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[#942E3A] px-6 py-3 text-xs font-bold text-[#FFF9EB] shadow-lg transition hover:bg-[#802832] active:scale-95 disabled:opacity-50 shrink-0"
        >
          <ClipboardCheck className="h-4 w-4 text-[#D8B46A]" />
          <span>Finalize & Apply Adjustments</span>
        </button>
      </div>

      {/* Audit Configuration Bar */}
      <div className="grid grid-cols-1 gap-4 rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm md:grid-cols-3">
        <div className="md:col-span-2 space-y-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#D8B46A]">
            Audit Session Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-[#942E3A]/15 bg-white px-3 py-2.5 text-sm font-bold text-[#942E3A] outline-none focus:border-[#942E3A]"
            placeholder="E.g., Shoes Stock Audit - August 2026"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#D8B46A]">
            Audit Notes (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-xl border border-[#942E3A]/15 bg-white px-3 py-2.5 text-xs text-[#6B1F2A] outline-none focus:border-[#942E3A]"
            placeholder="E.g., Checked by Ahmed & Sara"
          />
        </div>
      </div>

      {/* Live Reconciliation Summary Bar (Scoped to Category) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-3.5 shadow-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/55">
            System Expected
          </span>
          <span className="mt-1 block font-playfair text-2xl font-black text-[#942E3A]">
            {auditSummary.totalExpected} units
          </span>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5 shadow-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-800">
            Physical Actual
          </span>
          <span className="mt-1 block font-playfair text-2xl font-black text-emerald-900">
            {auditSummary.totalActual} units
          </span>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-3.5 shadow-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-rose-800">
            Total Shortage
          </span>
          <span className="mt-1 block font-playfair text-xl font-black text-rose-900">
            -{auditSummary.shortageCount} ({formatCurrency(auditSummary.shortageValue)})
          </span>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-3.5 shadow-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-blue-800">
            Total Surplus
          </span>
          <span className="mt-1 block font-playfair text-xl font-black text-blue-900">
            +{auditSummary.surplusCount} ({formatCurrency(auditSummary.surplusValue)})
          </span>
        </div>
      </div>

      {/* Search Bar & Locked Category Badge or Selector */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#942E3A]/10 bg-[#FFF9EB] p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
          {/* Search Input */}
          <div className="relative flex-1 sm:min-w-[280px] lg:min-w-[440px]">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D8B46A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isScopedCategory
                  ? `Search ${categoryName} items to audit...`
                  : "Search product name, SKU, color, or size to audit..."
              }
              className="w-full rounded-xl border border-[#942E3A]/15 bg-white py-2.5 pl-10 pr-3 text-xs text-[#942E3A] outline-none transition focus:border-[#942E3A] focus:ring-2 focus:ring-[#D8B46A]/20"
            />
          </div>

          {/* Locked Category Badge if Scoped, or Select Dropdown if Full */}
          {isScopedCategory ? (
            <div className="flex items-center gap-2 rounded-xl border border-[#D8B46A]/40 bg-white px-3.5 py-2 text-xs font-bold text-[#942E3A] shrink-0">
              <span className="text-[#6B1F2A]/60">Scope:</span>
              <span className="text-[#942E3A]">{categoryName} Only</span>
            </div>
          ) : (
            <AdminCategorySelect
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
            />
          )}
        </div>

        <button
          type="button"
          onClick={handleMatchAllFiltered}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-[#D8B46A]/40 bg-white px-3 py-2.5 text-xs font-bold text-[#942E3A] hover:bg-[#F2DFC0] transition shrink-0"
        >
          <RotateCcw className="h-3.5 w-3.5 text-[#D8B46A]" />
          <span>Match All System Counts</span>
        </button>
      </div>

      {/* Audit Items Interactive Cards / Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => {
          const actual = actualCounts[item.variantId] ?? item.systemStock;
          const diff = actual - item.systemStock;
          const isMatch = diff === 0;
          const isShortage = diff < 0;
          const isSurplus = diff > 0;

          return (
            <div
              key={item.variantId}
              className={`flex flex-col justify-between rounded-3xl border p-4 shadow-sm transition ${
                isMatch
                  ? "border-[#942E3A]/10 bg-white"
                  : isShortage
                  ? "border-rose-300 bg-rose-50/40"
                  : "border-blue-300 bg-blue-50/40"
              }`}
            >
              <div>
                {/* Header: Product & Thumbnail */}
                <div className="flex items-start gap-3">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-2xl border border-[#942E3A]/10 bg-white object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF9EB] text-[#D8B46A] border border-[#D8B46A]/30">
                      <Package className="h-6 w-6" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h4 className="truncate font-bold text-[#942E3A] text-sm">
                      {item.productName}
                    </h4>
                    <p className="mt-0.5 text-xs text-[#6B1F2A]/70">
                      {item.category.toLowerCase() !== "perfumes" && item.color ? `${item.color} · ` : ""}
                      <span className="font-bold">{item.size}</span>
                    </p>
                    <p className="text-[10px] text-[#6B1F2A]/50 font-mono">
                      SKU: {item.sku || "N/A"}
                    </p>
                  </div>

                  {/* Discrepancy Badge */}
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      isMatch
                        ? "bg-emerald-100 text-emerald-800"
                        : isShortage
                        ? "bg-rose-100 text-rose-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {isMatch ? "Match (0)" : isShortage ? `Shortage (${diff})` : `Surplus (+${diff})`}
                  </span>
                </div>

                {/* Stock Comparison Grid */}
                <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-[#FFF9EB]/60 p-2.5 border border-[#942E3A]/8 text-center text-xs">
                  <div>
                    <span className="block text-[10px] font-bold text-[#6B1F2A]/50 uppercase">
                      System Stock
                    </span>
                    <span className="font-playfair text-lg font-black text-[#942E3A]">
                      {item.systemStock}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-[#6B1F2A]/50 uppercase">
                      Physical Actual
                    </span>
                    <span className="font-playfair text-lg font-black text-[#942E3A]">
                      {actual}
                    </span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="mt-4 space-y-2 border-t border-[#942E3A]/8 pt-3">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleSetActual(item.variantId, actual - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#942E3A]/20 bg-white text-[#942E3A] hover:bg-[#FFF9EB]"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>

                  <input
                    type="number"
                    min="0"
                    value={actual}
                    onChange={(e) =>
                      handleSetActual(item.variantId, parseInt(e.target.value) || 0)
                    }
                    className="w-20 rounded-xl border border-[#942E3A]/20 bg-white px-2 py-1.5 text-center text-sm font-bold text-[#942E3A]"
                  />

                  <button
                    type="button"
                    onClick={() => handleSetActual(item.variantId, actual + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#942E3A]/20 bg-white text-[#942E3A] hover:bg-[#FFF9EB]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>

                  {!isMatch && (
                    <button
                      type="button"
                      onClick={() => handleMatchSystem(item.variantId, item.systemStock)}
                      className="ml-auto flex items-center gap-1 rounded-xl bg-[#FFF9EB] border border-[#D8B46A]/40 px-2.5 py-1.5 text-[10px] font-bold text-[#942E3A] hover:bg-[#F2DFC0]"
                    >
                      <Check className="h-3 w-3 text-[#D8B46A]" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Sticky Action Footer */}
      <div className="sticky bottom-4 z-30 flex items-center justify-between gap-4 rounded-3xl border border-[#D8B46A]/40 bg-[#FFF9EB] p-4 shadow-xl backdrop-blur sm:p-5">
        <div>
          <span className="block text-xs font-bold text-[#942E3A]">
            Ready to apply reconciliation?
          </span>
          <span className="text-[11px] text-[#6B1F2A]/60">
            This will record the audit session and update stock for {filteredItems.length} items.
          </span>
        </div>

        <button
          type="button"
          onClick={handleSubmitAudit}
          disabled={isPending}
          className="flex items-center gap-2 rounded-2xl bg-[#942E3A] px-6 py-3 text-xs font-bold text-[#FFF9EB] shadow-md hover:bg-[#802832] transition active:scale-95 disabled:opacity-50"
        >
          <ClipboardCheck className="h-4 w-4 text-[#D8B46A]" />
          <span>Finalize & Apply Adjustments</span>
        </button>
      </div>
    </div>
  );
}
