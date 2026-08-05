import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { Gift, Plus, Truck } from "lucide-react";
import AdminShippingZoneForm from "@/components/AdminShippingZoneForm";
import AdminShippingZonesClient from "@/components/AdminShippingZonesClient";
import { updateFreeShippingSettingsAction } from "@/app/admin/shipping/actions";
import { formatCurrency } from "@/lib/utils";
import {
  createFreeShippingPromotionAction,
  deletePromotionAction,
  togglePromotionAction,
} from "@/app/admin/promotions/actions";

export const dynamic = "force-dynamic";

export default async function ShippingPage() {
  await requireAdmin();
  const [zones, settings, freeShippingPromotions] = await Promise.all([
    prisma.shippingZone
      .findMany({
        include: { exceptions: true },
        orderBy: { createdAt: "asc" },
      })
      .catch((err) => {
        console.error("Failed to load shipping zones:", err);
        return [];
      }),
    prisma.shippingSettings
      .findUnique({ where: { id: "default" } })
      .catch((err) => {
        console.error("Failed to load shipping settings:", err);
        return null;
      }),
    prisma.promotion
      .findMany({
        where: { type: "free_shipping" },
        orderBy: { createdAt: "desc" },
      })
      .catch((err) => {
        console.error("Failed to load free shipping promotions:", err);
        return [];
      }),
  ]);
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">
          Store settings
        </p>
        <h1 className="mt-1 font-playfair text-3xl font-black">Shipping</h1>
        <p className="mt-1 text-xs text-[#6B1F2A]/65">
          Manage delivery zones, city exceptions, prices, and free shipping.
        </p>
      </div>
      <div className="grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
        <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-[#D8B46A]" />
            <h2 className="font-playfair text-xl font-bold">
              Add delivery zone
            </h2>
          </div>
          <AdminShippingZoneForm
            excludedGovernorates={zones.flatMap((zone) => zone.governorates)}
          />
        </section>
        <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-[#D8B46A]" />
            <h2 className="font-playfair text-xl font-bold">
              Active delivery zones
            </h2>
          </div>
          <div className="mt-5">
            <AdminShippingZonesClient
              zones={zones.map((zone) => ({
                id: zone.id,
                name: zone.name,
                governorates: zone.governorates,
                fee: Number(zone.fee),
                active: zone.active,
                exceptions: zone.exceptions.map((item) => ({
                  city: item.city,
                  fee: Number(item.fee),
                })),
              }))}
            />
          </div>
        </section>
      </div>
      <section className="rounded-3xl border border-[#D8B46A]/35 bg-[#fff7df] p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2">
          <Gift className="h-4 w-4 text-[#942E3A]" />
          <div>
            <h2 className="font-playfair text-xl font-bold">Free shipping</h2>
            <p className="text-[10px] text-[#6B1F2A]/65">
              Offer free delivery with a promo code or automatically above a
              minimum order value.
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <form
            action={updateFreeShippingSettingsAction}
            className="rounded-2xl bg-white p-4"
          >
            <h3 className="font-playfair text-lg font-bold text-[#942E3A]">
              Automatic free shipping
            </h3>
            <label className="mt-4 inline-flex cursor-pointer items-center gap-3 text-xs font-bold text-[#942E3A]">
              <input
                name="freeShippingEnabled"
                type="checkbox"
                defaultChecked={settings?.freeShippingEnabled || false}
                className="peer sr-only"
              />
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 border-[#942E3A]/25 bg-[#FFF9EB] text-transparent shadow-sm transition peer-checked:border-[#942E3A] peer-checked:bg-[#942E3A] peer-checked:text-[#D8B46A] peer-focus-visible:ring-4 peer-focus-visible:ring-[#D8B46A]/30 peer-hover:border-[#942E3A]">
                <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[2.5]"><path d="m4 10 4 4 8-8" /></svg>
              </span>
              <span className="leading-snug">Enable free shipping over a minimum order</span>
            </label>
            <label className="mt-3 block">
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
                placeholder="e.g. 2500"
                className="admin-input"
              />
            </label>
            <button
              type="submit"
              className="mt-3 rounded-xl bg-[#942E3A] px-4 py-3 text-xs font-bold text-white"
            >
              Save automatic rule
            </button>
          </form>
          <div className="rounded-2xl bg-white p-4">
            <h3 className="font-playfair text-lg font-bold text-[#942E3A]">
              Current status
            </h3>
            <p className="mt-3 text-xs text-[#6B1F2A]/70">
              {settings?.freeShippingEnabled &&
              settings.freeShippingThreshold !== null
                ? `Free shipping is active for orders over ${formatCurrency(Number(settings.freeShippingThreshold))}.`
                : "Automatic free shipping is currently disabled."}
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <form
            action={createFreeShippingPromotionAction}
            className="rounded-2xl bg-white p-4"
          >
            <h3 className="font-playfair text-lg font-bold text-[#942E3A]">
              Free-shipping promo code
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label>
                <span className="field-label">Promotion name</span>
                <input
                  required
                  name="name"
                  placeholder="Free delivery offer"
                  className="admin-input"
                />
              </label>
              <label>
                <span className="field-label">Promo code</span>
                <input
                  required
                  name="code"
                  placeholder="FREESHIP"
                  className="admin-input uppercase"
                />
              </label>
              <label>
                <span className="field-label">Minimum order (EGP)</span>
                <input
                  name="minimumOrderValue"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Optional"
                  className="admin-input"
                />
              </label>
              <label>
                <span className="field-label">Usage limit</span>
                <input
                  name="usageLimit"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Unlimited"
                  className="admin-input"
                />
              </label>
              <label>
                <span className="field-label">Starts at</span>
                <input
                  name="startsAt"
                  type="datetime-local"
                  className="admin-input"
                />
              </label>
              <label>
                <span className="field-label">Ends at</span>
                <input
                  name="endsAt"
                  type="datetime-local"
                  className="admin-input"
                />
              </label>
            </div>
            <button
              type="submit"
              className="mt-3 rounded-xl bg-[#942E3A] px-4 py-3 text-xs font-bold text-white"
            >
              Create free-shipping code
            </button>
          </form>
          <div className="rounded-2xl bg-white p-4">
            <h3 className="font-playfair text-lg font-bold text-[#942E3A]">
              Free-shipping codes
            </h3>
            <div className="mt-3 space-y-2">
              {freeShippingPromotions.map((promotion) => (
                <div
                  key={promotion.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[#942E3A]/10 px-3 py-2.5"
                >
                  <div>
                    <p className="text-xs font-bold text-[#942E3A]">
                      {promotion.code || promotion.name}
                    </p>
                    <p className="text-[10px] text-[#6B1F2A]/60">
                      {promotion.active ? "Active" : "Disabled"}
                      {promotion.minimumOrderValue !== null
                        ? ` · Min ${formatCurrency(Number(promotion.minimumOrderValue))}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <form action={togglePromotionAction}>
                      <input type="hidden" name="id" value={promotion.id} />
                      <input
                        type="hidden"
                        name="active"
                        value={String(promotion.active)}
                      />
                      <button
                        type="submit"
                        className="text-[10px] font-bold text-[#942E3A]"
                      >
                        {promotion.active ? "Disable" : "Enable"}
                      </button>
                    </form>
                    <form action={deletePromotionAction}>
                      <input type="hidden" name="id" value={promotion.id} />
                      <button
                        type="submit"
                        className="text-[10px] font-bold text-red-600"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              ))}
              {freeShippingPromotions.length === 0 && (
                <p className="py-5 text-xs text-[#6B1F2A]/60">
                  No free-shipping codes yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
