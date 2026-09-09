"use client";

import { Percent, Tag, X } from "lucide-react";
import { useMemo, useState } from "react";
import { updateProductDiscountAction } from "@/app/admin/products/actions";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/lib/toast";

export default function AdminProductDiscountModal({
  productId,
  productName,
  price,
  compareAtPrice,
  compact = false,
  isRtl = false,
}: {
  productId: string;
  productName: string;
  price: number;
  compareAtPrice: number | null;
  compact?: boolean;
  isRtl?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");

  const hasDiscount = Boolean(compareAtPrice && Number(compareAtPrice) > Number(price));
  const originalPrice = hasDiscount ? Number(compareAtPrice) : Number(price);
  const currentSellingPrice = Number(price);
  const existingFixedDiscount = hasDiscount ? Math.round((originalPrice - currentSellingPrice) * 100) / 100 : 0;
  const existingPctDiscount = hasDiscount && originalPrice > 0 ? Math.round(((originalPrice - currentSellingPrice) / originalPrice) * 100 * 100) / 100 : 0;

  const [discountValue, setDiscountValue] = useState(
    hasDiscount ? String(existingPctDiscount) : ""
  );

  const basePrice = originalPrice;
  const numericDiscount = Number(discountValue) || 0;

  const previewPrice = useMemo(() => {
    if (numericDiscount <= 0) {
      return hasDiscount ? currentSellingPrice : basePrice;
    }
    const nextPrice =
      discountType === "fixed"
        ? basePrice - numericDiscount
        : basePrice * (1 - numericDiscount / 100);
    return Math.max(0, Math.round(nextPrice * 100) / 100);
  }, [basePrice, discountType, numericDiscount, hasDiscount, currentSellingPrice]);

  const handleOpen = () => {
    if (hasDiscount) {
      setDiscountType("percentage");
      setDiscountValue(String(existingPctDiscount));
    } else {
      setDiscountType("percentage");
      setDiscountValue("");
    }
    setIsOpen(true);
  };

  const handleTypeChange = (newType: "percentage" | "fixed") => {
    if (newType === discountType) return;
    setDiscountType(newType);
    const num = Number(discountValue);
    if (!num || num <= 0 || basePrice <= 0) {
      setDiscountValue("");
      return;
    }
    if (newType === "fixed") {
      const fixedAmount = Math.round((basePrice * (num / 100)) * 100) / 100;
      setDiscountValue(fixedAmount > 0 ? String(fixedAmount) : "");
    } else {
      const pct = Math.round(((num / basePrice) * 100) * 100) / 100;
      setDiscountValue(pct > 0 && pct < 100 ? String(pct) : "");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={`inline-flex items-center font-bold hover:underline ${compact ? "gap-1 text-[10px]" : "gap-1.5"} ${
          hasDiscount ? "text-emerald-700" : "text-[#942E3A]"
        }`}
      >
        <Tag className={compact ? "h-3 w-3 text-[#D8B46A]" : "h-3.5 w-3.5 text-[#D8B46A]"} />
        {isRtl
          ? (hasDiscount ? `خصم %${Math.round(existingPctDiscount)}-` : "خصم")
          : (hasDiscount ? `${Math.round(existingPctDiscount)}% off` : "Discount")}
      </button>
      {isOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-[#8B7CC7]/30 p-4 backdrop-blur-[2px]"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`discount-title-${productId}`}
            className="w-full max-w-md rounded-3xl border border-[#D8B46A]/35 bg-[#FFF9EB] p-5 shadow-[0_24px_80px_rgba(67,25,31,0.28)] sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
                  {isRtl ? "خصم المنتج" : "Product discount"}
                </p>
                <h2 id={`discount-title-${productId}`} className="mt-1 font-playfair text-xl font-black text-[#942E3A]">
                  {isRtl ? (hasDiscount ? "تعديل خصم المنتج" : "إضافة خصم") : (hasDiscount ? "Edit discount" : "Add discount")}
                </h2>
                <p className="mt-1 max-w-xs truncate text-xs text-[#6B1F2A]/65" title={productName}>
                  {productName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close discount dialog"
                className="rounded-full p-2 text-[#942E3A]/60 hover:bg-[#F2DFC0] hover:text-[#942E3A]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5 rounded-2xl bg-white p-4 space-y-2">
              {hasDiscount ? (
                <>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6B1F2A]/60">{isRtl ? "السعر الأصلي (قبل الخصم)" : "Original price (before discount)"}</span>
                    <span className="font-bold text-[#6B1F2A] line-through">{formatCurrency(basePrice)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6B1F2A]/60">{isRtl ? "سعر البيع الحالي" : "Current selling price"}</span>
                    <span className="font-bold text-[#942E3A] flex items-center gap-1.5">
                      {formatCurrency(currentSellingPrice)}
                      <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md">
                        {existingPctDiscount}%-
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-[#942E3A]/10">
                    <span className="text-[#6B1F2A] font-bold">{isRtl ? "السعر الجديد بعد التعديل" : "New price after update"}</span>
                    <span className="font-playfair text-lg font-black text-[#942E3A]">{formatCurrency(previewPrice)}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6B1F2A]/60">{isRtl ? "السعر الحالي" : "Current price"}</span>
                    <span className="font-bold text-[#942E3A]">{formatCurrency(basePrice)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs pt-1.5 border-t border-[#942E3A]/10">
                    <span className="text-[#6B1F2A] font-bold">{isRtl ? "السعر الجديد" : "New price"}</span>
                    <span className="font-playfair text-lg font-black text-[#942E3A]">{formatCurrency(previewPrice)}</span>
                  </div>
                </>
              )}
            </div>
            <form
              id={`remove-discount-${productId}`}
              action={updateProductDiscountAction}
              onSubmit={() => {
                setIsOpen(false);
                toast.success(isRtl ? "تمت إزالة الخصم بنجاح!" : "Discount removed successfully!");
              }}
            >
              <input type="hidden" name="productId" value={productId} />
              <input type="hidden" name="action" value="remove" />
            </form>
            <form
              action={updateProductDiscountAction}
              onSubmit={() => {
                setIsOpen(false);
                toast.success(isRtl ? "تم تطبيق الخصم بنجاح!" : "Discount applied successfully!");
              }}
              className="mt-5 space-y-4"
            >
              <input type="hidden" name="productId" value={productId} />
              <div>
                <span className="field-label">{isRtl ? "نوع الخصم" : "Discount type"}</span>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <label className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition ${discountType === "percentage" ? "border-[#942E3A] bg-[#942E3A] text-[#FFF9EB]" : "border-[#942E3A]/10 bg-white text-[#942E3A] hover:bg-[#FFF9EB]"}`}>
                    <input type="radio" name="discountType" value="percentage" checked={discountType === "percentage"} onChange={() => handleTypeChange("percentage")} className="sr-only" />
                    <Percent className="h-3.5 w-3.5 text-[#D8B46A]" /> {isRtl ? "نسبة مئوية" : "Percentage"}
                  </label>
                  <label className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition ${discountType === "fixed" ? "border-[#942E3A] bg-[#942E3A] text-[#FFF9EB]" : "border-[#942E3A]/10 bg-white text-[#942E3A] hover:bg-[#FFF9EB]"}`}>
                    <input type="radio" name="discountType" value="fixed" checked={discountType === "fixed"} onChange={() => handleTypeChange("fixed")} className="sr-only" />
                    {isRtl ? "مبلغ ثابت EGP" : "EGP Fixed amount"}
                  </label>
                </div>
              </div>
              <label>
                <span className="field-label">{discountType === "fixed" ? (isRtl ? "مبلغ الخصم (EGP)" : "Discount amount (EGP)") : (isRtl ? "النسبة المئوية (%)" : "Percentage (%)")}</span>
                <input
                  required
                  min="0.01"
                  max={discountType === "percentage" ? "99.99" : (basePrice - 0.01)}
                  step="0.01"
                  type="number"
                  name="discountValue"
                  value={discountValue}
                  onChange={(event) => setDiscountValue(event.target.value)}
                  placeholder={discountType === "fixed" ? (hasDiscount ? String(existingFixedDiscount) : "100") : (hasDiscount ? String(existingPctDiscount) : "20")}
                  className="admin-input mt-1"
                />
              </label>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                {hasDiscount && (
                  <button
                    type="submit"
                    form={`remove-discount-${productId}`}
                    className="rounded-xl border border-red-200 px-4 py-2.5 text-xs font-bold text-red-700 hover:bg-red-50 cursor-pointer transition"
                  >
                    {isRtl ? "إزالة الخصم" : "Remove discount"}
                  </button>
                )}
                <button type="submit" name="action" value="apply" className="rounded-xl bg-[#942E3A] px-5 py-2.5 text-xs font-bold text-[#FFF9EB] sm:ml-auto hover:bg-[#7A242F] cursor-pointer transition">
                  {isRtl ? (hasDiscount ? "تحديث الخصم" : "تطبيق الخصم") : (hasDiscount ? "Update discount" : "Apply discount")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
