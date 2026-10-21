"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Native touch scrolling is already optimized by the browser. Running a
    // second animation loop on phones makes scrolling feel delayed and heavy.
    // The admin workspace also contains dense tables, dropdowns, and product
    // thumbnails, so it should always use native scrolling instead of Lenis.
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
    if (prefersReducedMotion || isTouchDevice || isAdminRoute) return;

    const lenis = new Lenis({
      duration: 0.65,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [pathname]);

  return null;
}
