"use client";

import { useEffect, useRef } from "react";
import { localizeLegacyAdminDom, useAdminI18n } from "@/providers/AdminI18nContext";

export default function AdminPageTranslationBoundary({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { lang } = useAdminI18n();

  useEffect(() => {
    if (lang !== "ar" || !rootRef.current) return;
    const root = rootRef.current;
    let applying = false;
    const apply = () => {
      if (applying) return;
      applying = true;
      observer.disconnect();
      localizeLegacyAdminDom(root);
      observer.observe(root, { childList: true, subtree: true });
      applying = false;
    };
    let frame = 0;
    const scheduleApply = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(apply);
    };
    const observer = new MutationObserver(scheduleApply);
    scheduleApply();
    observer.observe(root, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [lang]);

  return <div ref={rootRef} data-admin-page-translation suppressHydrationWarning>{children}</div>;
}
