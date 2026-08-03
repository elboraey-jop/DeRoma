"use client";

import { useMemo, useState } from "react";
import { createShippingZoneAction } from "@/app/admin/shipping/actions";
import { CENTERS_BY_GOVERNORATE } from "@/lib/locations";
import AdminShippingExceptionsPicker from "@/components/AdminShippingExceptionsPicker";
import AdminShippingGovernoratesPicker from "@/components/AdminShippingGovernoratesPicker";

export default function AdminShippingZoneForm({
  excludedGovernorates,
}: {
  excludedGovernorates: string[];
}) {
  const [governorates, setGovernorates] = useState<string[]>([]);
  const allowedCities = useMemo(
    () =>
      governorates.flatMap(
        (governorate) => CENTERS_BY_GOVERNORATE[governorate] || [],
      ),
    [governorates],
  );
  return (
    <form action={createShippingZoneAction} className="mt-5 space-y-3">
      <label className="block">
        <span className="field-label">Zone name</span>
        <input
          required
          name="name"
          placeholder="Cairo & Giza"
          className="admin-input"
        />
      </label>
      <AdminShippingGovernoratesPicker
        exclude={excludedGovernorates}
        onChange={setGovernorates}
      />
      <label className="block">
        <span className="field-label">Price (EGP)</span>
        <input
          required
          name="fee"
          type="number"
          min="0"
          step="0.01"
          placeholder="e.g. 60"
          className="admin-input"
        />
      </label>
      <AdminShippingExceptionsPicker allowedCities={allowedCities} />
      <button
        type="submit"
        className="w-full rounded-xl bg-[#942E3A] px-4 py-3 text-xs font-bold text-[#FFF9EB]"
      >
        Save zone
      </button>
    </form>
  );
}
