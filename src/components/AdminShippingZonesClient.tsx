"use client";

import { useMemo, useState } from "react";
import { Edit3, Search, Trash2, Truck } from "lucide-react";
import {
  deleteShippingZoneAction,
  updateShippingZoneAction,
} from "@/app/admin/shipping/actions";
import AdminShippingExceptionsPicker, {
  ShippingException,
} from "@/components/AdminShippingExceptionsPicker";
import { CENTERS_BY_GOVERNORATE } from "@/lib/locations";
import { useAdminI18n } from "@/providers/AdminI18nContext";
import { toast } from "@/lib/toast";

type Zone = {
  id: string;
  name: string;
  governorates: string[];
  fee: number;
  active: boolean;
  exceptions: ShippingException[];
};

type SearchResult = {
  label: string;
  governorate: string;
  fee: number;
  isException: boolean;
};

function formatShippingFee(fee: number, isRtl: boolean) {
  const amount = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(fee);
  return `EGP ${amount}`;
}

function SearchResultCard({
  result,
  isRtl,
}: {
  result: SearchResult;
  isRtl: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#942E3A]/10 bg-white p-4">
      <div>
        <p className="font-playfair text-lg font-bold text-[#942E3A]">
          {result.label}
        </p>
        <p className="mt-1 text-[10px] text-[#6B1F2A]/60">
          {result.isException
            ? "استثناء مدينة"
            : `محافظة · ${result.governorate}`}
        </p>
      </div>
      <p className="text-right">
        <span className="block font-playfair text-xl font-black text-[#942E3A]">
          {formatShippingFee(result.fee, isRtl)}
        </span>
        <span className="text-[9px] text-[#6B1F2A]/55">
          {isRtl ? "سعر التوصيل" : "Delivery price"}
        </span>
      </p>
    </div>
  );
}

export default function AdminShippingZonesClient({ zones }: { zones: Zone[] }) {
  const { lang, t } = useAdminI18n();
  const isRtl = lang === "ar";
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Zone | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? [] : zones;
  }, [zones, search]);

  const searchResults = useMemo<SearchResult[]>(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];

    const results: SearchResult[] = [];
    const cityMatches = Object.entries(CENTERS_BY_GOVERNORATE).flatMap(
      ([governorate, cities]) =>
        cities
          .filter((city) => city.toLowerCase().includes(query))
          .map((city) => ({ governorate, city })),
    );

    for (const zone of zones) {
      zone.exceptions
        .filter((item) => item.city.toLowerCase().includes(query))
        .forEach((item) =>
          results.push({
            label: item.city,
            governorate:
              zone.governorates.find((governorate) =>
                (CENTERS_BY_GOVERNORATE[governorate] || []).includes(item.city),
              ) || "",
            fee: item.fee,
            isException: true,
          }),
        );

      zone.governorates
        .filter((governorate) => governorate.toLowerCase().includes(query))
        .forEach((governorate) =>
          results.push({
            label: governorate,
            governorate,
            fee: zone.fee,
            isException: false,
          }),
        );

      cityMatches
        .filter(
          (match) =>
            zone.governorates.includes(match.governorate) &&
            !zone.exceptions.some((item) => item.city === match.city),
        )
        .forEach((match) =>
          results.push({
            label: match.city,
            governorate: match.governorate,
            fee: zone.fee,
            isException: false,
          }),
        );
    }

    return results.filter(
      (result, index, all) =>
        all.findIndex(
          (item) =>
            item.label === result.label && item.governorate === result.governorate,
        ) === index,
    );
  }, [zones, search]);

  return (
    <>
      <div className="mb-4 relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D8B46A]" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={
            isRtl
              ? "ابحث عن محافظة أو مدينة لمعرفة السعر"
              : "Search a city or governorate to find its price"
          }
          className="admin-input pl-9"
        />
      </div>

      <div className="space-y-3">
        {search.trim() ? (
          searchResults.map((result) => (
            <SearchResultCard
              key={`${result.label}-${result.governorate}`}
              result={result}
              isRtl={isRtl}
            />
          ))
        ) : (
          filtered.map((zone) => (
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
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">
                      {isRtl ? "نشط" : "Active"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#6B1F2A]/65">
                    {zone.governorates.join(", ")}
                  </p>
                  {zone.exceptions.length > 0 && (
                    <p className="mt-1 text-[10px] text-[#942E3A]">
                      {isRtl ? "استثناءات:" : "Exceptions:"}{" "}
                      {zone.exceptions
                        .map(
                          (item) =>
                            `${item.city} (${formatShippingFee(item.fee, isRtl)})`,
                        )
                        .join(", ")}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <p className="text-right">
                    <span className="block font-playfair text-xl font-black text-[#942E3A]">
                      {formatShippingFee(zone.fee, isRtl)}
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setEditing(zone)}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-[#942E3A] hover:underline"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    {t("common.edit")}
                  </button>
                  <form
                    action={deleteShippingZoneAction}
                    onSubmit={() => {
                      toast.success(isRtl ? `تم حذف منطقة "${zone.name}" بنجاح!` : `Zone "${zone.name}" deleted successfully!`);
                    }}
                  >
                    <input type="hidden" name="id" value={zone.id} />
                    <button
                      type="submit"
                      aria-label={`${isRtl ? "حذف" : "Delete"} ${zone.name}`}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))
        )}

        {(search.trim() ? searchResults.length : filtered.length) === 0 && (
          <div className="rounded-2xl bg-[#FFF9EB] p-6 text-center">
            <Truck className="mx-auto h-7 w-7 text-[#D8B46A]" />
            <p className="mt-2 text-sm font-bold">
              {isRtl
                ? "لا توجد مناطق توصيل مطابقة"
                : "No matching delivery zones"}
            </p>
          </div>
        )}
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#8B7CC7]/45 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditing(null);
          }}
        >
          <div className="hide-scrollbar max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-[#D8B46A]/35 bg-[#FFFDFC] p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
                  {isRtl ? "منطقة الشحن" : "Shipping zone"}
                </p>
                <h2 className="mt-1 font-playfair text-2xl font-black text-[#942E3A]">
                  {isRtl ? "تعديل المنطقة" : "Edit zone"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-full p-2 text-[#942E3A]"
              >
                <span className="text-xl">×</span>
              </button>
            </div>

            <form action={updateShippingZoneAction} className="mt-5 grid gap-3">
              <input type="hidden" name="id" value={editing.id} />

              <label>
                <span className="field-label">
                  {isRtl ? "اسم المنطقة" : "Zone name"}
                </span>
                <input
                  required
                  name="name"
                  defaultValue={editing.name}
                  className="admin-input"
                />
              </label>

              <label>
                <span className="field-label">
                  {isRtl ? "المحافظات" : "Governorates"}
                </span>
                <input
                  required
                  name="governorates"
                  defaultValue={editing.governorates.join(", ")}
                  className="admin-input"
                />
              </label>

              <label>
                <span className="field-label">
                  {isRtl ? "السعر (EGP)" : "Price (EGP)"}
                </span>
                <input
                  required
                  name="fee"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={editing.fee}
                  className="admin-input"
                />
              </label>

              <AdminShippingExceptionsPicker initial={editing.exceptions} />

              <button
                type="submit"
                className="mt-2 rounded-xl bg-[#942E3A] px-4 py-3 text-xs font-bold text-white"
              >
                {isRtl ? "حفظ التغييرات" : "Save changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
