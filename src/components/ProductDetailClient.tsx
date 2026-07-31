"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  X
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/lib/cartStore";
import { useWishlist } from "@/lib/wishlistStore";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/lib/useIsMobile";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ScrollReveal";
import ProductCard, { ProductWithVariants, COLOR_TRANSLATIONS } from "@/components/ProductCard";
import { submitReviewAction } from "@/app/review-actions";

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

// Mock reviews data
const MOCK_REVIEWS = [
  {
    id: 1,
    name: "Sarah Ahmed",
    avatar: "S",
    rating: 5,
    date: "2 weeks ago",
    comment: "Absolutely love these shoes! Super comfortable and the color is exactly as shown. I wore them all day without any discomfort. Highly recommend!",
  },
  {
    id: 2,
    name: "Nour Mohamed",
    avatar: "N",
    rating: 5,
    date: "1 month ago",
    comment: "Best sneakers I've ever bought! The quality is amazing and they fit perfectly. The cushioning is so soft, perfect for my daily walks.",
  },
  {
    id: 3,
    name: "Fatma Hassan",
    avatar: "F",
    rating: 4,
    date: "1 month ago",
    comment: "Great quality and very stylish. Took a day to break in but now they're my go-to shoes. The doorstep fitting service was a nice touch!",
  },
  {
    id: 4,
    name: "Mariam Ali",
    avatar: "M",
    rating: 5,
    date: "2 months ago",
    comment: "I ordered two pairs in different colors! The delivery was fast and the quality exceeded my expectations. Will definitely order again.",
  },
  {
    id: 5,
    name: "Yasmin Khaled",
    avatar: "Y",
    rating: 5,
    date: "3 months ago",
    comment: "These are so lightweight and comfortable. I get compliments every time I wear them. The packaging was also very premium.",
  },
];

