"use client";

import { useEffect, useState } from "react";

import { useStoreI18n } from "@/providers/StoreI18nContext";
import { Globe, Languages } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoreLangToggleProps {
  variant?: "desktop" | "mobile";
  className?: string;
}

export default function StoreLangToggle({ variant = "desktop", className }: StoreLangToggleProps) {
  const { lang, toggleLang } = useStoreI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keep the first client render identical to the server render. The provider
  // reads the saved language from localStorage immediately after hydration.
  const displayLang = mounted ? lang : "en";

  if (variant === "mobile") {
    return (
      <button
        type="button"
        onClick={toggleLang}
        className={cn(
          "w-full text-xs font-semibold py-2.5 px-3 rounded-xl transition-all flex items-center justify-between",
          "bg-white/10 text-[#FFF9EB] hover:bg-white/15 border border-white/15 shadow-2xs",
          className
        )}
        title={displayLang === "ar" ? "التحويل للغة الإنجليزية" : "Switch to Arabic"}
      >
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-[#D8B46A]" />
          <span>{displayLang === "ar" ? "اللغة: العربية" : "Language: English"}</span>
        </div>
        <span className="rounded-full bg-[#D8B46A]/20 px-2 py-0.5 text-[10px] font-bold text-[#FFF9EB] border border-[#D8B46A]/40 uppercase tracking-wider">
          {displayLang === "ar" ? "English" : "AR"}
        </span>
      </button>
    );
  }

  // Desktop Navbar variant (Pill style button)
  return (
    <button
      type="button"
      onClick={toggleLang}
      className={cn(
        "text-[10px] sm:text-[11px] font-bold text-[#FFF9EB] hover:text-white hover:bg-white/20 transition-all p-1.5 sm:px-2.5 sm:py-1 rounded-full bg-white/10 flex items-center gap-1 shrink-0 border border-white/15 shadow-2xs cursor-pointer active:scale-95",
        className
      )}
      title={displayLang === "ar" ? "Switch to English" : "التحويل إلى العربية"}
      aria-label="Toggle Language"
    >
      <Globe className="h-3.5 w-3.5 sm:h-3 sm:w-3 text-[#D8B46A]" />
      <span className="font-bold uppercase tracking-wider text-[10px]">
        {displayLang === "ar" ? "EN" : "AR"}
      </span>
    </button>
  );
}
