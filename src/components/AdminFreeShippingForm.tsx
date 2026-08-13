"use client";

import { useActionState, useState } from "react";
import { Gift, CheckCircle2, AlertCircle, Save, Loader2, Sparkles, Sliders, Check, Ban } from "lucide-react";
import { updateFreeShippingSettingsAction } from "@/app/admin/shipping/actions";
import { SerializedShippingSettings } from "@/components/AdminShippingClient";
import { useAdminI18n } from "@/providers/AdminI18nContext";
import { cn } from "@/lib/utils";

interface AdminFreeShippingFormProps {
  settings: SerializedShippingSettings;
}

export default function AdminFreeShippingForm({ settings }: AdminFreeShippingFormProps) {
  const { lang, formatPrice } = useAdminI18n();
  const isRtl = lang === "ar";

  const [enabled, setEnabled] = useState<boolean>(
    Boolean(settings?.freeShippingEnabled)
  );
  const [threshold, setThreshold] = useState<string>(
    settings?.freeShippingThreshold !== null && settings?.freeShippingThreshold !== undefined
      ? String(settings.freeShippingThreshold)
      : "1000"
  );

  const [state, formAction, isPending] = useActionState(
    updateFreeShippingSettingsAction,
    null
  );

  const numThreshold = Number(threshold) || 0;
  const presets = [1000, 2000, 3000, 5000];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Dynamic Status & Summary Header Card */}
      <div className="rounded-3xl border border-[#D8B46A]/40 bg-gradient-to-br from-[#FFFBF2] via-[#FFF9EB] to-[#FFF4D9] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#D8B46A]/30">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#942E3A] text-white shadow-sm shadow-[#942E3A]/20">
              <Gift className="h-6 w-6 text-[#D8B46A]" />
            </div>
            <div>
              <h2 className="font-playfair text-xl sm:text-2xl font-black text-[#942E3A]">
                {isRtl ? "إعدادات الشحن المجاني التلقائي" : "Automatic Free Shipping Rules"}
              </h2>
              <p className="text-xs text-[#6B1F2A]/70 mt-0.5">
                {isRtl
                  ? "تحديد الحد الأدنى لقيمة الطلب للحصول على توصيل مجاني تلقائياً في المتجر"
                  : "Set a minimum order value to grant zero delivery fee automatically"}
              </p>
            </div>
          </div>

          {/* Active / Inactive Badge */}
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-black shadow-xs self-start sm:self-auto",
              enabled
                ? "bg-emerald-100/90 text-emerald-800 border border-emerald-300/70"
                : "bg-stone-200/90 text-stone-700 border border-stone-300/70"
            )}
          >
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-full",
                enabled ? "bg-emerald-500 animate-pulse" : "bg-stone-400"
              )}
            />
            <span>
              {enabled
                ? isRtl
                  ? "مفعل تلقائياً"
                  : "Active"
                : isRtl
                ? "غير مفعل"
                : "Disabled"}
            </span>
          </div>
        </div>

        {/* Dynamic Context Box */}
        <div className="mt-5">
          {enabled ? (
            <div className="rounded-2xl border border-emerald-200/90 bg-emerald-50/90 p-4 text-emerald-950 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-emerald-900">
                  {isRtl
                    ? `الشحن المجاني مفعل للطلبات بقيمة ${formatPrice(numThreshold)} أو أكثر.`
                    : `Free shipping is active on orders of ${formatPrice(numThreshold)} or more.`}
                </p>
                <p className="text-emerald-700/90 text-[11px] leading-relaxed">
                  {isRtl
                    ? "عندما يتجاوز إجمالي المنتجات في السلة هذا المبلغ، يحصل العميل على توصيل مجاني (0 ج.م) تلقائياً عند إتمام الطلب."
                    : "When cart subtotal equals or exceeds this amount, delivery fee will be zeroed out automatically."}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 text-amber-950 flex items-start gap-3">
              <Ban className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-amber-900">
                  {isRtl
                    ? "الشحن المجاني التلقائي متوقف حالياً."
                    : "Automatic free shipping is currently disabled."}
                </p>
                <p className="text-amber-800/80 text-[11px] leading-relaxed">
                  {isRtl
                    ? "يتم حالياً تطبيق أسعار الشحن الأساسية المحددة لكل منطقة ومحافظة على كافة الطلبات بدون استثناء."
                    : "Standard delivery rates assigned to governorates and zones apply to all orders."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control Form Card */}
      <form
        action={formAction}
        className="rounded-3xl border border-[#942E3A]/10 bg-white p-6 sm:p-8 shadow-xs space-y-6"
      >
        <div className="flex items-center gap-2 pb-3 border-b border-[#D8B46A]/20">
          <Sliders className="h-5 w-5 text-[#D8B46A]" />
          <h3 className="font-playfair text-lg font-bold text-[#942E3A]">
            {isRtl ? "ضبط وتخصيص الشرط" : "Configure Free Shipping Condition"}
          </h3>
        </div>

        {/* Toggle Switch Row */}
        <div className="rounded-2xl border border-[#942E3A]/10 bg-[#FFF9EB]/60 p-4 sm:p-5 transition hover:bg-[#FFF9EB]">
          <label className="flex items-center justify-between gap-4 cursor-pointer select-none">
            <div className="space-y-1">
              <span className="text-sm font-extrabold text-[#942E3A] block">
                {isRtl
                  ? "تفعيل التوصيل المجاني عند تجاوز الحد الأدنى"
                  : "Enable free shipping over minimum threshold"}
              </span>
              <span className="text-xs text-[#6B1F2A]/70 block leading-snug">
                {isRtl
                  ? "قم بتفعيل هذا التبديل لإتاحة التوصيل المجاني للعملاء فور الوصول للمبلغ المحدد"
                  : "Toggle on to waive delivery fee once order subtotal hits target threshold"}
              </span>
            </div>

            {/* iOS-Style Toggle Pill */}
            <div className="relative shrink-0" dir="ltr">
              <input
                type="checkbox"
                name="freeShippingEnabled"
                value="on"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div
                className={cn(
                  "w-14 h-8 rounded-full transition-colors duration-200 ease-in-out border-2 shadow-inner",
                  enabled
                    ? "bg-[#942E3A] border-[#942E3A]"
                    : "bg-stone-300 border-stone-300"
                )}
              />
              <div
                className={cn(
                  "absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out flex items-center justify-center text-[10px] font-black",
                  enabled
                    ? "translate-x-6 text-[#942E3A]"
                    : "translate-x-0 text-stone-400"
                )}
              >
                {enabled ? <Check className="h-3.5 w-3.5 text-[#942E3A] stroke-[3]" /> : "✕"}
              </div>
            </div>
          </label>
        </div>

        {/* Threshold Input Box & Presets */}
        <div
          className={cn(
            "space-y-4 transition-all duration-300",
            !enabled && "opacity-45 grayscale-[30%]"
          )}
        >
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-[#6B1F2A]">
              {isRtl ? "حد الشحن المجاني (المبلغ)" : "Minimum Order Amount"}
            </label>

            <div className="relative flex items-center">
              <input
                name="freeShippingThreshold"
                type="number"
                step="1"
                min="0"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder="3000"
                disabled={!enabled}
                className={cn(
                  "w-full rounded-2xl border border-[#942E3A]/20 bg-[#FFF9EB]/40 py-3 text-sm font-bold text-[#942E3A] placeholder-[#942E3A]/30 outline-none transition focus:border-[#942E3A] focus:bg-white focus:ring-2 focus:ring-[#942E3A]/10 disabled:cursor-not-allowed",
                  isRtl ? "pl-20 pr-4" : "pr-20 pl-4"
                )}
              />
              <span
                className={cn(
                  "absolute font-black text-xs text-[#942E3A] bg-[#FFF3D6] px-3 py-1.5 rounded-xl border border-[#D8B46A]/50 select-none",
                  isRtl ? "left-3" : "right-3"
                )}
              >
                {isRtl ? "ج.م" : "EGP"}
              </span>
            </div>

            <p className="text-[11px] text-[#6B1F2A]/65 leading-relaxed">
              {isRtl
                ? "ادخل قيمة الحد الأدنى بالجنيه المصري (مثال: 3000 يعفي الطلبات بقيمة 3000 ج.م أو أكثر من مصاريف التوصيل)."
                : "Enter threshold in EGP (e.g. 3000 waives shipping fees on orders equal to or exceeding EGP 3000)."}
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold text-[#6B1F2A]/70 block">
              {isRtl ? "خيارات مبالغ مقترحة:" : "Quick Preset Thresholds:"}
            </span>
            <div className="flex flex-wrap gap-2">
              {presets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    setThreshold(String(val));
                    if (!enabled) setEnabled(true);
                  }}
                  className={cn(
                    "rounded-xl px-4 py-2 text-xs font-bold transition-all border",
                    Number(threshold) === val && enabled
                      ? "bg-[#942E3A] text-white border-[#942E3A] shadow-xs scale-[1.02]"
                      : "bg-[#FFF9EB]/80 text-[#942E3A] border-[#D8B46A]/40 hover:bg-[#FFF3D6] hover:border-[#D8B46A]"
                  )}
                >
                  {formatPrice(val)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feedback Banners */}
        {state?.error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-800 flex items-center gap-2.5">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-600" />
            <span>{state.error}</span>
          </div>
        )}

        {state?.success && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 flex items-center gap-2.5">
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-600" />
            <span>{state.message || (isRtl ? "تم حفظ التغييرات بنجاح!" : "Changes saved successfully!")}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto min-w-[220px] rounded-2xl bg-[#942E3A] px-7 py-3.5 text-xs font-black text-[#FFF9EB] shadow-md shadow-[#942E3A]/25 hover:bg-[#7e2732] active:scale-[0.99] transition disabled:opacity-50 flex items-center justify-center gap-2.5"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#D8B46A]" />
                <span>{isRtl ? "جاري حفظ التغييرات..." : "Saving Changes..."}</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 text-[#D8B46A]" />
                <span>{isRtl ? "حفظ التغييرات" : "Save Changes"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
