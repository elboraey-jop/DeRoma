"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { CENTERS_BY_GOVERNORATE } from "@/lib/locations";
import { useAdminI18n } from "@/providers/AdminI18nContext";

export type ShippingException = { city: string; fee: number };

export default function AdminShippingExceptionsPicker({
  initial = [],
  allowedCities,
}: {
  initial?: ShippingException[];
  allowedCities?: string[];
}) {
  const { lang } = useAdminI18n();
  const isRtl = lang === "ar";
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [exceptions, setExceptions] = useState<ShippingException[]>(initial);
  const [position, setPosition] = useState({ left: 0, bottom: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const cities = useMemo(
    () =>
      allowedCities
        ? [...new Set(allowedCities)].sort()
        : [...new Set(Object.values(CENTERS_BY_GOVERNORATE).flat())].sort(),
    [allowedCities],
  );

  const filtered = cities.filter((city) =>
    city.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    if (allowedCities) {
      setExceptions((current) =>
        current.filter((item) => allowedCities.includes(item.city)),
      );
    }
  }, [allowedCities]);

  useEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) {
        setPosition({
          left: rect.left,
          bottom: window.innerHeight - rect.top + 6,
          width: rect.width,
        });
      }
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      const target = event.target as Element;
      if (
        !pickerRef.current?.contains(target) &&
        !target.closest("[data-shipping-exceptions-menu]")
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const toggle = (city: string) =>
    setExceptions((current) =>
      current.some((item) => item.city === city)
        ? current.filter((item) => item.city !== city)
        : [...current, { city, fee: 0 }],
    );

  const updateFee = (city: string, fee: string) =>
    setExceptions((current) =>
      current.map((item) =>
        item.city === city ? { ...item, fee: Number(fee) || 0 } : item,
      ),
    );

  const menu =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            data-shipping-exceptions-menu
            style={{
              position: "fixed",
              left: position.left,
              bottom: position.bottom,
              width: position.width,
              zIndex: 1000,
            }}
            className="overflow-hidden rounded-2xl border border-[#eadfd6] bg-[#fffdfa] p-2 shadow-2xl"
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D8B46A]" />
              <input
                autoFocus
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={isRtl ? "ابحث عن مدينة..." : "Search cities..."}
                className="h-10 w-full rounded-xl border border-[#eadfd6] bg-[#fffaf0] pl-9 pr-3 text-xs text-[#481827] outline-none focus:border-[#942E3A]"
              />
            </div>

            <div
              className="hide-scrollbar mt-2 max-h-64 overscroll-contain overflow-y-auto"
              onWheel={(event) => {
                event.preventDefault();
                event.stopPropagation();
                event.currentTarget.scrollTop += event.deltaY;
              }}
            >
              {filtered.map((city) => {
                const selected = exceptions.find((item) => item.city === city);
                return (
                  <div
                    key={city}
                    className={`rounded-xl px-3 py-2.5 transition ${selected ? "bg-[#942E3A] text-white" : "hover:bg-[#fff5e8]"}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(city)}
                      className="flex w-full items-center justify-between text-left text-xs font-bold"
                    >
                      {city}
                      {selected && <Check className="h-3.5 w-3.5" />}
                    </button>

                    {selected && (
                      <label className="mt-2 flex items-center gap-2 text-[10px] text-white/80">
                        {isRtl ? "السعر" : "Price"}{" "}
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={selected.fee}
                          onChange={(event) =>
                            updateFee(city, event.target.value)
                          }
                          onClick={(event) => event.stopPropagation()}
                          className="h-8 w-24 rounded-lg border-0 bg-white px-2 text-xs font-bold text-[#942E3A] outline-none"
                        />{" "}
                        EGP
                      </label>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-2 w-full rounded-xl bg-[#942E3A] px-3 py-2 text-[10px] font-bold text-white"
            >
              {isRtl ? "تم" : "Done"}
            </button>
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={pickerRef} className="relative sm:col-span-2">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide">
        {isRtl ? "استثناءات المدن" : "City exceptions"}
      </span>
      <input
        type="hidden"
        name="exceptionsJson"
        value={JSON.stringify(exceptions)}
      />
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="admin-input flex w-full items-center justify-between gap-3 text-left"
      >
        <span
          className={
            exceptions.length ? "truncate text-[#481827]" : "text-[#a99ca0]"
          }
        >
          {exceptions.length
            ? `${exceptions.length} ${isRtl ? "استثناء مدينة محدد" : "city exception selected"}`
            : isRtl
              ? "اختر المدن بسعر مختلف"
              : "Select cities with a different price"}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-[#942E3A] transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {exceptions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {exceptions.map((item) => (
            <span
              key={item.city}
              className="inline-flex items-center gap-1 rounded-full bg-[#fff7df] px-2.5 py-1.5 text-[10px] font-bold text-[#942E3A]"
            >
              {item.city}
              <button
                type="button"
                onClick={() => toggle(item.city)}
                aria-label={`${isRtl ? "إزالة" : "Remove"} ${item.city}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {menu}
    </div>
  );
}
