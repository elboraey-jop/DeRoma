"use client";

import { useState, useMemo, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Package,
  Search,
  CheckSquare,
  Square,
  SlidersHorizontal,
  Plus,
  Minus,
  Sparkles,
  Layers,
  ArrowUpRight,
  ClipboardList,
  RefreshCw,
  Archive,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Footprints,
  Sparkle,
  ShoppingBag,
  Gem,
  X,
  Check,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import {
  updateVariantStockAction,
  bulkRestockVariantsAction,
  bulkUpdateProductsStatusAction,
} from "@/app/admin/inventory/actions";
import { useAdminI18n } from "@/providers/AdminI18nContext";
import { sortSizesList } from "@/lib/utils";

export interface InventoryRow {
  variantId: string;
  productId: string;
  product: string;
  productStatus: string;
  category: string;
  subcategory?: string;
  brand?: string;
  sku: string;
  size: string;
  color: string;
  image: string | null;
  stock: number;
  price: number;
  lowStockLimit: number;
}

interface CategoryStats {
  slug: string;
  name: string;
  icon: typeof Footprints;
  productsCount: number;
  variantsCount: number;
  totalUnits: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  coverImage?: string;
}

interface ProductGroupRow {
  productId: string;
  product: string;
  productStatus: string;
  category: string;
  brand?: string;
  image: string | null;
  price: number;
  totalStock: number;
  variantsCount: number;
  sizesList: string[];
  colorsList: string[];
  lowStockLimit: number;
  variantIds: string[];
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
  isRtl,
}: {
  value: string;
  onChange: (value: string) => void;
  isRtl: boolean;
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

  const categoryNames: Record<string, string> = {
    "All Categories": "كل الفئات",
    Shoes: "أحذية",
    Perfumes: "عطور",
    Bags: "حقائب",
    Accessories: "إكسسوارات",
  };
  const selectedLabel = CATEGORY_OPTIONS.find((opt) => opt.id === value.toLowerCase())?.label || "All Categories";

  return (
    <div ref={ref} className="relative shrink-0 text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group flex h-10 min-w-[140px] items-center justify-between gap-2 rounded-xl border border-[#942E3A]/15 bg-white px-3 py-2 text-xs font-bold text-[#942E3A] shadow-sm transition hover:border-[#D8B46A] hover:bg-[#FFF9EB]"
      >
        <span className="truncate">{isRtl ? categoryNames[selectedLabel] || selectedLabel : selectedLabel}</span>
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
                  <span>{isRtl ? categoryNames[opt.label] || opt.label : opt.label}</span>
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

function AdminFilterDropdown({
  label,
  value,
  options,
  onChange,
  isRtl,
}: {
  label: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (value: string) => void;
  isRtl: boolean;
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

  const labelMap: Record<string, string> = {
    Status: "الحالة",
    Brand: "العلامة التجارية",
    Size: "المقاس",
    Color: "اللون",
    Type: "النوع",
    Active: "نشط",
    Archived: "مؤرشف",
    "All Statuses": "كل الحالات",
    "All Statuss": "كل الحالات",
    "All Brands": "كل العلامات التجارية",
    "All Sizes": "كل المقاسات",
    "All Colors": "كل الألوان",
    "All Types": "كل الأنواع",
  };
  const rawSelectedLabel = value === "all" ? (label.toLowerCase() === "status" ? "All Statuses" : `All ${label}s`) : options.find((opt) => opt.id.toLowerCase() === value.toLowerCase())?.label || value;
  const selectedLabel = isRtl ? labelMap[rawSelectedLabel] || rawSelectedLabel : rawSelectedLabel;

  return (
    <div ref={ref} className={`relative shrink-0 ${isRtl ? "text-right" : "text-left"}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`group flex h-10 min-w-[110px] items-center justify-between gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold shadow-sm transition ${
          value !== "all"
            ? "border-[#942E3A] bg-[#942E3A] text-[#FFF9EB]"
            : "border-[#942E3A]/15 bg-white text-[#942E3A] hover:border-[#D8B46A] hover:bg-[#FFF9EB]"
        }`}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
            value !== "all" ? "text-[#D8B46A]" : "text-[#D8B46A]"
          } ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 max-h-56 min-w-[140px] overflow-y-auto rounded-2xl border border-[#D8B46A]/45 bg-[#FFF9EB] p-1.5 shadow-[0_16px_36px_rgba(67,25,31,0.18)] animate-in fade-in zoom-in-95">
          <div className="space-y-0.5">
            {options.map((opt) => {
              const isSelected = value.toLowerCase() === opt.id.toLowerCase();
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
                  <span className="truncate">{isRtl ? labelMap[opt.label] || opt.label : opt.label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-[#D8B46A] shrink-0 ml-1.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminInventoryClient({
  initialRows,
  hideHeader = false,
  hideCategoryCards = false,
}: {
  initialRows: InventoryRow[];
  hideHeader?: boolean;
  hideCategoryCards?: boolean;
}) {
  const { lang, t, formatPrice, formatNumber } = useAdminI18n();
  const isRtl = lang === "ar";

  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<"variants" | "products">("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "healthy" | "low" | "out">("all");
  const [productStatusFilter, setProductStatusFilter] = useState<"all" | "active" | "archived">("all");

  useEffect(() => {
    const filterParam = searchParams.get("filter");
    if (filterParam === "low" || filterParam === "out" || filterParam === "healthy") {
      setStatusFilter(filterParam);
    }
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  const [selectedSize, setSelectedSize] = useState("all");
  const [selectedColor, setSelectedColor] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");

  const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockQty, setRestockQty] = useState(10);
  const [isPending, startTransition] = useTransition();

  // Optimistic stock tracking for instant updates
  const [localStockMap, setLocalStockMap] = useState<Record<string, number>>({});
  // Optimistic product status tracking for instant toggle
  const [localStatusMap, setLocalStatusMap] = useState<Record<string, "active" | "archived">>({});

  const rows = useMemo(() => {
    return initialRows.map((r) => ({
      ...r,
      stock: localStockMap[r.variantId] !== undefined ? localStockMap[r.variantId] : r.stock,
      productStatus:
        localStatusMap[r.productId] !== undefined
          ? localStatusMap[r.productId]
          : r.productStatus,
    }));
  }, [initialRows, localStockMap, localStatusMap]);

  // Handle direct product status toggle
  const handleToggleProductStatus = (productId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "archived" : "active";
    setLocalStatusMap((prev) => ({ ...prev, [productId]: nextStatus }));

    startTransition(async () => {
      await bulkUpdateProductsStatusAction([productId], nextStatus);
    });
  };

  // Dynamic variant filter option extraction
  const availableSizes = useMemo(() => {
    const set = new Set<string>();
    initialRows.forEach((r) => {
      if (r.size) set.add(r.size);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [initialRows]);

  const availableColors = useMemo(() => {
    const set = new Set<string>();
    initialRows.forEach((r) => {
      if (r.color && r.category.toLowerCase() !== "perfumes") set.add(r.color);
    });
    return Array.from(set).sort();
  }, [initialRows]);

  const availableSubcategories = useMemo(() => {
    const set = new Set<string>();
    initialRows.forEach((r) => {
      if (r.subcategory && r.subcategory !== "General") set.add(r.subcategory);
    });
    return Array.from(set).sort();
  }, [initialRows]);

  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    initialRows.forEach((r) => {
      if (r.brand) set.add(r.brand);
    });
    return Array.from(set).sort();
  }, [initialRows]);

  // General KPIs
  const totalProducts = useMemo(() => new Set(rows.map((r) => r.productId)).size, [rows]);
  const totalVariants = rows.length;
  const totalUnits = useMemo(() => rows.reduce((sum, r) => sum + r.stock, 0), [rows]);
  const totalValue = useMemo(() => rows.reduce((sum, r) => sum + r.stock * r.price, 0), [rows]);

  const lowStockCount = useMemo(
    () => rows.filter((r) => r.stock > 0 && r.stock <= r.lowStockLimit).length,
    [rows]
  );
  const outOfStockCount = useMemo(() => rows.filter((r) => r.stock === 0).length, [rows]);

  // Category Overview Cards calculation
  const categoryCards: CategoryStats[] = useMemo(() => {
    const cats = [
      { slug: "shoes", name: isRtl ? "أحذية" : "Shoes", icon: Footprints },
      { slug: "perfumes", name: isRtl ? "عطور" : "Perfumes", icon: Sparkle },
      { slug: "bags", name: isRtl ? "حقائب" : "Bags", icon: ShoppingBag },
      { slug: "accessories", name: isRtl ? "إكسسوارات" : "Accessories", icon: Gem },
    ];

    return cats.map((cat) => {
      const catRows = rows.filter((r) => r.category.toLowerCase() === cat.slug);
      const catProductsCount = new Set(catRows.map((r) => r.productId)).size;
      const catUnits = catRows.reduce((sum, r) => sum + r.stock, 0);
      const catVal = catRows.reduce((sum, r) => sum + r.stock * r.price, 0);
      const catLow = catRows.filter((r) => r.stock > 0 && r.stock <= r.lowStockLimit).length;
      const catOut = catRows.filter((r) => r.stock === 0).length;
      const firstImage = catRows.find((r) => r.image)?.image || undefined;

      return {
        slug: cat.slug,
        name: cat.name,
        icon: cat.icon,
        productsCount: catProductsCount,
        variantsCount: catRows.length,
        totalUnits: catUnits,
        totalValue: catVal,
        lowStockCount: catLow,
        outOfStockCount: catOut,
        coverImage: firstImage,
      };
    });
  }, [rows, isRtl]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const matchesSearch =
        `${r.product} ${r.sku} ${r.color} ${r.size} ${r.subcategory || ""} ${r.brand || ""}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === "all" || r.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesProductStatus =
        productStatusFilter === "all" || r.productStatus === productStatusFilter;

      let matchesStockStatus = true;
      if (statusFilter === "healthy") {
        matchesStockStatus = r.stock > r.lowStockLimit;
      } else if (statusFilter === "low") {
        matchesStockStatus = r.stock > 0 && r.stock <= r.lowStockLimit;
      } else if (statusFilter === "out") {
        matchesStockStatus = r.stock === 0;
      }

      const matchesSize =
        selectedSize === "all" || r.size.toLowerCase() === selectedSize.toLowerCase();

      const matchesColor =
        selectedColor === "all" || r.color.toLowerCase() === selectedColor.toLowerCase();

      const matchesSubcategory =
        selectedSubcategory === "all" ||
        (r.subcategory && r.subcategory.toLowerCase() === selectedSubcategory.toLowerCase());

      const matchesBrand =
        selectedBrand === "all" ||
        (r.brand && r.brand.toLowerCase() === selectedBrand.toLowerCase());

      return (
        matchesSearch &&
        matchesCat &&
        matchesProductStatus &&
        matchesStockStatus &&
        matchesSize &&
        matchesColor &&
        matchesSubcategory &&
        matchesBrand
      );
    });
  }, [
    rows,
    searchQuery,
    selectedCategory,
    statusFilter,
    productStatusFilter,
    selectedSize,
    selectedColor,
    selectedSubcategory,
    selectedBrand,
  ]);

  // Product-level grouped rows for "By Product" view mode
  const productGroupRows: ProductGroupRow[] = useMemo(() => {
    const map = new Map<string, ProductGroupRow>();

    filteredRows.forEach((r) => {
      if (!map.has(r.productId)) {
        map.set(r.productId, {
          productId: r.productId,
          product: r.product,
          productStatus: r.productStatus,
          category: r.category,
          brand: r.brand,
          image: r.image,
          price: r.price,
          totalStock: 0,
          variantsCount: 0,
          sizesList: [],
          colorsList: [],
          lowStockLimit: r.lowStockLimit,
          variantIds: [],
        });
      }

      const item = map.get(r.productId)!;
      item.totalStock += r.stock;
      item.variantsCount += 1;
      item.variantIds.push(r.variantId);
      if (r.size && !item.sizesList.includes(r.size)) {
        item.sizesList.push(r.size);
      }
      if (
        r.color &&
        r.category.toLowerCase() !== "perfumes" &&
        !item.colorsList.includes(r.color)
      ) {
        item.colorsList.push(r.color);
      }
    });

    const result = Array.from(map.values());
    result.forEach((item) => {
      item.sizesList = sortSizesList(item.sizesList);
    });

    return result;
  }, [filteredRows]);

  // Checkbox handlers for Variants View
  const isAllVariantsSelected =
    filteredRows.length > 0 && filteredRows.every((r) => selectedVariantIds.includes(r.variantId));

  const toggleSelectAllVariants = () => {
    if (isAllVariantsSelected) {
      setSelectedVariantIds([]);
    } else {
      setSelectedVariantIds(filteredRows.map((r) => r.variantId));
    }
  };

  const toggleSelectRow = (variantId: string) => {
    setSelectedVariantIds((prev) =>
      prev.includes(variantId) ? prev.filter((id) => id !== variantId) : [...prev, variantId]
    );
  };

  // Checkbox handlers for Products View
  const isAllProductsSelected =
    productGroupRows.length > 0 &&
    productGroupRows.every((p) => p.variantIds.every((id) => selectedVariantIds.includes(id)));

  const toggleSelectAllProducts = () => {
    if (isAllProductsSelected) {
      setSelectedVariantIds([]);
    } else {
      const allIds = productGroupRows.flatMap((p) => p.variantIds);
      setSelectedVariantIds(Array.from(new Set(allIds)));
    }
  };

  const toggleSelectProduct = (pRow: ProductGroupRow) => {
    const isSelected = pRow.variantIds.every((id) => selectedVariantIds.includes(id));
    if (isSelected) {
      setSelectedVariantIds((prev) => prev.filter((id) => !pRow.variantIds.includes(id)));
    } else {
      setSelectedVariantIds((prev) => Array.from(new Set([...prev, ...pRow.variantIds])));
    }
  };

  // Selected product IDs for status bulk actions
  const selectedProductIds = useMemo(() => {
    const selectedRows = rows.filter((r) => selectedVariantIds.includes(r.variantId));
    return Array.from(new Set(selectedRows.map((r) => r.productId)));
  }, [rows, selectedVariantIds]);

  // Bulk Actions
  const handleBulkSetStatus = (status: "active" | "archived") => {
    if (!selectedProductIds.length) return;
    startTransition(async () => {
      const res = await bulkUpdateProductsStatusAction(selectedProductIds, status);
      if (res.success) {
        setLocalStatusMap((prev) => {
          const next = { ...prev };
          selectedProductIds.forEach((id) => {
            next[id] = status;
          });
          return next;
        });
        setSelectedVariantIds([]);
      }
    });
  };

  const handleBulkRestock = () => {
    if (!selectedVariantIds.length || restockQty <= 0) return;
    startTransition(async () => {
      const res = await bulkRestockVariantsAction(selectedVariantIds, restockQty);
      if (res.success) {
        setLocalStockMap((prev) => {
          const next = { ...prev };
          selectedVariantIds.forEach((id) => {
            const currentStock = rows.find((r) => r.variantId === id)?.stock ?? 0;
            next[id] = currentStock + restockQty;
          });
          return next;
        });
        setSelectedVariantIds([]);
        setIsRestockModalOpen(false);
      }
    });
  };

  const hasActiveVariantFilters =
    selectedSize !== "all" ||
    selectedColor !== "all" ||
    selectedSubcategory !== "all" ||
    selectedBrand !== "all" ||
    productStatusFilter !== "all";

  const resetVariantFilters = () => {
    setSelectedSize("all");
    setSelectedColor("all");
    setSelectedSubcategory("all");
    setSelectedBrand("all");
    setProductStatusFilter("all");
  };

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="space-y-6 text-start">
      {/* Page Header */}
      {!hideHeader && (
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">
              {isRtl ? "العمليات والمخزن" : "Operations"}
            </p>
            <h1 className="mt-0.5 sm:mt-1 font-playfair text-2xl sm:text-3xl font-black text-[#942E3A]">
              {t("inventory.title")}
            </h1>
            <p className="mt-1 hidden sm:block text-xs text-[#6B1F2A]/65">
              {t("inventory.subtitle")}
            </p>
          </div>

          {/* Stock Audits Button */}
          <Link
            href="/admin/inventory/audits"
            className="flex items-center gap-1.5 rounded-xl sm:rounded-2xl bg-[#942E3A] px-3 py-2 sm:px-5 sm:py-2.5 text-[11px] sm:text-xs font-bold text-[#FFF9EB] shadow-xs transition hover:bg-[#802832] shrink-0"
          >
            <ClipboardList className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#D8B46A]" />
            <span>{isRtl ? "جلسات الجرد" : "Stock Audits"}</span>
          </Link>
        </div>
      )}

      {/* KPI General Stats Grid */}
      {!hideHeader && (
        <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3 xl:grid-cols-6">
          <div className="rounded-xl sm:rounded-2xl border border-[#942E3A]/10 bg-white p-2.5 sm:p-4 shadow-xs">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/55 truncate">
              {t("dashboard.activeProducts")}
            </p>
            <p className="mt-0.5 sm:mt-1 font-playfair text-xl sm:text-2xl font-black text-[#942E3A]">
              {formatNumber(totalProducts)}
            </p>
          </div>

          <div className="rounded-xl sm:rounded-2xl border border-[#942E3A]/10 bg-white p-2.5 sm:p-4 shadow-xs">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/55 truncate">
              {t("inventory.totalVariants")}
            </p>
            <p className="mt-0.5 sm:mt-1 font-playfair text-xl sm:text-2xl font-black text-[#942E3A]">
              {formatNumber(totalVariants)}
            </p>
          </div>

          <div className="rounded-xl sm:rounded-2xl border border-[#942E3A]/10 bg-white p-2.5 sm:p-4 shadow-xs">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/55 truncate">
              {isRtl ? "إجمالي القطع بالمخزن" : "Units in Stock"}
            </p>
            <p className="mt-0.5 sm:mt-1 font-playfair text-xl sm:text-2xl font-black text-[#942E3A]">
              {formatNumber(totalUnits)}
            </p>
          </div>

          <div className="rounded-xl sm:rounded-2xl border border-[#D8B46A]/40 bg-[#fff7df] p-2.5 sm:p-4 shadow-xs">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/55 truncate">
              {isRtl ? "قيمة المخزون الإجمالية" : "Stock Valuation"}
            </p>
            <p className="mt-0.5 sm:mt-1 font-playfair text-base sm:text-xl font-black text-[#942E3A] truncate">
              {formatPrice(totalValue)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === "low" ? "all" : "low")}
            className={`rounded-xl sm:rounded-2xl border p-2.5 sm:p-4 text-left shadow-xs transition ${
              statusFilter === "low"
                ? "border-[#D8B46A] bg-[#FFF9EB] ring-2 ring-[#D8B46A]/40"
                : "border-[#D8B46A]/30 bg-white hover:bg-[#FFF9EB]/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/55 truncate">
                {isRtl ? "مخزون منخفض" : "Low Stock"}
              </p>
              <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500 shrink-0" />
            </div>
            <p className="mt-0.5 sm:mt-1 font-playfair text-xl sm:text-2xl font-black text-amber-700">
              {lowStockCount}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === "out" ? "all" : "out")}
            className={`rounded-xl sm:rounded-2xl border p-2.5 sm:p-4 text-left shadow-xs transition ${
              statusFilter === "out"
                ? "border-rose-300 bg-rose-50/90 ring-2 ring-rose-300"
                : "border-rose-200 bg-rose-50/50 hover:bg-rose-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-rose-700/65 truncate">
                {isRtl ? "نفد المخزون" : "Out of Stock"}
              </p>
              <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-rose-600 shrink-0" />
            </div>
            <p className="mt-0.5 sm:mt-1 font-playfair text-xl sm:text-2xl font-black text-rose-700">
              {outOfStockCount}
            </p>
          </button>
        </div>
      )}

      {/* 4 Big Category Overview Cards */}
      {!hideCategoryCards && (
        <div>
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="font-playfair text-base sm:text-lg font-bold text-[#942E3A]">
              {isRtl ? "نظرة عامة على فئات الكتالوج" : "Catalog Categories Overview"}
            </h2>
            <span className="hidden sm:inline text-xs text-[#6B1F2A]/60">
              {isRtl ? "اضغط على أي بطاقة لاستعراض مخزون الفئة" : "Click any card to inspect category inventory"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {categoryCards.map((cat) => {
              const Icon = cat.icon;

              return (
                <Link
                  key={cat.slug}
                  href={`/admin/inventory/category/${cat.slug}`}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-[#942E3A]/12 bg-white p-3.5 sm:p-5 text-[#942E3A] transition-all shadow-xs hover:border-[#942E3A]/40 hover:shadow-md"
                >
                  <div>
                    {/* Top Bar */}
                    <div className="flex items-center justify-between">
                      <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-[#FFF9EB] text-[#942E3A] border border-[#D8B46A]/30 transition group-hover:bg-[#942E3A] group-hover:text-[#FFF9EB]">
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <span className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-lg sm:rounded-xl px-2 py-0.5 sm:px-2.5 sm:py-1 bg-[#FFF9EB] text-[#942E3A] group-hover:bg-[#942E3A] group-hover:text-[#FFF9EB] transition">
                        <span>{isRtl ? "استعراض" : "Explore"}</span>
                        <ArrowUpRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      </span>
                    </div>

                    {/* Title & Valuation */}
                    <h3 className="mt-2.5 sm:mt-4 font-playfair text-base sm:text-xl font-black truncate">{cat.name}</h3>
                    <p className="mt-0.5 text-[10px] sm:text-xs font-semibold text-[#6B1F2A]/70 truncate">
                      {isRtl ? "قيمة المخزون: " : "Valuation: "}{formatPrice(cat.totalValue)}
                    </p>
                  </div>

                  {/* Metrics Footer */}
                  <div className="mt-3 sm:mt-5 border-t border-[#942E3A]/10 pt-2 sm:pt-3">
                    <div className="grid grid-cols-4 text-center text-[9px] sm:text-[10px]">
                      <div>
                <span className="block font-bold opacity-60 truncate">{isRtl ? "منتجات" : "Prods"}</span>
                        <span className="font-playfair text-xs sm:text-sm font-bold">{cat.productsCount}</span>
                      </div>
                      <div>
                        <span className="block font-bold opacity-60 truncate">{isRtl ? "متغيرات" : "Vars"}</span>
                        <span className="font-playfair text-xs sm:text-sm font-bold">{cat.variantsCount}</span>
                      </div>
                      <div>
                        <span className="block font-bold opacity-60 truncate">{isRtl ? "وحدات" : "Units"}</span>
                        <span className="font-playfair text-xs sm:text-sm font-bold">{cat.totalUnits}</span>
                      </div>
                      <div>
                        <span className="block font-bold opacity-60 truncate">{isRtl ? "نفد/منخفض" : "Out/Low"}</span>
                        <span
                          className={`font-playfair text-xs sm:text-sm font-bold ${
                            cat.outOfStockCount > 0 ? "text-rose-600" : ""
                          }`}
                        >
                          {cat.outOfStockCount}/{cat.lowStockCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Stock Ledger Section */}
      <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 border-b border-[#942E3A]/10 pb-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <Package className="h-5 w-5 text-[#D8B46A]" />
              <h2 className="font-playfair text-xl font-bold text-[#942E3A]">
                {isRtl ? "سجل المخزون" : "Stock Ledger"}
              </h2>
              <span className="rounded-full border border-[#D8B46A]/30 bg-[#FFF9EB] px-3 py-0.5 text-[10px] font-bold text-[#942E3A]">
                {viewMode === "variants"
                  ? (isRtl ? `${filteredRows.length} متغير` : `${filteredRows.length} variants found`)
                  : (isRtl ? `${productGroupRows.length} منتج` : `${productGroupRows.length} products found`)}
              </span>
            </div>

            {/* View Mode Switcher Sub-Tabs (By Variant vs By Product) */}
            <div className="flex items-center gap-2">
              {selectedCategory !== "all" && !hideCategoryCards && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className="flex items-center gap-1 text-xs font-bold text-[#942E3A] hover:underline mr-2"
                >
                  <X className="h-3.5 w-3.5" />
                      {isRtl ? "إعادة ضبط فلتر الفئة" : "Reset category filter"}
                </button>
              )}

              <div className="flex items-center rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB] p-1 shrink-0 shadow-inner">
                <button
                  type="button"
                  onClick={() => setViewMode("variants")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    viewMode === "variants"
                      ? "bg-[#942E3A] text-[#FFF9EB] shadow-md"
                      : "text-[#942E3A]/70 hover:text-[#942E3A]"
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>{isRtl ? "حسب المتغير" : "By Variant"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("products")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    viewMode === "products"
                      ? "bg-[#942E3A] text-[#FFF9EB] shadow-md"
                      : "text-[#942E3A]/70 hover:text-[#942E3A]"
                  }`}
                >
                  <Package className="h-3.5 w-3.5" />
                  <span>{isRtl ? "حسب المنتج" : "By Product"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Left side: Compact Search & Dynamic Filter Dropdowns */}
            <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center flex-wrap">
              {/* Compact Search Input */}
              <div className="relative w-full sm:w-56 lg:w-60 shrink-0">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#D8B46A]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isRtl ? "ابحث عن المنتج أو SKU..." : "Search product, SKU..."}
                  className="w-full rounded-xl border border-[#942E3A]/15 bg-white py-2 pl-8 pr-2.5 text-xs text-[#942E3A] outline-none transition placeholder:text-[#6B1F2A]/35 focus:border-[#942E3A] focus:ring-2 focus:ring-[#D8B46A]/20"
                />
              </div>

              {/* Show All Categories Dropdown & Status Filter on Main Page */}
              {!hideCategoryCards && (
                <div className="flex flex-wrap items-center gap-2">
                  <AdminCategorySelect
                    value={selectedCategory}
                    onChange={(val) => setSelectedCategory(val)}
                    isRtl={isRtl}
                  />
                  <AdminFilterDropdown
                    label="Status"
                    value={productStatusFilter}
                    isRtl={isRtl}
                    options={[
                      { id: "all", label: "All Statuses" },
                      { id: "active", label: "Active" },
                      { id: "archived", label: "Archived" },
                    ]}
                    onChange={(val) => setProductStatusFilter(val as any)}
                  />
                </div>
              )}

              {/* Show Category Specific Filters on Category Page */}
              {hideCategoryCards && (
                <div className="flex flex-wrap items-center gap-2">
                  {/* Brand Filter Dropdown */}
                  {availableBrands.length > 0 && (
                    <AdminFilterDropdown
                      label="Brand"
                      value={selectedBrand}
                      isRtl={isRtl}
                      options={[
                        { id: "all", label: "All Brands" },
                        ...availableBrands.map((b) => ({ id: b, label: b })),
                      ]}
                      onChange={(val) => setSelectedBrand(val)}
                    />
                  )}

                  {/* Size Filter Dropdown */}
                  {availableSizes.length > 0 && (
                    <AdminFilterDropdown
                      label="Size"
                      value={selectedSize}
                      isRtl={isRtl}
                      options={[
                        { id: "all", label: "All Sizes" },
                        ...availableSizes.map((s) => ({ id: s, label: `Size ${s}` })),
                      ]}
                      onChange={(val) => setSelectedSize(val)}
                    />
                  )}

                  {/* Color Filter Dropdown */}
                  {availableColors.length > 0 && (
                    <AdminFilterDropdown
                      label="Color"
                      value={selectedColor}
                      isRtl={isRtl}
                      options={[
                        { id: "all", label: "All Colors" },
                        ...availableColors.map((c) => ({ id: c, label: c })),
                      ]}
                      onChange={(val) => setSelectedColor(val)}
                    />
                  )}

                  {/* Subcategory / Type Filter Dropdown */}
                  {availableSubcategories.length > 0 && (
                    <AdminFilterDropdown
                      label="Type"
                      value={selectedSubcategory}
                      isRtl={isRtl}
                      options={[
                        { id: "all", label: "All Types" },
                        ...availableSubcategories.map((sub) => ({ id: sub, label: sub })),
                      ]}
                      onChange={(val) => setSelectedSubcategory(val)}
                    />
                  )}

                  {/* Product Status Filter Dropdown (Active / Archive) */}
                  <AdminFilterDropdown
                    label="Status"
                    value={productStatusFilter}
                    isRtl={isRtl}
                    options={[
                      { id: "all", label: "All Statuses" },
                      { id: "active", label: "Active" },
                      { id: "archived", label: "Archived" },
                    ]}
                    onChange={(val) => setProductStatusFilter(val as any)}
                  />

                  {hasActiveVariantFilters && (
                    <button
                      type="button"
                      onClick={resetVariantFilters}
                      className="flex items-center gap-1 rounded-xl border border-[#942E3A]/20 bg-white px-2.5 py-2 text-[10px] font-bold text-[#942E3A] hover:bg-[#FFF9EB] transition"
                    >
                      <RotateCcw className="h-3 w-3 text-[#D8B46A]" />
                      <span>{isRtl ? "إعادة ضبط الفلاتر" : "Reset Filters"}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right side: Stock Status Filter Tabs */}
            <div className="flex gap-1 overflow-x-auto shrink-0">
              {(["all", "healthy", "low", "out"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`flex-1 sm:flex-initial whitespace-nowrap rounded-xl px-3 py-2 text-[10px] font-bold capitalize transition ${
                    statusFilter === tab
                      ? "bg-[#942E3A] text-[#FFF9EB]"
                      : "bg-[#FFF9EB] text-[#942E3A]/70 hover:bg-[#F2DFC0]"
                  }`}
                >
                  {tab === "all"
                    ? (isRtl ? "الكل" : "All")
                    : tab === "healthy"
                    ? (isRtl ? "سليم" : "Healthy")
                    : tab === "low"
                    ? (isRtl ? "منخفض" : "Low")
                    : (isRtl ? "نفد" : "Out")}
                </button>
              ))}
            </div>
          </div>

          {/* Bulk Actions Floating Toolbar */}
          {selectedVariantIds.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#D8B46A]/40 bg-[#FFF9EB] p-3 shadow-md animate-in fade-in">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#942E3A] text-[10px] font-bold text-[#FFF9EB]">
                  {selectedVariantIds.length}
                </span>
                <span className="text-xs font-bold text-[#942E3A]">
                  {isRtl ? "متغيرات محددة" : "Variants Selected"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBulkSetStatus("active")}
                  disabled={isPending}
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-600/30 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{isRtl ? "تفعيل" : "Set Active"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBulkSetStatus("archived")}
                  disabled={isPending}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-600/30 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-800 hover:bg-rose-100 transition"
                >
                  <Archive className="h-3.5 w-3.5" />
                  <span>{isRtl ? "أرشفة" : "Archive"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedVariantIds([])}
                  className="text-xs font-semibold text-[#6B1F2A]/60 hover:underline px-2"
                >
                  {isRtl ? "إلغاء تحديد الكل" : "Deselect All"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="mt-4 hidden sm:block overflow-x-auto">
          {viewMode === "variants" ? (
            /* Table 1: By Variant View */
            <table className={`w-full min-w-[850px] ${isRtl ? "text-right" : "text-left"} text-xs`}>
              <thead className="border-b border-[#942E3A]/10 text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
                <tr>
                  <th className="w-10 pb-3 px-3">
                    <button
                      type="button"
                      onClick={toggleSelectAllVariants}
                      className="text-[#942E3A] hover:opacity-80"
                    >
                      {isAllVariantsSelected ? (
                        <CheckSquare className="h-4 w-4 text-[#942E3A]" />
                      ) : (
                        <Square className="h-4 w-4 text-[#942E3A]/40" />
                      )}
                    </button>
                  </th>
                  <th className={`w-[28%] pb-3 px-3 ${isRtl ? "text-right" : "text-left"}`}>{isRtl ? "المنتج" : "Product"}</th>
                  <th className={`w-[12%] pb-3 px-3 ${isRtl ? "text-right" : "text-left"}`}>{isRtl ? "رمز المنتج (SKU)" : "SKU"}</th>
                  <th className={`w-[14%] pb-3 px-3 ${isRtl ? "text-right" : "text-left"}`}>{isRtl ? "المتغير / المقاس" : "Variant"}</th>
                  <th className={`w-[12%] pb-3 px-3 ${isRtl ? "text-right" : "text-left"}`}>{isRtl ? "القسم" : "Category"}</th>
                  <th className={`w-[15%] pb-3 px-3 ${isRtl ? "text-right" : "text-left"}`}>{isRtl ? "حالة المنتج" : "Product Status"}</th>
                  <th className={`w-[13%] pb-3 px-3 ${isRtl ? "text-right" : "text-left"}`}>{isRtl ? "حالة المخزون" : "Stock Status"}</th>
                  <th className={`w-[10%] pb-3 px-3 ${isRtl ? "text-left" : "text-right"}`}>{isRtl ? "كمية المخزون" : "Stock Quantity"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#942E3A]/8">
                {filteredRows.map((row) => {
                  const isSelected = selectedVariantIds.includes(row.variantId);
                  const isHealthy = row.stock > row.lowStockLimit;
                  const isLow = row.stock > 0 && row.stock <= row.lowStockLimit;
                  const isOut = row.stock === 0;

                  return (
                    <tr
                      key={row.variantId}
                      className={`group transition ${
                        isSelected ? "bg-[#FFF9EB]" : "hover:bg-[#FFF9EB]/50"
                      }`}
                    >
                      <td className="py-3.5 px-3">
                        <button
                          type="button"
                          onClick={() => toggleSelectRow(row.variantId)}
                          className="text-[#942E3A]"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-[#942E3A]" />
                          ) : (
                            <Square className="h-4 w-4 text-[#942E3A]/30" />
                          )}
                        </button>
                      </td>

                      {/* Product Name & Price */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          {row.image ? (
                            <img
                              src={row.image}
                              alt=""
                              className="h-10 w-10 shrink-0 rounded-xl bg-white border border-[#942E3A]/10 object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF9EB] text-[#D8B46A] border border-[#D8B46A]/30">
                              <Package className="h-5 w-5" />
                            </div>
                          )}
                          <div>
                            <Link
                              href={`/admin/products/${row.productId}`}
                              className="font-bold text-[#942E3A] hover:underline inline-flex items-center gap-1"
                            >
                              <span>{row.product}</span>
                              <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition text-[#D8B46A]" />
                            </Link>
                            <div className="mt-0.5 text-[10px] text-[#6B1F2A]/60 font-semibold">
                              {formatPrice(row.price)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-3.5 px-3 text-[11px] font-mono text-[#6B1F2A]/60">
                        {row.sku || "—"}
                      </td>

                      {/* Variant */}
                      <td className="py-3.5 px-3 font-medium text-[#6B1F2A]">
                        {row.category.toLowerCase() !== "perfumes" && row.color ? `${row.color} · ` : ""}
                        <span className="font-bold">{row.size}</span>
                        {row.subcategory && row.subcategory !== "General" && (
                          <span className={`${isRtl ? "mr-1.5" : "ml-1.5"} text-[10px] text-[#6B1F2A]/50`}>
                            ({row.subcategory})
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3 capitalize">
                        <span className="rounded-lg bg-[#FFF9EB] border border-[#D8B46A]/30 px-2 py-0.5 text-[10px] font-bold text-[#942E3A]">
                          {row.category}
                        </span>
                      </td>

                      {/* Product Status (Prominent 3D Button) */}
                      <td className="py-3.5 px-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleProductStatus(row.productId, row.productStatus)
                          }
                          disabled={isPending}
                          title={isRtl ? "انقر لتغيير حالة المنتج" : "Click to toggle product status"}
                          className={`group relative inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-sm hover:shadow-md active:scale-95 border ${
                            row.productStatus === "active"
                              ? "border-emerald-600/40 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-600"
                              : "border-gray-400/50 bg-gray-100/90 text-gray-800 hover:bg-gray-200 hover:border-gray-500"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full transition-transform group-hover:scale-125 ${
                              row.productStatus === "active"
                                ? "bg-emerald-600 shadow-[0_0_6px_rgba(5,150,105,0.6)]"
                                : "bg-gray-500 shadow-[0_0_6px_rgba(107,114,128,0.6)]"
                            }`}
                          />
                          <span className="capitalize">
                            {row.productStatus === "active" ? (isRtl ? "مفعّل" : "Active") : (isRtl ? "مؤرشف" : "Archived")}
                          </span>
                          <RefreshCw className="h-3 w-3 opacity-40 group-hover:opacity-100 transition-transform group-hover:rotate-180 text-current ml-0.5" />
                        </button>
                      </td>

                      {/* Stock Status Badge */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            isOut
                              ? "bg-rose-100 text-rose-800"
                              : isLow
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isOut
                                ? "bg-rose-600"
                                : isLow
                                ? "bg-amber-600"
                                : "bg-emerald-600"
                            }`}
                          />
                          {isOut ? (isRtl ? "نفد المخزون" : "Out of stock") : isLow ? (isRtl ? "مخزون منخفض" : "Low stock") : (isRtl ? "متوفر" : "Healthy")}{" "}
                          ({formatNumber(row.stock)})
                        </span>
                      </td>

                      {/* Clean Stock Quantity Column (Display only) */}
                      <td className={`py-3.5 px-3 ${isRtl ? "text-left" : "text-right"} font-mono font-bold text-[#942E3A] text-sm`}>
                        {formatNumber(row.stock)} <span className="text-[10px] font-sans font-medium text-[#6B1F2A]/50">{isRtl ? "قطعة" : "units"}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            /* Table 2: By Product View */
            <table className={`w-full min-w-[850px] ${isRtl ? "text-right" : "text-left"} text-xs`}>
              <thead className="border-b border-[#942E3A]/10 text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
                <tr>
                  <th className="w-10 pb-3 px-3">
                    <button
                      type="button"
                      onClick={toggleSelectAllProducts}
                      className="text-[#942E3A] hover:opacity-80"
                    >
                      {isAllProductsSelected ? (
                        <CheckSquare className="h-4 w-4 text-[#942E3A]" />
                      ) : (
                        <Square className="h-4 w-4 text-[#942E3A]/40" />
                      )}
                    </button>
                  </th>
                  <th className={`w-[32%] pb-3 px-3 ${isRtl ? "text-right" : "text-left"}`}>{isRtl ? "المنتج" : "Product"}</th>
                  <th className={`w-[22%] pb-3 px-3 ${isRtl ? "text-right" : "text-left"}`}>{isRtl ? "تفاصيل المقاسات والمتغيرات" : "Variants Breakdown"}</th>
                  <th className={`w-[14%] pb-3 px-3 ${isRtl ? "text-right" : "text-left"}`}>{isRtl ? "القسم" : "Category"}</th>
                  <th className={`w-[15%] pb-3 px-3 ${isRtl ? "text-right" : "text-left"}`}>{isRtl ? "حالة المنتج" : "Product Status"}</th>
                  <th className={`w-[12%] pb-3 px-3 ${isRtl ? "text-left" : "text-right"}`}>{isRtl ? "إجمالي القطع" : "Total Units"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#942E3A]/8">
                {productGroupRows.map((pRow) => {
                  const isSelected = pRow.variantIds.every((id) =>
                    selectedVariantIds.includes(id)
                  );

                  return (
                    <tr
                      key={pRow.productId}
                      className={`group transition ${
                        isSelected ? "bg-[#FFF9EB]" : "hover:bg-[#FFF9EB]/50"
                      }`}
                    >
                      <td className="py-3.5 px-3">
                        <button
                          type="button"
                          onClick={() => toggleSelectProduct(pRow)}
                          className="text-[#942E3A]"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-[#942E3A]" />
                          ) : (
                            <Square className="h-4 w-4 text-[#942E3A]/30" />
                          )}
                        </button>
                      </td>

                      {/* Product Info */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          {pRow.image ? (
                            <img
                              src={pRow.image}
                              alt=""
                              className="h-10 w-10 shrink-0 rounded-xl bg-white border border-[#942E3A]/10 object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF9EB] text-[#D8B46A] border border-[#D8B46A]/30">
                              <Package className="h-5 w-5" />
                            </div>
                          )}
                          <div>
                            <Link
                              href={`/admin/products/${pRow.productId}`}
                              className="font-bold text-[#942E3A] hover:underline inline-flex items-center gap-1"
                            >
                              <span>{pRow.product}</span>
                              <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition text-[#D8B46A]" />
                            </Link>
                            <div className="mt-0.5 text-[10px] text-[#6B1F2A]/60 font-semibold">
                              {formatPrice(pRow.price)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Variants & Sizes Breakdown */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-0.5">
                          <span className="font-bold text-[#942E3A] text-xs">
                            {formatNumber(pRow.variantsCount)} {isRtl ? "متغيرات" : "variants"}
                          </span>
                          <div className="text-[10px] text-[#6B1F2A]/70 truncate max-w-[220px]">
                            {pRow.sizesList.length > 0 && `${isRtl ? "المقاسات: " : "Sizes: "}${pRow.sizesList.join("، ")}`}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3 capitalize">
                        <span className="rounded-lg bg-[#FFF9EB] border border-[#D8B46A]/30 px-2 py-0.5 text-[10px] font-bold text-[#942E3A]">
                          {pRow.category}
                        </span>
                      </td>

                      {/* Product Status (Prominent 3D Button) */}
                      <td className="py-3.5 px-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleProductStatus(pRow.productId, pRow.productStatus)
                          }
                          disabled={isPending}
                          title={isRtl ? "انقر لتغيير حالة المنتج" : "Click to toggle product status"}
                          className={`group relative inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-sm hover:shadow-md active:scale-95 border ${
                            pRow.productStatus === "active"
                              ? "border-emerald-600/40 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-600"
                              : "border-gray-400/50 bg-gray-100/90 text-gray-800 hover:bg-gray-200 hover:border-gray-500"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full transition-transform group-hover:scale-125 ${
                              pRow.productStatus === "active"
                                ? "bg-emerald-600 shadow-[0_0_6px_rgba(5,150,105,0.6)]"
                                : "bg-gray-500 shadow-[0_0_6px_rgba(107,114,128,0.6)]"
                            }`}
                          />
                          <span className="capitalize">
                            {pRow.productStatus === "active" ? (isRtl ? "مفعّل" : "Active") : (isRtl ? "مؤرشف" : "Archived")}
                          </span>
                          <RefreshCw className="h-3 w-3 opacity-40 group-hover:opacity-100 transition-transform group-hover:rotate-180 text-current ml-0.5" />
                        </button>
                      </td>

                      {/* Total Stock Quantity */}
                      <td className={`py-3.5 px-3 ${isRtl ? "text-left" : "text-right"} font-mono font-bold text-[#942E3A] text-sm`}>
                        {formatNumber(pRow.totalStock)}{" "}
                        <span className="text-[10px] font-sans font-medium text-[#6B1F2A]/50">
                          {isRtl ? "قطعة" : "units"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile Cards View (By Variant vs By Product) */}
        <div className="space-y-2.5 sm:hidden mt-4">
          <div className="flex items-center justify-between px-1 text-[11px] font-bold text-[#6B1F2A]/60">
            <button
              type="button"
              onClick={viewMode === "variants" ? toggleSelectAllVariants : toggleSelectAllProducts}
              className="flex items-center gap-1.5 text-[#942E3A]"
            >
              {(viewMode === "variants" ? isAllVariantsSelected : isAllProductsSelected) ? (
                <CheckSquare className="h-4 w-4 text-[#942E3A]" />
              ) : (
                <Square className="h-4 w-4 text-[#942E3A]/40" />
              )}
              <span>{isRtl ? "تحديد الكل" : "Select All"}</span>
            </button>
            <span>
              {viewMode === "variants"
                ? `${formatNumber(filteredRows.length)} ${isRtl ? "عنصر" : "items"}`
                : `${formatNumber(productGroupRows.length)} ${isRtl ? "منتج" : "products"}`}
            </span>
          </div>

          {viewMode === "variants" ? (
            filteredRows.map((row) => {
              const isSelected = selectedVariantIds.includes(row.variantId);
              const isHealthy = row.stock > row.lowStockLimit;
              const isLow = row.stock > 0 && row.stock <= row.lowStockLimit;
              const isOut = row.stock === 0;

              return (
                <div
                  key={row.variantId}
                  className={`rounded-2xl border p-3 text-xs space-y-2.5 transition ${
                    isSelected ? "border-[#942E3A] bg-[#FFF9EB]" : "border-[#942E3A]/12 bg-[#FFF9EB]/30"
                  }`}
                >
                  {/* Top Row: Checkbox, Status Button, SKU */}
                  <div className="flex items-center justify-between gap-2 border-b border-[#942E3A]/10 pb-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleSelectRow(row.variantId)}
                        className="text-[#942E3A] p-0.5"
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-[#942E3A]" />
                        ) : (
                          <Square className="h-4 w-4 text-[#942E3A]/30" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleProductStatus(row.productId, row.productStatus)}
                        disabled={isPending}
                        className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold border ${
                          row.productStatus === "active"
                            ? "border-emerald-600/40 bg-emerald-50 text-emerald-800"
                            : "border-gray-400/50 bg-gray-100 text-gray-800"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${row.productStatus === "active" ? "bg-emerald-600" : "bg-gray-500"}`} />
                        <span className="capitalize">{row.productStatus === "active" ? (isRtl ? "مفعّل" : "Active") : (isRtl ? "مؤرشف" : "Archived")}</span>
                      </button>
                    </div>
                    <span className="font-mono text-[10px] font-semibold text-[#6B1F2A]/60 truncate">
                      {row.sku || "—"}
                    </span>
                  </div>

                  {/* Middle Row: Product Image, Name, Price, Category & Variant */}
                  <div className="flex items-start gap-3">
                    {row.image ? (
                      <img
                        src={row.image}
                        alt=""
                        className="h-11 w-11 shrink-0 rounded-xl bg-white border border-[#942E3A]/10 object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF9EB] text-[#D8B46A] border border-[#D8B46A]/30">
                        <Package className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <Link
                        href={`/admin/products/${row.productId}`}
                        className="font-bold text-[#942E3A] hover:underline block truncate text-xs"
                      >
                        {row.product}
                      </Link>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[#942E3A] text-xs">
                          {formatPrice(row.price)}
                        </span>
                        <span className="rounded-md bg-[#FFF9EB] border border-[#D8B46A]/30 px-1.5 py-0.5 text-[9px] font-bold text-[#942E3A] capitalize">
                          {row.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6B1F2A]/80 font-medium">
                        {isRtl ? "المتغير: " : "Variant: "}{row.category.toLowerCase() !== "perfumes" && row.color ? `${row.color} · ` : ""}
                        <span className="font-bold">{row.size}</span>
                        {row.subcategory && row.subcategory !== "General" && ` (${row.subcategory})`}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Row: Stock Badge & Units */}
                  <div className="flex items-center justify-between gap-2 border-t border-[#942E3A]/10 pt-2 text-[11px]">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        isOut
                          ? "bg-rose-100 text-rose-800"
                          : isLow
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${isOut ? "bg-rose-600" : isLow ? "bg-amber-600" : "bg-emerald-600"}`} />
                      {isOut ? (isRtl ? "نفد المخزون" : "Out of stock") : isLow ? (isRtl ? "مخزون منخفض" : "Low stock") : (isRtl ? "متوفر" : "Healthy")}
                    </span>

                    <span className="font-mono font-bold text-[#942E3A]">
                      {formatNumber(row.stock)} <span className="font-sans text-[10px] text-[#6B1F2A]/50">{isRtl ? "قطعة" : "units"}</span>
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            productGroupRows.map((pRow) => {
              const isSelected = pRow.variantIds.every((id) => selectedVariantIds.includes(id));

              return (
                <div
                  key={pRow.productId}
                  className={`rounded-2xl border p-3 text-xs space-y-2.5 transition ${
                    isSelected ? "border-[#942E3A] bg-[#FFF9EB]" : "border-[#942E3A]/12 bg-[#FFF9EB]/30"
                  }`}
                >
                  {/* Top Row: Checkbox & Product Status */}
                  <div className="flex items-center justify-between gap-2 border-b border-[#942E3A]/10 pb-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleSelectProduct(pRow)}
                        className="text-[#942E3A] p-0.5"
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-[#942E3A]" />
                        ) : (
                          <Square className="h-4 w-4 text-[#942E3A]/30" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleProductStatus(pRow.productId, pRow.productStatus)}
                        disabled={isPending}
                        className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold border ${
                          pRow.productStatus === "active"
                            ? "border-emerald-600/40 bg-emerald-50 text-emerald-800"
                            : "border-gray-400/50 bg-gray-100 text-gray-800"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${pRow.productStatus === "active" ? "bg-emerald-600" : "bg-gray-500"}`} />
                        <span className="capitalize">{pRow.productStatus === "active" ? (isRtl ? "مفعّل" : "Active") : (isRtl ? "مؤرشف" : "Archived")}</span>
                      </button>
                    </div>

                    <span className="rounded-md bg-[#FFF9EB] border border-[#D8B46A]/30 px-1.5 py-0.5 text-[9px] font-bold text-[#942E3A] capitalize">
                      {pRow.category}
                    </span>
                  </div>

                  {/* Middle Row: Product Image, Name, Price & Variants breakdown */}
                  <div className="flex items-start gap-3">
                    {pRow.image ? (
                      <img
                        src={pRow.image}
                        alt=""
                        className="h-11 w-11 shrink-0 rounded-xl bg-white border border-[#942E3A]/10 object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF9EB] text-[#D8B46A] border border-[#D8B46A]/30">
                        <Package className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <Link
                        href={`/admin/products/${pRow.productId}`}
                        className="font-bold text-[#942E3A] hover:underline block truncate text-xs"
                      >
                        {pRow.product}
                      </Link>
                      <span className="font-extrabold text-[#942E3A] text-xs block">
                        {formatPrice(pRow.price)}
                      </span>
                      <p className="text-[10px] text-[#6B1F2A]/70 truncate">
                        <span className="font-bold">{formatNumber(pRow.variantsCount)} {isRtl ? "متغيرات" : "variants"}</span>
                        {pRow.sizesList.length > 0 && ` (${pRow.sizesList.join("، ")})`}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Row: Total Units */}
                  <div className="flex items-center justify-between gap-2 border-t border-[#942E3A]/10 pt-2 text-[11px]">
                    <span className="text-[10px] font-bold text-[#6B1F2A]/50 uppercase tracking-wide">
                      {isRtl ? "إجمالي المخزون" : "Total Stock"}
                    </span>
                    <span className="font-mono font-bold text-[#942E3A]">
                      {formatNumber(pRow.totalStock)} <span className="font-sans text-[10px] text-[#6B1F2A]/50">{isRtl ? "قطعة" : "units"}</span>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

          {filteredRows.length === 0 && (
            <div className="py-14 text-center text-xs text-[#6B1F2A]/60">
              <Search className="mx-auto h-8 w-8 text-[#D8B46A]/60" />
              <p className="mt-2 font-bold text-[#942E3A]">No inventory variants matched your search or filters.</p>
            </div>
          )}
      </section>

      {/* Bulk Restock Modal */}
      {isRestockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#8B7CC7]/45 backdrop-blur-[2px]"
            onClick={() => setIsRestockModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-3xl border border-[#D8B46A]/30 bg-[#FFF9EB] p-6 shadow-2xl">
            <h3 className="font-playfair text-xl font-bold text-[#942E3A]">
              Bulk Restock Variants
            </h3>
            <p className="mt-1 text-xs text-[#6B1F2A]/70">
              Add stock quantity to {selectedVariantIds.length} selected variants.
            </p>

            <div className="mt-4 space-y-2">
              <label className="block text-[10px] font-bold uppercase text-[#D8B46A]">
                Quantity to Add (+Qty)
              </label>
              <input
                type="number"
                min="1"
                value={restockQty}
                onChange={(e) => setRestockQty(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full rounded-xl border border-[#942E3A]/20 bg-white px-3 py-2.5 text-sm font-bold text-[#942E3A]"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsRestockModalOpen(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-[#6B1F2A]/70 hover:bg-[#942E3A]/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkRestock}
                disabled={isPending}
                className="rounded-xl bg-[#942E3A] px-5 py-2 text-xs font-bold text-[#FFF9EB] hover:bg-[#802832]"
              >
                Apply Restock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
