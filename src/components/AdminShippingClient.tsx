"use client";

import { useState } from "react";
import { Gift, Plus, Truck, Settings2 } from "lucide-react";
import AdminShippingZoneForm from "@/components/AdminShippingZoneForm";
import AdminShippingZonesClient from "@/components/AdminShippingZonesClient";
import { updateFreeShippingSettingsAction } from "@/app/admin/shipping/actions";
import {
  createFreeShippingPromotionAction,
  deletePromotionAction,
  togglePromotionAction,
} from "@/app/admin/promotions/actions";
import { cn } from "@/lib/utils";
import { useAdminI18n } from "@/providers/AdminI18nContext";

export type SerializedZone = {
  id: string;
  name: string;
  governorates: string[];
  fee: number;
  active: boolean;
  exceptions: Array<{ city: string; fee: number }>;
};

export type SerializedShippingSettings = {
  freeShippingEnabled: boolean;
  freeShippingThreshold: number | null;
} | null;

export type SerializedFreeShippingPromo = {
  id: string;
  name: string;
  code: string | null;
  minimumOrderValue: number | null;
  usageLimit: number | null;
  startsAt: string | null;
  endsAt: string | null;
  active: boolean;
};

interface AdminShippingClientProps {
  zones: SerializedZone[];
  settings: SerializedShippingSettings;
  freeShippingPromotions: SerializedFreeShippingPromo[];
}

