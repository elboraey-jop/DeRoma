"use client";

import { Search } from "lucide-react";
import { useStoreI18n } from "@/providers/StoreI18nContext";

export default function TrackSearchForm({ query }: { query: string }) {
  const { dir } = useStoreI18n();
  const isArabic = dir === "rtl";

  return (
    <form action="/track" method="GET" className="space-y-2 sm:space-y-3" dir={dir}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D8B46A] rtl:left-auto rtl:right-4" />
        <input
          type="text"
          name="q"
          defaultValue={query}
          required
          placeholder={isArabic ? "رقم الطلب أو رقم الهاتف" : "Order reference or phone number"}
          className="m-0 w-full rounded-2xl border border-[#942E3A]/20 bg-[#FFF9EB]/70 py-3 pl-11 pr-4 text-sm font-semibold text-[#942E3A] placeholder:text-[#942E3A]/45 outline-none transition-all focus:border-[#942E3A] focus:bg-white focus:ring-4 focus:ring-[#942E3A]/10 rtl:pl-4 rtl:pr-11 sm:py-4"
        />
      </div>
      <button
        type="submit"
        className="flex w-full items-center justify-center rounded-2xl bg-[#942E3A] px-6 py-3 text-sm font-bold text-[#FFF9EB] shadow-sm transition-all hover:bg-[#802832] active:scale-[0.99] sm:py-4"
      >
        {isArabic ? "تتبع الطلب" : "Track Order"}
      </button>
    </form>
  );
}
