"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  Check,
  Shield,
  Truck,
  Heart,
  Star,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Send,
  X,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/lib/cartStore";
import { useWishlist } from "@/lib/wishlistStore";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/lib/useIsMobile";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ScrollReveal";
import ProductCard, { ProductWithVariants, COLOR_TRANSLATIONS } from "@/components/ProductCard";
import { submitReviewAction } from "@/app/review-actions";
import { trackAddToWishlist, trackViewItem } from "@/lib/analytics";

import { useStoreI18n } from "@/providers/StoreI18nContext";

export interface ProductReviewView {
  id: string | number;
  name: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

interface ProductDetailClientProps {
  product: ProductWithVariants;
  similarProducts: ProductWithVariants[];
  reviews?: ProductReviewView[];
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
      return "#111111";
    case "أحمر":
    case "Red":
      return "#C0392B";
    case "Burgundy":
      return "#6F1F2D";
    case "Cream Burgundy":
      return "#E7DDC7";
    case "Grey":
      return "#8E8E86";
    case "Navy":
      return "#1F365D";
    case "Pastel Pink":
      return "#F0B8B8";
    case "Silver":
      return "#C4C8CE";
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

export default function ProductDetailClient({ product, similarProducts, reviews = [] }: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { t, formatPrice, formatNumber, dir, lang } = useStoreI18n();
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryZoom, setGalleryZoom] = useState(1);
  const [galleryMounted, setGalleryMounted] = useState(false);
  const galleryTouchStartX = useRef<number | null>(null);
  const [added, setAdded] = useState(false);
  const { has, toggle } = useWishlist();
  const isWishlisted = has(product.id);
  const uniqueColors: string[] = [];
  const [selectedColor, setSelectedColor] = useState(product.color || "");
  const isBag = product.category === "bags";
  const sizesForColor = product.variants;
  const currentColorImages = product.images;

  useEffect(() => {
    setGalleryMounted(true);
  }, []);

  useEffect(() => {
    if (!isGalleryOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsGalleryOpen(false);
        setGalleryZoom(1);
      }
      if (event.key === "ArrowLeft") {
        setActiveImageIndex((index) => (index - 1 + currentColorImages.length) % currentColorImages.length);
        setGalleryZoom(1);
      }
      if (event.key === "ArrowRight") {
        setActiveImageIndex((index) => (index + 1) % currentColorImages.length);
        setGalleryZoom(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isGalleryOpen, currentColorImages.length]);

  const openGallery = (index: number) => {
    setActiveImageIndex(index);
    setGalleryZoom(1);
    setIsGalleryOpen(true);
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
    setGalleryZoom(1);
  };

  const changeGalleryImage = (direction: -1 | 1) => {
    if (currentColorImages.length < 2) return;
    setActiveImageIndex((index) => (index + direction + currentColorImages.length) % currentColorImages.length);
    setGalleryZoom(1);
  };

  const adjustGalleryZoom = (amount: number) => {
    setGalleryZoom((zoom) => Math.min(3, Math.max(1, Number((zoom + amount).toFixed(2)))));
  };
  const stockRemainingLabel = lang === "ar" ? "المتبقي" : "Remaining";
  const stockLeftLabel = lang === "ar" ? "متبقي" : "left";

  const [shippingSettings, setShippingSettings] = useState<{
    freeShippingEnabled: boolean;
    freeShippingThreshold: number | null;
  } | null>(null);

  useEffect(() => {
    fetch("/api/shipping")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings) {
          setShippingSettings(data.settings);
        }
      })
      .catch(() => null);
  }, []);

  const isFreeShippingActive = Boolean(
    shippingSettings?.freeShippingEnabled &&
      shippingSettings.freeShippingThreshold !== null &&
      shippingSettings.freeShippingThreshold > 0
  );

  const deliveryBannerText = isFreeShippingActive
    ? (lang === "ar"
        ? `شحن سريع مجاني للطلبات أكثر من ${formatPrice(shippingSettings!.freeShippingThreshold!)}`
        : `Free Express Delivery On Orders Over ${formatPrice(shippingSettings!.freeShippingThreshold!)}`)
    : (lang === "ar" ? "شحن سريع وموثوق إلى جميع محافظات مصر" : "Fast Express Delivery Across Egypt");

