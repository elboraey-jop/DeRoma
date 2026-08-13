"use client";

import { useWishlist } from "@/lib/wishlistStore";
import { ProductWithVariants } from "@/components/ProductCard";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useStoreI18n } from "@/providers/StoreI18nContext";

export default function WishlistClient({ allProducts }: { allProducts: ProductWithVariants[] }) {
  const { wishlist } = useWishlist();
  const { t, dir } = useStoreI18n();

  // Filter products in the wishlist
  const wishlistedProducts = allProducts.filter((product) =>
    wishlist.includes(product.id)
  );

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:py-12 lg:px-8" dir={dir}>
      {/* Page Title */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#942E3A] font-playfair tracking-tight mb-2">
          {t("wishlist.title")}
        </h1>
        <p className="text-xs sm:text-sm text-[#D8B46A] max-w-md mx-auto font-medium font-sans">
          {t("wishlist.subtitle")}
        </p>
      </div>

      {wishlistedProducts.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center text-center py-16 sm:py-24 bg-white/40 border border-[#D8B46A]/20 rounded-[2rem] p-6 max-w-lg mx-auto shadow-xs">
          <div className="rounded-full bg-[#FFF9EB] p-8 mb-6 border border-[#D8B46A]/20">
            <Heart className="h-12 w-12 text-[#D8B46A] stroke-[1.5]" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#942E3A] font-playfair mb-2">
            {t("wishlist.emptyTitle")}
          </h2>
          <p className="text-xs sm:text-sm text-[#D8B46A] max-w-xs mb-8 font-medium font-sans">
            {t("wishlist.emptyDesc")}
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-full bg-[#942E3A] px-8 py-3.5 text-xs font-bold text-white hover:bg-[#802832] transition-all shadow-md hover:scale-[1.03] active:scale-[0.98] font-sans"
          >
            {t("wishlist.exploreShop")}
          </Link>
        </div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-2 gap-x-3.5 gap-y-6 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {wishlistedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
