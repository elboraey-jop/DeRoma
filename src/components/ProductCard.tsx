"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Check, Heart, Star } from "lucide-react";
import { useCart } from "@/lib/cartStore";
import { useWishlist } from "@/lib/wishlistStore";
import { motion } from "framer-motion";
import { trackAddToWishlist, trackSelectItem, trackViewItemList } from "@/lib/analytics";
import { useStoreI18n } from "@/providers/StoreI18nContext";
import { sortVariantsByNumericSize } from "@/lib/utils";
import { getProductPath } from "@/lib/productSlug";

export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  stock: number;
  price?: number | null;
  compareAtPrice?: number | null;
  wholesalePrice?: number | null;
  additionalCost?: number | null;
}

export interface ProductColorway {
  productId: string;
  color: string;
  label: string;
  hex: string;
  image: string;
  name: string;
}

export interface ProductWithVariants {
  id: string;
  slug?: string | null;
  name: string;
  description: string | null;
  price: any;
  compareAtPrice: any;
  category: string;
  subcategory?: string | null;
  images: string[];
  variants: ProductVariant[];
  brand?: string;
  sku?: string | null;
  color?: string | null;
  rating?: number;
  reviewsCount?: number;
}

export const COLOR_TRANSLATIONS: Record<string, string> = {
  Beige: "Beige",
  Black: "Black",
  White: "White",
  Gold: "Gold",
  Brown: "Brown",
  Pink: "Pink",
  Red: "Red",
  Grey: "Grey",
  Burgundy: "Burgundy",
  Navy: "Navy",
  "Cream Burgundy": "Cream Burgundy",
  "Pastel Pink": "Pastel Pink",
  Silver: "Silver",
};