  const isTotalSoldOut = product.variants.length > 0 && product.variants.every((v) => v.stock <= 0);

  const activeVariant = isBag
    ? product.variants[0]
    : product.variants.find((v) => v.size === selectedSize);
  const maxQuantity = activeVariant?.stock ?? 0;


  const priceNum = Number(activeVariant?.price ?? product.price);
  const compareAtPriceNum = activeVariant?.compareAtPrice != null
    ? Number(activeVariant.compareAtPrice)
    : product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const discountPercent = compareAtPriceNum
    ? Math.round(((compareAtPriceNum - priceNum) / compareAtPriceNum) * 100)
    : null;
  const analyticsItem = {
    productId: product.id,
    variantId: activeVariant?.id,
    name: product.name,
    price: priceNum,
    category: product.category,
    color: product.color || "",
    size: isBag ? "" : selectedSize,
  };

  useEffect(() => {
    trackViewItem({
      productId: product.id,
      variantId: activeVariant?.id,
      name: product.name,
      price: priceNum,
      category: product.category,
      color: product.color || "",
      size: isBag ? "" : selectedSize,
    });
  }, [product.id]);

  const handleWishlistToggle = () => {
    if (!isWishlisted) {
      trackAddToWishlist(analyticsItem);
    }
    toggle(product.id);
  };

