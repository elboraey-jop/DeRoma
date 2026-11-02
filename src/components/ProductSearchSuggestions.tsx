"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ArrowRight, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStoreI18n } from "@/providers/StoreI18nContext";
import { cn } from "@/lib/utils";

interface SearchProduct {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  image: string | null;
  href: string;
  searchText: string;
}

let searchCatalogPromise: Promise<SearchProduct[]> | null = null;

function loadSearchCatalog() {
  if (!searchCatalogPromise) {
    searchCatalogPromise = fetch("/api/search?all=1")
      .then((response) => (response.ok ? response.json() : { products: [] }))
      .then((data) => (Array.isArray(data.products) ? data.products : []))
      .catch(() => {
        searchCatalogPromise = null;
        return [];
      });
  }
  return searchCatalogPromise;
}

interface ProductSearchSuggestionsProps {
  query: string;
  open: boolean;
  onClose?: () => void;
  className?: string;
}

export default function ProductSearchSuggestions({
  query,
  open,
  onClose,
  className,
}: ProductSearchSuggestionsProps) {
  const router = useRouter();
  const { dir, lang, formatPrice } = useStoreI18n();
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const cleanQuery = query.trim();

  useEffect(() => {
    if (!open) {
      setProducts([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(Boolean(cleanQuery));
    void loadSearchCatalog().then((catalog) => {
      if (cancelled) return;
      const normalizedQuery = cleanQuery.toLowerCase();
      setProducts(
        normalizedQuery
          ? catalog
              .filter((product) => product.searchText.includes(normalizedQuery))
              .slice(0, 6)
          : [],
      );
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [cleanQuery, open]);

  if (!open || !cleanQuery) return null;

  const viewAllHref = `/shop?q=${encodeURIComponent(cleanQuery)}`;

  return (
    <div
      dir={dir}
      data-product-search-suggestions="true"
      className={cn(
        "absolute left-0 right-0 top-[calc(100%+0.55rem)] z-[110] overflow-hidden rounded-2xl border border-[#D8B46A]/45 bg-[#FFFDF8] text-[#942E3A] shadow-[0_18px_42px_rgba(67,25,31,0.2)]",
        className,
      )}
      onMouseDown={(event) => event.preventDefault()}
    >
      <div className="flex items-center justify-between border-b border-[#eadfd6] bg-[#fffaf0] px-3.5 py-2.5">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b8934a]">
          {lang === "ar" ? "اقتراحات البحث" : "Search suggestions"}
        </span>
        {loading && <LoaderCircle className="h-3.5 w-3.5 animate-spin text-[#b8934a]" />}
      </div>

      {products.length > 0 ? (
        <div className="max-h-64 overflow-y-auto p-1.5">
          {products.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => {
                onClose?.();
                router.push(product.href);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-[#F2E7D5]/70 rtl:text-right"
            >
              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[#eadfd6] bg-white">
                {product.image ? (
                  <Image src={product.image} alt="" fill sizes="40px" className="object-cover" />
                ) : (
                  <Search className="m-auto h-4 w-4 text-[#D8B46A]" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span data-admin-i18n-skip className="block truncate text-xs font-bold text-[#942E3A]">{product.name}</span>
                <span className="mt-0.5 block truncate text-[10px] text-[#806e73]">
                  <span data-admin-i18n-skip>{product.brand}</span>{product.brand ? " · " : ""}{formatPrice(product.price)}
                </span>
              </span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#D8B46A] rtl:rotate-180" />
            </button>
          ))}
        </div>
      ) : loading ? (
        <div className="px-4 py-5 text-center text-[11px] text-[#806e73]">
          {lang === "ar" ? "جاري البحث..." : "Searching..."}
        </div>
      ) : (
        <div className="px-4 py-5 text-center text-[11px] text-[#806e73]">
          {lang === "ar" ? "لا توجد اقتراحات مطابقة" : "No matching suggestions"}
        </div>
      )}

      <Link
        href={viewAllHref}
        onClick={onClose}
        className="flex items-center justify-center gap-1.5 border-t border-[#eadfd6] bg-[#942E3A] px-3 py-2.5 text-[10px] font-bold text-[#FFF9EB] transition hover:bg-[#7d2530]"
      >
        {lang === "ar" ? "عرض كل نتائج البحث" : "View all search results"}
        <ArrowRight className="h-3 w-3 rtl:rotate-180" />
      </Link>
    </div>
  );
}