export default function ProductDetailClient({ product, similarProducts, reviews = [] }: ProductDetailClientProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const productColors = Array.from(new Set(product.variants.map((v) => v.color)));
  const colorwayOptions =
    product.colorways && product.colorways.length > 0
      ? product.colorways
      : productColors.map((color) => ({
          productId: product.id,
          color,
          label: COLOR_TRANSLATIONS[color] || color,
          hex: getColorHex(color),
          image: product.images[productColors.indexOf(color)] || product.images[0],
          name: product.name,
        }));
  const uniqueColors = colorwayOptions.map((colorway) => colorway.color);
  
  const [selectedColor, setSelectedColor] = useState(productColors[0] || uniqueColors[0] || "");
  const [selectedSize, setSelectedSize] = useState("");
  const [sizeUnit, setSizeUnit] = useState<"EU" | "US" | "CM">("EU");
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const { has, toggle } = useWishlist();
  const isWishlisted = has(product.id);

  // Build a color -> images mapping
  // Each color gets a subset of images. Since the current data structure maps images by index to colors,
  // we assign images proportionally. If only 1 image per color, each color gets its corresponding image.
  // For fallback: color at index i -> image at index i
  const getImagesForColor = (color: string): string[] => {
    const colorway = colorwayOptions.find((item) => item.color === color);
    if (colorway) {
      return [colorway.productId === product.id ? product.images[0] || colorway.image : colorway.image];
    }

    const colorIdx = uniqueColors.indexOf(color);
    if (colorIdx === -1) return [product.images[0]];
    
    // If we have exactly as many images as colors, 1 image per color
    if (product.images.length === uniqueColors.length) {
      return [product.images[colorIdx]];
    }
    
    // If more images than colors, distribute proportionally
    const imagesPerColor = Math.max(1, Math.floor(product.images.length / uniqueColors.length));
    const startIdx = colorIdx * imagesPerColor;
    const endIdx = colorIdx === uniqueColors.length - 1 
      ? product.images.length 
      : startIdx + imagesPerColor;
    
    return product.images.slice(startIdx, endIdx);
  };

  const currentColorImages = getImagesForColor(selectedColor);

  useEffect(() => {
    // Reset to first image when color changes
    setActiveImageIndex(0);
  }, [selectedColor]);

  useEffect(() => {
    const selectedColorway = colorwayOptions.find(
      (colorway) => colorway.color === selectedColor && colorway.productId !== product.id
    );

    if (selectedColorway) {
      router.push(`/shop/${selectedColorway.productId}`);
    }
  }, [selectedColor, product.id, router]);

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

    const colorIdx = uniqueColors.indexOf(selectedColor);
    addItem({
      productId: product.id,
      variantId: activeVariant.id,
      name: product.name,
      price: priceNum,
      image: currentColorImages[0] || product.images[0],
      color: COLOR_TRANSLATIONS[selectedColor] || selectedColor,
      size: selectedSize,
      quantity,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const ratingBreakdown = [
    { stars: 5, percentage: 82 },
    { stars: 4, percentage: 12 },
    { stars: 3, percentage: 4 },
    { stars: 2, percentage: 1 },
    { stars: 1, percentage: 1 },
  ];

  return (
    <div className="pdp-page w-full flex flex-col pb-16 sm:pb-24 bg-[#FFF9EB] text-[#942E3A]" dir="ltr">
      
      {/* Breadcrumbs */}
      <ScrollReveal direction="none" duration={0.5}>
        <nav className="pdp-breadcrumb mx-auto w-full max-w-[1400px] px-4 lg:px-6 pt-3 sm:pt-4">
          <ol className="flex items-center gap-x-1.5 text-[11px] sm:text-xs font-bold text-[#D8B46A]">
            <li>
              <Link href="/" className="hover:text-[#942E3A] transition-colors">Home</Link>
            </li>
            <ChevronRight className="h-3 w-3 text-[#D8B46A] shrink-0" />
            <li>
              <Link href="/shop" className="hover:text-[#942E3A] transition-colors">Shop</Link>
            </li>
            <ChevronRight className="h-3 w-3 text-[#D8B46A] shrink-0" />
            <li className="text-[#942E3A] truncate">
              {product.name}
            </li>
          </ol>
        </nav>
      </ScrollReveal>

      {/* Main PDP Grid */}
      <section className="pdp-shell mx-auto w-full max-w-[1400px] px-4 lg:px-6 mt-3 sm:mt-6">
        <StaggerContainer className="pdp-layout">
          
          {/* Gallery Left (6 cols) */}
          <StaggerItem direction="left" className="pdp-gallery flex flex-col gap-3 w-full">
            {/* Main Image */}
            <div className="pdp-main-image relative w-full pt-[100%] rounded-2xl sm:rounded-[2rem] border border-[#942E3A]/20 overflow-hidden bg-[#F2E7D5]/20">
              {discountPercent && (
                <span className="product-detail-discount-badge absolute right-3 top-3 sm:right-5 sm:top-5 z-15 rounded-full bg-[#942E3A] px-3 py-1 text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider shadow-sm">
                  -{discountPercent}% OFF
                </span>
              )}
              
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
              <h1 className="text-[22px] sm:text-3xl lg:text-4xl font-extrabold text-[#942E3A] font-playfair tracking-tight leading-snug text-center lg:text-left">
                {product.name}
              </h1>

              {/* Star rating */}
              <div className="flex items-center justify-center lg:justify-start gap-1.5 mt-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="font-numeric text-[11px] sm:text-xs font-bold text-[#942E3A]">
                  {product.rating ? product.rating.toFixed(1) : "4.8"}
                </span>
                <span className="font-numeric text-[11px] sm:text-xs text-[#D8B46A]">
                  ({product.reviewsCount ? `${product.reviewsCount} Reviews` : "12 Reviews"})
                </span>
              </div>
            </div>

            {/* Price Row */}
            <div className="flex items-baseline justify-center lg:justify-start gap-x-2.5 py-3 border-y border-[#D8B46A]/30 w-full">
              <span className="font-numeric text-2xl sm:text-3xl font-extrabold text-[#942E3A]">
                {formatCurrency(priceNum)}
              </span>
              {compareAtPriceNum && (
                <span className="font-numeric text-sm text-[#D8B46A] line-through">
                  {formatCurrency(compareAtPriceNum)}
                </span>
              )}
            </div>

            {/* Description Brief */}
            {product.description && (
              <p className="text-[13px] sm:text-sm text-[#942E3A]/80 leading-relaxed text-center lg:text-left">
                {product.description}
              </p>
            )}

            {/* Color Selector */}
            {uniqueColors.length > 0 && (
              <div className="space-y-2 w-full">
                <div className="flex items-center justify-center lg:justify-between gap-3">
                  <span className="text-xs font-bold text-[#D8B46A]">Color:</span>
                  <span className="text-xs font-bold text-[#D8B46A]">{COLOR_TRANSLATIONS[selectedColor] || selectedColor}</span>
                </div>
                <div className="flex justify-center lg:justify-start gap-3">
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
            <div className="space-y-3 w-full">
              <div className="flex items-center justify-center lg:justify-between gap-3">
                <span className="text-xs font-bold text-[#942E3A]">Select Size (Women)</span>
                <div className="flex items-center gap-0.5 bg-[#F2E7D5]/50 p-1 rounded-full text-[10px] font-bold">
                  {(["EU", "US", "CM"] as const).map((unit) => (
                    <button
                      key={unit}
                      onClick={() => setSizeUnit(unit)}
                      className={`px-2.5 py-1 rounded-full transition-all ${
                        sizeUnit === unit ? "bg-[#942E3A] text-white shadow-sm" : "text-[#942E3A]"
                      }`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size circles */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-2.5">
                {sizesForColor.map((variant) => {
                  const isSelected = variant.size === selectedSize;
                  const isOutOfStock = variant.stock <= 0;
                  return (
                    <button
                      key={variant.id}
                      disabled={isOutOfStock}
                      onClick={() => setSelectedSize(variant.size)}
                      className={`font-numeric h-11 w-11 rounded-full text-xs font-bold transition-all border-2 flex items-center justify-center ${
                        isOutOfStock
                          ? "bg-stone-100 border-stone-200 text-stone-300 line-through cursor-not-allowed"
                          : isSelected
                          ? "bg-[#942E3A] border-[#942E3A] text-white shadow-md scale-105"
                          : "bg-white border-[#D8B46A] text-[#942E3A] hover:bg-[#F2E7D5]"
                      }`}
                    >
                      {variant.size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity + Buy Now Row */}
            <div className="flex items-center justify-center lg:justify-start gap-3 py-1 w-full">
              <div className="flex items-center rounded-full border border-[#D8B46A] bg-white h-11 px-2.5 shrink-0">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-1.5 text-[#D8B46A] hover:text-[#942E3A] transition-colors"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="font-numeric w-8 text-center text-xs font-bold text-[#942E3A]">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-1.5 text-[#D8B46A] hover:text-[#942E3A] transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 flex h-12 items-center justify-center gap-2 rounded-full bg-[#D8B46A] text-sm font-bold text-[#FFF9EB] hover:bg-[#B8934A] transition-all shadow-md active:scale-[0.98] min-w-0"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Buy Now</span>
              </button>
            </div>

            {/* Add to Cart + Wishlist Row */}
            <div className="flex items-center justify-center lg:justify-start gap-3 pt-1">
              {added ? (
                <button className="flex-1 flex h-12 items-center justify-center gap-2 rounded-full bg-emerald-600 text-xs font-bold text-white shadow-sm">
                  <Check className="h-4 w-4" />
                  <span>Added to Cart!</span>
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex h-12 items-center justify-center gap-2 rounded-full border-2 border-[#942E3A] bg-white text-xs font-bold text-[#942E3A] hover:bg-[#F2E7D5] transition-colors"
                >
                  <span>Add To Cart</span>
                </button>
              )}

              {/* Wishlist */}
              <button
                onClick={() => toggle(product.id)}
                className="h-12 w-12 rounded-full border border-[#D8B46A] bg-white flex items-center justify-center text-[#D8B46A] hover:bg-[#F2E7D5] transition-colors shrink-0 shadow-sm"
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? "fill-[#942E3A] text-[#942E3A]" : "text-[#D8B46A]"}`} />
              </button>
            </div>

            {/* Delivery Guarantee Banner */}
            <div className="rounded-xl bg-[#F2E7D5]/50 border border-[#D8B46A]/40 p-3.5 flex items-center justify-center gap-3 text-[#942E3A] text-xs font-medium text-center">
              <Truck className="h-5 w-5 text-[#942E3A] shrink-0" />
              <span>Free Express Delivery On Orders Over $150 & Doorstep fitting guarantee</span>
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
            <h2 className="text-lg sm:text-xl font-extrabold text-[#942E3A] font-playfair mb-4 sm:mb-6 text-center">You May Also Like</h2>
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
  const isMobile = useIsMobile();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewName, setReviewName] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviews, setReviews] = useState<ProductReviewView[]>(storedReviews.length ? storedReviews : MOCK_REVIEWS);

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
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#942E3A] font-playfair">Customer Reviews</h2>
            <p className="text-[11px] sm:text-xs text-[#D8B46A] mt-1">25,000+ verified reviews</p>
          </div>
          <button
            onClick={() => setShowReviewForm(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#942E3A] text-[11px] sm:text-xs font-bold text-white hover:bg-[#7a2430] transition-all shadow-md shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
            Write a Review
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
                Based on {product.reviewsCount ? `${product.reviewsCount} reviews` : "12 reviews"}
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
      </div>

      {/* Write a Review Modal */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-0 sm:px-4"
            onClick={() => setShowReviewForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full sm:max-w-md bg-[#FFF9EB] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#D8B46A]/30 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-extrabold text-[#942E3A] font-playfair">Write a Review</h3>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="h-8 w-8 rounded-full bg-[#F2E7D5] flex items-center justify-center text-[#942E3A] hover:bg-[#D8B46A]/30 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Star Rating Picker */}
              <div className="mb-5">
                <label className="text-xs font-bold text-[#942E3A] mb-2 block">Your Rating</label>
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
                <label className="text-xs font-bold text-[#942E3A] mb-1.5 block">Your Name</label>
                <input
                  type="text"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D8B46A]/40 bg-white text-sm text-[#942E3A] placeholder:text-[#D8B46A]/50 focus:outline-none focus:ring-2 focus:ring-[#942E3A]/30 focus:border-[#942E3A] transition-all"
                />
              </div>

              {/* Comment Input */}
              <div className="mb-6">
                <label className="text-xs font-bold text-[#942E3A] mb-1.5 block">Your Review</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience with this product..."
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
                Submit Review
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
