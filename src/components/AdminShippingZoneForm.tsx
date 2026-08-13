"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { createShippingZoneAction } from "@/app/admin/shipping/actions";
import { CENTERS_BY_GOVERNORATE } from "@/lib/locations";
import AdminShippingExceptionsPicker from "@/components/AdminShippingExceptionsPicker";
import AdminShippingGovernoratesPicker from "@/components/AdminShippingGovernoratesPicker";
import { useAdminI18n } from "@/providers/AdminI18nContext";

export default function AdminShippingZoneForm({
  excludedGovernorates,
}: {
  excludedGovernorates: string[];
}) {
  const { lang } = useAdminI18n();
  const isRtl = lang === "ar";
  const formRef = useRef<HTMLFormElement>(null);
  const [formKey, setFormKey] = useState(0);
  const [governorates, setGovernorates] = useState<string[]>([]);
  const [state, formAction] = useActionState(createShippingZoneAction, {
    success: false,
  });

  useEffect(() => {
    if (!state.success) return;
    formRef.current?.reset();
    setGovernorates([]);
    setFormKey((value) => value + 1);
  }, [state.success]);

  const allowedCities = useMemo(
    () =>
      governorates.flatMap(
        (governorate) => CENTERS_BY_GOVERNORATE[governorate] || [],
      ),
    [governorates],
  );

  return (
    <form ref={formRef} action={formAction} className="mt-5 space-y-3">
      <label className="block">
        <span className="field-label">{isRtl ? "اسم المنطقة" : "Zone name"}</span>
        <input
          required
          name="name"
          placeholder="Cairo & Giza"
          className="admin-input"
        />
      </label>

      <AdminShippingGovernoratesPicker
        key={`governorates-${formKey}`}
        exclude={excludedGovernorates}
        onChange={setGovernorates}
      />

      <label className="block">
        <span className="field-label">{isRtl ? "السعر (EGP)" : "Price (EGP)"}</span>
        <input
          required
          name="fee"
          type="number"
          min="0"
          step="0.01"
          placeholder={isRtl ? "مثال: 60" : "e.g. 60"}
          className="admin-input"
        />
      </label>

      <AdminShippingExceptionsPicker
        key={`exceptions-${formKey}`}
        allowedCities={allowedCities}
      />

      <SaveZoneButton />
    </form>
  );
}

function SaveZoneButton() {
  const { pending } = useFormStatus();
  const { lang } = useAdminI18n();
  const isRtl = lang === "ar";

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#942E3A] px-4 py-3 text-xs font-bold text-[#FFF9EB] disabled:cursor-wait disabled:opacity-70"
    >
      {pending && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#FFF9EB] border-t-transparent" />
      )}
      {pending
        ? isRtl
          ? "جارٍ حفظ المنطقة..."
          : "Saving zone..."
        : isRtl
          ? "حفظ المنطقة"
          : "Save zone"}
    </button>
  );
}
