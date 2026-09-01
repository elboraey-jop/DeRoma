"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Toaster as SonnerToaster } from "sonner";
import { toast as smartToast } from "@/lib/toast";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastContextType {
  toast: typeof smartToast;
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  removeToast: (id: string | number) => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: smartToast,
  showToast: (message, type = "info", title, duration) => {
    const opts = { description: title, duration };
    if (type === "success") smartToast.success(message, opts);
    else if (type === "error") smartToast.error(message, opts);
    else if (type === "warning") smartToast.warning(message, opts);
    else smartToast.info(message, opts);
  },
  removeToast: (id) => smartToast.dismiss(id),
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [dir, setDir] = useState<"ltr" | "rtl">("ltr");

  useEffect(() => {
    setMounted(true);
    // Sync direction from html document attribute
    const updateDir = () => {
      const docDir = document.documentElement.getAttribute("dir");
      setDir(docDir === "rtl" ? "rtl" : "ltr");
    };

    updateDir();
    const observer = new MutationObserver(updateDir);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["dir", "lang"] });
    return () => observer.disconnect();
  }, []);

  const showToast = (message: string, type: ToastType = "info", title?: string, duration?: number) => {
    const opts = { description: title, duration };
    if (type === "success") smartToast.success(message, opts);
    else if (type === "error") smartToast.error(message, opts);
    else if (type === "warning") smartToast.warning(message, opts);
    else smartToast.info(message, opts);
  };

  const removeToast = (id: string | number) => {
    smartToast.dismiss(id);
  };

  return (
    <ToastContext.Provider value={{ toast: smartToast, showToast, removeToast }}>
      {children}
      {mounted && (
        <SonnerToaster
          position="top-right"
          dir={dir}
          richColors
          closeButton
          expand={true}
          duration={3800}
          style={{
            zIndex: 9999999,
          }}
          toastOptions={{
            style: {
              fontFamily: dir === "rtl" ? "var(--font-cairo), sans-serif" : "var(--font-montserrat), sans-serif",
            },
            classNames: {
              toast: "group toast rounded-2xl shadow-xl p-4 text-xs sm:text-sm font-medium border transition-all duration-200 pointer-events-auto",
              success: "!bg-emerald-50 !border-emerald-200 !text-emerald-950 shadow-emerald-500/10",
              error: "!bg-red-50 !border-red-200 !text-red-950 shadow-red-500/10",
              warning: "!bg-amber-50 !border-amber-200 !text-amber-950 shadow-amber-500/10",
              info: "!bg-blue-50 !border-blue-200 !text-blue-950 shadow-blue-500/10",
              description: "!text-[11px] sm:!text-xs !opacity-85 !mt-0.5",
              actionButton: "!bg-[#942E3A] !text-[#FFF9EB] !text-xs !rounded-xl !px-3 !py-1.5",
              cancelButton: "!bg-gray-100 !text-gray-800 !text-xs !rounded-xl !px-3 !py-1.5",
              closeButton: "!bg-white !border !border-gray-200 !text-gray-600 hover:!text-gray-950 !rounded-lg",
            },
          }}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

export { smartToast as toast };
export default ToastProvider;
