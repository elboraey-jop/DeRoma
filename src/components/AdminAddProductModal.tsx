"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Boxes,
  Check,
  FilePlus2,
  PackagePlus,
  X,
} from "lucide-react";
import { createProductBatchAction } from "@/app/admin/products/actions";
import {
  AdminCatalogProductPicker,
  AdminSupplierPicker,
} from "@/components/AdminProcurementPickers";
import { useAdminI18n } from "@/providers/AdminI18nContext";

type ProductVariant = {
  id: string;
  size: string;
  stock: number;
  price: number | null;
  wholesalePrice: number | null;
  label: string;
};
type Product = {
  id: string;
  name: string;
  category: string;
  image: string | null;
  price: number;
  wholesalePrice: number | null;
  supplierId: string | null;
  variants: ProductVariant[];
};
type PriceDraft = { wholesalePrice: string; retailPrice: string };
const SHOE_SIZES = ["36", "37", "38", "39", "40", "41"];
const PERFUME_VOLUMES = ["30 ml", "50 ml", "100 ml"];

export default function AdminAddProductModal({
  products,
  suppliers,
}: {
  products: Product[];
  suppliers: { id: string; name: string }[];
}) {
  const { lang, formatNumber } = useAdminI18n();
  const isRtl = lang === "ar";
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"choice" | "batch">("choice");
  const [productId, setProductId] = useState("");
  const [supplierMode, setSupplierMode] = useState<"same" | "new">("same");
  const [supplierId, setSupplierId] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [batchPrices, setBatchPrices] = useState<Record<string, PriceDraft>>(
    {},
  );
  const [wholesale, setWholesale] = useState("");
  const [retail, setRetail] = useState("");
  const [sameWholesale, setSameWholesale] = useState(false);
  const [sameRetail, setSameRetail] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const selected = products.find((product) => product.id === productId);
  const isShoes = selected?.category === "shoes";
  const isPerfume = selected?.category === "perfumes";
  const options = useMemo(() => {
    if (!selected) return [];
    if (isShoes)
      return SHOE_SIZES.map((size) => ({
        key:
          selected.variants.find((variant) => variant.size === size)?.id ||
          `new-${size}`,
        size,
        variant: selected.variants.find((variant) => variant.size === size),
      }));
    if (isPerfume) {
      return Array.from(
        new Set([
          ...PERFUME_VOLUMES,
          ...selected.variants.map((variant) => variant.size),
        ]),
      ).map((size) => ({
        key:
          selected.variants.find((variant) => variant.size === size)?.id ||
          `new-${size}`,
        size,
        variant: selected.variants.find((variant) => variant.size === size),
      }));
    }
    const variant = selected.variants[0];
    return [{ key: variant?.id || "new-ONE_SIZE", size: "ONE_SIZE", variant }];
  }, [selected, isShoes, isPerfume]);
  const totalQuantity = useMemo(
    () =>
      Object.entries(quantities).reduce(
        (sum, [key, value]) => sum + (enabled[key] ? Number(value) || 0 : 0),
        0,
      ),
    [quantities, enabled],
  );

  useEffect(() => {
    const handler = (event: Event) => {
      const productIdFromEvent = (event as CustomEvent<{ productId?: string }>)
        .detail?.productId;
      setOpen(true);
      setMode(productIdFromEvent ? "batch" : "choice");
      if (productIdFromEvent) setProductId(productIdFromEvent);
    };
    window.addEventListener("open-add-product", handler);
    return () => window.removeEventListener("open-add-product", handler);
  }, []);
  useEffect(() => {
    if (!open) return;
    const oldBodyOverflow = document.body.style.overflow;
    const oldDocumentOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    const keepScrollInsideModal = (event: WheelEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest(".admin-modal-scroll")) {
        event.preventDefault();
      }
    };
    document.addEventListener("wheel", keepScrollInsideModal, {
      capture: true,
      passive: false,
    });
    return () => {
      document.body.style.overflow = oldBodyOverflow;
      document.documentElement.style.overflow = oldDocumentOverflow;
      document.removeEventListener("wheel", keepScrollInsideModal, true);
    };
  }, [open]);
  useEffect(() => {
    if (!selected) return;
    setSupplierId(selected.supplierId || "");
    setSupplierMode(selected.supplierId ? "same" : "new");
    setWholesale(String(selected.wholesalePrice ?? ""));
    setRetail(String(selected.price));
    setQuantities(
      Object.fromEntries(options.map((option) => [option.key, ""])),
    );
    setEnabled(
      Object.fromEntries(
        options.map((option) => [
          option.key,
          !isShoes || Boolean(option.variant),
        ]),
      ),
    );
    setBatchPrices(
      Object.fromEntries(
        options.map((option) => [
          option.key,
          {
            wholesalePrice: String(
              option.variant?.wholesalePrice ?? selected.wholesalePrice ?? "",
            ),
            retailPrice: String(option.variant?.price ?? selected.price),
          },
        ]),
      ),
    );
  }, [productId, selected, isShoes, options]);
  const close = () => {
    if (!submitting) setOpen(false);
  };
  const submit = (_event: FormEvent<HTMLFormElement>) => setSubmitting(true);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#8B7CC7]/45 p-4 backdrop-blur-[2px]"
      dir={isRtl ? "rtl" : "ltr"}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      role="dialog"
      aria-modal="true"
      onWheel={(event) => event.stopPropagation()}
      onTouchMove={(event) => event.stopPropagation()}
    >
      <div
        className={`admin-modal-scroll hide-scrollbar min-h-0 w-full max-w-4xl rounded-3xl border border-[#D8B46A]/35 bg-[#FFFDFC] p-5 shadow-2xl sm:p-7 ${mode === "batch" ? "h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain" : "h-auto overflow-hidden"}`}
        onMouseDown={(event) => event.stopPropagation()}
        onWheel={(event) => event.stopPropagation()}
        onTouchMove={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">
              {isRtl ? "إدخال المخزون" : "Catalog intake"}
            </p>
            <h2 className="mt-1 font-playfair text-2xl font-black text-[#942E3A]">
              {isRtl ? "إضافة مخزون للمنتج" : "Add product stock"}
            </h2>
            <p className="mt-1 text-xs text-[#6B1F2A]/65">
              {isRtl ? "استلام مخزون جديد للمقاسات والأحجام بنفس منطق محرر المنتجات." : "Receive stock using the same size and volume logic as the product editor."}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-full p-2 text-[#942E3A] hover:bg-[#FFF9EB]"
            aria-label={isRtl ? "إغلاق" : "Close"}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {mode === "choice" ? (
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <Link
              href="/admin/products/new?fromInvoice=1"
              onClick={close}
              className={`group rounded-2xl border border-[#942E3A]/12 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#D8B46A] ${isRtl ? "text-right" : "text-left"}`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#942E3A] text-[#D8B46A]">
                <FilePlus2 className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-playfair text-xl font-bold text-[#942E3A]">
                {isRtl ? "منتج جديد" : "New product"}
              </h3>
              <p className="mt-2 text-xs leading-5 text-[#6B1F2A]/65">
                {isRtl ? "إنشاء المنتج بالكامل، الموديلات، التسعير والمخزون." : "Create the complete product, variants, pricing and stock."}
              </p>
            </Link>
            <button
              type="button"
              onClick={() => setMode("batch")}
              className={`group rounded-2xl border border-[#D8B46A]/50 bg-[#fff7df] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#942E3A] ${isRtl ? "text-right" : "text-left"}`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#942E3A]">
                <Boxes className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-playfair text-xl font-bold text-[#942E3A]">
                {isRtl ? "دفعة جديدة" : "New batch"}
              </h3>
              <p className="mt-2 text-xs leading-5 text-[#6B1F2A]/65">
                {isRtl ? "إضافة مخزون لمنتج موجود مسبقاً بالمقاس أو الحجم." : "Add stock to an existing product by size or volume."}
              </p>
            </button>
          </div>
        ) : (
          <form
            action={createProductBatchAction}
            onSubmit={submit}
            className="mt-6 space-y-5"
          >
            <input type="hidden" name="productId" value={productId} />
            <input type="hidden" name="supplierId" value={supplierId} />
            <input type="hidden" name="supplierMode" value={supplierMode} />
            <input
              type="hidden"
              name="quantities"
              value={JSON.stringify(quantities)}
            />
            <input
              type="hidden"
              name="enabledOptions"
              value={JSON.stringify(enabled)}
            />
            <input
              type="hidden"
              name="batchPrices"
              value={JSON.stringify(batchPrices)}
            />
            <input
              type="hidden"
              name="wholesaleSame"
              value={sameWholesale ? "on" : "off"}
            />
            <input
              type="hidden"
              name="retailSame"
              value={sameRetail ? "on" : "off"}
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMode("choice")}
                className="rounded-xl border border-[#942E3A]/15 p-2 text-[#942E3A]"
                aria-label={isRtl ? "رجوع" : "Back"}
              >
                <ArrowLeft className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />
              </button>
              <p className="text-xs text-[#6B1F2A]/65">{isRtl ? "تفاصيل الدفعة" : "Batch details"}</p>
            </div>
            <label>
              <span className="field-label">{isRtl ? "المنتج الحالي *" : "Existing product *"}</span>
              <AdminCatalogProductPicker
                products={products.map((product) => ({
                  id: product.id,
                  name: product.name,
                  category: product.category,
                  image: product.image,
                }))}
                value={productId}
                onChange={setProductId}
              />
            </label>
            {selected && (
              <>
                <div className="rounded-3xl border border-[#D8B46A]/40 bg-gradient-to-br from-[#FFF9EB] to-white p-4 sm:p-5">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="step-kicker">
                        {isShoes
                          ? (isRtl ? "جدول المقاسات" : "Size matrix")
                          : isPerfume
                            ? (isRtl ? "جدول الأحجام" : "Volume matrix")
                            : (isRtl ? "جدول المخزون" : "Stock matrix")}
                      </p>
                      <h3 className="mt-1 font-playfair text-xl font-bold text-[#942E3A]">
                        {isRtl ? "حدد ما تحتويه هذه الدفعة" : "Select what this batch contains"}
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-[#6B1F2A]/55">
                      {formatNumber(totalQuantity)} {isRtl ? "إجمالي القطع" : "total units"}
                    </span>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {options.map((option) => (
                      <div
                        key={option.key}
                        className={`rounded-2xl border p-4 transition ${enabled[option.key] ? "border-[#942E3A]/25 bg-white shadow-sm" : "border-[#942E3A]/8 bg-[#FFF9EB]/55 opacity-70"}`}
                      >
                        <label className="flex cursor-pointer items-center gap-3">
                          <input
                            type="checkbox"
                            checked={Boolean(enabled[option.key])}
                            onChange={() =>
                              setEnabled((current) => ({
                                ...current,
                                [option.key]: !current[option.key],
                              }))
                            }
                            className="sr-only"
                          />
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-lg border ${enabled[option.key] ? "border-[#942E3A] bg-[#942E3A] text-white" : "border-[#D8B46A] text-transparent"}`}
                          >
                            <Check className="h-4 w-4" />
                          </span>
                          <span className="font-bold text-[#942E3A]">
                            {isShoes
                              ? `EU ${option.size}`
                              : !isPerfume
                                ? (isRtl ? "إجمالي المخزون" : "Total stock")
                                : option.size}
                          </span>
                          <span className="ml-auto text-[10px] font-bold uppercase tracking-wide text-[#D8B46A]">
                            {enabled[option.key] ? (isRtl ? "مضمن" : "Included") : (isRtl ? "مستبعد" : "Off")}
                          </span>
                        </label>
                        {enabled[option.key] && (
                          <>
                            <label className="mt-3 block">
                              <span className="field-label">{isRtl ? "الكمية" : "Quantity"}</span>
                              <input
                                type="number"
                                min="0"
                                value={quantities[option.key] || ""}
                                onChange={(event) =>
                                  setQuantities((current) => ({
                                    ...current,
                                    [option.key]: event.target.value,
                                  }))
                                }
                                className="admin-input text-right"
                                placeholder="0"
                              />
                            </label>
                            {isPerfume && (
                              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                <label>
                                  <span className="field-label">{isRtl ? "سعر الجملة" : "Wholesale"}</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={
                                      batchPrices[option.key]?.wholesalePrice ||
                                      ""
                                    }
                                    onChange={(event) =>
                                      setBatchPrices((current) => ({
                                        ...current,
                                        [option.key]: {
                                          ...(current[option.key] || {
                                            wholesalePrice: "",
                                            retailPrice: "",
                                          }),
                                          wholesalePrice: event.target.value,
                                        },
                                      }))
                                    }
                                    className="admin-input text-right"
                                  />
                                </label>
                                <label>
                                  <span className="field-label">{isRtl ? "سعر البيع" : "Selling"}</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={
                                      batchPrices[option.key]?.retailPrice || ""
                                    }
                                    onChange={(event) =>
                                      setBatchPrices((current) => ({
                                        ...current,
                                        [option.key]: {
                                          ...(current[option.key] || {
                                            wholesalePrice: "",
                                            retailPrice: "",
                                          }),
                                          retailPrice: event.target.value,
                                        },
                                      }))
                                    }
                                    className="admin-input text-right"
                                  />
                                </label>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="field-label">{isRtl ? "المورد *" : "Supplier *"}</span>
                  <AdminSupplierPicker
                    suppliers={suppliers}
                    value={supplierId}
                    onChange={(value) => {
                      setSupplierId(value);
                      setSupplierMode("same");
                    }}
                    onAddNew={() => setSupplierMode("new")}
                  />
                  {supplierMode === "new" && (
                    <input
                      name="supplierName"
                      required
                      placeholder={isRtl ? "اسم المورد الجديد" : "New supplier name"}
                      value={supplierName}
                      onChange={(event) => setSupplierName(event.target.value)}
                      className="admin-input mt-3"
                    />
                  )}
                </div>
                {!isPerfume && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <PriceField
                      label={isRtl ? "سعر الشراء / للقطعة" : "Wholesale price / unit"}
                      isWholesale
                      value={wholesale}
                      onChange={setWholesale}
                      same={sameWholesale}
                      onSameChange={setSameWholesale}
                      disabled={!wholesale}
                      isRtl={isRtl}
                    />
                    <PriceField
                      label={isRtl ? "سعر البيع / للقطعة" : "Selling price / unit"}
                      isWholesale={false}
                      value={retail}
                      onChange={setRetail}
                      same={sameRetail}
                      onSameChange={setSameRetail}
                      isRtl={isRtl}
                    />
                  </div>
                )}
              </>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={close}
                className="rounded-xl border border-[#942E3A]/15 bg-white px-4 py-3 text-xs font-bold text-[#942E3A]"
              >
                {isRtl ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="submit"
                disabled={
                  !selected ||
                  totalQuantity < 1 ||
                  (supplierMode === "new"
                    ? !supplierName.trim()
                    : !supplierId) ||
                  submitting
                }
                className="inline-flex items-center gap-2 rounded-xl bg-[#942E3A] px-5 py-3 text-xs font-bold text-[#FFF9EB] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <PackagePlus className="h-4 w-4" />
                {submitting ? (isRtl ? "جاري الحفظ..." : "Saving…") : (isRtl ? "استلام الدفعة" : "Receive batch")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function PriceField({
  label,
  isWholesale,
  value,
  onChange,
  same,
  onSameChange,
  disabled = false,
  isRtl = false,
}: {
  label: string;
  isWholesale: boolean;
  value: string;
  onChange: (value: string) => void;
  same: boolean;
  onSameChange: (value: boolean) => void;
  disabled?: boolean;
  isRtl?: boolean;
}) {
  const inputName = isWholesale ? "wholesalePrice" : "retailPrice";
  return (
    <label className="block">
      <span className="flex items-center justify-between gap-2">
        <span className="field-label">{label} *</span>
        <button
          type="button"
          role="switch"
          aria-checked={same}
          onClick={() => onSameChange(!same)}
          disabled={disabled}
          className={`inline-flex items-center gap-1.5 text-[10px] font-bold ${disabled ? "cursor-not-allowed opacity-40" : "text-[#942E3A]"}`}
        >
          <span
            className={`relative h-5 w-9 rounded-full transition ${same ? "bg-[#942E3A]" : "bg-[#D8B46A]/50"}`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${same ? (isRtl ? "right-[18px]" : "left-[18px]") : (isRtl ? "right-0.5" : "left-0.5")}`}
            />
          </span>
          {same ? (isRtl ? "نفس السعر السابق" : "Same as previous") : (isRtl ? "سعر جديد" : "New price")}
        </button>
      </span>
      <input
        name={inputName}
        required
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={same || disabled}
        className="admin-input mt-2 text-right disabled:cursor-not-allowed disabled:bg-[#FFF9EB] disabled:text-[#6B1F2A]/55"
      />
    </label>
  );
}