export default function ProductCard({
  product,
  mobileOptimized = false,
}: {
  product: ProductWithVariants;
  mobileOptimized?: boolean;
}) {
  const { addItem } = useCart();
  const { t, formatNumber, lang, dir } = useStoreI18n();
  const soldOutLabel = lang === "ar" ? "نفد المخزون" : "Sold Out";
  const [selectedSize, setSelectedSize] = useState("");
  const [added, setAdded] = useState(false);
  const { has, toggle } = useWishlist();
  const isWishlisted = has(product.id);
  const [imageLoading, setImageLoading] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const hasTrackedImpression = useRef(false);
  const isBag = product.category === "bags";

  const activeImage = product.images[0];
  const sizesForProduct = sortVariantsByNumericSize(product.variants);
  const availableSizes = sizesForProduct.filter((v) => v.stock > 0);
  const selectedVariant =
    availableSizes.find((variant) => variant.size === selectedSize) || availableSizes[0];

  const formatCardPrice = (amount: number | string) => {
    const num = typeof amount === "number" ? amount : parseFloat(String(amount));
    if (isNaN(num)) return `${amount} EGP`;
    return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(num)} EGP`;
  };

  const priceNum = Number(selectedVariant?.price ?? product.price);
  const compareAtPriceNum = selectedVariant?.compareAtPrice != null
    ? Number(selectedVariant.compareAtPrice)
    : product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const discountPercent = compareAtPriceNum
    ? Math.round(((compareAtPriceNum - priceNum) / compareAtPriceNum) * 100)
    : null;

  useEffect(() => {
    const firstAvailableSize = availableSizes[0]?.size || "";
    if (!availableSizes.some((variant) => variant.size === selectedSize)) {
      setSelectedSize(firstAvailableSize);
    }
  }, [availableSizes, selectedSize]);

  useEffect(() => {
    setImageLoading(true);
  }, [activeImage]);

  // Product cards add one unit per click. Quantity changes belong to the
  // product detail page and the cart drawer, not the card itself.
  const handleAddOne = () => {
    if (!selectedVariant) return;

    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      price: priceNum,
      image: activeImage,
      color: product.color || "",
      size: selectedVariant.size,
      availableStock: selectedVariant.stock,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const isTotalSoldOut = sizesForProduct.length > 0 && sizesForProduct.every((v) => v.stock <= 0);
  const hasRealRating = Boolean(
    product.rating && Number(product.rating) > 0 && (product.reviewsCount === undefined || product.reviewsCount > 0)
  );
  const analyticsItem = {
    productId: product.id,
    variantId: selectedVariant?.id,
    name: product.name,
    price: priceNum,
    category: product.category,
    color: product.color || "",
    size: selectedVariant?.size || "",
  };

  const handleWishlistToggle = () => {
    if (!isWishlisted) {
      trackAddToWishlist(analyticsItem);
    }
    toggle(product.id);
  };

  const handleProductSelect = () => {
    trackSelectItem(analyticsItem, product.category || "Shop");
  };

  useEffect(() => {
    if (!cardRef.current || hasTrackedImpression.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || hasTrackedImpression.current) return;
        hasTrackedImpression.current = true;
        trackViewItemList(analyticsItem, product.category || "Shop");
        observer.disconnect();
      },
      { threshold: 0.5 },
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [analyticsItem, product.category]);

  return (
    <motion.div
      ref={cardRef}
      dir={dir}
      whileHover={mobileOptimized || isTotalSoldOut ? undefined : { y: -5, transition: { duration: 0.25, ease: "easeOut" } }}
      className={`product-card-shell group relative flex h-[340px] w-full min-w-0 flex-col overflow-hidden rounded-[1.35rem] bg-white shadow-[0_12px_30px_rgba(148,46,58,0.06)] hover:shadow-[0_18px_38px_rgba(148,46,58,0.13)] sm:h-[390px] sm:max-w-[230px] sm:rounded-[1.65rem] transition-all duration-300 ${
        isTotalSoldOut ? "opacity-75 grayscale bg-stone-100" : ""
      }`}
    >
      {/* Top Product Image Container */}
      <div className="relative h-[68%] sm:h-[69%] w-full shrink-0 overflow-hidden bg-[#FFF9EB]">
        
        {/* Badges */}
        {isTotalSoldOut ? (
          <span className="product-card-badge-number absolute left-2 rtl:left-auto rtl:right-2 top-2 z-15 rounded-full bg-red-700 px-2 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-white shadow-sm">
            {soldOutLabel}
          </span>
        ) : discountPercent ? (
          <span className="product-card-badge-number absolute left-2 rtl:left-auto rtl:right-2 top-2 z-10 rounded-full bg-[#D8B46A] px-2 py-0.5 text-[8px] sm:text-[9px] font-medium uppercase tracking-wider text-white shadow-xs">
            -{formatNumber(discountPercent)}%
          </span>
        ) : null}

        {/* Shimmer Image Placeholder */}
        {imageLoading && (
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-stone-200/50 via-stone-100/50 to-stone-200/50 animate-pulse" />
        )}

        {/* Product Image Link */}
        <Link href={getProductPath(product)} onClick={handleProductSelect} className="relative h-full w-full flex items-center justify-center">
          <Image
            src={activeImage}
            alt={product.name}
            fill
            className={`object-cover transition-all duration-500 group-hover:scale-105 ${
              imageLoading ? "opacity-0 scale-95" : "opacity-100 scale-100"
            }`}
            sizes="(max-width: 768px) 50vw, 230px"
            onLoad={() => setImageLoading(false)}
          />
        </Link>

      </div>

      {/* Card Details */}
      <div
        className={`relative z-10 -mt-7 flex flex-1 flex-col rounded-t-[1.15rem] px-2.5 pb-3.5 pt-2 text-[#6B1F2A] sm:-mt-9 sm:rounded-t-[1.35rem] sm:px-3 sm:pb-4 sm:pt-2.5 ${
          isTotalSoldOut ? "bg-stone-700 text-stone-200" : "bg-[#EADFC8] text-[#6B1F2A]"
        }`}
        style={!isTotalSoldOut ? { backgroundColor: "#EADFC8" } : undefined}
      >
        <div className="relative mb-0.5 min-h-[1.75rem]">
          {hasRealRating && (
            <div className="absolute left-0 rtl:left-auto rtl:right-0 top-0 flex items-center gap-0.5 text-xs font-semibold text-amber-500">
              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
              <span className="product-card-badge-number text-[#6B1F2A] text-[10px] font-medium sm:text-[11px]">
                {formatNumber(Number(product.rating).toFixed(1))}
              </span>
            </div>
          )}

          <Link
            href={getProductPath(product)}
            onClick={handleProductSelect}
            className={`block text-center transition-colors group-hover:text-[#942E3A] ${
              hasRealRating ? "px-8 sm:px-9" : "px-1 sm:px-2"
            }`}
          >
            <h3 className="product-card-name text-[10px] font-normal leading-[1.2] tracking-tight text-[#6B1F2A] line-clamp-2 sm:text-[11px]">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="mb-1 flex flex-row items-baseline justify-center gap-1.5 leading-none">
          <span className="font-numeric text-[15px] font-light text-[#6B1F2A] sm:text-[18px]">
            {formatCardPrice(priceNum)}
          </span>
          {compareAtPriceNum && (
            <span className="font-numeric text-[9px] font-light text-[#6B1F2A]/55 line-through sm:text-[10px]">
              {formatCardPrice(compareAtPriceNum)}
            </span>
          )}
        </div>

        {!isBag && <div className="mt-1 mb-1 flex min-h-5 flex-wrap items-center justify-center gap-1">
          {sizesForProduct.slice(0, 5).map((variant) => {
            const isSelected = selectedSize === variant.size;
            const isOutOfStock = variant.stock <= 0;
            return (
              <motion.button
                key={variant.id}
                disabled={isOutOfStock}
                onClick={() => {
                  setSelectedSize(variant.size);
                }}
                title={isOutOfStock ? soldOutLabel : undefined}
                whileHover={!mobileOptimized && !isOutOfStock ? { scale: 1.1 } : undefined}
                whileTap={!mobileOptimized && !isOutOfStock ? { scale: 0.9 } : undefined}
                className={`product-card-badge-number group relative flex h-6 min-w-6 items-center justify-center rounded-full border px-1 text-[9px] font-bold leading-none text-center transition-all sm:h-6.5 sm:min-w-6.5 sm:text-[10px] ${
                  isOutOfStock
                    ? "border-stone-400/30 bg-stone-100/50 text-stone-400 opacity-40 cursor-not-allowed"
                    : isSelected
                    ? "border-[#942E3A] bg-[#942E3A] text-[#FFF9EB] shadow-xs scale-105"
                    : "border-[#942E3A]/30 bg-[#FFF9EB]/75 text-[#6B1F2A] hover:border-[#942E3A] hover:bg-[#FFF9EB]"
                }`}
              >
                <span className="flex items-center justify-center leading-none">{formatNumber(variant.size)}</span>
                {isOutOfStock && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-0.5 right-0.5 top-1/2 h-[1px] -translate-y-1/2 bg-stone-400/80"
                  />
                )}
              </motion.button>
            );
          })}
        </div>}

        {/* Action Buttons */}
        <div className="mt-auto border-t border-[#942E3A]/20 pt-1.5 pb-0.5">
          {isTotalSoldOut ? (
            <div className="flex h-7 sm:h-8 w-full items-center justify-center rounded-full bg-stone-500 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-white shadow-inner">
              {soldOutLabel}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <motion.button
                onClick={handleAddOne}
                disabled={!selectedVariant}
                whileHover={mobileOptimized ? undefined : { scale: 1.1 }}
                whileTap={mobileOptimized ? undefined : { scale: 0.9 }}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#D8B46A] text-[#FFF9EC] shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#942E3A] hover:text-white hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:hover:translate-y-0 disabled:hover:shadow-xs sm:h-8 sm:w-8"
                aria-label={t("productCard.addToBag")}
              >
                {added ? <Check className="h-3.5 w-3.5" /> : <ShoppingBag className="h-3.5 w-3.5" />}
              </motion.button>

              <motion.button
                onClick={handleWishlistToggle}
                whileHover={mobileOptimized ? undefined : { scale: 1.1 }}
                whileTap={mobileOptimized ? undefined : { scale: 0.9 }}
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-transparent shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FFF9EB] hover:text-[#942E3A] hover:shadow-md active:translate-y-0 sm:h-8 sm:w-8 border ${
                  isWishlisted ? "border-[#942E3A] text-[#942E3A]" : "border-[#942E3A]/45 text-[#6B1F2A]"
                }`}
                aria-label="Add to wishlist"
              >
                <Heart className={`h-3.5 w-3.5 ${isWishlisted ? "fill-[#942E3A]" : ""}`} />
              </motion.button>

              <motion.button
                onClick={handleAddOne}
                disabled={!selectedVariant}
                whileHover={mobileOptimized ? undefined : { scale: 1.03 }}
                whileTap={mobileOptimized ? undefined : { scale: 0.97 }}
                className="flex h-7 flex-1 items-center justify-center rounded-full bg-[#942E3A] px-3 text-[9px] font-black text-[#FFF9EB] shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#6B1F2A] hover:text-[#FFF9EB] hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:hover:translate-y-0 disabled:hover:shadow-xs sm:h-8 sm:text-[10px]"
              >
                {t("productCard.buyNow", lang === "ar" ? "اشتري الآن" : "Buy Now")}
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
