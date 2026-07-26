"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Check, Heart, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/lib/cartStore";
import { useWishlist } from "@/lib/wishlistStore";

export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  color: string;
  stock: number;
  sku: string;
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
  name: string;
  description: string | null;
  price: any;
  compareAtPrice: any;
  category: string;
  images: string[];
  variants: ProductVariant[];
  brand?: string;
  modelKey?: string;
  colorLabel?: string;
  colorHex?: string;
  colorways?: ProductColorway[];
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

function getColorHex(colorName: string): string {
  switch (colorName) {
    case "White":
      return "#FFFFFF";
    case "Beige":
      return "#E8D9C5";
    case "Black":
      return "#111111";
    case "Red":
      return "#942E3A";
    case "Gold":
      return "#D4AF37";
    case "Brown":
      return "#5C4033";
    case "Pink":
      return "#E8A7A1";
    case "Burgundy":
      return "#6F1F2D";
    case "Navy":
      return "#1F365D";
    case "Cream Burgundy":
      return "#E7DDC7";
    case "Pastel Pink":
      return "#F0B8B8";
    case "Silver":
      return "#C4C8CE";
    case "Grey":
      return "#8E8E86";
    default:
      return "#CCCCCC";
  }
}

export default function ProductCard({ product }: { product: ProductWithVariants }) {
  const { addItem } = useCart();
  const [activeColorIndex, setActiveColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [added, setAdded] = useState(false);
  const { has, toggle } = useWishlist();
  const isWishlisted = has(product.id);

  const uniqueColors = Array.from(new Set(product.variants.map((v) => v.color)));
  const activeColor = uniqueColors[activeColorIndex] || uniqueColors[0];
  const activeImage = product.images[activeColorIndex] || product.images[0];
  const sizesForColor = product.variants.filter((v) => v.color === activeColor);
  const availableSizes = sizesForColor.filter((v) => v.stock > 0);
  const selectedVariant =
    availableSizes.find((variant) => variant.size === selectedSize) || availableSizes[0];

  const priceNum = Number(product.price);
  const compareAtPriceNum = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const discountPercent = compareAtPriceNum
    ? Math.round(((compareAtPriceNum - priceNum) / compareAtPriceNum) * 100)
    : null;

  useEffect(() => {
    const firstAvailableSize = availableSizes[0]?.size || "";
    if (!availableSizes.some((variant) => variant.size === selectedSize)) {
      setSelectedSize(firstAvailableSize);
    }
  }, [availableSizes, selectedSize]);

  const handleAddSelected = () => {
    if (!selectedVariant) return;

    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      price: priceNum,
      image: activeImage,
      color: COLOR_TRANSLATIONS[selectedVariant.color] || selectedVariant.color,
      size: selectedVariant.size,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="group relative flex h-[330px] w-full min-w-0 flex-col overflow-hidden rounded-[1.35rem] bg-white shadow-[0_12px_30px_rgba(148,46,58,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(148,46,58,0.13)] sm:h-[380px] sm:max-w-[230px] sm:rounded-[1.65rem]">
      {/* Top Product Image Container */}
      <div className="relative h-[71%] sm:h-[72%] w-full shrink-0 overflow-hidden bg-[#FFF9EB]">
        
        {/* Discount Badge */}
        {discountPercent && (
          <span className="product-card-badge-number absolute left-2 top-2 z-10 rounded-full bg-[#D8B46A] px-2 py-0.5 text-[8px] sm:text-[9px] font-medium uppercase tracking-wider text-white shadow-xs">
            -{discountPercent}%
          </span>
        )}

        {/* Product Image Link */}
        <Link href={`/shop/${product.id}`} className="relative h-full w-full flex items-center justify-center">
          <Image
            src={activeImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 230px"
          />
        </Link>

      </div>

      {/* Card Details */}
      <div className="relative z-10 -mt-7 flex flex-1 flex-col rounded-t-[1.15rem] bg-[#942E3A] px-2.5 pb-2 pt-2 text-[#FFF9EB] sm:-mt-9 sm:rounded-t-[1.35rem] sm:px-3 sm:pb-2.5 sm:pt-2.5">
        <div className="relative mb-0.5 min-h-[1.75rem]">
          <div className="absolute left-0 top-0 flex items-center gap-0.5 text-xs font-semibold text-amber-500">
            <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
            <span className="product-card-badge-number text-[#FFF9EB] text-[10px] font-medium sm:text-[11px]">
              {product.rating ? product.rating.toFixed(1) : "4.8"}
            </span>
          </div>

          <Link href={`/shop/${product.id}`} className="block px-8 sm:px-9 text-center transition-colors group-hover:text-white">
            <h3 className="product-card-name text-[10px] font-extrabold leading-[1.15] tracking-tight text-[#FFF9EB] line-clamp-2 sm:text-[11px]">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="mb-1 flex flex-row items-baseline justify-center gap-1.5 leading-none">
          <span className="font-numeric text-[15px] font-semibold text-white sm:text-[18px]">
            {formatCurrency(priceNum)}
          </span>
          {compareAtPriceNum && (
            <span className="font-numeric text-[9px] font-normal text-[#FFF9EB]/65 line-through sm:text-[10px]">
              {formatCurrency(compareAtPriceNum)}
            </span>
          )}
        </div>

        <div className="mt-1 mb-1 flex min-h-5 flex-wrap items-center justify-center gap-1">
          {sizesForColor.slice(0, 5).map((variant) => {
            const isSelected = selectedSize === variant.size;
            const isOutOfStock = variant.stock <= 0;
            return (
              <button
                key={variant.id}
                disabled={isOutOfStock}
                onClick={() => setSelectedSize(variant.size)}
                className={`product-card-badge-number relative min-w-6 rounded-full border px-1.5 py-0.5 text-[9px] font-medium transition-all sm:text-[10px] ${
                  isOutOfStock
                    ? "border-white/20 bg-white/10 text-white/40 after:absolute after:left-1 after:right-1 after:top-[48%] after:h-[1.2px] after:bg-white after:content-['']"
                    : isSelected
                    ? "border-[#D8B46A] bg-[#D8B46A] text-white"
                    : "border-white/60 bg-[#FFF9EB] text-[#942E3A] hover:border-white"
                }`}
              >
                <span className="relative -top-0.5">{variant.size}</span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-auto border-t border-white/35 pt-1">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleAddSelected}
              disabled={!selectedVariant}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#D8B46A] text-white shadow-xs transition-all hover:bg-[#FFF9EB] hover:text-[#942E3A] active:scale-95 disabled:cursor-not-allowed disabled:bg-stone-300 sm:h-8 sm:w-8"
              aria-label="Add to cart"
            >
              {added ? <Check className="h-3.5 w-3.5" /> : <ShoppingBag className="h-3.5 w-3.5" />}
            </button>

            <button
              onClick={() => toggle(product.id)}
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-transparent shadow-xs transition-all hover:bg-white hover:text-[#D8B46A] active:scale-95 sm:h-8 sm:w-8 border ${
                isWishlisted ? "border-[#D8B46A] text-[#D8B46A]" : "border-white/70 text-white"
              }`}
              aria-label="Add to wishlist"
            >
              <Heart className={`h-3.5 w-3.5 ${isWishlisted ? "fill-[#D8B46A]" : ""}`} />
            </button>

            <button
              onClick={handleAddSelected}
              disabled={!selectedVariant}
              className="flex h-7 flex-1 items-center justify-center rounded-full bg-[#FFF9EB] px-3 text-[9px] font-black text-[#942E3A] shadow-xs transition-all hover:bg-[#D8B46A] hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:bg-stone-300 sm:h-8 sm:text-[10px]"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
