import { useState, useEffect } from "react";

const WISHLIST_KEY = "deroma_wishlist";

export function getWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(WISHLIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function toggleWishlist(productId: string) {
  if (typeof window === "undefined") return;
  const list = getWishlist();
  const index = list.indexOf(productId);
  if (index > -1) {
    list.splice(index, 1);
  } else {
    list.push(productId);
  }
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("wishlist-change"));
}

export function isProductWishlisted(productId: string): boolean {
  return getWishlist().includes(productId);
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    setWishlist(getWishlist());

    const handleChange = () => {
      setWishlist(getWishlist());
    };

    window.addEventListener("wishlist-change", handleChange);
    return () => {
      window.removeEventListener("wishlist-change", handleChange);
    };
  }, []);

  return {
    wishlist,
    toggle: toggleWishlist,
    has: (id: string) => wishlist.includes(id),
    count: wishlist.length,
  };
}
