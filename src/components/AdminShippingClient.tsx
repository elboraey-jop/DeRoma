"use client";

import { useState } from "react";
import { Gift, Plus, Truck, Sparkles, Tag, ShieldCheck, Layers, Percent, Settings2 } from "lucide-react";
import AdminShippingZoneForm from "@/components/AdminShippingZoneForm";
import AdminShippingZonesClient from "@/components/AdminShippingZonesClient";
import { updateFreeShippingSettingsAction } from "@/app/admin/shipping/actions";
import { formatCurrency } from "@/lib/utils";
import {
  createFreeShippingPromotionAction,
  deletePromotionAction,
  togglePromotionAction,
} from "@/app/admin/promotions/actions";
import { cn } from "@/lib/utils";

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
  const [activeTab, setActiveTab] = useState<"zones" | "freeship">("zones");

  const activeZonesCount = zones.filter((z) => z.active).length;
  const isFreeShipActive = Boolean(settings?.freeShippingEnabled && settings.freeShippingThreshold !== null);

  return (
    <div className="space-y-6" dir="ltr">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">
            Store settings
          </p>
          <h1 className="mt-1 font-playfair text-3xl font-black text-[#942E3A]">
            Shipping & Delivery
          </h1>
          <p className="mt-1 text-xs text-[#6B1F2A]/65">
            Configure shipping zones, regional price exceptions, automatic free delivery thresholds, and promo codes.
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
          <span>Delivery Zones</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-black",
              activeTab === "zones"
                ? "bg-[#D8B46A] text-[#2C1018]"
                : "bg-[#F2E7D5] text-[#942E3A]"
            )}
          >
            {zones.length}
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
          <span>Free Shipping Rules</span>
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
                  Add Delivery Zone
                </h2>
                <p className="text-[10px] text-[#6B1F2A]/60">Define governorates & standard fee</p>
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
                  Active Delivery Zones
                </h2>
                <p className="text-[10px] text-[#6B1F2A]/60">Manage pricing & city exceptions</p>
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
                  Automatic Free Shipping
                </h2>
                <p className="text-xs text-[#6B1F2A]/70">
                  Automatically unlock 0 EGP delivery fee when order subtotal meets minimum threshold.
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
                  <span>Configure Automatic Rule</span>
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
                  <span className="leading-snug">Enable automatic free shipping over minimum order value</span>
                </label>

                <label className="mt-4 block">
                  <span className="field-label">Minimum order value (EGP)</span>
                  <input
                    required={settings?.freeShippingEnabled || false}
                    name="freeShippingThreshold"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={
                      settings?.freeShippingThreshold
                        ? Number(settings.freeShippingThreshold)
                        : ""
                    }
                    placeholder="e.g. 4000"
                    className="admin-input"
                  />
                </label>

                <button
                  type="submit"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#942E3A] px-4 py-3 text-xs font-bold text-white shadow-md hover:bg-[#7a2430] transition-colors"
                >
                  <ShieldCheck className="h-4 w-4 text-[#D8B46A]" />
                  Save Automatic Rule
                </button>
              </form>

              {/* Status Box */}
              <div className="flex flex-col justify-between rounded-2xl border border-[#D8B46A]/30 bg-white p-5 shadow-xs">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-playfair text-base font-bold text-[#942E3A]">
                      Current Live Status
                    </h3>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider",
                        isFreeShipActive
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-stone-100 text-stone-600 border border-stone-200"
                      )}
                    >
                      {isFreeShipActive ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-[#6B1F2A]/75">
                    {isFreeShipActive
                      ? `Customers will automatically get free express delivery on all orders totaling ${formatCurrency(
                          Number(settings?.freeShippingThreshold)
                        )} or more.`
                      : "Automatic free delivery threshold is currently disabled. Customers will pay standard governorate delivery fees unless using a free-shipping promo code."}
                  </p>
                </div>

                <div className="mt-4 rounded-xl bg-[#FFF9EB] border border-[#D8B46A]/20 p-3.5 text-[11px] text-[#942E3A]">
                  <span className="font-bold">Tip:</span> The free delivery progress bar on the customer cart drawer dynamically updates in real-time as items are added.
                </div>
              </div>
            </div>
          </section>

          {/* Free Shipping Promo Codes */}
          <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-xs sm:p-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-[#D8B46A]/20">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF9EB] text-[#942E3A]">
                <Tag className="h-5 w-5 text-[#D8B46A]" />
              </div>
              <div>
                <h2 className="font-playfair text-xl font-bold text-[#942E3A]">
                  Free-Shipping Promo Codes
                </h2>
                <p className="text-xs text-[#6B1F2A]/65">
                  Create single-use or limited coupon codes for free shipping campaigns.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-6 xl:grid-cols-2">
              {/* Form */}
              <form
                action={createFreeShippingPromotionAction}
                className="rounded-2xl border border-[#942E3A]/10 bg-[#FFFDFC] p-4 sm:p-5"
              >
                <h3 className="font-playfair text-base font-bold text-[#942E3A] mb-3 flex items-center gap-2">
                  <Plus className="h-4 w-4 text-[#D8B46A]" />
                  <span>Create Free-Shipping Code</span>
                </h3>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="field-label">Offer Name</span>
                    <input
                      required
                      name="name"
                      placeholder="Free Delivery Offer"
                      className="admin-input"
                    />
                  </label>
                  <label className="block">
                    <span className="field-label">Promo Code</span>
                    <input
                      required
                      name="code"
                      placeholder="FREESHIP"
                      className="admin-input uppercase font-mono font-bold text-[#942E3A]"
                    />
                  </label>
                  <label className="block">
                    <span className="field-label">Min. Order Value (EGP)</span>
                    <input
                      name="minimumOrderValue"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Optional"
                      className="admin-input"
                    />
                  </label>
                  <label className="block">
                    <span className="field-label">Usage Limit</span>
                    <input
                      name="usageLimit"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Unlimited"
                      className="admin-input"
                    />
                  </label>
                  <label className="block">
                    <span className="field-label">Starts At</span>
                    <input
                      name="startsAt"
                      type="datetime-local"
                      className="admin-input text-xs"
                    />
                  </label>
                  <label className="block">
                    <span className="field-label">Ends At</span>
                    <input
                      name="endsAt"
                      type="datetime-local"
                      className="admin-input text-xs"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#942E3A] px-4 py-3 text-xs font-bold text-white shadow-md hover:bg-[#7a2430] transition-colors"
                >
                  <Sparkles className="h-4 w-4 text-[#D8B46A]" />
                  <span>Create Promo Code</span>
                </button>
              </form>

              {/* Codes List */}
              <div className="rounded-2xl border border-[#942E3A]/10 bg-[#FFFDFC] p-4 sm:p-5">
                <h3 className="font-playfair text-base font-bold text-[#942E3A] mb-3 flex items-center justify-between">
                  <span>Active & Past Promo Codes</span>
                  <span className="font-sans text-xs font-bold text-[#D8B46A]">
                    {freeShippingPromotions.length} codes
                  </span>
                </h3>

                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {freeShippingPromotions.map((promotion) => (
                    <div
                      key={promotion.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-[#942E3A]/15 bg-white p-3.5 shadow-xs transition hover:border-[#D8B46A]"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-black text-[#942E3A]">
                            {promotion.code || promotion.name}
                          </span>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[9px] font-bold",
                              promotion.active
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-stone-100 text-stone-500"
                            )}
                          >
                            {promotion.active ? "Active" : "Disabled"}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-[#6B1F2A]/65">
                          {promotion.minimumOrderValue !== null
                            ? `Min order: ${formatCurrency(Number(promotion.minimumOrderValue))}`
                            : "No minimum order"}
                          {promotion.usageLimit
                            ? ` · Limit: ${promotion.usageLimit}`
                            : " · Unlimited uses"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <form action={togglePromotionAction}>
                          <input type="hidden" name="id" value={promotion.id} />
                          <input
                            type="hidden"
                            name="active"
                            value={String(promotion.active)}
                          />
                          <button
                            type="submit"
                            className={cn(
                              "rounded-lg px-2.5 py-1 text-[10px] font-bold transition",
                              promotion.active
                                ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
                                : "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                            )}
                          >
                            {promotion.active ? "Disable" : "Enable"}
                          </button>
                        </form>

                        <form action={deletePromotionAction}>
                          <input type="hidden" name="id" value={promotion.id} />
                          <button
                            type="submit"
                            aria-label={`Delete ${promotion.code || promotion.name}`}
                            className="rounded-lg p-1 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <span className="text-xs font-bold">Delete</span>
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}

                  {freeShippingPromotions.length === 0 && (
                    <div className="py-8 text-center bg-[#FFF9EB]/50 rounded-2xl border border-dashed border-[#D8B46A]/30">
                      <Tag className="mx-auto h-7 w-7 text-[#D8B46A]" />
                      <p className="mt-2 text-xs font-bold text-[#942E3A]">
                        No free-shipping codes created yet
                      </p>
                      <p className="text-[10px] text-[#6B1F2A]/60 mt-0.5">
                        Use the form on the left to create a coupon code.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
