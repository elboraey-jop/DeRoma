"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, UserPlus, X } from "lucide-react";
import {
  createCustomerAction,
  updateCustomerAction,
} from "@/app/admin/customers/actions";
import { CENTERS_BY_GOVERNORATE, GOVERNORATES } from "@/lib/locations";
import { useAdminI18n } from "@/providers/AdminI18nContext";

export type CustomerFormValue = {
  id?: string;
  name: string;
  email?: string | null;
  phone: string;
  phone2?: string | null;
  governorate: string;
  city: string;
  address: string;
  notes?: string | null;
};

function LocationDropdown({
  label,
  value,
  options,
  placeholder,
  disabled = false,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[] | string[];
  placeholder: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const { lang } = useAdminI18n();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isRtl = lang === "ar";

  const filtered = options.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    if (disabled) {
      setOpen(false);
      setSearch("");
    }
  }, [disabled]);

  useEffect(() => {
    if (!open) return;
    const closeOnOutside = (event: PointerEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutside);
    return () => document.removeEventListener("pointerdown", closeOnOutside);
  }, [open]);

  return (
    <div ref={dropdownRef} className="relative">
      <span className="field-label">{label} *</span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={`admin-input mt-1 flex w-full items-center justify-between gap-3 ${isRtl ? "text-right" : "text-left"} ${value ? "text-[#481827]" : "text-[#a99ca0]"} disabled:cursor-not-allowed disabled:bg-[#f8f3ed] disabled:opacity-70`}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#942E3A] transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute inset-x-0 top-[calc(100%+0.35rem)] z-20 overflow-hidden rounded-2xl border border-[#eadfd6] bg-[#fffdfa] p-2 shadow-xl">
          <div className="relative">
            <Search className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-[#D8B46A] ${isRtl ? "right-3" : "left-3"}`} />
            <input
              autoFocus
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={isRtl ? `ابحث عن ${label}...` : `Search ${label.toLowerCase()}...`}
              className={`h-10 w-full rounded-xl border border-[#eadfd6] bg-[#fffaf0] text-xs text-[#481827] outline-none focus:border-[#942E3A] focus:ring-2 focus:ring-[#942E3A]/10 ${isRtl ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left"}`}
            />
          </div>
          <div
            className="hide-scrollbar mt-2 max-h-52 overscroll-contain overflow-y-auto"
            onWheel={(event) => {
              event.preventDefault();
              event.stopPropagation();
              event.currentTarget.scrollTop += event.deltaY;
            }}
          >
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
                setSearch("");
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs transition ${isRtl ? "text-right" : "text-left"} ${!value ? "bg-[#942E3A] text-white" : "text-[#806e73] hover:bg-[#fff5e8] hover:text-[#942E3A]"}`}
            >
              <span>{placeholder}</span>
              {!value && <Check className="h-3.5 w-3.5" />}
            </button>
            {filtered.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => {
                  onChange(item);
                  setOpen(false);
                  setSearch("");
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs transition ${isRtl ? "text-right" : "text-left"} ${item === value ? "bg-[#942E3A] font-bold text-white" : "text-[#481827] hover:bg-[#fff5e8] hover:text-[#942E3A]"}`}
              >
                <span>{item}</span>
                {item === value && <Check className="h-3.5 w-3.5" />}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-4 text-center text-xs text-[#806e73]">
                {isRtl ? "لم يتم العثور على نتائج" : `No ${label.toLowerCase()} found`}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminCustomerModal({
  customer,
  triggerLabel,
}: {
  customer?: CustomerFormValue;
  triggerLabel?: string;
}) {
  const { lang, t } = useAdminI18n();
  const [open, setOpen] = useState(false);
  const editing = Boolean(customer?.id);
  const isRtl = lang === "ar";

  const defaultTriggerLabel = triggerLabel || (isRtl ? "إضافة عميل جديد" : "Add new customer");

  const [governorate, setGovernorate] = useState(customer?.governorate || "");
  const [city, setCity] = useState(customer?.city || "");

  const cities = useMemo(
    () => CENTERS_BY_GOVERNORATE[governorate] || [],
    [governorate],
  );

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", close);
    };
  }, [open]);

  useEffect(() => {
    setGovernorate(customer?.governorate || "");
    setCity(customer?.city || "");
  }, [customer, open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          editing
            ? "inline-flex items-center gap-2 rounded-xl border border-[#942E3A]/15 bg-white px-4 py-3 text-xs font-bold text-[#942E3A] transition hover:border-[#D8B46A]"
            : "inline-flex items-center gap-2 rounded-xl bg-[#942E3A] px-4 py-3 text-xs font-bold text-[#FFF9EB] shadow-xs transition hover:bg-[#7e2732]"
        }
      >
        {!editing && <UserPlus className="h-4 w-4 text-[#D8B46A]" />}
        <span>{defaultTriggerLabel}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex h-dvh items-center justify-center bg-[#8B7CC7]/45 p-3 backdrop-blur-[2px] sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#D8B46A]/35 bg-[#FFFDFC] p-4 shadow-2xl sm:rounded-3xl sm:p-7 text-right">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.22em] text-[#D8B46A]">
                  {isRtl ? "ملف العميل" : "Customer profile"}
                </p>
                <h2 className="mt-0.5 sm:mt-1 font-playfair text-xl sm:text-2xl font-black text-[#942E3A]">
                  {editing ? (isRtl ? "تعديل بيانات العميل" : "Edit customer") : (isRtl ? "إضافة عميل جديد" : "Add new customer")}
                </h2>
                <p className="mt-0.5 text-[11px] text-[#6B1F2A]/60 sm:mt-1 sm:text-xs">
                  {isRtl ? "حفظ وتعديل أرقام للتواصل وعنوان التوصيل المفضل." : "Save the customer contact and delivery details."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-[#942E3A] hover:bg-[#942E3A]/10"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              action={editing ? updateCustomerAction : createCustomerAction}
              className="mt-5 space-y-3"
            >
              {customer?.id && <input type="hidden" name="id" value={customer.id} />}

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="field-label">{t("customers.customerName")} *</span>
                  <input
                    required
                    name="name"
                    defaultValue={customer?.name || ""}
                    placeholder={isRtl ? "اسم العميل الرباعي" : "Customer name"}
                    className={`admin-input ${isRtl ? "text-right" : "text-left"}`}
                  />
                </label>

                <label className="block">
                  <span className="field-label">{t("team.email")}</span>
                  <input
                    type="email"
                    name="email"
                    defaultValue={customer?.email || ""}
                    placeholder="name@example.com"
                    className={`admin-input ${isRtl ? "text-right" : "text-left"}`}
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="field-label">{t("team.phone")} *</span>
                  <input
                    required
                    name="phone"
                    defaultValue={customer?.phone || ""}
                    placeholder="01012345678"
                    className={`admin-input ${isRtl ? "text-right" : "text-left"}`}
                  />
                </label>

                <label className="block">
                  <span className="field-label">{isRtl ? "رقم هاتف ثانٍ" : "Secondary phone"}</span>
                  <input
                    name="phone2"
                    defaultValue={customer?.phone2 || ""}
                    placeholder="01112345678"
                    className={`admin-input ${isRtl ? "text-right" : "text-left"}`}
                  />
                </label>
              </div>

              <input type="hidden" name="governorate" value={governorate} />
              <input type="hidden" name="city" value={city} />

              <div className="grid gap-3 sm:grid-cols-2">
                <LocationDropdown
                  label={isRtl ? "المحافظة" : "Governorate"}
                  value={governorate}
                  options={GOVERNORATES}
                  placeholder={isRtl ? "اختر المحافظة" : "Select governorate"}
                  onChange={(val) => {
                    setGovernorate(val);
                    setCity("");
                  }}
                />

                <LocationDropdown
                  label={isRtl ? "المدينة / المركز" : "City / District"}
                  value={city}
                  options={cities}
                  placeholder={
                    governorate
                      ? (isRtl ? "اختر المدينة" : "Select city")
                      : (isRtl ? "اختر المحافظة أولاً" : "Select governorate first")
                  }
                  disabled={!governorate}
                  onChange={setCity}
                />
              </div>

              <label className="block">
                <span className="field-label">{isRtl ? "العنوان التفصيلي" : "Address details"} *</span>
                <textarea
                  required
                  rows={2}
                  name="address"
                  defaultValue={customer?.address || ""}
                  placeholder={isRtl ? "الشارع، رقم العمارة، رقم الشقة أو أي علامة مميزة" : "Street name, building number, apartment, landmark..."}
                  className={`admin-input resize-none ${isRtl ? "text-right" : "text-left"}`}
                />
              </label>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-[#942E3A]/15 bg-white px-5 py-2.5 text-xs font-bold text-[#942E3A]"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#942E3A] px-5 py-2.5 text-xs font-bold text-[#FFF9EB]"
                >
                  {editing ? t("common.save") : (isRtl ? "إضافة العميل" : "Save customer")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
