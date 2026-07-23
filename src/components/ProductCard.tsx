"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Check, Heart, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/lib/cartStore";

export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  color: string;
  stock: number;
  sku: string;
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
}

export const COLOR_TRANSLATIONS: Record<string, string> = {
  "وردي": "Pink",
  "بيج": "Beige",
  "أسود": "Black",
  "أبيض": "White",
  "ذهبي": "Gold",
  "بني": "Brown",
  "أحمر": "Red",
};

function getColorHex(colorName: string): string {
  switch (colorName) {
    case "أبيض":
    case "White":
      return "#FFFFFF";
    case "بيج":
    case "Beige":
      return "#E8D9C5";
    case "أسود":
    case "Black":
      return "#005F6B";
    case "أحمر":
    case "Red":
      return "#005F6B";
    case "ذهبي":
    case "Gold":
      return "#D4AF37";
    case "بني":
    case "Brown":
      return "#5C4033";
    case "وردي":
    case "Pink":
      return "#E8A7A1";
    default:
      return "#CCCCCC";
  }
}

export default function ProductCard({ product }: { product: ProductWithVariants }) {
  const { addItem } = useCart();
  const [activeColorIndex, setActiveColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [added, setAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

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
    <div className="group relative flex h-[330px] w-full min-w-0 flex-col overflow-hidden rounded-[1.35rem] bg-white shadow-[0_12px_30px_rgba(0,95,107,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(0,95,107,0.13)] sm:h-[380px] sm:rounded-[1.65rem]">
      {/* Top Product Image Container */}
      <div className="relative h-[54%] w-full shrink-0 overflow-hidden bg-[#F2D4D7]">
        
        {/* Discount Badge */}
        {discountPercent && (
          <span className="font-numeric absolute left-2 top-2 z-10 rounded-full bg-[#F88379] px-2 py-0.5 text-[8px] sm:text-[9px] font-medium uppercase tracking-wider text-white shadow-xs">
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
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        </Link>

      </div>

      {/* Card Details */}
      <div className="relative z-10 -mt-7 flex flex-1 flex-col rounded-t-[1.15rem] bg-[#005F6B] px-2.5 pb-2 pt-3 text-[#FFF9EB] sm:-mt-9 sm:rounded-t-[1.35rem] sm:px-3 sm:pb-2.5 sm:pt-3.5">
        <div className="relative mb-1 min-h-[2rem]">
          <div className="absolute left-0 top-0 flex items-center gap-0.5 text-xs font-semibold text-amber-500">
            <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
            <span className="font-numeric text-[#FFF9EB] text-[10px] font-medium sm:text-[11px]">4.9</span>
          </div>

          <Link href={`/shop/${product.id}`} className="block px-9 text-center transition-colors group-hover:text-white">
            <h3 className="text-[10px] font-extrabold leading-[1.15] tracking-tight text-[#FFF9EB] line-clamp-2 sm:text-[11px]">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="mb-1.5 flex flex-col items-center text-center leading-none">
          {compareAtPriceNum && (
            <span className="font-numeric text-[10px] font-normal text-[#FFF9EB]/65 line-through sm:text-[11px]">
              {formatCurrency(compareAtPriceNum)}
            </span>
          )}
          <span className="font-numeric text-[17px] font-semibold text-white sm:text-xl">
            {formatCurrency(priceNum)}
          </span>
        </div>

        <div className="flex min-h-4 items-center justify-center gap-1.5">
          {/* Color Dots */}
          {uniqueColors.slice(0, 5).map((color, index) => {
                const hexColor = getColorHex(color);
                const isActive = index === activeColorIndex;
                return (
                  <button
                    key={color}
                    onClick={() => {
                      setActiveColorIndex(index);
                      setAdded(false);
                    }}
                    className={`h-2.5 w-2.5 rounded-full border transition-all sm:h-3 sm:w-3 ${
                      isActive ? "scale-125 border-white ring-2 ring-[#F88379] ring-offset-1 ring-offset-[#005F6B]" : "border-white/70"
                    }`}
                    style={{ backgroundColor: hexColor }}
                    aria-label={`Color option ${color}`}
                  />
                );
              })}
        </div>

        <div className="mt-1.5 flex min-h-6 flex-wrap items-center justify-center gap-1">
          {sizesForColor.slice(0, 5).map((variant) => {
            const isSelected = selectedSize === variant.size;
            const isOutOfStock = variant.stock <= 0;
            return (
              <button
                key={variant.id}
                disabled={isOutOfStock}
                onClick={() => setSelectedSize(variant.size)}
                className={`font-numeric min-w-6 rounded-full border px-1.5 py-0.5 text-[9px] font-medium transition-all sm:text-[10px] ${
                  isOutOfStock
                    ? "border-white/20 bg-white/10 text-white/40 line-through"
                    : isSelected
                    ? "border-[#F88379] bg-[#F88379] text-white"
                    : "border-white/60 bg-[#FFF9EB] text-[#005F6B] hover:border-white"
                }`}
              >
                {variant.size}
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-auto border-t border-white/35 pt-1.5">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleAddSelected}
              disabled={!selectedVariant}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F88379] text-white shadow-xs transition-all hover:bg-[#FFF9EB] hover:text-[#005F6B] active:scale-95 disabled:cursor-not-allowed disabled:bg-stone-300 sm:h-8 sm:w-8"
              aria-label="Add to cart"
            >
              {added ? <Check className="h-3.5 w-3.5" /> : <ShoppingBag className="h-3.5 w-3.5" />}
            </button>

            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/70 bg-transparent text-white shadow-xs transition-all hover:bg-white hover:text-[#F88379] active:scale-95 sm:h-8 sm:w-8"
              aria-label="Add to wishlist"
            >
              <Heart className={`h-3.5 w-3.5 ${isWishlisted ? "fill-current" : ""}`} />
            </button>

            <button
              onClick={handleAddSelected}
              disabled={!selectedVariant}
              className="flex h-7 flex-1 items-center justify-center rounded-full bg-[#FFF9EB] px-3 text-[9px] font-black text-[#005F6B] shadow-xs transition-all hover:bg-[#F88379] hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:bg-stone-300 sm:h-8 sm:text-[10px]"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
