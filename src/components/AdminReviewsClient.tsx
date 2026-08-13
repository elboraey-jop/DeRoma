"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, CheckCircle2, ChevronDown, Home, MessageSquareQuote, Pencil, Plus, Search, Star, Trash2, X } from "lucide-react";
import { createReviewAction, deleteReviewAction, updateReviewAction, updateReviewStatusAction, toggleShowOnHomeAction } from "@/app/admin/reviews/actions";
import { useAdminI18n } from "@/providers/AdminI18nContext";

type Product = { id: string; name: string; images: string[]; category: string };
type Review = { id: string; productId: string; customerName: string; customerPhone: string | null; rating: number; title: string | null; body: string; status: string; verifiedPurchase: boolean; showOnHome?: boolean; createdAt: string; updatedAt: string; product: Product };

const statusStyles: Record<string, string> = { approved: "bg-[#e7f4ec] text-[#27663d]", pending: "bg-[#fff3d8] text-[#9a6a18]", rejected: "bg-[#fae9e8] text-[#a33b43]" };

function Stars({ rating, large = false }: { rating: number; large?: boolean }) {
  return <span className={`inline-flex items-center gap-0.5 ${large ? "text-base" : "text-xs"}`} aria-label={`${rating} out of 5 stars`}>{[1, 2, 3, 4, 5].map((star) => <Star key={star} className={star <= rating ? "fill-[#D8B46A] text-[#D8B46A]" : "text-[#d9c8b8]"} />)}</span>;
}

function RatingPicker({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Rating"><input type="hidden" name="rating" value={value} />{[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" role="radio" aria-checked={value === star} aria-label={`${star} out of 5 stars`} onClick={() => onChange(star)} className="rounded-lg p-1 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#D8B46A]/50"><Star className={`h-7 w-7 transition ${star <= value ? "fill-[#D8B46A] text-[#D8B46A]" : "text-[#d9c8b8] hover:text-[#D8B46A]/70"}`} /></button>)}</div>;
}

