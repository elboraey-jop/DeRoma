"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  ChevronRight,
  Plus,
  Minus,
  Check,
  Shield,
  Truck,
  Heart,
  Star,
  ChevronDown,
  ChevronUp,
  Sparkles
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/lib/cartStore";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard, { ProductWithVariants, COLOR_TRANSLATIONS } from "@/components/ProductCard";

interface ProductDetailClientProps {
  product: ProductWithVariants;
  similarProducts: ProductWithVariants[];
}

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
      return "#C0392B";
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

export default function ProductDetailClient({ product, similarProducts }: ProductDetailClientProps) {
  const { addItem } = useCart();
  const uniqueColors = Array.from(new Set(product.variants.map((v) => v.color)));
  
  const [selectedColor, setSelectedColor] = useState(uniqueColors[0] || "");
  const [selectedSize, setSelectedSize] = useState("");
  const [sizeUnit, setSizeUnit] = useState<"EU" | "US" | "CM">("EU");
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>("description");

  const colorIndex = uniqueColors.indexOf(selectedColor);
  useEffect(() => {
    if (colorIndex > -1 && product.images[colorIndex]) {
      setActiveImageIndex(colorIndex);
    }
  }, [selectedColor, colorIndex, product.images]);

  const sizesForColor = product.variants.filter((v) => v.color === selectedColor);
  const activeVariant = product.variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  );

  const priceNum = Number(product.price);
  const compareAtPriceNum = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const discountPercent = compareAtPriceNum
    ? Math.round(((compareAtPriceNum - priceNum) / compareAtPriceNum) * 100)
    : null;

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select your shoe size first.");
      return;
    }

    if (!activeVariant) return;

    addItem({
      productId: product.id,
      variantId: activeVariant.id,
      name: product.name,
      price: priceNum,
      image: product.images[colorIndex] || product.images[0],
      color: COLOR_TRANSLATIONS[selectedColor] || selectedColor,
      size: selectedSize,
      quantity,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="w-full flex flex-col space-y-12 pb-24 bg-[#FFF9EB] text-[#005F6B]" dir="ltr">
      
      {/* Breadcrumbs */}
      <nav className="mx-auto w-full max-w-[94vw] lg:max-w-[1400px] px-2 sm:px-4 lg:px-6 pt-4">
        <ol className="flex items-center gap-x-2 text-xs font-bold text-[#F88379]">
          <li>
            <Link href="/" className="hover:text-[#005F6B] transition-colors">Home</Link>
          </li>
          <ChevronRight className="h-3 w-3 text-[#F88379]" />
          <li>
            <Link href="/shop" className="hover:text-[#005F6B] transition-colors">Boutique Catalog</Link>
          </li>
          <ChevronRight className="h-3 w-3 text-[#F88379]" />
          <li className="text-[#005F6B] truncate max-w-[180px] sm:max-w-none">
            {product.name}
          </li>
        </ol>
      </nav>

      {/* Main PDP Grid */}
      <section className="mx-auto w-full max-w-[94vw] lg:max-w-[1400px] px-2 sm:px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Gallery Left (6 cols) */}
          <div className="lg:col-span-6 flex flex-col space-y-4">
            <div className="relative aspect-square w-full overflow-hidden bg-[#F2D4D7] rounded-[2.5rem] border border-[#F88379] flex items-center justify-center p-8 shadow-xs">
              {discountPercent && (
                <span className="absolute right-6 top-6 z-10 rounded-full bg-[#005F6B] px-3.5 py-1.5 text-xs font-bold text-white uppercase tracking-wider shadow-xs">
                  -{discountPercent}% OFF
                </span>
              )}
              
              <Image
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name}
                fill
                className="object-contain p-4 transition-transform duration-500 hover:scale-105"
                priority
              />
            </div>

            {/* Thumbnail Row */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                {product.images.map((img, index) => {
                  const isActive = index === activeImageIndex;
                  return (
                    <button
                      key={img}
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all bg-[#F2D4D7] ${
                        isActive
                          ? "border-[#005F6B] scale-105 shadow-xs"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        fill
                        className="object-contain p-1"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Details Right (6 cols) */}
          <div className="lg:col-span-6 flex flex-col space-y-6">
            
            {/* Brand & Title */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#005F6B] text-white flex items-center justify-center text-[10px] font-bold font-playfair">D</span>
                <span className="text-xs font-bold text-[#F88379] uppercase tracking-widest">DeRoma Women's Boutique</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#005F6B] font-playfair tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Star rating */}
              <div className="flex items-center gap-2 pt-1">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-bold text-[#005F6B]">4.9</span>
                <span className="text-xs text-[#F88379]">(25k+ Total Reviews)</span>
              </div>
            </div>

            {/* Price Row */}
            <div className="flex items-baseline gap-x-3 py-3 border-y border-[#F88379]">
              <span className="text-3xl font-extrabold text-[#005F6B]">
                {formatCurrency(priceNum)}
              </span>
              {compareAtPriceNum && (
                <span className="text-sm text-[#F88379] line-through">
                  {formatCurrency(compareAtPriceNum)}
                </span>
              )}
            </div>

            {/* Description Brief */}
            {product.description && (
              <p className="text-xs sm:text-sm text-[#F88379] leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Color Selector */}
            {uniqueColors.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#005F6B]">Color:</span>
                  <span className="text-[#F88379]">{COLOR_TRANSLATIONS[selectedColor] || selectedColor}</span>
                </div>
                <div className="flex gap-2.5">
                  {uniqueColors.map((color) => {
                    const hexColor = getColorHex(color);
                    const isSelected = color === selectedColor;
                    return (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedColor(color);
                          setSelectedSize("");
                        }}
                        className={`h-9 w-9 rounded-full border-2 transition-all flex items-center justify-center ${
                          isSelected
                            ? "scale-110 border-[#005F6B] ring-2 ring-[#005F6B] ring-offset-2"
                            : "border-stone-300 hover:scale-105"
                        }`}
                        style={{ backgroundColor: hexColor }}
                        aria-label={`Select color ${color}`}
                      >
                        {isSelected && (
                          <Check className={`h-4 w-4 ${color === "أبيض" ? "text-[#005F6B]" : "text-white"}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector (EU Women) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#005F6B]">Select Size (Women)</span>
                
                {/* Size Unit Selector */}
                <div className="flex items-center gap-1 bg-[#F2D4D7] p-1 rounded-full text-[10px] font-bold">
                  {(["EU", "US", "CM"] as const).map((unit) => (
                    <button
                      key={unit}
                      onClick={() => setSizeUnit(unit)}
                      className={`px-2.5 py-0.5 rounded-full transition-all ${
                        sizeUnit === unit ? "bg-[#005F6B] text-white shadow-xs" : "text-[#F88379]"
                      }`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Grid */}
              <div className="grid grid-cols-5 gap-2">
                {sizesForColor.map((variant) => {
                  const isSelected = variant.size === selectedSize;
                  const isOutOfStock = variant.stock <= 0;
                  return (
                    <button
                      key={variant.id}
                      disabled={isOutOfStock}
                      onClick={() => setSelectedSize(variant.size)}
                      className={`h-11 rounded-2xl text-xs font-bold transition-all border flex items-center justify-center ${
                        isOutOfStock
                          ? "bg-stone-100 border-stone-200 text-stone-300 line-through cursor-not-allowed"
                          : isSelected
                          ? "bg-[#005F6B] border-[#005F6B] text-white shadow-xs scale-102"
                          : "bg-white border-[#F88379] text-[#005F6B] hover:bg-[#F2D4D7]"
                      }`}
                    >
                      {variant.size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity & CTA Row */}
            <div className="flex flex-col space-y-3 pt-2">
              <div className="flex items-center gap-3">
                {/* Quantity Toggle */}
                <div className="flex items-center rounded-full border border-[#F88379] bg-white px-3 py-1.5">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-1 text-[#F88379] hover:text-[#005F6B]"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-[#005F6B]">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-1 text-[#F88379] hover:text-[#005F6B]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Primary Buy Now Burgundy Button */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex h-12 items-center justify-center gap-2 rounded-full bg-[#F88379] text-xs font-bold text-[#FFF9EB] hover:bg-[#E56F65] transition-all shadow-md active:scale-98"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Buy Now</span>
                </button>

                {/* Wishlist Button */}
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="h-12 w-12 rounded-full border border-[#F88379] bg-white flex items-center justify-center text-[#F88379] hover:bg-[#F2D4D7] transition-colors shadow-xs"
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? "fill-[#F88379] text-[#F88379]" : "text-[#F88379]"}`} />
                </button>
              </div>

              {/* Secondary Add to Cart */}
              {added ? (
                <button className="w-full flex h-12 items-center justify-center gap-2 rounded-full bg-emerald-600 text-xs font-bold text-white shadow-xs">
                  <Check className="h-4 w-4" />
                  <span>Added to Shopping Cart!</span>
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="w-full flex h-12 items-center justify-center gap-2 rounded-full border border-[#005F6B] bg-white text-xs font-bold text-[#005F6B] hover:bg-[#F2D4D7] transition-colors"
                >
                  <span>Add To Cart</span>
                </button>
              )}
            </div>

            {/* Delivery Guarantee Banner */}
            <div className="rounded-2xl bg-[#F2D4D7] border border-[#F88379] p-4 flex items-center gap-3 text-[#005F6B] text-xs font-medium">
              <Truck className="h-5 w-5 text-[#005F6B] shrink-0" />
              <span>Free Express Delivery On Orders Over $150 & Doorstep fitting guarantee</span>
            </div>

            {/* Accordions */}
            <div className="border-t border-[#F88379] pt-2 space-y-2">
              {[
                { id: "description", label: "Product Description", text: product.description || "Crafted with luxury imported leathers, ergonomic cushioned insoles, and high-durability outer soles designed for all-day comfort." },
                { id: "shipping", label: "Shipping & Doorstep Fitting", text: "Express shipping available across all governorates within 24-48 hours. Try on your shoes at your doorstep before payment." },
                { id: "reviews", label: "Customer Reviews (25k+)", text: "Rated 4.9/5 stars based on verified customer purchases." },
              ].map((acc) => {
                const isOpen = activeAccordion === acc.id;
                return (
                  <div key={acc.id} className="border-b border-[#F88379] pb-3 pt-1">
                    <button
                      onClick={() => setActiveAccordion(isOpen ? null : acc.id)}
                      className="w-full flex items-center justify-between text-xs font-bold text-[#005F6B] py-1"
                    >
                      <span>{acc.label}</span>
                      {isOpen ? <ChevronUp className="h-4 w-4 text-[#F88379]" /> : <ChevronDown className="h-4 w-4 text-[#F88379]" />}
                    </button>
                    {isOpen && (
                      <p className="text-xs text-[#F88379] pt-2 leading-relaxed font-sans">
                        {acc.text}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section className="mx-auto w-full max-w-[94vw] lg:max-w-[1400px] px-2 sm:px-4 lg:px-6 border-t border-[#F88379] pt-12 space-y-6">
          <h2 className="text-xl font-extrabold text-[#005F6B] font-playfair">You May Also Like</h2>
          <div className="grid grid-cols-2 gap-2 sm:gap-6 md:grid-cols-4">
            {similarProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
