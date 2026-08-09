"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const CRITICAL_ROUTES = [
  "/shop",
  "/shop/bags",
  "/shop/perfumes",
  "/shop/accessories",
  "/checkout",
  "/track",
  "/about",
  "/privacy",
  "/wishlist",
  "/login",
];

export default function RoutePrefetcher() {
  const router = useRouter();

  useEffect(() => {
    // 1. Instantly prefetch key store routes in background
    const idleCallback =
      typeof window !== "undefined" && "requestIdleCallback" in window
        ? window.requestIdleCallback
        : (cb: () => void) => setTimeout(cb, 100);

    const timer = setTimeout(() => {
      idleCallback(() => {
        CRITICAL_ROUTES.forEach((route) => {
          try {
            router.prefetch(route);
          } catch (_) {
            // Ignore prefetch errors for non-existent paths
          }
        });
      });
    }, 200);

    // 2. Instant prefetch on link hover / touch
    const handleMouseOverOrTouch = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("//") &&
        !href.includes("mailto:") &&
        !href.includes("tel:")
      ) {
        try {
          router.prefetch(href);
        } catch (_) {
          // Ignore prefetch errors
        }
      }
    };

    document.addEventListener("mouseover", handleMouseOverOrTouch, { passive: true });
    document.addEventListener("touchstart", handleMouseOverOrTouch, { passive: true });

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseover", handleMouseOverOrTouch);
      document.removeEventListener("touchstart", handleMouseOverOrTouch);
    };
  }, [router]);

  return null;
}