function StatusPicker({ value }: { value: string }) {
  const { lang } = useAdminI18n();
  const [status, setStatus] = useState(value);
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const isRtl = lang === "ar";

  useEffect(() => {
    if (!open) return;
    const closeOnOutside = (event: PointerEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutside);
    return () => document.removeEventListener("pointerdown", closeOnOutside);
  }, [open]);

  const options = [
    { value: "approved", label: isRtl ? "منشورة" : "Published" },
    { value: "pending", label: isRtl ? "بانتظار الموافقة" : "Pending" },
    { value: "rejected", label: isRtl ? "مرفوضة" : "Rejected" },
  ];
  const current = options.find((option) => option.value === status) || options[0];

  return (
    <div ref={pickerRef} className="relative">
      <input type="hidden" name="status" value={status} />
      <button
        type="button"
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        className="inline-flex min-w-[92px] items-center justify-between gap-2 rounded-xl border border-[#942E3A]/10 bg-white px-2.5 py-2 text-[10px] font-bold text-[#942E3A] shadow-xs transition hover:border-[#D8B46A]"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{current.label}</span>
        <ChevronDown className={`h-3 w-3 text-[#D8B46A] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          className={`absolute bottom-[calc(100%+6px)] z-50 min-w-[130px] overflow-hidden rounded-xl border border-[#D8B46A]/45 bg-[#fffdf8] p-1 shadow-[0_14px_30px_rgba(67,25,31,0.2)] ${
            isRtl ? "right-0 text-right" : "left-0 text-left"
          }`}
          role="listbox"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={status === option.value}
              onClick={(event) => {
                const form = event.currentTarget.form;
                setStatus(option.value);
                setOpen(false);
                window.setTimeout(() => form?.requestSubmit(), 0);
              }}
              className={`block w-full rounded-lg px-3 py-2 text-[10px] font-bold transition ${
                status === option.value ? "bg-[#942E3A] text-[#fff9eb]" : "text-[#942E3A] hover:bg-[#fff1d4]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewForm({ review, products, onClose }: { review?: Review; products: Product[]; onClose: () => void }) {
  const { lang, t } = useAdminI18n();
  const action = review ? updateReviewAction : createReviewAction;
  const [selectedProductId, setSelectedProductId] = useState(review?.productId || "");
  const [productMenuOpen, setProductMenuOpen] = useState(false);
  const productMenuRef = useRef<HTMLDivElement>(null);
  const [rating, setRating] = useState(review?.rating || 5);
  const [productSearch, setProductSearch] = useState("");
  const [productCategory, setProductCategory] = useState("all");
  const isRtl = lang === "ar";

  const selectedProduct = products.find((product) => product.id === selectedProductId);
  const productCategories = ["all", ...Array.from(new Set(products.map((product) => product.category))).sort()];
  const visibleProducts = products.filter((product) =>
    (productCategory === "all" || product.category === productCategory) &&
    product.name.toLowerCase().includes(productSearch.toLowerCase()),
  );

  useEffect(() => {
    if (!productMenuOpen) return;
    const closeOnOutside = (event: PointerEvent) => {
      if (!productMenuRef.current?.contains(event.target as Node)) setProductMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutside);
    return () => document.removeEventListener("pointerdown", closeOnOutside);
  }, [productMenuOpen]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2c1018]/45 p-4 backdrop-blur-xs" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-[#fffdf8] p-5 shadow-2xl sm:p-7 text-right">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#D8B46A]">
              {isRtl ? "صوت ومراجعات العملاء" : "Customer voice"}
            </p>
            <h2 className="mt-1 font-playfair text-2xl font-black text-[#942E3A]">
              {review ? (isRtl ? "تعديل المراجعة" : "Edit review") : (isRtl ? "إضافة تقييم جديد" : "Add a review")}
            </h2>
            <p className="mt-1 text-xs text-[#6B1F2A]/60">
              {isRtl ? "تسجيل مراجعة العميل وتحديد المنتجات ومكان النشر." : "Capture the customer story and choose where it appears."}
            </p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-[#942E3A]/60 hover:bg-[#942E3A]/8" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form action={action} className="mt-6 space-y-4" onSubmit={onClose}>
          {review && <input type="hidden" name="id" value={review.id} />}

          <div>
            <label className="field-label">{t("reviews.product")}</label>
            <input type="hidden" name="productId" value={selectedProductId} required />
            <div ref={productMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setProductMenuOpen((open) => !open)}
                className={`field-input flex items-center justify-between ${isRtl ? "text-right" : "text-left"}`}
              >
                <span className={selectedProduct ? "text-[#6B1F2A]" : "text-[#6B1F2A]/55"}>
                  {selectedProduct?.name || (isRtl ? "اختر المنتج" : "Choose a product")}
                </span>
                <ChevronDown className={`h-4 w-4 text-[#942E3A]/50 transition-transform ${productMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {productMenuOpen && (
                <div
                  className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-2xl border border-[#942E3A]/12 bg-[#fffdf8] shadow-xl"
                  onWheel={(event) => event.stopPropagation()}
                >
                  <div className="border-b border-[#942E3A]/10 bg-[#fffaf0] p-2.5">
                    <div className="relative">
                      <Search className={`absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#942E3A]/40 ${isRtl ? "right-3" : "left-3"}`} />
                      <input
                        autoFocus
                        value={productSearch}
                        onChange={(event) => setProductSearch(event.target.value)}
                        placeholder={t("common.search")}
                        className={`h-9 w-full rounded-xl border border-[#942E3A]/10 bg-white text-xs text-[#6B1F2A] outline-none focus:border-[#D8B46A] ${isRtl ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left"}`}
                        onClick={(event) => event.stopPropagation()}
                      />
                    </div>
                  </div>

                  <div className="max-h-52 overflow-y-auto overscroll-contain p-1.5">
                    {visibleProducts.map((product) => (
                      <button
                        type="button"
                        key={product.id}
                        onClick={() => {
                          setSelectedProductId(product.id);
                          setProductMenuOpen(false);
                        }}
                        className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-right transition hover:bg-[#fff1d4] ${selectedProductId === product.id ? "bg-[#fff1d4]" : ""}`}
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f7e9d8] text-xs font-bold text-[#942E3A]">
                          {product.images[0] ? <img src={product.images[0]} alt="" className="h-full w-full object-cover" /> : product.name.charAt(0)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-bold text-[#942E3A]">{product.name}</span>
                        </span>
                        {selectedProductId === product.id && <Check className="h-4 w-4 shrink-0 text-[#942E3A]" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="field-label">{t("reviews.customer")}</label>
            <input
              name="customerName"
              required
              defaultValue={review?.customerName}
              placeholder={isRtl ? "اسم العميل" : "e.g. Nour Mohamed"}
              className={`field-input ${isRtl ? "text-right" : "text-left"}`}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">{t("reviews.rating")}</label>
              <RatingPicker value={rating} onChange={setRating} />
            </div>
            <input type="hidden" name="status" value={review?.status || "approved"} />
          </div>

          <div>
            <label className="field-label">{t("reviews.reviewText")}</label>
            <textarea
              name="body"
              required
              defaultValue={review?.body}
              placeholder={isRtl ? "اكتب تعليق أو تجربة العميل..." : "Write the customer's experience..."}
              rows={4}
              className={`field-input resize-none ${isRtl ? "text-right" : "text-left"}`}
            />
          </div>

          <div className="flex flex-wrap gap-5 pt-1">
            <label className="group flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-[#6B1F2A]/75">
              <input type="checkbox" name="verifiedPurchase" defaultChecked={review?.verifiedPurchase} className="review-checkbox sr-only" />
              <span className="review-checkbox-box flex h-5 w-5 items-center justify-center rounded-md border border-[#942E3A]/20 bg-white transition group-hover:border-[#D8B46A]">
                <Check className="review-checkbox-icon h-3.5 w-3.5 text-[#fff9eb]" />
              </span>
              <span>{isRtl ? "شراء مؤكد" : "Verified purchase"}</span>
            </label>

            <label className="group flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-[#942E3A]">
              <input type="checkbox" name="showOnHome" defaultChecked={review?.showOnHome} className="review-checkbox sr-only" />
              <span className="review-checkbox-box flex h-5 w-5 items-center justify-center rounded-md border border-[#942E3A]/30 bg-white transition group-hover:border-[#D8B46A]">
                <Check className="review-checkbox-icon h-3.5 w-3.5 text-[#fff9eb]" />
              </span>
              <span>{isRtl ? "عرض في الصفحة الرئيسية" : "Show on Home Page"}</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 border-t border-[#942E3A]/10 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-xs font-bold text-[#942E3A]/70 hover:bg-[#942E3A]/6"
            >
              {t("common.cancel")}
            </button>
            <button className="rounded-xl bg-[#942E3A] px-5 py-2.5 text-xs font-bold text-[#fff9eb] shadow-xs hover:bg-[#7e2531]">
              {review ? t("common.save") : (isRtl ? "إضافة التقييم" : "Add review")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminReviewsClient({ reviews, products }: { reviews: Review[]; products: Product[] }) {
  const { lang, t, formatNumber } = useAdminI18n();
  const isRtl = lang === "ar";
  const [filter, setFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState<"all" | "home">("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Review | undefined>();
  const [adding, setAdding] = useState(false);

  const filtered = useMemo(() => reviews.filter((review) => {
    const matchesScope = scopeFilter === "all" || review.showOnHome === true;
    const matchesStatus = filter === "all" || review.status === filter;
    const matchesQuery = `${review.customerName} ${review.product.name} ${review.body}`.toLowerCase().includes(query.toLowerCase());
    return matchesScope && matchesStatus && matchesQuery;
  }), [reviews, scopeFilter, filter, query]);

  const approved = reviews.filter((review) => review.status === "approved");
  const average = reviews.length ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : "0.0";
  const pending = reviews.filter((review) => review.status === "pending").length;
  const homeCount = reviews.filter((review) => review.showOnHome).length;

  return (
    <div className="space-y-4 sm:space-y-7">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.28em] text-[#D8B46A]">
            {isRtl ? "صوت وآراء العملاء" : "Customer voice · reviews"}
          </p>
          <h1 className="mt-0.5 sm:mt-1 font-playfair text-2xl sm:text-4xl font-black tracking-tight text-[#942E3A]">
            {t("reviews.title")}
          </h1>
          <p className="mt-1 hidden sm:block max-w-xl text-xs sm:text-sm text-[#6B1F2A]/60">
            {t("reviews.subtitle")}
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#942E3A] px-3 py-2 text-[11px] font-bold text-[#fff9eb] shadow-xs hover:bg-[#7e2531] shrink-0 sm:px-4 sm:py-3 sm:text-xs"
        >
          <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>{isRtl ? "إضافة تقييم" : "Add review"}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
        <div className="stat-card p-3 sm:p-4 rounded-xl sm:rounded-2xl">
          <span className="stat-icon bg-[#fff1d4] text-[#bc812b]"><MessageSquareQuote className="h-4 w-4" /></span>
          <div>
            <p className="stat-label text-[9px] sm:text-[10px]">{t("common.total")}</p>
            <p className="stat-value text-xl sm:text-2xl">{formatNumber(reviews.length)}</p>
          </div>
        </div>
        <div className="stat-card p-3 sm:p-4 rounded-xl sm:rounded-2xl">
          <span className="stat-icon bg-[#fbe8e8] text-[#942E3A]"><Star className="h-4 w-4 fill-current" /></span>
          <div>
            <p className="stat-label text-[9px] sm:text-[10px]">{t("reviews.rating")}</p>
            <p className="stat-value text-xl sm:text-2xl">{formatNumber(average)}<span className="ml-1 text-xs font-normal text-[#942E3A]/45">/ 5</span></p>
          </div>
        </div>
        <div className="stat-card p-3 sm:p-4 rounded-xl sm:rounded-2xl">
          <span className="stat-icon bg-[#e7f4ec] text-[#27663d]"><CheckCircle2 className="h-4 w-4" /></span>
          <div>
            <p className="stat-label text-[9px] sm:text-[10px]">{isRtl ? "منشورة بالمتجر" : "Published"}</p>
            <p className="stat-value text-xl sm:text-2xl">{formatNumber(approved.length)}</p>
          </div>
        </div>
        <div className="stat-card p-3 sm:p-4 rounded-xl sm:rounded-2xl">
          <span className="stat-icon bg-[#fff3d8] text-[#9a6a18]"><MessageSquareQuote className="h-4 w-4" /></span>
          <div>
            <p className="stat-label text-[9px] sm:text-[10px]">{t("reviews.pendingApproval")}</p>
            <p className="stat-value text-xl sm:text-2xl">{formatNumber(pending)}</p>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-[#942E3A]/10 bg-white/80 p-4 shadow-xs sm:rounded-[28px] sm:p-6">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquareQuote className="h-4 w-4 sm:h-5 sm:w-5 text-[#D8B46A]" />
              <h2 className="font-playfair text-lg sm:text-2xl font-bold text-[#942E3A]">
                {isRtl ? "صندوق مراجعة التقييمات" : "Review inbox"}
              </h2>
            </div>
            <p className="mt-0.5 text-[11px] text-[#6B1F2A]/55 sm:mt-1 sm:text-xs">
              {formatNumber(filtered.length)} {isRtl ? "تقييم مسجل" : "reviews in your workspace"}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center flex-wrap">
            <div className="flex rounded-xl border border-[#942E3A]/12 bg-[#fffdf8] p-0.5">
              <button
                type="button"
                onClick={() => setScopeFilter("all")}
                className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition ${
                  scopeFilter === "all" ? "bg-[#942E3A] text-[#fff9eb]" : "text-[#942E3A]/60 hover:text-[#942E3A]"
                }`}
              >
                {t("common.all")}
              </button>
              <button
                type="button"
                onClick={() => setScopeFilter("home")}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition ${
                  scopeFilter === "home" ? "bg-[#942E3A] text-[#fff9eb]" : "text-[#942E3A]/60 hover:text-[#942E3A]"
                }`}
              >
                <Home className="h-3 w-3" />
                <span>{isRtl ? "الرئيسية" : "Home"} ({formatNumber(homeCount)})</span>
              </button>
            </div>

            <div className="relative flex-1 sm:flex-none">
              <Search className={`absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#942E3A]/40 ${isRtl ? "right-3" : "left-3"}`} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("common.search")}
                className={`h-8 w-full rounded-xl border border-[#942E3A]/12 bg-[#fffdf8] text-xs outline-none focus:border-[#D8B46A] sm:h-9 sm:w-48 ${isRtl ? "pr-8 pl-3 text-right" : "pl-8 pr-3 text-left"}`}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 grid min-w-0 gap-3 xl:grid-cols-2 sm:mt-6">
          {filtered.map((review) => (
            <article key={review.id} className="group relative w-full min-w-0 max-w-full rounded-2xl border border-[#942E3A]/10 bg-[#fffdf8] p-3.5 transition hover:border-[#D8B46A]/70 shadow-xs sm:p-5 [&:has([aria-expanded='true'])]:z-30">
              <div className="flex gap-2.5 sm:gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#942E3A] font-playfair text-base font-bold text-[#fff9eb] sm:h-10 sm:w-10 sm:text-lg">
                  {review.customerName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <h3 className="font-playfair text-sm font-bold text-[#942E3A] sm:text-base truncate">{review.customerName}</h3>
                    <span className="text-[#D8B46A]">·</span>
                    <Stars rating={review.rating} />
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] text-[#6B1F2A]/55 sm:mt-1 sm:gap-2">
                    <span className="truncate font-semibold text-[#942E3A]/75">{review.product.name}</span>
                    <span>·</span>
                    <span>{new Date(review.createdAt).toLocaleDateString(isRtl ? "ar-EG" : "en-US", { month: "short", day: "numeric" })}</span>
                    {review.verifiedPurchase && <span className="inline-flex items-center gap-0.5 font-bold text-[#27663d]"><Check className="h-3 w-3" /> {isRtl ? "مؤكد" : "Verified"}</span>}
                  </div>
                </div>
                <span className={`h-fit rounded-full px-2 py-0.5 text-[9px] font-bold capitalize shrink-0 sm:px-2.5 sm:py-1 ${statusStyles[review.status] || statusStyles.pending}`}>
                  {review.status === "approved" ? (isRtl ? "منشورة" : "Published") : review.status}
                </span>
              </div>
              <p className="mt-2.5 text-xs leading-5 text-[#6B1F2A]/75 sm:mt-3 sm:leading-6 break-words">{review.body}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#942E3A]/8 pt-2.5 sm:mt-4 sm:pt-3 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0">
                  <form action={updateReviewStatusAction} className="flex items-center gap-2 shrink-0">
                    <input type="hidden" name="id" value={review.id} />
                    <StatusPicker value={review.status} />
                  </form>
                  <form action={toggleShowOnHomeAction} className="flex items-center shrink-0">
                    <input type="hidden" name="id" value={review.id} />
                    <input type="hidden" name="showOnHome" value={String(!review.showOnHome)} />
                    <button type="submit" className={`inline-flex items-center gap-1 rounded-xl border px-2 py-1.5 text-[10px] font-bold transition sm:px-2.5 ${review.showOnHome ? "border-[#942E3A] bg-[#942E3A] text-white shadow-xs" : "border-[#942E3A]/20 bg-white text-[#942E3A]/70 hover:border-[#942E3A]"}`} title="Toggle show on Home Page">
                      <Home className="h-3 w-3" />
                      <span>{isRtl ? "الرئيسية" : "Home"}</span>
                      <span className={`h-2 w-2 rounded-full ${review.showOnHome ? "bg-[#D8B46A]" : "bg-stone-300"}`} />
                    </button>
                  </form>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setEditing(review)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-bold text-[#942E3A]/70 hover:bg-[#942E3A]/8 hover:text-[#942E3A]"><Pencil className="h-3 w-3" /> {t("common.edit")}</button>
                  <form action={deleteReviewAction}>
                    <input type="hidden" name="id" value={review.id} />
                    <button className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-bold text-[#a33b43]/70 hover:bg-[#fae9e8] hover:text-[#a33b43]" onClick={(event) => { if (!window.confirm(isRtl ? "هل أنت تأكد من حذف هذا التقييم نهائياً؟" : "Delete this review permanently?")) event.preventDefault(); }}><Trash2 className="h-3 w-3" /> {t("common.delete")}</button>
                  </form>
                </div>
              </div>
            </article>
          ))}
          {filtered.length === 0 && <div className="col-span-full rounded-2xl border border-dashed border-[#942E3A]/15 py-12 text-center sm:py-16"><MessageSquareQuote className="mx-auto h-8 w-8 text-[#D8B46A]" /><p className="mt-3 font-playfair text-lg font-bold text-[#942E3A]">{t("common.noResults")}</p></div>}
        </div>
      </section>
      {(adding || editing) && <ReviewForm review={editing} products={products} onClose={() => { setAdding(false); setEditing(undefined); }} />}
    </div>
  );
}
