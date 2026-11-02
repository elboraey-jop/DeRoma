"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RoutePrefetcher() {
  const router = useRouter();

  useEffect(() => {
    // Prefetch only after a real user intent. Prefetching every critical route
    // after page load creates a burst of server requests for every visitor.
    const prefetchedRoutes = new Set<string>();
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
        !href.includes("tel:") &&
        !prefetchedRoutes.has(href)
      ) {
        prefetchedRoutes.add(href);
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
      document.removeEventListener("mouseover", handleMouseOverOrTouch);
      document.removeEventListener("touchstart", handleMouseOverOrTouch);
    };
  }, [router]);

  return null;
}
