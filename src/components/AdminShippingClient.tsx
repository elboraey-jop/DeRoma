"use client";

import { useState } from "react";
import { Gift, Plus, Truck, Settings2 } from "lucide-react";
import AdminShippingZoneForm from "@/components/AdminShippingZoneForm";
import AdminShippingZonesClient from "@/components/AdminShippingZonesClient";
import AdminFreeShippingForm from "@/components/AdminFreeShippingForm";
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

      {/* Tab 2: Free Shipping Settings */}
      {activeTab === "freeship" && (
        <AdminFreeShippingForm settings={settings} />
      )}
    </div>
  );
}
