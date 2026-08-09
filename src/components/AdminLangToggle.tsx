"use client";

import { useAdminI18n } from "@/providers/AdminI18nContext";
import { Globe, Languages } from "lucide-react";

export default function AdminLangToggle() {
  const { lang, toggleLang } = useAdminI18n();

  return (
    <button
      type="button"
      onClick={toggleLang}
      className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/90 hover:bg-white/15 hover:text-white transition-all shadow-2xs"
      title={lang === "ar" ? "التحويل للغة الإنجليزية" : "Switch to Arabic"}
    >
      <div className="flex items-center gap-2">
        <Languages className="h-4 w-4 text-[#D8B46A]" />
        <span>{lang === "ar" ? "اللغة: العربية" : "Language: English"}</span>
      </div>
      <span className="rounded-md bg-[#D8B46A]/20 px-2 py-0.5 text-[10px] font-bold text-[#FFF9EB] border border-[#D8B46A]/30 uppercase">
        {lang === "ar" ? "EN" : "عربي"}
      </span>
    </button>
  );
}
