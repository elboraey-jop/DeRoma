"use client";

import { useState, useRef, useEffect } from "react";
import {
  Globe,
  Home,
  PhoneCall,
  Info,
  Save,
  Plus,
  Trash2,
  ImagePlus,
  LoaderCircle,
  Star,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ShoppingBag,
  Search,
  ChevronDown,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { HeroBanner, HomeReview, SiteSettingsData } from "@/lib/siteSettings";
import { updateSiteSettingsAction } from "@/app/admin/website/actions";
import { useAdminI18n } from "@/providers/AdminI18nContext";

interface SimpleProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  image?: string;
}

interface AdminWebsiteClientProps {
  initialSettings: SiteSettingsData;
  products: SimpleProduct[];
}

function ProductRowSelector({
  title,
  isRtl,
  icon: Icon,
  selectedIds,
  onToggleProduct,
  onMoveProduct,
  products,
}: {
  title: string;
  isRtl: boolean;
  icon: React.ElementType;
  selectedIds: string[];
  onToggleProduct: (id: string) => void;
  onMoveProduct?: (index: number, direction: "left" | "right") => void;
  products: SimpleProduct[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const pickerRef = useRef<HTMLDivElement>(null);

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category))).sort()];

  const filteredProducts = products.filter((p) => {
    const matchesCat = categoryFilter === "all" || p.category === categoryFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const selectedProducts = selectedIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is SimpleProduct => Boolean(p));

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: PointerEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleOutsideClick);
    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, [isOpen]);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-bold text-xs sm:text-sm text-[#942E3A] flex items-center gap-1.5 min-w-0 truncate">
          <Icon className="h-4 w-4 text-[#D8B46A] shrink-0" />
          <span className="truncate">{title}</span>
          <span className="rounded-full bg-[#FFF9EB] px-2 py-0.5 text-[10px] sm:text-xs font-extrabold text-[#942E3A] border border-[#942E3A]/15 shrink-0">
            {selectedIds.length}
          </span>
        </h4>

        <div ref={pickerRef} className="relative shrink-0 w-36 sm:w-72">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex h-8 sm:h-10 w-full items-center justify-between gap-1.5 rounded-xl border border-[#942E3A]/20 bg-[#FFF9EB]/40 px-2.5 py-1 sm:px-3 sm:py-2 text-[11px] sm:text-xs font-bold text-[#942E3A] transition hover:border-[#942E3A] hover:bg-[#FFF9EB]"
          >
            <span className="flex items-center gap-1.5 truncate">
              <Search className="h-3.5 w-3.5 text-[#D8B46A] shrink-0" />
              <span className="truncate">{isRtl ? "اختيار المنتجات" : "Select Products"}</span>
            </span>
            <ChevronDown className={cn("h-3.5 w-3.5 text-[#D8B46A] transition-transform shrink-0", isOpen && "rotate-180")} />
          </button>

          {isOpen && (
            <div
              className="absolute right-0 top-[calc(100%+4px)] z-30 w-[280px] sm:w-[340px] max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border border-[#D8B46A]/40 bg-white p-2.5 shadow-xl"
              onWheel={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <div className="space-y-2 pb-2 border-b border-[#942E3A]/10">
                <div className="relative flex items-center">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#942E3A]/40 pointer-events-none" />
                    <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isRtl ? "البحث باسم المنتج..." : "Search by product name..."}
                    className="w-full rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB]/30 pl-8 pr-2.5 py-1.5 text-xs text-[#942E3A] placeholder-[#942E3A]/40 focus:outline-none focus:ring-1 focus:ring-[#942E3A]"
                  />
                </div>
                <div className="flex gap-1 overflow-x-auto pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={cn(
                        "shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-bold capitalize transition",
                        categoryFilter === cat
                          ? "bg-[#942E3A] text-white"
                          : "bg-[#FFF9EB] text-[#942E3A] hover:bg-[#942E3A]/10"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className="max-h-56 overflow-y-auto space-y-1 pt-1.5 overscroll-contain touch-pan-y [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                onWheel={(e) => e.stopPropagation()}
              >
                {filteredProducts.map((p) => {
                  const isChecked = selectedIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onToggleProduct(p.id)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-xl p-1.5 text-left text-xs transition-all",
                        isChecked
                          ? "bg-[#942E3A]/10 text-[#942E3A] font-bold"
                          : "hover:bg-[#FFF9EB] text-stone-700"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-md border transition shrink-0",
                          isChecked ? "border-[#942E3A] bg-[#942E3A] text-white" : "border-stone-300 bg-white"
                        )}
                      >
                        {isChecked && <Check className="h-3 w-3 text-white" />}
                      </div>
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="h-7 w-7 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="h-7 w-7 rounded-lg bg-[#FFF9EB] flex items-center justify-center shrink-0">
                          <ShoppingBag className="h-3.5 w-3.5 text-[#D8B46A]" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs">{p.name}</p>
                        <p className="text-[9px] text-stone-400 capitalize">{p.category} · {p.price} EGP</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mini Lazy Row Display */}
      {selectedProducts.length > 0 ? (
        <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {selectedProducts.map((p, idx) => (
            <div
              key={p.id}
              className="w-36 sm:w-44 shrink-0 rounded-2xl border border-[#942E3A]/15 bg-white p-2 shadow-xs relative group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="rounded-md bg-[#FFF9EB] px-1.5 py-0.5 text-[9px] font-extrabold text-[#942E3A] border border-[#942E3A]/15">
                  #{idx + 1}
                </span>
                <div className="flex items-center gap-1">
                  {onMoveProduct && idx > 0 && (
                    <button
                      type="button"
                      onClick={() => onMoveProduct(idx, "left")}
                      className="flex h-5 w-5 items-center justify-center rounded-md border border-[#942E3A]/20 bg-[#FFF9EB] text-[#942E3A] hover:bg-[#942E3A] hover:text-white transition"
                      title="Move Left"
                    >
                      <ArrowLeft className="h-3 w-3" />
                    </button>
                  )}
                  {onMoveProduct && idx < selectedProducts.length - 1 && (
                    <button
                      type="button"
                      onClick={() => onMoveProduct(idx, "right")}
                      className="flex h-5 w-5 items-center justify-center rounded-md border border-[#942E3A]/20 bg-[#FFF9EB] text-[#942E3A] hover:bg-[#942E3A] hover:text-white transition"
                      title="Move Right"
                    >
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onToggleProduct(p.id)}
                    className="flex h-5 w-5 items-center justify-center rounded-md bg-red-600/90 text-white hover:bg-red-700 transition"
                    title="Remove product"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#FFF9EB] flex items-center justify-center border border-[#942E3A]/10">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <ShoppingBag className="h-7 w-7 text-[#D8B46A]" />
                )}
              </div>

              <div className="mt-1.5 space-y-0.5">
                <span className="text-[8px] font-bold uppercase tracking-wider text-[#D8B46A] block truncate">
                  {p.category}
                </span>
                <p className="truncate text-[11px] sm:text-xs font-bold text-[#942E3A]" title={p.name}>
                  {p.name}
                </p>
                <p className="text-[11px] sm:text-xs font-black text-[#D8B46A]">
                  {p.price.toLocaleString()} EGP
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[#942E3A]/20 bg-[#FFF9EB]/30 p-4 text-center">
          <ShoppingBag className="mx-auto h-6 w-6 text-[#D8B46A]" />
          <p className="mt-1 text-xs font-bold text-[#942E3A]">{isRtl ? "لم يتم اختيار منتجات لهذا الصف" : "No products selected for this row"}</p>
          <p className="text-[10px] text-[#6B1F2A]/60 mt-0.5">
            {isRtl ? "اضغط على «اختيار المنتجات» بالأعلى لإضافة منتجات." : <>Click &quot;Select Products&quot; above to add products.</>}
          </p>
        </div>
      )}
    </div>
  );
}

export default function AdminWebsiteClient({
  initialSettings,
  products,
}: AdminWebsiteClientProps) {
  const { lang, t, formatPrice } = useAdminI18n();
  const isRtl = lang === "ar";

  const [activeTab, setActiveTab] = useState<"home" | "contact" | "about">("home");
  const [homeSubTab, setHomeSubTab] = useState<"banners" | "products">("banners");
  const [settings, setSettings] = useState<SiteSettingsData>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSiteSettingsAction(settings);
      toast.success(isRtl ? "تم حفظ إعدادات الموقع بنجاح!" : "Website settings saved successfully!");
    } catch (error) {
      console.error("Failed to save site settings", error);
      toast.error(isRtl ? "حدث خطأ أثناء حفظ الإعدادات." : "Failed to save website settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (
    file: File | null,
    onSuccess: (url: string) => void,
    fieldKey: string
  ) => {
    if (!file) return;
    setUploadingField(fieldKey);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const res = await fetch("/admin/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Upload failed");
      onSuccess(data.url);
      toast.success(isRtl ? "تم رفع الصورة بنجاح!" : "Image uploaded successfully!");
    } catch (err) {
      console.error("Upload error", err);
      toast.error(err instanceof Error ? err.message : (isRtl ? "فشل رفع الصورة." : "Image upload failed."));
    } finally {
      setUploadingField(null);
    }
  };

  // Banner handlers
  const addBanner = () => {
    const newBanner: HeroBanner = {
      id: Date.now().toString(),
      tag: "",
      title: "",
      desc: "",
      href: "/shop",
      image: "",
      mobileImage: "",
    };
    setSettings((prev) => ({
      ...prev,
      heroBanners: [...prev.heroBanners, newBanner],
    }));
  };

  const updateBanner = (index: number, key: keyof HeroBanner, value: string) => {
    setSettings((prev) => {
      const updated = [...prev.heroBanners];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, heroBanners: updated };
    });
  };

  const removeBanner = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      heroBanners: prev.heroBanners.filter((_, i) => i !== index),
    }));
  };

  const moveBanner = (index: number, dir: "up" | "down") => {
    setSettings((prev) => {
      const list = [...prev.heroBanners];
      const target = dir === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= list.length) return prev;
      const temp = list[index];
      list[index] = list[target];
      list[target] = temp;
      return { ...prev, heroBanners: list };
    });
  };

  const toggleForYouProduct = (id: string) => {
    setSettings((prev) => {
      const exists = prev.forYouProductIds.includes(id);
      const updated = exists
        ? prev.forYouProductIds.filter((pId) => pId !== id)
        : [...prev.forYouProductIds, id];
      return { ...prev, forYouProductIds: updated };
    });
  };

  const moveForYouProduct = (index: number, dir: "left" | "right") => {
    setSettings((prev) => {
      const list = [...prev.forYouProductIds];
      const target = dir === "left" ? index - 1 : index + 1;
      if (target < 0 || target >= list.length) return prev;
      const temp = list[index];
      list[index] = list[target];
      list[target] = temp;
      return { ...prev, forYouProductIds: list };
    });
  };

  const toggleBestSellerProduct = (id: string) => {
    setSettings((prev) => {
      const exists = prev.bestSellerProductIds.includes(id);
      const updated = exists
        ? prev.bestSellerProductIds.filter((pId) => pId !== id)
        : [...prev.bestSellerProductIds, id];
      return { ...prev, bestSellerProductIds: updated };
    });
  };

  const moveBestSellerProduct = (index: number, dir: "left" | "right") => {
    setSettings((prev) => {
      const list = [...prev.bestSellerProductIds];
      const target = dir === "left" ? index - 1 : index + 1;
      if (target < 0 || target >= list.length) return prev;
      const temp = list[index];
      list[index] = list[target];
      list[target] = temp;
      return { ...prev, bestSellerProductIds: list };
    });
  };
  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="space-y-4 text-start sm:space-y-6">
      {/* Top Action Header */}
      <div className="flex items-center justify-between gap-2 border-b border-[#942E3A]/10 pb-3">
        <div>
          <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#D8B46A]">
            {isRtl ? "إدارة الموقع" : "WEBSITE MANAGEMENT"}
          </span>
          <h1 className="font-playfair text-lg sm:text-2xl font-extrabold text-[#942E3A]">
            {isRtl ? "الموقع الإلكتروني CMS والمحتوى" : <>Website CMS &amp; Content</>}
          </h1>
          <p className="text-[10px] sm:text-xs text-[#6B1F2A]/60 hidden sm:block">
            {isRtl ? "إدارة محتوى المتجر بالكامل: البانرات الرئيسية، صفوف المنتجات، بيانات التواصل، ومن نحن." : "Manage full storefront content: hero banners, product rows, contact details, and About Us."}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#942E3A] px-3.5 py-2 sm:px-5 sm:py-2.5 text-xs font-bold text-white transition hover:bg-[#7a2530] disabled:opacity-50 shadow-xs shrink-0"
        >
          {isSaving ? (
            <LoaderCircle className="h-3.5 w-3.5 animate-spin text-white" />
          ) : (
            <Save className="h-3.5 w-3.5 text-[#D8B46A]" />
          )}
          <span className="text-xs">{isRtl ? "حفظ" : "Save"}</span>
        </button>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="admin-tabs-shell grid grid-cols-3 gap-1.5 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("home")}
          data-active={activeTab === "home"}
          className={cn(
            "admin-tab flex items-center justify-center gap-1.5 px-2 py-2 text-center text-[11px] font-bold sm:px-4 sm:py-2.5 sm:text-xs",
            activeTab === "home" ? "text-[#5F5598]" : ""
          )}
        >
          <Home className="h-3.5 w-3.5 text-[#D8B46A] shrink-0" />
          <span className="truncate">{isRtl ? "الصفحة الرئيسية" : "Home Page"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("contact")}
          data-active={activeTab === "contact"}
          className={cn(
            "admin-tab flex items-center justify-center gap-1.5 px-2 py-2 text-center text-[11px] font-bold sm:px-4 sm:py-2.5 sm:text-xs",
            activeTab === "contact" ? "text-[#5F5598]" : ""
          )}
        >
          <PhoneCall className="h-3.5 w-3.5 text-[#D8B46A] shrink-0" />
          <span className="truncate">{isRtl ? "بيانات التواصل" : "Contact Info"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("about")}
          data-active={activeTab === "about"}
          className={cn(
            "admin-tab flex items-center justify-center gap-1.5 px-2 py-2 text-center text-[11px] font-bold sm:px-4 sm:py-2.5 sm:text-xs",
            activeTab === "about" ? "text-[#5F5598]" : ""
          )}
        >
          <Info className="h-3.5 w-3.5 text-[#D8B46A] shrink-0" />
          <span className="truncate">{isRtl ? "من نحن" : "About Us"}</span>
        </button>
      </div>

      {/* TAB 1: HOME PAGE */}
      {activeTab === "home" && (
        <div className="space-y-4 sm:space-y-6">
          {/* Sub-Tabs Bar for Home Page Sections */}
          <div className="admin-tabs-shell grid grid-cols-2 gap-1 w-full sm:w-fit">
            <button
              type="button"
              onClick={() => setHomeSubTab("banners")}
              data-active={homeSubTab === "banners"}
              className={cn(
                "admin-tab px-2.5 py-1.5 text-center text-[11px] font-bold truncate sm:px-4 sm:py-2 sm:text-xs",
                homeSubTab === "banners" ? "text-[#5F5598]" : ""
              )}
            >
              {isRtl ? `1. البانرات الرئيسية (${settings.heroBanners.length})` : `1. Hero Banners (${settings.heroBanners.length})`}
            </button>

            <button
              type="button"
              onClick={() => setHomeSubTab("products")}
              data-active={homeSubTab === "products"}
              className={cn(
                "admin-tab px-2.5 py-1.5 text-center text-[11px] font-bold truncate sm:px-4 sm:py-2 sm:text-xs",
                homeSubTab === "products" ? "text-[#5F5598]" : ""
              )}
            >
              {isRtl ? "2. صفوف المنتجات" : "2. Product Rows"}
            </button>
          </div>

          {/* SECTION 1: HERO BANNERS */}
          {homeSubTab === "banners" && (
            <section className="rounded-2xl border border-[#942E3A]/15 bg-white p-3.5 sm:p-5 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#942E3A]/10 pb-2.5">
                <div>
                  <h3 className="font-playfair text-base sm:text-lg font-bold text-[#942E3A]">
                    {isRtl ? `البانرات الرئيسية (${settings.heroBanners.length})` : `Hero Banners (${settings.heroBanners.length})`}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-[#6B1F2A]/60">
                    {isRtl ? "صور بانرات سطح المكتب والهاتف." : "Desktop &amp; Mobile banner images."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addBanner}
                  className="inline-flex items-center gap-1 rounded-xl border border-[#942E3A]/20 bg-[#FFF9EB] px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 text-xs font-bold text-[#942E3A] hover:bg-[#942E3A] hover:text-white transition-all shadow-xs shrink-0"
                >
                  <Plus className="h-3.5 w-3.5 text-[#D8B46A]" />
                  <span>{isRtl ? "إضافة بانر" : "Add Banner"}</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {settings.heroBanners.map((banner, index) => (
                  <div
                    key={banner.id || index}
                    className="rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB]/30 p-2.5 space-y-2 relative"
                  >
                    <div className="flex items-center justify-between border-b border-[#942E3A]/10 pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#942E3A] text-[10px] font-bold text-white leading-none">
                          {index + 1}
                        </span>
                        <span className="font-bold text-xs text-[#942E3A]">{isRtl ? `بانر #${index + 1}` : `Banner #${index + 1}`}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveBanner(index, "up")}
                          disabled={index === 0}
                          className="rounded-md p-1 text-[#942E3A] hover:bg-[#942E3A]/10 disabled:opacity-30"
                          title="Move up"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveBanner(index, "down")}
                          disabled={index === settings.heroBanners.length - 1}
                          className="rounded-md p-1 text-[#942E3A] hover:bg-[#942E3A]/10 disabled:opacity-30"
                          title="Move down"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeBanner(index)}
                          className="rounded-md p-1 text-red-600 hover:bg-red-50"
                          title="Delete Banner"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {/* Desktop Image */}
                      <div className="space-y-1">
                        <span className="font-bold text-[#942E3A] text-[10px] sm:text-[11px] block truncate">{isRtl ? "صورة سطح المكتب" : "Desktop Image"}</span>
                        {banner.image ? (
                          <div className="relative aspect-[16/9] sm:aspect-[2120/742] h-20 sm:h-28 w-full rounded-lg overflow-hidden border border-[#942E3A]/20 bg-[#FFF9EB] p-1 group flex items-center justify-center">
                            <img src={banner.image} alt="Desktop Preview" className="h-full w-full object-cover rounded-md" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col sm:flex-row items-center justify-center gap-1 p-1">
                              <label className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-md bg-[#D8B46A] px-2 py-1 text-[9px] sm:text-[11px] font-bold text-[#942E3A] hover:bg-[#c9a45b] transition">
                                {uploadingField === `desktop-${index}` ? (
                                  <LoaderCircle className="h-3 w-3 animate-spin" />
                                ) : (
                                  <ImagePlus className="h-3 w-3" />
                                )}
                                <span>{isRtl ? "تغيير" : "Change"}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={(e) =>
                                    handleFileUpload(
                                      e.target.files?.[0] || null,
                                      (url) => updateBanner(index, "image", url),
                                      `desktop-${index}`
                                    )
                                  }
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => updateBanner(index, "image", "")}
                                className="inline-flex items-center justify-center rounded-md bg-red-600 px-2 py-1 text-[9px] sm:text-[11px] font-bold text-white hover:bg-red-700 transition"
                              >
                                {isRtl ? "حذف" : "Remove"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className="flex h-20 sm:h-28 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#D8B46A]/60 bg-[#FFF9EB]/40 text-center transition hover:border-[#942E3A] hover:bg-[#FFF9EB]">
                            {uploadingField === `desktop-${index}` ? (
                              <LoaderCircle className="h-4 w-4 animate-spin text-[#942E3A]" />
                            ) : (
                              <ImagePlus className="h-4 w-4 text-[#D8B46A]" />
                            )}
                            <span className="mt-0.5 text-[10px] font-bold text-[#942E3A]">
                              {uploadingField === `desktop-${index}` ? (isRtl ? "جارٍ الرفع..." : "Uploading...") : (isRtl ? "سطح المكتب" : "Desktop")}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={(e) =>
                                handleFileUpload(
                                  e.target.files?.[0] || null,
                                  (url) => updateBanner(index, "image", url),
                                  `desktop-${index}`
                                )
                              }
                            />
                          </label>
                        )}
                      </div>

                      {/* Mobile Image */}
                      <div className="space-y-1">
                        <span className="font-bold text-[#942E3A] text-[10px] sm:text-[11px] block truncate">{isRtl ? "صورة الهاتف" : "Mobile Image"}</span>
                        {banner.mobileImage ? (
                          <div className="relative aspect-[16/9] sm:aspect-[2120/742] h-20 sm:h-28 w-full rounded-lg overflow-hidden border border-[#942E3A]/20 bg-[#FFF9EB] p-1 group flex items-center justify-center">
                            <img src={banner.mobileImage} alt="Mobile Preview" className="h-full w-full object-cover rounded-md" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col sm:flex-row items-center justify-center gap-1 p-1">
                              <label className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-md bg-[#D8B46A] px-2 py-1 text-[9px] sm:text-[11px] font-bold text-[#942E3A] hover:bg-[#c9a45b] transition">
                                {uploadingField === `mobile-${index}` ? (
                                  <LoaderCircle className="h-3 w-3 animate-spin" />
                                ) : (
                                  <ImagePlus className="h-3 w-3" />
                                )}
                                <span>{isRtl ? "تغيير" : "Change"}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={(e) =>
                                    handleFileUpload(
                                      e.target.files?.[0] || null,
                                      (url) => updateBanner(index, "mobileImage", url),
                                      `mobile-${index}`
                                    )
                                  }
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => updateBanner(index, "mobileImage", "")}
                                className="inline-flex items-center justify-center rounded-md bg-red-600 px-2 py-1 text-[9px] sm:text-[11px] font-bold text-white hover:bg-red-700 transition"
                              >
                                {isRtl ? "حذف" : "Remove"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className="flex h-20 sm:h-28 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#D8B46A]/60 bg-[#FFF9EB]/40 text-center transition hover:border-[#942E3A] hover:bg-[#FFF9EB]">
                            {uploadingField === `mobile-${index}` ? (
                              <LoaderCircle className="h-4 w-4 animate-spin text-[#942E3A]" />
                            ) : (
                              <ImagePlus className="h-4 w-4 text-[#D8B46A]" />
                            )}
                            <span className="mt-0.5 text-[10px] font-bold text-[#942E3A]">
                              {uploadingField === `mobile-${index}` ? (isRtl ? "جارٍ الرفع..." : "Uploading...") : (isRtl ? "الهاتف" : "Mobile")}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={(e) =>
                                handleFileUpload(
                                  e.target.files?.[0] || null,
                                  (url) => updateBanner(index, "mobileImage", url),
                                  `mobile-${index}`
                                )
                              }
                            />
                          </label>
                        )}
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SECTION 2: PRODUCT ROWS (FOR YOU & BEST SELLERS) */}
          {homeSubTab === "products" && (
            <section className="rounded-2xl border border-[#942E3A]/15 bg-white p-3.5 sm:p-6 shadow-xs space-y-6">
              <div className="border-b border-[#942E3A]/10 pb-3">
                <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
                  {isRtl ? "اختيار المنتجات" : "PRODUCT SELECTION"}
                </span>
                <h3 className="font-playfair text-base sm:text-xl font-extrabold text-[#942E3A]">
                  {isRtl ? "صفوف منتجات الصفحة الرئيسية" : "Home Product Rows"}
                </h3>
                <p className="text-[10px] sm:text-xs text-[#6B1F2A]/60">
                  {isRtl ? "اختر المنتجات لصفوف «مقترحة لك» و«الأكثر مبيعًا»." : <>Select products for &quot;For You&quot; and &quot;Best Sellers&quot; rows.</>}
                </p>
              </div>

              {/* FOR YOU ROW PICKER */}
              <ProductRowSelector
                title={isRtl ? "1. مقترحة لك" : "1. For You Row"}
                isRtl={isRtl}
                icon={ShoppingBag}
                selectedIds={settings.forYouProductIds}
                onToggleProduct={toggleForYouProduct}
                onMoveProduct={moveForYouProduct}
                products={products}
              />

              {/* BEST SELLER ROW PICKER */}
              <div className="pt-3 border-t border-[#942E3A]/10">
                <ProductRowSelector
                  title={isRtl ? "2. الأكثر مبيعًا" : "2. Best Sellers Row"}
                  isRtl={isRtl}
                  icon={Star}
                  selectedIds={settings.bestSellerProductIds}
                  onToggleProduct={toggleBestSellerProduct}
                  onMoveProduct={moveBestSellerProduct}
                  products={products}
                />
              </div>
            </section>
          )}

        </div>
      )}

      {/* TAB 2: GLOBAL CONTACT INFO */}
      {activeTab === "contact" && (
        <div className="rounded-2xl border border-[#942E3A]/15 bg-white p-3.5 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-[#942E3A]/10 pb-3">
            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
              {isRtl ? "بيانات التواصل العامة" : "SITE-WIDE CONTACT CHANNELS"}
            </span>
            <h3 className="font-playfair text-base sm:text-xl font-extrabold text-[#942E3A]">
              {isRtl ? "بيانات التواصل والروابط الاجتماعية" : <>Global Contact Info &amp; Social Links</>}
            </h3>
            <p className="text-[10px] sm:text-xs text-[#6B1F2A]/60">
              {isRtl ? "تنعكس التغييرات على المتجر بالكامل (التذييل، صفحة التواصل، سياسة الخصوصية، والشروط)." : "Changes reflect across the entire storefront (Footer, Contact page, Privacy Policy, Terms)."}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-[#942E3A] text-[11px] block truncate">{isRtl ? "رقم الهاتف" : "Phone Number"}</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                placeholder="+20 102 345 6789"
                className="w-full rounded-xl border border-[#942E3A]/20 bg-[#FFF9EB]/30 px-2.5 py-1.5 sm:py-2 text-xs text-[#942E3A] focus:outline-none focus:ring-1 focus:ring-[#942E3A]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#942E3A] text-[11px] block truncate">{isRtl ? "واتساب" : "WhatsApp"}</label>
              <input
                type="text"
                value={settings.whatsapp}
                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                placeholder="201023456789"
                className="w-full rounded-xl border border-[#942E3A]/20 bg-[#FFF9EB]/30 px-2.5 py-1.5 sm:py-2 text-xs text-[#942E3A] focus:outline-none focus:ring-1 focus:ring-[#942E3A]"
              />
            </div>

            <div className="col-span-2 mt-2 border-t border-[#942E3A]/10 pt-4 sm:col-span-3">
              <p className="font-playfair text-base font-bold text-[#942E3A]">{isRtl ? "بيانات الدفع الإلكتروني" : "Online payment details"}</p>
              <p className="mt-1 text-[10px] text-[#6B1F2A]/60">{isRtl ? "تظهر هذه البيانات للعملاء عند اختيار InstaPay أو المحفظة." : "These details appear at checkout for InstaPay and wallet payments."}</p>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#942E3A] text-[11px] block truncate">{isRtl ? "حساب InstaPay" : "InstaPay account"}</label>
              <input type="text" value={settings.instapayAccount} onChange={(e) => setSettings({ ...settings, instapayAccount: e.target.value })} placeholder="01515205073" className="w-full rounded-xl border border-[#942E3A]/20 bg-[#FFF9EB]/30 px-2.5 py-1.5 text-xs text-[#942E3A] focus:outline-none focus:ring-1 focus:ring-[#942E3A]" />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-[#942E3A] text-[11px] block truncate">{isRtl ? "رقم المحفظة" : "Wallet number"}</label>
              <input type="text" value={settings.walletNumber} onChange={(e) => setSettings({ ...settings, walletNumber: e.target.value })} placeholder="01515205073" className="w-full rounded-xl border border-[#942E3A]/20 bg-[#FFF9EB]/30 px-2.5 py-1.5 text-xs text-[#942E3A] focus:outline-none focus:ring-1 focus:ring-[#942E3A]" />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-[#942E3A] text-[11px] block truncate">{isRtl ? "اسم المحفظة" : "Wallet provider"}</label>
              <input type="text" value={settings.walletProvider} onChange={(e) => setSettings({ ...settings, walletProvider: e.target.value })} placeholder="Vodafone Cash" className="w-full rounded-xl border border-[#942E3A]/20 bg-[#FFF9EB]/30 px-2.5 py-1.5 text-xs text-[#942E3A] focus:outline-none focus:ring-1 focus:ring-[#942E3A]" />
            </div>

            <div className="space-y-1 col-span-2 sm:col-span-1">
              <label className="font-bold text-[#942E3A] text-[11px] block truncate">{isRtl ? "البريد الإلكتروني للدعم" : "Support Email"}</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="support@deroma.store"
                className="w-full rounded-xl border border-[#942E3A]/20 bg-[#FFF9EB]/30 px-2.5 py-1.5 sm:py-2 text-xs text-[#942E3A] focus:outline-none focus:ring-1 focus:ring-[#942E3A]"
              />
            </div>

            <div className="space-y-1 col-span-2 sm:col-span-1">
              <label className="font-bold text-[#942E3A] text-[11px] block truncate">{isRtl ? "رابط Instagram" : "Instagram Link"}</label>
              <input
                type="text"
                value={settings.instagram}
                onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                placeholder="https://instagram.com/deroma"
                className="w-full rounded-xl border border-[#942E3A]/20 bg-[#FFF9EB]/30 px-2.5 py-1.5 sm:py-2 text-xs text-[#942E3A] focus:outline-none focus:ring-1 focus:ring-[#942E3A]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#942E3A] text-[11px] block truncate">{isRtl ? "رابط Facebook" : "Facebook Link"}</label>
              <input
                type="text"
                value={settings.facebook}
                onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                placeholder="https://facebook.com/deroma"
                className="w-full rounded-xl border border-[#942E3A]/20 bg-[#FFF9EB]/30 px-2.5 py-1.5 sm:py-2 text-xs text-[#942E3A] focus:outline-none focus:ring-1 focus:ring-[#942E3A]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#942E3A] text-[11px] block truncate">{isRtl ? "رابط TikTok" : "TikTok Link"}</label>
              <input
                type="text"
                value={settings.tiktok}
                onChange={(e) => setSettings({ ...settings, tiktok: e.target.value })}
                placeholder="https://tiktok.com/@deroma"
                className="w-full rounded-xl border border-[#942E3A]/20 bg-[#FFF9EB]/30 px-2.5 py-1.5 sm:py-2 text-xs text-[#942E3A] focus:outline-none focus:ring-1 focus:ring-[#942E3A]"
              />
            </div>

            <div className="space-y-1 col-span-2">
              <label className="font-bold text-[#942E3A] text-[11px] block truncate">{isRtl ? "عنوان الشحن والمتجر" : <>Dispatch &amp; Store Address</>}</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                placeholder="Samanoud, Gharbia Governorate, Egypt"
                className="w-full rounded-xl border border-[#942E3A]/20 bg-[#FFF9EB]/30 px-2.5 py-1.5 sm:py-2 text-xs text-[#942E3A] focus:outline-none focus:ring-1 focus:ring-[#942E3A]"
              />
            </div>

            <div className="space-y-1 col-span-2">
              <label className="font-bold text-[#942E3A] text-[11px] block truncate">{isRtl ? "ساعات العمل" : "Operating Hours"}</label>
              <input
                type="text"
                value={settings.hours}
                onChange={(e) => setSettings({ ...settings, hours: e.target.value })}
                placeholder="24/7 Available All Day"
                className="w-full rounded-xl border border-[#942E3A]/20 bg-[#FFF9EB]/30 px-2.5 py-1.5 sm:py-2 text-xs text-[#942E3A] focus:outline-none focus:ring-1 focus:ring-[#942E3A]"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ABOUT US SECTION */}
      {activeTab === "about" && (
        <div className="rounded-2xl border border-[#942E3A]/15 bg-white p-3.5 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-[#942E3A]/10 pb-3">
            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
              {isRtl ? "قسم قصتنا" : "ABOUT STORY SECTION"}
            </span>
            <h3 className="font-playfair text-base sm:text-xl font-extrabold text-[#942E3A]">
              {isRtl ? "قسم قصة DeRoma" : "The DeRoma Story Section"}
            </h3>
            <p className="text-[10px] sm:text-xs text-[#6B1F2A]/60">
              {isRtl ? "خصص عنوان القسم والفقرات وصورة القصة." : "Customize section title, paragraphs, and story image."}
            </p>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-[#942E3A] text-[11px]">{isRtl ? "عنوان القسم" : "Section Title"}</label>
              <input
                type="text"
                value={settings.aboutTitle}
                onChange={(e) => setSettings({ ...settings, aboutTitle: e.target.value })}
                placeholder="The DeRoma Story"
                className="w-full rounded-xl border border-[#942E3A]/20 bg-[#FFF9EB]/30 px-2.5 py-1.5 sm:py-2 text-xs text-[#942E3A] focus:outline-none focus:ring-1 focus:ring-[#942E3A]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="font-bold text-[#942E3A] text-[11px]">{isRtl ? "الفقرة الأولى" : "First Paragraph"}</label>
                <textarea
                  rows={3}
                  value={settings.aboutParagraph1}
                  onChange={(e) => setSettings({ ...settings, aboutParagraph1: e.target.value })}
                  placeholder="Founded on the belief that athletic footwear..."
                  className="w-full rounded-xl border border-[#942E3A]/20 bg-[#FFF9EB]/30 px-2.5 py-1.5 sm:py-2 text-xs text-[#942E3A] focus:outline-none focus:ring-1 focus:ring-[#942E3A] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#942E3A] text-[11px]">{isRtl ? "الفقرة الثانية" : "Second Paragraph"}</label>
                <textarea
                  rows={3}
                  value={settings.aboutParagraph2}
                  onChange={(e) => setSettings({ ...settings, aboutParagraph2: e.target.value })}
                  placeholder="Our sneakers feature meticulously selected..."
                  className="w-full rounded-xl border border-[#942E3A]/20 bg-[#FFF9EB]/30 px-2.5 py-1.5 sm:py-2 text-xs text-[#942E3A] focus:outline-none focus:ring-1 focus:ring-[#942E3A] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden resize-none"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="font-bold text-[#942E3A] text-[11px] block">{isRtl ? "صورة القسم" : "Section Image"}</label>
              {settings.aboutImage ? (
                <div className="relative h-32 sm:h-44 w-full max-w-sm rounded-xl overflow-hidden border border-[#942E3A]/20 bg-stone-100 group">
                  <img
                    src={settings.aboutImage}
                    alt={settings.aboutTitle}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    <label className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-lg bg-[#D8B46A] px-3 py-1.5 text-xs font-bold text-[#942E3A] hover:bg-[#c9a45b] transition">
                      {uploadingField === "aboutImage" ? (
                        <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ImagePlus className="h-3.5 w-3.5" />
                      )}
                      <span>{isRtl ? "تغيير" : "Change"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) =>
                          handleFileUpload(
                            e.target.files?.[0] || null,
                            (url) => setSettings({ ...settings, aboutImage: url }),
                            "aboutImage"
                          )
                        }
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, aboutImage: "" })}
                      className="inline-flex items-center justify-center rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition"
                    >
                      {isRtl ? "حذف" : "Remove"}
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex h-24 max-w-sm cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#D8B46A]/60 bg-[#FFF9EB]/40 text-center transition hover:border-[#942E3A] hover:bg-[#FFF9EB]">
                  {uploadingField === "aboutImage" ? (
                    <LoaderCircle className="h-5 w-5 animate-spin text-[#942E3A]" />
                  ) : (
                    <ImagePlus className="h-5 w-5 text-[#D8B46A]" />
                  )}
                  <span className="mt-1 text-xs font-bold text-[#942E3A]">
                    {uploadingField === "aboutImage" ? (isRtl ? "جارٍ الرفع..." : "Uploading...") : (isRtl ? "رفع صورة القسم" : "Upload Section Image")}
                  </span>
                  <span className="text-[9px] text-[#6B1F2A]/50">{isRtl ? "اضغط لاختيار صورة" : "Click to choose image"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) =>
                      handleFileUpload(
                        e.target.files?.[0] || null,
                        (url) => setSettings({ ...settings, aboutImage: url }),
                        "aboutImage"
                      )
                    }
                  />
                </label>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