export default function AdminShippingClient({
  zones,
  settings,
  freeShippingPromotions,
}: AdminShippingClientProps) {
  const { lang, t, formatPrice, formatNumber } = useAdminI18n();
  const isRtl = lang === "ar";
  const [activeTab, setActiveTab] = useState<"zones" | "freeship">("zones");

  const isFreeShipActive = Boolean(settings?.freeShippingEnabled && settings.freeShippingThreshold !== null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">
            {isRtl ? "إعدادات المبيعات والتشغيل" : "Store settings"}
          </p>
          <h1 className="mt-1 font-playfair text-3xl font-black text-[#942E3A]">
            {t("shipping.title")}
          </h1>
          <p className="mt-1 text-xs text-[#6B1F2A]/65">
            {t("shipping.subtitle")}
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-[#D8B46A]/30 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("zones")}
          className={cn(
            "inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-xs font-bold transition-all",
            activeTab === "zones"
              ? "bg-[#942E3A] text-white shadow-md shadow-[#942E3A]/20"
              : "bg-white text-[#942E3A] border border-[#D8B46A]/30 hover:bg-[#FFF9EB]"
          )}
        >
          <Truck className={cn("h-4 w-4", activeTab === "zones" ? "text-[#D8B46A]" : "text-[#942E3A]")} />
          <span>{isRtl ? "مناطق ومحافظات التوصيل" : "Delivery Zones"}</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-black",
              activeTab === "zones"
                ? "bg-[#D8B46A] text-[#2C1018]"
                : "bg-[#F2E7D5] text-[#942E3A]"
            )}
          >
            {formatNumber(zones.length)}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("freeship")}
          className={cn(
            "inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-xs font-bold transition-all",
            activeTab === "freeship"
              ? "bg-[#942E3A] text-white shadow-md shadow-[#942E3A]/20"
              : "bg-white text-[#942E3A] border border-[#D8B46A]/30 hover:bg-[#FFF9EB]"
          )}
        >
          <Gift className={cn("h-4 w-4", activeTab === "freeship" ? "text-[#D8B46A]" : "text-[#942E3A]")} />
          <span>{isRtl ? "قواعد الشحن المجاني" : "Free Shipping Rules"}</span>
          {isFreeShipActive && (
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* Tab 1: Delivery Zones */}
      {activeTab === "zones" && (
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          {/* Add Zone Form */}
          <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-xs sm:p-6">
            <div className="flex items-center gap-2 pb-3 border-b border-[#D8B46A]/20">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFF9EB] text-[#942E3A]">
                <Plus className="h-4 w-4 text-[#D8B46A]" />
              </div>
              <div>
                <h2 className="font-playfair text-xl font-bold text-[#942E3A]">
                  {t("shipping.addZone")}
                </h2>
                <p className="text-[10px] text-[#6B1F2A]/60">
                  {isRtl ? "تحديد المحافظات وسعر الشحن الأساسي" : "Define governorates & standard fee"}
                </p>
              </div>
            </div>
            <AdminShippingZoneForm
              excludedGovernorates={zones.flatMap((zone) => zone.governorates)}
            />
          </section>

          {/* Zones List */}
          <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-xs sm:p-6">
            <div className="flex items-center gap-2 pb-3 border-b border-[#D8B46A]/20">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFF9EB] text-[#942E3A]">
                <Truck className="h-4 w-4 text-[#D8B46A]" />
              </div>
              <div>
                <h2 className="font-playfair text-xl font-bold text-[#942E3A]">
                  {isRtl ? "مناطق التوصيل النشطة" : "Active Delivery Zones"}
                </h2>
                <p className="text-[10px] text-[#6B1F2A]/60">
                  {isRtl ? "إدارة أسعار الشحن واستثناءات المدن" : "Manage pricing & city exceptions"}
                </p>
              </div>
            </div>
            <div className="mt-5">
              <AdminShippingZonesClient zones={zones} />
            </div>
          </section>
        </div>
      )}

      {/* Tab 2: Free Shipping Settings & Promos */}
      {activeTab === "freeship" && (
        <div className="space-y-6">
          {/* Automatic Free Shipping Rule */}
          <section className="rounded-3xl border border-[#D8B46A]/35 bg-[#fff7df] p-5 shadow-xs sm:p-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-[#D8B46A]/30">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#942E3A] text-white shadow-xs">
                <Gift className="h-5 w-5 text-[#D8B46A]" />
              </div>
              <div>
                <h2 className="font-playfair text-xl font-extrabold text-[#942E3A]">
                  {isRtl ? "الشحن المجاني التلقائي" : "Automatic Free Shipping"}
                </h2>
                <p className="text-xs text-[#6B1F2A]/70">
                  {isRtl ? "تفعيل الشحن المجاني فور وصول إجمالي الطلب للحد الأدنى المحدد." : "Automatically unlock 0 EGP delivery fee when order subtotal meets minimum threshold."}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              <form
                action={updateFreeShippingSettingsAction}
                className="rounded-2xl border border-[#D8B46A]/30 bg-white p-5 shadow-xs"
              >
                <h3 className="font-playfair text-base font-bold text-[#942E3A] flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-[#D8B46A]" />
                  <span>{isRtl ? "ضبط الشرط التلقائي" : "Configure Automatic Rule"}</span>
                </h3>

                <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-[#942E3A]/10 bg-[#FFF9EB]/70 p-3 text-xs font-bold text-[#942E3A]">
                  <input
                    name="freeShippingEnabled"
                    type="checkbox"
                    defaultChecked={settings?.freeShippingEnabled || false}
                    className="peer sr-only"
                  />
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border-2 border-[#942E3A]/30 bg-white text-transparent shadow-xs transition peer-checked:border-[#942E3A] peer-checked:bg-[#942E3A] peer-checked:text-[#D8B46A]">
                    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-none stroke-current stroke-[2.5]"><path d="m4 10 4 4 8-8" /></svg>
                  </span>
                  <span className="leading-snug">
                    {isRtl ? "تفعيل التوصيل المجاني للطلبات التي تتجاوز الحد الأدنى" : "Enable automatic free shipping over minimum order value"}
                  </span>
                </label>

                <div className="mt-4 space-y-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wide text-[#6B1F2A]/70">
                    {t("shipping.freeThreshold")}
                  </label>
                  <input
                    name="freeShippingThreshold"
                    type="number"
                    step="1"
                    min="0"
                    defaultValue={settings?.freeShippingThreshold ?? 1000}
                    placeholder="1000"
                    className="w-full rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB]/40 px-3.5 py-2.5 text-xs font-bold text-[#942E3A] outline-none focus:border-[#942E3A]"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-5 w-full rounded-xl bg-[#942E3A] px-4 py-2.5 text-xs font-bold text-[#FFF9EB] shadow-xs hover:bg-[#7e2732] transition"
                >
                  {t("common.save")}
                </button>
              </form>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