  const handleAddToCart = () => {
    if (!isBag && !selectedSize) {
      alert(lang === "ar" ? "يرجى اختيار مقاس الحذاء أولاً." : "Please select your shoe size first.");
      return;
    }

    if (!activeVariant) return;

    addItem({
      productId: product.id,
      variantId: activeVariant.id,
      name: product.name,
      price: priceNum,
      image: product.images[0],
      color: product.color || "",
      size: isBag ? "" : selectedSize,
      quantity,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!isBag && !selectedSize) {
      alert(lang === "ar" ? "يرجى اختيار مقاس الحذاء أولاً." : "Please select your shoe size first.");
      return;
    }

    if (!activeVariant) return;

    addItem({
      productId: product.id,
      variantId: activeVariant.id,
      name: product.name,
      price: priceNum,
      image: product.images[0],
      color: product.color || "",
      size: isBag ? "" : selectedSize,
      quantity,
    });

    router.push("/checkout");
  };

  const ratingBreakdown = [
    { stars: 5, percentage: 82 },
    { stars: 4, percentage: 12 },
    { stars: 3, percentage: 4 },
    { stars: 2, percentage: 1 },
    { stars: 1, percentage: 1 },
  ];

  return (
    <div className="pdp-page w-full flex flex-col pb-16 sm:pb-24 bg-[#FFF9EB] text-[#942E3A]" dir={dir}>
      
      {/* Breadcrumbs */}
      <ScrollReveal direction="none" duration={0.5}>
        <nav className="pdp-breadcrumb mx-auto w-full max-w-[1400px] px-4 lg:px-6 pt-3 sm:pt-4">
          <ol className="flex items-center gap-x-1.5 text-[11px] sm:text-xs font-bold text-[#D8B46A]">
            <li>
              <Link href="/" className="hover:text-[#942E3A] transition-colors">{t("nav.home")}</Link>
            </li>
            <ChevronRight className={`h-3 w-3 text-[#D8B46A] shrink-0 ${dir === "rtl" ? "rotate-180" : ""}`} />
            <li>
              <Link href="/shop" className="hover:text-[#942E3A] transition-colors">{t("nav.shop")}</Link>
            </li>
            <ChevronRight className={`h-3 w-3 text-[#D8B46A] shrink-0 ${dir === "rtl" ? "rotate-180" : ""}`} />
            <li className="text-[#942E3A] truncate">
              {product.name}
            </li>
          </ol>
        </nav>
      </ScrollReveal>

      {/* Main PDP Grid */}
      <section className="pdp-shell mx-auto w-full max-w-[1400px] px-4 lg:px-6 mt-3 sm:mt-6">
        <StaggerContainer className="pdp-layout">
          
          {/* Gallery Left */}
          <StaggerItem direction="left" className="pdp-gallery flex flex-col gap-3 w-full max-w-[480px] lg:max-w-[540px] mx-auto">
            {/* Main Image */}
            <div
              className={`pdp-main-image group relative w-full pt-[100%] rounded-2xl sm:rounded-[2rem] border border-[#942E3A]/20 overflow-hidden bg-[#F2E7D5]/20 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D8B46A] focus-visible:ring-offset-2 ${
              isTotalSoldOut ? "grayscale opacity-80" : ""
              }`}
              role="button"
              tabIndex={0}
              aria-label={lang === "ar" ? "فتح معرض صور المنتج" : "Open product image gallery"}
              onClick={() => openGallery(activeImageIndex)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openGallery(activeImageIndex);
                }
              }}
            >
              {isTotalSoldOut ? (
                <span className="product-detail-discount-badge absolute right-3 top-3 sm:right-5 sm:top-5 z-15 rounded-full bg-red-700 px-3 py-1 text-[11px] sm:text-xs font-black text-white uppercase tracking-wider shadow-md">
                  {t("productCard.soldOut")}
                </span>
              ) : discountPercent ? (
                <span className="product-detail-discount-badge absolute right-3 top-3 sm:right-5 sm:top-5 z-15 rounded-full bg-[#942E3A] px-3 py-1 text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider shadow-sm">
                  {lang === "ar" ? `خصم ${discountPercent}%` : `-${discountPercent}% OFF`}
                </span>
              ) : null}

              
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selectedColor}-${activeImageIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 w-full h-full"
                >
                  <Image
                    src={currentColorImages[activeImageIndex] || currentColorImages[0]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              <span className="pointer-events-none absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-[#1f1114]/75 px-3 py-1.5 text-[10px] font-bold text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <Maximize2 className="h-3.5 w-3.5" />
                {lang === "ar" ? "اضغط للتكبير" : "Click to enlarge"}
              </span>
            </div>

            {/* Thumbnail Row */}
            {currentColorImages.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                {currentColorImages.map((img, index) => {
                  const isActive = index === activeImageIndex;
                  return (
                    <button
                      key={img}
                      onClick={() => setActiveImageIndex(index)}
                      aria-label={lang === "ar" ? `عرض الصورة ${index + 1}` : `View image ${index + 1}`}
                      aria-current={isActive ? "true" : undefined}
                      className={`relative h-[60px] w-[60px] sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                        isActive
                          ? "border-[#942E3A] shadow-sm"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </StaggerItem>

          {/* Details Right (6 cols) */}
          <StaggerItem direction="right" className="pdp-details flex flex-col gap-5 sm:gap-6 w-full max-w-[34rem] mx-auto lg:max-w-none">
            
            {/* Title */}
            <div className="w-full">
              <h1 className="text-[22px] sm:text-3xl lg:text-4xl font-extrabold text-[#942E3A] font-playfair tracking-tight leading-snug text-center">
                {product.name}
              </h1>

              {/* Star rating */}
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="font-numeric text-[11px] sm:text-xs font-bold text-[#942E3A]">
                  {formatNumber(product.rating ? product.rating.toFixed(1) : "4.8")}
                </span>
                <span className="font-numeric text-[11px] sm:text-xs text-[#D8B46A]">
                  ({formatNumber(product.reviewsCount ?? reviews.length)} {t("productDetail.reviews")})
                </span>
              </div>
            </div>

            {/* Price Row */}
            <div className="flex items-baseline justify-center gap-x-2.5 py-3 border-y border-[#D8B46A]/30 w-full">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#942E3A]">
                {formatPrice(priceNum)}
              </span>
              {compareAtPriceNum && (
                <span className="text-sm text-[#D8B46A] line-through">
                  {formatPrice(compareAtPriceNum)}
                </span>
              )}
            </div>

            {/* Description Brief */}
            {product.description && (
              <p className="text-[13px] sm:text-sm text-[#942E3A]/80 leading-relaxed text-center">
                {product.description}
              </p>
            )}

            {product.color && (
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#D8B46A]">
                <span>{t("cart.color")}:</span><span className="text-[#942E3A]">{product.color}</span>
              </div>
            )}

            {/* Color Selector */}
            {uniqueColors.length > 0 && (
              <div className="space-y-2 w-full">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xs font-bold text-[#D8B46A]">{t("productDetail.selectColor")}:</span>
                  <span className="text-xs font-bold text-[#D8B46A]">{COLOR_TRANSLATIONS[selectedColor] || selectedColor}</span>
                </div>
                <div className="flex justify-center gap-3">
                  {uniqueColors.map((color) => {
                    const hexColor = getColorHex(color);
                    const isSelected = color === selectedColor;
                    return (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedColor(color);
                          setSelectedSize("");
                          setQuantity(1);
                        }}
                        className={`h-10 w-10 rounded-full border-2 transition-all flex items-center justify-center ${
                          isSelected
                            ? "scale-110 border-[#942E3A] ring-2 ring-[#942E3A] ring-offset-2 ring-offset-[#FFF9EB]"
                            : "border-stone-300 hover:scale-105"
                        }`}
                        style={{ backgroundColor: hexColor }}
                        aria-label={`Select color ${color}`}
                      >
                        {isSelected && (
                          <Check className={`h-4 w-4 ${color === "أبيض" || color === "White" ? "text-[#942E3A]" : "text-white"}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {!isBag && <div className="space-y-3 w-full">
              <div className="flex items-center justify-center gap-3">
                <span className="text-xs font-bold text-[#942E3A]">{t("productDetail.selectSize")}</span>
              </div>

              {/* Size circles */}
              <div className="flex flex-wrap justify-center gap-2.5">
                {sizesForColor.map((variant) => {
                  const isSelected = variant.size === selectedSize;
                  const isOutOfStock = variant.stock <= 0;
                  return (
                    <button
                      key={variant.id}
                      disabled={isOutOfStock}
                      onClick={() => {
                        setSelectedSize(variant.size);
                        setQuantity(1);
                      }}
                      title={isOutOfStock ? t("productDetail.outOfStock") : `${stockRemainingLabel}: ${formatNumber(variant.stock)}`}
                      className={`group relative h-11 w-11 rounded-full text-xs font-bold transition-all border-2 flex items-center justify-center ${
                        isOutOfStock
                          ? "bg-stone-100 border-stone-200 text-stone-300 line-through cursor-not-allowed"
                          : isSelected
                          ? "bg-[#942E3A] border-[#942E3A] text-white shadow-md scale-105"
                          : "bg-white border-[#D8B46A] text-[#942E3A] hover:bg-[#F2E7D5]"
                      }`}
                    >
                      {formatNumber(variant.size)}
                      {!isOutOfStock && (
                        <span className="pointer-events-none absolute left-1/2 top-[calc(100%+0.25rem)] z-20 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-[#942E3A] px-1.5 py-0.5 text-[8px] font-medium text-white shadow-sm group-hover:block">
                          {formatNumber(variant.stock)} {stockLeftLabel}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {activeVariant && (
                <p className="text-center text-[10px] font-semibold text-[#942E3A]/65">
                  {formatNumber(activeVariant.stock)} {stockLeftLabel}
                </p>
              )}
            </div>}
            {isBag && (
              <div className="flex items-center justify-between rounded-2xl border border-[#D8B46A]/35 bg-[#FFF9EB] px-4 py-3 text-xs font-bold text-[#942E3A]">
                <span>{t("productDetail.quantity")}</span>
                <span>{product.variants[0]?.stock > 0 ? t("productDetail.inStock") : t("productDetail.outOfStock")}</span>
              </div>
            )}

            {/* Quantity + Add To Cart & Buy Now Rows */}
            {isTotalSoldOut ? (
              <div className="flex items-center justify-between gap-3 py-2 w-full">
                <div className="flex-1 flex h-13 items-center justify-center gap-2 rounded-full bg-stone-400 text-sm font-extrabold text-white uppercase tracking-wider shadow-inner cursor-not-allowed border border-stone-500">
                        <span>{t("productDetail.outOfStock")}</span>
                </div>

                {/* Wishlist */}
                <button
                  onClick={handleWishlistToggle}
                  className="h-13 w-13 rounded-full border border-[#D8B46A] bg-white flex items-center justify-center text-[#D8B46A] hover:bg-[#F2E7D5] transition-colors shrink-0 shadow-sm"
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? "fill-[#942E3A] text-[#942E3A]" : "text-[#D8B46A]"}`} />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center gap-3 py-1 w-full">
                  <div className="flex items-center rounded-full border border-[#D8B46A] bg-white h-11 px-2.5 shrink-0">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-1.5 text-[#D8B46A] hover:text-[#942E3A] transition-colors"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="font-numeric w-8 text-center text-xs font-bold text-[#942E3A]">{quantity}</span>
                    <button
                      onClick={() => {
                        setQuantity((q) => Math.min(maxQuantity, q + 1));
                      }}
                      disabled={!activeVariant || quantity >= maxQuantity}
                      className="p-1.5 text-[#D8B46A] hover:text-[#942E3A] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {added ? (
                    <button className="flex-1 flex h-12 items-center justify-center gap-2 rounded-full bg-emerald-600 text-sm font-bold text-white shadow-sm">
                      <Check className="h-4 w-4" />
                      <span>{t("productDetail.addedToCart")}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 flex h-12 items-center justify-center gap-2 rounded-full bg-[#D8B46A] text-sm font-bold text-[#FFF9EB] hover:bg-[#B8934A] transition-all shadow-md active:scale-[0.98] min-w-0"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      <span>{t("productDetail.addToCart")}</span>
                    </button>
                  )}
                </div>

                {/* Buy Now + Wishlist Row */}
                <div className="flex items-center justify-center gap-3 pt-1">
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 flex h-12 items-center justify-center gap-2 rounded-full bg-[#942E3A] text-sm font-bold text-white hover:bg-[#7a2430] transition-all shadow-md active:scale-[0.98] min-w-0"
                  >
                    <span>{t("productCard.buyNow", lang === "ar" ? "اشتري الآن" : "Buy Now")}</span>
                  </button>

                  {/* Wishlist */}
                  <button
                    onClick={handleWishlistToggle}
                    className="h-12 w-12 rounded-full border border-[#D8B46A] bg-white flex items-center justify-center text-[#D8B46A] hover:bg-[#F2E7D5] transition-colors shrink-0 shadow-sm"
                  >
                    <Heart className={`h-5 w-5 ${isWishlisted ? "fill-[#942E3A] text-[#942E3A]" : "text-[#D8B46A]"}`} />
                  </button>
                </div>
              </>
            )}


            {/* Delivery Guarantee Banner */}
            <div className="rounded-xl bg-[#F2E7D5]/50 border border-[#D8B46A]/40 p-3.5 flex items-center justify-center gap-3 text-[#942E3A] text-xs font-medium text-center">
              <Truck className="h-5 w-5 text-[#942E3A] shrink-0" />
              <span>{deliveryBannerText}</span>
            </div>

          </StaggerItem>
        </StaggerContainer>
      </section>

      {/* Reviews Section */}
      <ScrollReveal className="mt-10 sm:mt-14">
        <ReviewsSection ratingBreakdown={ratingBreakdown} product={product} reviews={reviews} />
      </ScrollReveal>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <ScrollReveal>
          <section className="mx-auto w-full max-w-[1400px] px-4 lg:px-6 border-t border-[#D8B46A]/30 pt-8 sm:pt-12 mt-10 sm:mt-14">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#942E3A] font-playfair mb-4 sm:mb-6 text-center">{t("productDetail.relatedProducts")}</h2>
            <div 
              className="flex overflow-x-auto flex-nowrap gap-3 sm:gap-6 py-4 px-1 no-scrollbar justify-start md:justify-center"
              style={{ 
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
                msOverflowStyle: "none"
              }}
            >
              {similarProducts.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="h-full w-[calc((94vw-20px)/2)] sm:w-[230px] shrink-0 pointer-events-auto"
                >
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>
      )}

      {galleryMounted && createPortal(
        <AnimatePresence>
          {isGalleryOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100000] flex items-center justify-center bg-[#160d10]/90 p-2 backdrop-blur-md sm:p-6"
              role="dialog"
              aria-modal="true"
              aria-label={lang === "ar" ? "معرض صور المنتج" : "Product image gallery"}
              onClick={closeGallery}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                transition={{ type: "spring", damping: 28, stiffness: 260 }}
                className="flex max-h-[calc(100dvh-1rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[1.5rem] border border-white/15 bg-[#241417]/95 p-3 text-white shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:rounded-[2rem] sm:p-5"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-center justify-between gap-3 px-1 pb-3 sm:px-2 sm:pb-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold sm:text-base">{product.name}</p>
                    <p className="mt-0.5 text-[10px] font-medium text-white/55 sm:text-xs">
                      {activeImageIndex + 1} / {currentColorImages.length}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => adjustGalleryZoom(-0.25)}
                      disabled={galleryZoom <= 1}
                      aria-label={lang === "ar" ? "تصغير الصورة" : "Zoom out"}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </button>
                    <span className="hidden min-w-11 text-center text-[11px] font-bold text-white/70 sm:inline-block">
                      {Math.round(galleryZoom * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustGalleryZoom(0.25)}
                      disabled={galleryZoom >= 3}
                      aria-label={lang === "ar" ? "تكبير الصورة" : "Zoom in"}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setGalleryZoom(1)}
                      disabled={galleryZoom === 1}
                      aria-label={lang === "ar" ? "إعادة ضبط التكبير" : "Reset zoom"}
                      className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-35 sm:flex"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={closeGallery}
                      aria-label={lang === "ar" ? "إغلاق المعرض" : "Close gallery"}
                      className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#241417] transition hover:bg-[#F2E7D5] sm:ml-2"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div
                  className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[1.1rem] bg-black/20"
                  onWheel={(event) => {
                    event.preventDefault();
                    adjustGalleryZoom(event.deltaY < 0 ? 0.25 : -0.25);
                  }}
                  onTouchStart={(event) => {
                    galleryTouchStartX.current = event.touches[0]?.clientX ?? null;
                  }}
                  onTouchEnd={(event) => {
                    const startX = galleryTouchStartX.current;
                    const endX = event.changedTouches[0]?.clientX;
                    galleryTouchStartX.current = null;
                    if (startX === null || endX === undefined || Math.abs(endX - startX) < 45) return;
                    changeGalleryImage(endX < startX ? 1 : -1);
                  }}
                  onDoubleClick={() => setGalleryZoom((zoom) => zoom === 1 ? 2 : 1)}
                >
                  <Image
                    src={currentColorImages[activeImageIndex] || currentColorImages[0]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 90vw"
                    className="select-none object-contain p-2 transition-transform duration-200 sm:p-6"
                    style={{ transform: `scale(${galleryZoom})` }}
                    draggable={false}
                  />

                  {currentColorImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => changeGalleryImage(-1)}
                        aria-label={lang === "ar" ? "الصورة السابقة" : "Previous image"}
                        className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/65 sm:left-4 sm:h-12 sm:w-12"
                      >
                        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                      </button>
                      <button
                        type="button"
                        onClick={() => changeGalleryImage(1)}
                        aria-label={lang === "ar" ? "الصورة التالية" : "Next image"}
                        className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/65 sm:right-4 sm:h-12 sm:w-12"
                      >
                        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                      </button>
                    </>
                  )}

                  <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/45 px-3 py-1.5 text-[10px] font-medium text-white/75 backdrop-blur-sm sm:bottom-4 sm:text-xs">
                    {lang === "ar" ? "اسحب للتنقل • اضغط مرتين للتكبير" : "Swipe to navigate • Double-click to zoom"}
                  </span>
                </div>

                {currentColorImages.length > 1 && (
                  <div className="mt-3 flex shrink-0 gap-2 overflow-x-auto px-1 pb-1 sm:mt-4 sm:justify-center sm:gap-2.5" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                    {currentColorImages.map((img, index) => (
                      <button
                        type="button"
                        key={`${img}-${index}`}
                        onClick={() => {
                          setActiveImageIndex(index);
                          setGalleryZoom(1);
                        }}
                        aria-label={lang === "ar" ? `عرض الصورة ${index + 1}` : `View image ${index + 1}`}
                        aria-current={index === activeImageIndex ? "true" : undefined}
                        className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-16 sm:w-16 ${index === activeImageIndex ? "border-[#D8B46A] opacity-100" : "border-transparent opacity-50 hover:opacity-100"}`}
                      >
                        <Image src={img} alt="" fill sizes="64px" className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

// ── Reviews Section Component ──
function ReviewsSection({ 
  ratingBreakdown,
  product,
  reviews: storedReviews,
}: { 
  ratingBreakdown: { stars: number; percentage: number }[];
  product: ProductWithVariants;
  reviews: ProductReviewView[];
}) {
  const { lang, formatNumber } = useStoreI18n();
  const reviewCopy = lang === "ar"
    ? {
        title: "آراء العملاء",
        write: "اكتب تقييمًا",
        basedOn: "بناءً على",
        reviews: "تقييم",
        noReviews: "لا توجد تقييمات لهذا المنتج. كن أول من يشارك تجربته!",
        modalTitle: "اكتب تقييمًا",
        yourRating: "تقييمك",
        yourName: "اسمك",
        namePlaceholder: "اكتب اسمك",
        yourReview: "تقييمك للمنتج",
        reviewPlaceholder: "شاركنا تجربتك مع هذا المنتج...",
        submit: "إرسال التقييم",
      }
    : {
        title: "Customer Reviews",
        write: "Write a Review",
        basedOn: "Based on",
        reviews: "reviews",
        noReviews: "No reviews yet for this product. Be the first to share your experience!",
        modalTitle: "Write a Review",
        yourRating: "Your Rating",
        yourName: "Your Name",
        namePlaceholder: "Enter your name",
        yourReview: "Your Review",
        reviewPlaceholder: "Share your experience with this product...",
        submit: "Submit Review",
      };
  const isMobile = useIsMobile();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewName, setReviewName] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviews, setReviews] = useState<ProductReviewView[]>(storedReviews);
  const actualReviewsCount = product.reviewsCount ?? reviews.length;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (showReviewForm) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showReviewForm]);

  const scrollLeft = () => {
    const container = document.getElementById("reviews-carousel");
    if (container) container.scrollBy({ left: -320, behavior: isMobile ? "auto" : "smooth" });
  };

  const scrollRight = () => {
    const container = document.getElementById("reviews-carousel");
    if (container) container.scrollBy({ left: 320, behavior: isMobile ? "auto" : "smooth" });
  };

  const handleSubmitReview = async () => {
    if (!reviewName.trim() || !reviewComment.trim() || newReviewRating === 0) return;

    const result = await submitReviewAction({ productId: product.id, customerName: reviewName, rating: newReviewRating, body: reviewComment });
    if (!result.success) return;

    const newReview = {
      id: reviews.length + 1,
      name: reviewName,
      avatar: reviewName.charAt(0).toUpperCase(),
      rating: newReviewRating,
      date: "Just now",
      comment: reviewComment,
    };

    setReviews([newReview, ...reviews]);
    setShowReviewForm(false);
    setReviewName("");
    setReviewComment("");
    setNewReviewRating(0);
  };

  return (
    <section className="mx-auto w-full max-w-[1400px] px-4 lg:px-6 border-t border-[#D8B46A]/30 pt-8 sm:pt-12">
      <div className="space-y-6 sm:space-y-8">
        {/* Reviews Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#942E3A] font-playfair">{reviewCopy.title}</h2>
            <p className="text-[11px] sm:text-xs text-[#D8B46A] mt-1">
              {formatNumber(actualReviewsCount)} {lang === "ar" ? "تقييم موثق" : "verified reviews"}
            </p>
          </div>
          <button
            onClick={() => setShowReviewForm(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#942E3A] text-[11px] sm:text-xs font-bold text-white hover:bg-[#7a2430] transition-all shadow-md shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
            {reviewCopy.write}
          </button>
        </div>

        {/* Rating Summary - Horizontal on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-stretch gap-4 sm:gap-6">
          {/* Overall Rating */}
          <div className="flex items-center gap-4 sm:flex-col sm:items-center sm:justify-center p-4 sm:p-6 rounded-2xl bg-[#F2E7D5]/50 border border-[#D8B46A]/30 sm:min-w-[180px]">
            <span className="text-5xl sm:text-6xl font-extrabold text-[#942E3A] font-playfair leading-none">
              {product.rating ? product.rating.toFixed(1) : "4.8"}
            </span>
            <div>
              <div className="flex text-amber-400">
                {[...Array(Math.round(product.rating || 4.8))].map((_, i) => (
                  <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-amber-400 text-amber-400" />
                ))}
                {[...Array(5 - Math.round(product.rating || 4.8))].map((_, i) => (
                  <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 text-amber-200" />
                ))}
              </div>
              <span className="text-[11px] sm:text-xs text-[#D8B46A] mt-1 block sm:text-center">
                {reviewCopy.basedOn} {formatNumber(actualReviewsCount)} {reviewCopy.reviews}
              </span>
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="hidden sm:flex flex-1 flex-col justify-center space-y-1.5 sm:space-y-2.5">
            {ratingBreakdown.map((item) => (
              <div key={item.stars} className="flex items-center gap-2.5">
                <div className="flex items-center gap-1 w-10 sm:w-14 shrink-0">
                  <span className="text-xs font-bold text-[#942E3A]">{item.stars}</span>
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                </div>
                <div className="flex-1 h-2 sm:h-2.5 bg-[#F2E7D5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-700"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-[11px] sm:text-xs font-medium text-[#D8B46A] w-8 text-right">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Horizontal Swipeable Reviews Carousel */}
        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-[#D8B46A]/25 bg-white/70 p-8 text-center text-xs font-bold text-[#942E3A]">
            {reviewCopy.noReviews}
          </div>
        ) : (
          <div className="relative">
            {/* Navigation Arrows */}
            <button
              onClick={scrollLeft}
              className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white border border-[#D8B46A] shadow-md flex items-center justify-center text-[#942E3A] hover:bg-[#F2E7D5] transition-colors hidden md:flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={scrollRight}
              className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white border border-[#D8B46A] shadow-md flex items-center justify-center text-[#942E3A] hover:bg-[#F2E7D5] transition-colors hidden md:flex"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Scrollable Row */}
            <div
              id="reviews-carousel"
              className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="min-w-[280px] max-w-[280px] sm:min-w-[300px] sm:max-w-[300px] flex-shrink-0 snap-start p-4 rounded-xl bg-white/70 border border-[#D8B46A]/20 hover:border-[#D8B46A]/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="h-10 w-10 rounded-full bg-[#942E3A] flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {review.avatar}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-[#942E3A]">{review.name}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < review.rating ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-[#D8B46A]">{review.date}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#942E3A]/80 leading-relaxed mt-3 line-clamp-4">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Write a Review Modal */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {showReviewForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={() => setShowReviewForm(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="w-full sm:max-w-md bg-[#FFF9EB] rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#D8B46A]/30 max-h-[90vh] overflow-y-auto relative my-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-extrabold text-[#942E3A] font-playfair">{reviewCopy.modalTitle}</h3>
                    <button
                      onClick={() => setShowReviewForm(false)}
                      className="h-8 w-8 rounded-full bg-[#F2E7D5] flex items-center justify-center text-[#942E3A] hover:bg-[#D8B46A]/30 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Star Rating Picker */}
                  <div className="mb-5">
                    <label className="text-xs font-bold text-[#942E3A] mb-2 block">{reviewCopy.yourRating}</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setNewReviewRating(star)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-7 w-7 ${
                              star <= (hoverRating || newReviewRating)
                                ? "fill-amber-400 text-amber-400"
                                : "fill-stone-200 text-stone-200"
                            } transition-colors`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name Input */}
                  <div className="mb-4">
                    <label className="text-xs font-bold text-[#942E3A] mb-1.5 block">{reviewCopy.yourName}</label>
                    <input
                      type="text"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder={reviewCopy.namePlaceholder}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#D8B46A]/40 bg-white text-sm text-[#942E3A] placeholder:text-[#D8B46A]/50 focus:outline-none focus:ring-2 focus:ring-[#942E3A]/30 focus:border-[#942E3A] transition-all"
                    />
                  </div>

                  {/* Comment Input */}
                  <div className="mb-6">
                    <label className="text-xs font-bold text-[#942E3A] mb-1.5 block">{reviewCopy.yourReview}</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder={reviewCopy.reviewPlaceholder}
                      rows={4}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#D8B46A]/40 bg-white text-sm text-[#942E3A] placeholder:text-[#D8B46A]/50 focus:outline-none focus:ring-2 focus:ring-[#942E3A]/30 focus:border-[#942E3A] transition-all resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmitReview}
                    disabled={!reviewName.trim() || !reviewComment.trim() || newReviewRating === 0}
                    className="w-full flex items-center justify-center gap-2 h-12 rounded-full bg-[#942E3A] text-sm font-bold text-white hover:bg-[#7a2430] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                    {reviewCopy.submit}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </section>
  );
}
