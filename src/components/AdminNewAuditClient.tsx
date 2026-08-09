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
import { createStockAuditAction } from "@/app/admin/inventory/actions";
import { useAdminI18n } from "@/providers/AdminI18nContext";

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

function AdminCategorySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { lang, t } = useAdminI18n();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isRtl = lang === "ar";

  const categoryOptions = [
    { id: "all", label: isRtl ? "كل الأقسام" : "All Categories" },
    { id: "shoes", label: isRtl ? "الأحذية" : "Shoes" },
    { id: "perfumes", label: isRtl ? "العطور" : "Perfumes" },
    { id: "bags", label: isRtl ? "الحقائب" : "Bags" },
    { id: "accessories", label: isRtl ? "الإكسسوارات" : "Accessories" },
  ];

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
    categoryOptions.find((opt) => opt.id === value.toLowerCase())?.label ||
    (isRtl ? "كل الأقسام" : "All Categories");

  return (
    <div ref={ref} className="relative shrink-0 text-right">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group flex h-10 min-w-[140px] items-center justify-between gap-2 rounded-xl border border-[#942E3A]/15 bg-white px-3 py-2 text-xs font-bold text-[#942E3A] shadow-xs transition hover:border-[#D8B46A] hover:bg-[#FFF9EB]"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#D8B46A] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className={`absolute top-[calc(100%+6px)] z-50 min-w-[160px] overflow-hidden rounded-2xl border border-[#D8B46A]/45 bg-[#FFF9EB] p-1.5 shadow-xl animate-in fade-in zoom-in-95 ${isRtl ? "right-0 text-right" : "left-0 text-left"}`}>
          <div className="space-y-0.5">
            {categoryOptions.map((opt) => {
              const isSelected = value.toLowerCase() === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition ${
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
  const { lang, t, formatPrice, formatNumber } = useAdminI18n();
  const isRtl = lang === "ar";
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const initialCatParam = searchParams.get("category") || "";
  const isScopedCategory = Boolean(initialCatParam);
  const categoryName = initialCatParam
    ? initialCatParam.charAt(0).toUpperCase() + initialCatParam.slice(1)
    : "";

  const [title, setTitle] = useState(
    isScopedCategory
      ? `${categoryName} Stock Audit - ${new Date().toLocaleDateString(isRtl ? "ar-EG" : "en-US", { month: "short", year: "numeric" })}`
      : `Full Stock Audit - ${new Date().toLocaleDateString(isRtl ? "ar-EG" : "en-US", { month: "short", year: "numeric" })}`
  );
  const [notes, setNotes] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const auditScopedItems = useMemo(() => {
    if (!isScopedCategory) return sourceItems;
    return sourceItems.filter(
      (item) => item.category.toLowerCase() === initialCatParam.toLowerCase()
    );
  }, [sourceItems, isScopedCategory, initialCatParam]);

  const [actualCounts, setActualCounts] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    auditScopedItems.forEach((item) => {
      init[item.variantId] = item.systemStock;
    });
    return init;
  });

  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});

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
      notes: itemNotes[item.variantId] || undefined,
    }));

    startTransition(async () => {
      const res = await createStockAuditAction({
        title: title.trim() || (isRtl ? "جلسة جرد جديدة" : "New Stock Audit"),
        notes,
        items: payloadItems,
      });

      if (res.success) {
        router.push("/admin/inventory/audits");
      } else {
        alert(res.error || (isRtl ? "حدث خطأ أثناء حفظ جلسة الجرد." : "Failed to save stock audit."));
      }
    });
  };

  return (
    <div className="space-y-6 text-right">
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
                  {isRtl ? "جلسة الجرد الذكي للمخزون" : "Smart Stock Audit"}
                </h1>
                {isScopedCategory && (
                  <span className="rounded-full border border-[#D8B46A]/40 bg-[#FFF9EB] px-3 py-0.5 text-xs font-bold text-[#942E3A]">
                    {categoryName}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B1F2A]/65 font-medium">
                {isRtl
                  ? `حصر وعد القطع الفعلي ومطابقتها مع كميات النظام بقسم ${categoryName}.`
                  : `Physical inventory counting & stock reconciliation for ${categoryName} items.`}
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
          <span>{isRtl ? "تأكيد وتطبيق تسوية الجرد" : "Finalize & Apply Adjustments"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-xs md:grid-cols-3">
        <div className="md:col-span-2 space-y-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#D8B46A]">
            {isRtl ? "عنوان جلسة الجرد" : "Audit Session Title"}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-[#942E3A]/15 bg-white px-3 py-2.5 text-sm font-bold text-[#942E3A] outline-none focus:border-[#942E3A] text-right"
            placeholder={isRtl ? "مثال: جرد الأحذية - أغسطس 2026" : "E.g., Shoes Stock Audit - August 2026"}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#D8B46A]">
            {isRtl ? "ملاحظات الجرد (اختياري)" : "Audit Notes (Optional)"}
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-xl border border-[#942E3A]/15 bg-white px-3 py-2.5 text-xs font-semibold text-[#6B1F2A] outline-none focus:border-[#942E3A] text-right"
            placeholder={isRtl ? "ملاحظات حول فريق الجرد أو حالة المخزن..." : "Notes on counter staff..."}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/60">
            {isRtl ? "القطع بالنظام" : "Expected Units"}
          </p>
          <p className="mt-1 font-playfair text-2xl font-black text-[#942E3A]">
            {formatNumber(auditSummary.totalExpected)}
          </p>
        </div>

        <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/60">
            {isRtl ? "القطع الفعلية" : "Counted Units"}
          </p>
          <p className="mt-1 font-playfair text-2xl font-black text-[#942E3A]">
            {formatNumber(auditSummary.totalActual)}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
            {isRtl ? "عناصر مطابقة" : "Matching Items"}
          </p>
          <p className="mt-1 font-playfair text-2xl font-black text-emerald-700">
            {formatNumber(auditSummary.matchesCount)}
          </p>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
            {isRtl ? "عجز المخزون" : "Shortage (Missing)"}
          </p>
          <p className="mt-1 font-playfair text-2xl font-black text-rose-700">
            {formatNumber(auditSummary.shortageCount)}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
            {isRtl ? "زيادة بالفحص" : "Surplus (Extra)"}
          </p>
          <p className="mt-1 font-playfair text-2xl font-black text-amber-700">
            {formatNumber(auditSummary.surplusCount)}
          </p>
        </div>

        <div className="rounded-2xl border border-[#D8B46A]/40 bg-[#FFF9EB] p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/60">
            {isRtl ? "صافي فارق القيمة" : "Net Variance"}
          </p>
          <p className="mt-1 font-playfair text-lg font-black text-[#942E3A] truncate">
            {formatPrice(auditSummary.surplusValue - auditSummary.shortageValue)}
          </p>
        </div>
      </div>
    </div>
  );
}
