import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { Plus, Trash2, Truck } from "lucide-react";
import {
  createShippingZoneAction,
  deleteShippingZoneAction,
  toggleShippingZoneAction,
} from "@/app/admin/shipping/actions";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ShippingPage() {
  await requireAdmin();
  let zones: Awaited<ReturnType<typeof prisma.shippingZone.findMany>> = [];
  try {
    zones = await prisma.shippingZone.findMany({
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    console.warn("Unable to load shipping zones", error);
  }
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">
          Store settings
        </p>
        <h1 className="mt-1 font-playfair text-3xl font-black">Shipping</h1>
        <p className="mt-1 text-xs text-[#6B1F2A]/65">
          Manage delivery zones, fees, estimated time, and free-shipping
          thresholds.
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
          <form action={createShippingZoneAction} className="mt-5 space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide">
                Zone name
              </span>
              <input
                required
                name="name"
                placeholder="Cairo & Giza"
                className="w-full rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB]/50 px-3 py-3 text-xs outline-none focus:border-[#942E3A]"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide">
                Governorates
              </span>
              <input
                required
                name="governorates"
                placeholder="Cairo, Giza"
                className="w-full rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB]/50 px-3 py-3 text-xs outline-none focus:border-[#942E3A]"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide">
                  Fee (EGP)
                </span>
                <input
                  required
                  name="fee"
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB]/50 px-3 py-3 text-xs outline-none focus:border-[#942E3A]"
                />
              </label>
              <label>
                <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide">
                  Delivery time
                </span>
                <input
                  name="estimatedDays"
                  placeholder="2–5 days"
                  className="w-full rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB]/50 px-3 py-3 text-xs outline-none focus:border-[#942E3A]"
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide">
                Free shipping over (optional)
              </span>
              <input
                name="freeShippingThreshold"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 2500"
                className="w-full rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB]/50 px-3 py-3 text-xs outline-none focus:border-[#942E3A]"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-xl bg-[#942E3A] px-4 py-3 text-xs font-bold text-[#FFF9EB]"
            >
              Save zone
            </button>
          </form>
        </section>
        <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-[#D8B46A]" />
            <h2 className="font-playfair text-xl font-bold">
              Active delivery zones
            </h2>
          </div>
          <div className="mt-5 space-y-3">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className="rounded-2xl border border-[#942E3A]/10 p-4"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-playfair text-lg font-bold">
                        {zone.name}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-1 text-[9px] font-bold ${zone.active ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"}`}
                      >
                        {zone.active ? "Active" : "Paused"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#6B1F2A]/65">
                      {zone.governorates.join(", ")}
                      {zone.estimatedDays ? ` · ${zone.estimatedDays}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-playfair text-xl font-black text-[#942E3A]">
                      {formatCurrency(Number(zone.fee))}
                    </p>
                    <form action={toggleShippingZoneAction}>
                      <input type="hidden" name="id" value={zone.id} />
                      <input
                        type="hidden"
                        name="active"
                        value={String(zone.active)}
                      />
                      <button
                        type="submit"
                        className="text-[10px] font-bold text-[#942E3A] hover:underline"
                      >
                        {zone.active ? "Pause" : "Activate"}
                      </button>
                    </form>
                    <form action={deleteShippingZoneAction}>
                      <input type="hidden" name="id" value={zone.id} />
                      <button
                        type="submit"
                        aria-label={`Delete ${zone.name}`}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </div>
                {zone.freeShippingThreshold && (
                  <p className="mt-3 rounded-xl bg-[#fff7df] px-3 py-2 text-[10px] font-semibold text-[#6B1F2A]">
                    Free shipping on orders over{" "}
                    {formatCurrency(Number(zone.freeShippingThreshold))}
                  </p>
                )}
              </div>
            ))}
            {zones.length === 0 && (
              <div className="rounded-2xl bg-[#FFF9EB] p-6 text-center">
                <Truck className="mx-auto h-7 w-7 text-[#D8B46A]" />
                <p className="mt-2 text-sm font-bold">No shipping zones yet</p>
                <p className="mt-1 text-xs text-[#6B1F2A]/60">
                  Add your first delivery zone from the form.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
