"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal, StaggerContainer, StaggerItem } from "./ScrollReveal";
import {
  ShoppingBag,
  Truck,
  ArrowRight,
  Headphones,
  ChevronLeft,
  ChevronRight,
  Quote,
  Star
} from "lucide-react";
import ProductCard, { ProductWithVariants } from "./ProductCard";

import { useSiteSettings } from "@/providers/SiteSettingsProvider";
import { useStoreI18n } from "@/providers/StoreI18nContext";
import { DEFAULT_HOME_REVIEWS } from "@/lib/siteSettings";

export type HomeReviewItem = {
  id?: string;
  brand: string;
  initials: string;
  model: string;
  rating: number;
  quote: string;
  name: string;
  detail: string;
};

export default function HomeClient({
  products,
  dbHomeReviews = [],
}: {
  products: ProductWithVariants[];
  dbHomeReviews?: HomeReviewItem[];
}) {
  const settings = useSiteSettings();
  const { t, lang, dir, formatNumber } = useStoreI18n();
  const [activeSlide, setActiveSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [activeReview, setActiveReview] = useState(0);
  const [reviewDirection, setReviewDirection] = useState(1);
  const [isReviewLeaving, setIsReviewLeaving] = useState(false);
  const [returningReview, setReturningReview] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bestsellerScrollRef = useRef<HTMLDivElement>(null);

  const forYouProducts = settings.forYouProductIds.length > 0
    ? settings.forYouProductIds.map((id) => products.find((p) => p.id === id)).filter((p): p is ProductWithVariants => Boolean(p))
    : products;

  const bestsellerProducts = settings.bestSellerProductIds.length > 0
    ? settings.bestSellerProductIds.map((id) => products.find((p) => p.id === id)).filter((p): p is ProductWithVariants => Boolean(p))
    : products;

  const displayForYouProducts = forYouProducts.length > 0 ? forYouProducts : products;
  const displayBestsellerProducts = bestsellerProducts.length > 0 ? bestsellerProducts : products;

  const cardWidth = 246; // 230px card + 16px gap
  const singleCopyWidth = displayForYouProducts.length * cardWidth;
  const repeatCount = Math.max(8, Math.ceil(8000 / (singleCopyWidth || 1)));

  const repeatedProducts = Array.from({ length: repeatCount }).flatMap(() => displayForYouProducts);
  const repeatedBestsellerProducts = Array.from({ length: repeatCount }).flatMap(() => displayBestsellerProducts);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || products.length === 0) return;

    let singleWidth = container.scrollWidth / repeatCount;
    const middleIndex = Math.floor(repeatCount / 2);
    container.scrollLeft = middleIndex * singleWidth;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const middleIndex = Math.floor(repeatCount / 2);

      const lowerLimit = (middleIndex - 1) * singleWidth;
      const upperLimit = (middleIndex + 1) * singleWidth;

      if (scrollLeft > upperLimit) {
        container.scrollLeft = scrollLeft - singleWidth;
      } else if (scrollLeft < lowerLimit) {
        container.scrollLeft = scrollLeft + singleWidth;
      }
    };

    const handleResize = () => {
      singleWidth = container.scrollWidth / repeatCount;
      const middleIndex = Math.floor(repeatCount / 2);
      container.scrollLeft = middleIndex * singleWidth;
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [products, repeatCount]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const container = scrollRef.current;
    if (!container) return;
    const startX = e.pageX - container.offsetLeft;
    const scrollLeft = container.scrollLeft;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const x = moveEvent.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5;
      container.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleBestsellerMouseDown = (e: React.MouseEvent) => {
    const container = bestsellerScrollRef.current;
    if (!container) return;
    const startX = e.pageX - container.offsetLeft;
    const scrollLeft = container.scrollLeft;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const x = moveEvent.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5;
      container.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };


  const heroCards = settings.heroBanners.length > 0 ? settings.heroBanners : [
    {
      id: "1",
      tag: "THE FEMININE EDIT",
      title: "Soft Sport Icons",
      desc: "Pastel runners and everyday silhouettes for easy comfort, soft colour, and feminine street style.",
      href: "/shop?category=shoes",
      image: "/banners/hero-1-desktop.webp",
      mobileImage: "/banners/hero-1-mobile.webp"
    },
    {
      id: "2",
      tag: "NEW RELEASE",
      title: "Performance Running & Gym",
      desc: "Super-lightweight cushioned trainers from Asics & Nike engineered for gym workouts, daily running, and support.",
      href: "/shop?category=shoes",
      image: "/banners/hero-2-desktop.webp",
      mobileImage: "/banners/hero-2-mobile.webp"
    },
    {
      id: "3",
      tag: "LIFESTYLE DROP",
      title: "Chunky & Platform Soles",
      desc: "Bold elevated profiles combined with soft memory foam footbeds for maximum casual comfort.",
      href: "/shop?category=shoes",
      image: "/banners/hero-3-desktop.webp",
      mobileImage: "/banners/hero-3-mobile.webp"
    }
  ];

  const cardThemes = [
    {
      bgColor: "bg-gradient-to-br from-[#942E3A] via-[#802832] to-[#942E3A]",
      textColor: "text-[#FFF9EB]",
      accentBlur: "bg-[#942E3A]/10"
    },
    {
      bgColor: "bg-[#942E3A]",
      textColor: "text-[#942E3A]",
      accentBlur: "bg-[#942E3A]/5"
    },
    {
      bgColor: "bg-[#FFF9EB]",
      textColor: "text-[#942E3A]",
      accentBlur: "bg-[#942E3A]/15"
    }
  ];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDirection(1);
      setActiveSlide((prev) => prev + 1);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [activeSlide]);

  const handleNext = () => {
    setDirection(1);
    setActiveSlide((prev) => prev + 1);
  };

  const handlePrev = () => {
    setDirection(-1);
    setActiveSlide((prev) => prev - 1);
  };

  const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
    const swipeThreshold = 40;
    if (info.offset.x < -swipeThreshold) {
      handleNext();
    } else if (info.offset.x > swipeThreshold) {
      handlePrev();
    }
  };

  const currentIndex = ((activeSlide % heroCards.length) + heroCards.length) % heroCards.length;
  const currentCard = heroCards[currentIndex];
  const currentTheme = cardThemes[currentIndex % cardThemes.length];

  const reviews = dbHomeReviews.length > 0 ? dbHomeReviews : settings.homeReviews;

  const localizedReviewQuotes: Record<string, string> = lang === "ar"
    ? {
        "1": "المقاس مظبوط جدًا والجودة أحلى بكتير على الطبيعة. DeRoma سهّلت عليا اختيار الكوتشي اليومي بتاعي.",
        "2": "ده بالضبط الموديل اللي كنت بدور عليه. التوصيل كان سريع، والتغليف جميل، والكوتشي مريح جدًا.",
        "3": "أخيرًا لقيت كوتشي جري شكله شيك وخفيف طول اليوم. دليل المقاسات ساعدني أختار المقاس الصح.",
        "4": "التجربة كلها فخمة من أول تصفح المجموعة لحد ما لبست الكوتشي المفضل الجديد بتاعي.",
        "5": "كوتشي يومي جميل ولونه سهل يتنسق مع أي لبس. بلبسه تقريبًا كل يوم.",
        "6": "نصيحة المقاسات خلتني أختار بثقة، والكوتشي وصل مطابق تمامًا للصور.",
        "7": "خفيف جدًا ومريح، وتفصيلة اللون النبيتي خلت اللوك كله مميز أكتر.",
        "8": "تصميم بسيط ونعل مريح للاستخدام اليومي. تجربة التوصيل كانت سهلة من البداية للنهاية.",
      }
    : {};

  const reviewSectionCopy = lang === "ar"
    ? {
        eyebrow: "آراء العملاء",
        title: "اللي جربوا قالوا إيه؟",
        hint: "آراء عملائنا عن المنتجات وتجربتهم مع DeRoma",
        ratingAria: "تقييم كامل من 5 نجوم",
        previousAria: "التقييم السابق",
        nextAria: "التقييم التالي",
        showAria: "عرض تقييم",
        customer: "من عملاء DeRoma",
        verifiedCustomer: "عميل موثّق",
        shoes: "أحذية",
      }
    : {
        eyebrow: "THE DE ROMA EDIT",
        title: "Loved by every step.",
        hint: "Swipe the cards to discover what our sneaker community is saying.",
        ratingAria: "5 out of 5 stars",
        previousAria: "Previous review",
        nextAria: "Next review",
        showAria: "Show review",
        customer: "DeRoma Customer",
        verifiedCustomer: "Verified DeRoma customer",
        shoes: "SHOES",
      };


  const activeReviewData = reviews[activeReview];

  const changeReview = (step: number, exitDirection = step > 0 ? 1 : -1) => {
    if (isReviewLeaving) return;
    const departingReview = activeReview;
    const nextReview = (activeReview + step + reviews.length) % reviews.length;
    setReviewDirection(exitDirection);
    setIsReviewLeaving(true);
    window.setTimeout(() => {
      setActiveReview(nextReview);
      setIsReviewLeaving(false);
      setReturningReview(departingReview);
      window.setTimeout(() => setReturningReview(null), 300);
    }, 250);
  };

  const selectReview = (index: number) => {
    setReviewDirection(index >= activeReview ? 1 : -1);
    setActiveReview(index);
  };

  const handleReviewDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number }; velocity: { x: number } }) => {
    if (Math.abs(info.offset.x) > 45 || Math.abs(info.velocity.x) > 350) {
      changeReview(1, info.offset.x < 0 ? 1 : -1);
    }
  };

  // Ultra-lightweight Mobile Touch Swipe (No 3D stack, zero jank)
  const mobileTouchStartX = useRef<number | null>(null);
  const handleMobileTouchStart = (e: React.TouchEvent) => {
    mobileTouchStartX.current = e.touches[0].clientX;
  };

  const handleMobileTouchEnd = (e: React.TouchEvent) => {
    if (mobileTouchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - mobileTouchStartX.current;
    mobileTouchStartX.current = null;
    if (Math.abs(deltaX) > 35) {
      if (deltaX > 0) {
        // Swiped right
        changeReview(dir === "rtl" ? 1 : -1);
      } else {
        // Swiped left
        changeReview(dir === "rtl" ? -1 : 1);
      }
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: "0%",
      opacity: 1,
      transition: { duration: 0.5 },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
      transition: { duration: 0.5 },
    }),
  };




  return (
    <div className="w-full flex flex-col space-y-8 pb-16 bg-[#FFF9EB] text-[#942E3A]" dir={dir}>
      {/* Eagerly preload all hero banner images */}
      <div className="hidden" aria-hidden="true">
        {heroCards.map((card) => (
          <picture key={card.id}>
            <source media="(max-width: 639px)" srcSet={card.mobileImage} />
            <img src={card.image} alt="preload" />
          </picture>
        ))}
      </div>
      
      {/* 1. HERO CAROUSEL - Sleek, Compact & Refined */}
      <section className="px-2 sm:px-4 lg:px-6 pt-0">
        <div className="mx-auto max-w-[94vw] lg:max-w-[1320px] relative select-none">
          
          <div className="relative aspect-[1209/1300] overflow-hidden rounded-2xl shadow-lg sm:aspect-[2120/742] sm:rounded-3xl lg:rounded-[2rem] cursor-grab active:cursor-grabbing">
            
            <AnimatePresence mode="popLayout" custom={direction}>
              <motion.div
                key={activeSlide}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                dragDirectionLock
                dragMomentum={false}
                onDragEnd={handleDragEnd}
                whileTap={{ scale: 0.995 }}
                className={`relative h-full w-full touch-pan-y overflow-hidden rounded-2xl border border-white/10 sm:rounded-3xl lg:rounded-[2rem] ${currentTheme.bgColor} ${currentTheme.textColor}`}
              >
                <div className={`absolute -top-20 -right-20 h-64 w-64 rounded-full ${currentTheme.accentBlur} blur-2xl pointer-events-none z-0`} />
                <div className={`absolute -bottom-20 -left-20 h-64 w-64 rounded-full ${currentTheme.accentBlur} blur-2xl pointer-events-none z-0`} />

                {/* Responsive artwork supplied by DeRoma */}
                <picture className="absolute inset-0 z-10 block h-full w-full">
                  {currentCard.mobileImage && (
                    <source media="(max-width: 639px)" srcSet={currentCard.mobileImage} />
                  )}
                  <img
                    src={currentCard.image || "/banners/hero-1-desktop.webp"}
                    alt={currentCard.title || "DeRoma Banner"}
                    className="h-full w-full select-none object-cover"
                    draggable={false}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.endsWith("/banners/hero-1-desktop.webp")) {
                        target.src = "/banners/hero-1-desktop.webp";
                      }
                    }}
                  />
                </picture>

                {currentIndex === 0 && (
                  <Link
                    href={currentCard.href}
                    onPointerDown={(event) => event.stopPropagation()}
                    className="absolute bottom-[3.8%] left-[39.8%] z-20 inline-flex -translate-x-1/2 items-center justify-center rounded-full bg-[#942E3A] px-4 py-2 text-[10px] font-bold tracking-wide text-[#FFF9EB] shadow-md transition-transform hover:scale-105 hover:bg-[#7d2530] sm:bottom-[8%] sm:left-[27.5%] sm:px-8 sm:py-3 sm:text-sm"
                  >
                    {t("nav.shop")}
                  </Link>
                )}

                {/* Embedded Dots */}
                <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center items-center gap-2 pointer-events-auto">
                  {heroCards.map((c, idx) => {
                    const isActive = idx === currentIndex;
                    return (
                      <button
                        key={c.id}
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={() => {
                          setDirection(idx > currentIndex ? 1 : -1);
                          setActiveSlide(idx);
                        }}
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isActive
                            ? "w-7 bg-[#942E3A] shadow-md"
                            : "w-2 bg-[#942E3A]/30 hover:bg-[#942E3A]/60"
                        }`}
                        aria-label={`Go to card ${idx + 1}`}
                      />
                    );
                  })}
                </div>

              </motion.div>
            </AnimatePresence>

          </div>

        </div>
      </section>

      {/* 1.5. BRAND REVIEWS - Compact deck-style swipe carousel */}
      <section className="px-2 sm:px-4 lg:px-6">
        <ScrollReveal>
          <div className="mx-auto max-w-[94vw] lg:max-w-[1320px]">
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#942E3A] px-4 py-5 sm:px-8 sm:py-6 lg:px-12 text-[#FFF9EB] shadow-lg">
              <div className="pointer-events-none absolute -left-16 -top-20 h-48 w-48 rounded-full bg-[#D8B46A]/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 right-0 h-56 w-56 rounded-full bg-[#FFF9EB]/10 blur-3xl" />

              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
                <div className="shrink-0 sm:w-[170px] lg:w-[220px]">
                  <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#D8B46A]">{reviewSectionCopy.eyebrow}</span>
                  <h2 className="mt-1 font-playfair text-xl font-semibold leading-tight sm:text-2xl">{reviewSectionCopy.title}</h2>
                  <div className="mt-3 flex items-center gap-1.5 text-[#D8B46A]" aria-label={reviewSectionCopy.ratingAria}>
                    {Array.from({ length: 5 }).map((_, index) => <Star key={index} className="h-3.5 w-3.5 fill-current" />)}
                    <span className="ml-1 text-[10px] font-semibold text-[#FFF9EB]/75">4.9 / 5</span>
                  </div>
                  <p className="mt-3 hidden max-w-[190px] text-[10px] leading-relaxed text-[#FFF9EB]/60 sm:block">{reviewSectionCopy.hint}</p>
                </div>

                <div className="relative min-w-0 flex-1 sm:h-[190px]">
                  {/* MOBILE VIEW: Ultra-lightweight 60fps single-card transition */}
                  <div
                    className="relative h-[210px] w-full sm:hidden"
                    onTouchStart={handleMobileTouchStart}
                    onTouchEnd={handleMobileTouchEnd}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.article
                        key={`mobile-rev-${activeReview}`}
                        initial={{ opacity: 0, x: reviewDirection * 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -reviewDirection * 24 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="absolute inset-0 rounded-2xl border border-[#942E3A]/10 bg-[#FFF9EB] p-4 text-[#942E3A] shadow-md"
                        style={{ willChange: "transform, opacity" }}
                      >
                        <div className="flex h-full flex-col justify-between">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#942E3A] font-playfair text-xs font-bold text-[#D8B46A]">
                                {activeReviewData.initials}
                              </span>
                              <div>
                                <p className="text-[10px] font-semibold text-[#942E3A]">
                                  {activeReviewData.name}
                                </p>
                                <div className="mt-0.5 flex items-center gap-1.5">
                                  <div
                                    className="flex gap-0.5 text-[#D8B46A]"
                                    aria-label={`${activeReviewData.rating} out of 5 stars`}
                                  >
                                    {Array.from({ length: 5 }).map((_, index) => (
                                      <Star
                                        key={index}
                                        className={`h-3 w-3 ${
                                          index < activeReviewData.rating
                                            ? "fill-current"
                                            : "fill-transparent opacity-40"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-[9px] font-bold tracking-[0.1em] text-[#942E3A]/65">
                                    {activeReviewData.model}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Quote className="h-5 w-5 rotate-180 text-[#942E3A]/20" />
                          </div>

                          <p className="font-playfair text-sm leading-snug">
                            “{localizedReviewQuotes[activeReviewData.id || ""] || activeReviewData.quote}”
                          </p>

                          <div className="flex items-center justify-between gap-2 text-[9px]">
                            <span className="font-bold tracking-[0.12em] text-[#D8B46A]">
                              {lang === "ar" && activeReviewData.brand.toLowerCase() === "shoes"
                                ? reviewSectionCopy.shoes
                                : activeReviewData.brand}
                            </span>
                            <span className="text-[#942E3A]/55">
                              {lang === "ar"
                                ? activeReviewData.detail.toLowerCase().includes("verified")
                                  ? reviewSectionCopy.verifiedCustomer
                                  : reviewSectionCopy.customer
                                : activeReviewData.detail}
                            </span>
                          </div>
                        </div>
                      </motion.article>
                    </AnimatePresence>
                  </div>

                  {/* DESKTOP VIEW: Rich 3D Stack Deck Animation */}
                  <div className="relative mx-auto hidden h-full w-full max-w-[620px] sm:block">
                    {[0, 1, 2, ...(returningReview !== null ? [3] : [])].map((stackPosition) => {
                      const isReturning = stackPosition === 3 && returningReview !== null;
                      const reviewIndex = isReturning ? returningReview : (activeReview + stackPosition) % reviews.length;
                      const review = reviews[reviewIndex];
                      const isFront = stackPosition === 0;

                      return (
                        <motion.article
                          key={`${review.id || review.model}-${isReturning ? "returning" : stackPosition}`}
                          drag={isFront ? "x" : false}
                          dragConstraints={{ left: -520, right: 520 }}
                          dragElastic={0.18}
                          onDragEnd={isFront ? handleReviewDragEnd : undefined}
                          initial={{
                            x: isReturning ? reviewDirection * 760 : isFront ? reviewDirection * 34 : stackPosition * 10,
                            y: stackPosition * 7,
                            rotate: stackPosition === 0 ? 0 : stackPosition === 1 ? 3 : -3,
                            opacity: isReturning ? 0.95 : isFront ? 0.65 : 1 - stackPosition * 0.12,
                            scale: 1 - stackPosition * 0.035,
                          }}
                          animate={{
                            x: isFront && isReviewLeaving ? reviewDirection * 760 : stackPosition * 10,
                            y: stackPosition * 7,
                            rotate: stackPosition === 0 ? 0 : stackPosition === 1 ? 3 : -3,
                            scale: 1 - stackPosition * 0.035,
                            opacity: 1 - stackPosition * 0.12,
                          }}
                          transition={isFront && isReviewLeaving
                            ? { duration: 0.25, ease: "easeOut" }
                            : isReturning
                              ? { duration: 0.3, ease: "easeOut" }
                            : { type: "spring", stiffness: 220, damping: 24, mass: 0.8 }}
                          className={`absolute inset-y-0 left-0 right-0 rounded-2xl border border-[#942E3A]/10 bg-[#FFF9EB] p-4 text-[#942E3A] shadow-xl sm:p-5 ${isFront ? "z-30 cursor-grab active:cursor-grabbing" : stackPosition === 1 ? "z-20" : "z-10"}`}
                          style={{ transformOrigin: "bottom center" }}
                        >
                          <div className="flex h-full flex-col justify-between">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-2.5">
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#942E3A] font-playfair text-xs font-bold text-[#D8B46A]">{review.initials}</span>
                                <div>
                                  <p className="text-[10px] font-semibold text-[#942E3A]">{review.name}</p>
                                  <div className="mt-1 flex items-center gap-2">
                                    <div className="flex gap-0.5 text-[#D8B46A]" aria-label={`${review.rating} out of 5 stars`}>{Array.from({ length: 5 }).map((_, index) => <Star key={index} className={`h-3 w-3 ${index < review.rating ? "fill-current" : "fill-transparent opacity-40"}`} />)}</div>
                                    <span className="text-[9px] font-bold tracking-[0.12em] text-[#942E3A]/65">{review.model}</span>
                                  </div>
                                </div>
                              </div>
                              <Quote className="h-6 w-6 rotate-180 text-[#942E3A]/20" />
                            </div>
                            <p className="max-w-[540px] font-playfair text-base leading-snug sm:text-lg">“{localizedReviewQuotes[review.id || ""] || review.quote}”</p>
                            <div className="flex items-center justify-between gap-3 text-[10px]">
                              <span className="font-bold tracking-[0.14em] text-[#D8B46A]">{lang === "ar" && review.brand.toLowerCase() === "shoes" ? reviewSectionCopy.shoes : review.brand}</span>
                              <span className="text-[#942E3A]/55">{lang === "ar" ? (review.detail.toLowerCase().includes("verified") ? reviewSectionCopy.verifiedCustomer : reviewSectionCopy.customer) : review.detail}</span>
                            </div>
                          </div>
                        </motion.article>
                      );
                    })}
                  </div>
                  <div className="absolute -bottom-1 left-0 right-0 z-40 flex items-center justify-center gap-1.5 sm:-bottom-3">
                    {reviews.map((review, index) => <button key={`${review.brand}-${index}`} type="button" onClick={() => selectReview(index)} aria-label={`${reviewSectionCopy.showAria} ${review.brand}`} className={`h-1.5 rounded-full transition-all duration-300 ${index === activeReview ? "w-6 bg-[#D8B46A]" : "w-1.5 bg-[#FFF9EB]/45 hover:bg-[#FFF9EB]"}`} />)}
                  </div>
                </div>

                <div className={`absolute top-0 z-40 flex gap-1.5 sm:top-auto sm:bottom-1 ${dir === "rtl" ? "left-0 sm:left-0" : "right-0 sm:right-0"}`}>
                  <button type="button" onClick={() => changeReview(-1)} aria-label={reviewSectionCopy.previousAria} className="rounded-full border border-[#FFF9EB]/25 bg-[#942E3A]/60 p-1.5 transition-colors hover:border-[#D8B46A] hover:text-[#D8B46A]">{dir === "rtl" ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}</button>
                  <button type="button" onClick={() => changeReview(1)} aria-label={reviewSectionCopy.nextAria} className="rounded-full border border-[#FFF9EB]/25 bg-[#942E3A]/60 p-1.5 transition-colors hover:border-[#D8B46A] hover:text-[#D8B46A]">{dir === "rtl" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</button>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 2. CUSTOM BENTO GRID BOUTIQUE BRANDS SECTION (Matches Hand-Drawn Sketch Exactly) */}
      <section className="px-2 sm:px-4 lg:px-6">
        <div className="mx-auto max-w-[94vw] lg:max-w-[1320px] space-y-3">
          <ScrollReveal>
            <div className="flex items-center justify-center py-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#942E3A] font-playfair tracking-[0.2em] uppercase text-center">
                {lang === "ar" ? "مجموعاتنا" : "OUR COLLECTIONS"}
              </h2>
            </div>
          </ScrollReveal>

          {/* UNIFIED 6-BOX BENTO GRID - PERFECT SYMMETRY (1:2:1) & ENLARGED LOGOS */}
          <StaggerContainer className="flex flex-row flex-nowrap items-stretch w-full gap-1.5 sm:gap-2.5 lg:gap-3.5">
            
            {/* LEFT COLUMN (flex-[1]) -> Full Height Tall Vertical Box: New Balance */}
            <StaggerItem className="flex-[1] min-w-0 shrink-0 flex flex-col" scale={true}>
              <Link
                href="/shop?brand=New%20Balance"
                className="group relative w-full h-full min-h-[115px] sm:min-h-[210px] lg:min-h-[268px] rounded-lg sm:rounded-2xl bg-transparent border border-[#942E3A]/15 hover:border-[#942E3A] hover:bg-black/[0.02] transition-all duration-300 flex flex-col items-center justify-center p-0.5 sm:p-3 lg:p-4 text-center overflow-hidden"
              >
                <div className="flex items-center justify-center w-full h-full p-1 transition-transform duration-300 group-hover:scale-105">
                  <svg viewBox="0 0 24 24" className="w-14 sm:w-20 lg:w-24 h-auto max-h-[75%] fill-[#942E3A]">
                    <path d="M12.169 10.306l1.111-1.937 3.774-.242.132-.236-3.488-.242.82-1.414h6.47c1.99 0 3.46.715 2.887 2.8-.17.638-.979 2.233-3.356 2.899.507.06 1.76.616 1.54 2.057-.384 2.558-3.69 3.774-5.533 3.774l-7.641.006-.38-1.48 4.005-.28.137-.237-4.346-.264-.467-1.755 6.178-.363.137-.231-11.096-.693.534-.925 11.948-.775.138-.231-3.504-.231m5 .385l1.1-.006c.738-.005 1.502-.34 1.783-1.018.259-.632-.088-1.171-.55-1.166h-1.067l-1.266 2.19zm-1.27 2.195l-1.326 2.305h1.265c.589 0 1.64-.292 1.964-1.128.302-.781-.253-1.177-.638-1.177h-1.266zM6.26 16.445l-.77 1.315L0 17.77l.534-.923 5.726-.402zm.385-10.216l4.417.006.336 1.248-5.276-.33.523-.924zm5 2.245l.484 1.832-7.542-.495.528-.92 6.53-.417zm-3.84 5.281l-.957 1.661-5.32-.302.534-.924 5.743-.435z" />
                  </svg>
                </div>
              </Link>
            </StaggerItem>

            {/* CENTER AREA (flex-[2]) -> Top Row (Wide + Small) & Bottom Row (Small + Wide) */}
            <StaggerItem className="flex-[2] min-w-0 shrink-0 flex flex-col justify-between gap-1.5 sm:gap-2.5 lg:gap-3.5" scale={true}>
              
              {/* TOP ROW: Wide Box (Asics) + Small Box (Adidas) */}
              <div className="flex-1 flex flex-row flex-nowrap gap-1.5 sm:gap-2.5 lg:gap-3.5 min-h-0">
                {/* Wide Box: Asics */}
                <Link
                  href="/shop?brand=Asics"
                  className="group relative flex-[2] h-full rounded-lg sm:rounded-2xl bg-transparent border border-[#942E3A]/15 hover:border-[#942E3A] hover:bg-black/[0.02] transition-all duration-300 flex items-center justify-center p-0.5 sm:p-3 lg:p-4 text-center overflow-hidden"
                >
                  <div className="flex items-center justify-center w-full h-full p-1 transition-transform duration-300 group-hover:scale-105">
                    <svg viewBox="0 0 250 88" className="w-16 sm:w-24 lg:w-28 h-auto max-h-[75%] fill-[#942E3A]">
                      <g>
                        <path fill="currentColor" d="M29.219,60.303c-4.446,0-6.583-3.418-5.467-7.372c2.304-8.195,17.109-20.339,27.198-20.339 c7.357,0,6.797,6.583,2.484,12.198l-2.384,2.639C42.499,55.82,34.572,60.303,29.219,60.303 M65.279,5.041 c-12.876,0.005-27.055,7.882-35.96,15.342l0.703,1.019c13.822-9.689,33.001-15.989,38.288-6.539 c2.792,4.985-1.947,15.053-8.621,23.01c1.596-3.514,0.542-10.261-8.764-10.261C35.455,27.612,5,48.105,5,69.078 c0,8.401,5.828,13.882,15.428,13.882c25.696,0,60.544-42.12,60.544-63.275C80.972,12.212,76.673,5.041,65.279,5.041" />
                        <path fill="currentColor" d="M98.361,60.303c-1.496,0-2.741-0.522-3.52-1.475c-0.812-0.999-1.054-2.415-0.669-3.877 c0.855-3.172,4.274-5.664,7.79-5.664h8.27l-2.955,11.016H98.361z M122.129,27.279c-2.365-2.908-6.194-4.209-8.934-4.209H98.167 l-2.551,9.514h14.173l1.358,0.143c0.014,0,1.301,0.15,2.019,1.116c0.58,0.808,0.665,2.008,0.248,3.582l-0.67,2.504h-8.93 c-7.686,0-18.401,5.514-20.79,14.42c-1.188,4.441-0.147,8.288,2.161,11.115c2.29,2.806,6.612,4.355,11.281,4.355h8.27h-0.005 h10.511l4.93-18.411l3.629-13.533C125.226,32.554,123.682,29.174,122.129,27.279" />
                        <path fill="currentColor" d="M225.361,23.07c-4.066,0-7.844,1.203-10.916,3.48c-3.102,2.297-4.813,5.057-5.833,8.864 c-2.213,8.251,4.271,12.233,9.481,15.056c3.737,2.024,6.969,3.77,6.269,6.356c-0.494,1.856-1.305,3.48-5.902,3.48h-14.033 l-2.546,9.513h15.533c4.165,0,8.009-0.867,11.106-3.245c3.1-2.386,4.852-5.71,5.935-9.767c1.04-3.861,0.339-7.549-2.146-10.301 c-2.071-2.311-5.05-3.916-7.675-5.334c-3.364-1.81-6.536-3.518-5.982-5.588c0.339-1.253,1.582-3,4.299-3h13.651l2.552-9.514 H225.361z" />
                        <path fill="currentColor" d="M143.921,23.07c-4.065,0-7.842,1.203-10.915,3.48c-3.102,2.297-4.813,5.057-5.843,8.864 c-2.208,8.251,4.281,12.233,9.49,15.056c3.739,2.024,6.963,3.77,6.27,6.356c-0.499,1.856-1.306,3.48-5.903,3.48h-14.031 l-2.551,9.513h15.532c4.17,0,8.013-0.867,11.11-3.245c3.105-2.386,4.853-5.71,5.936-9.767c1.036-3.861,0.334-7.549-2.141-10.301 c-2.071-2.311-5.055-3.916-7.685-5.334c-3.359-1.81-6.527-3.518-5.972-5.588c0.333-1.253,1.581-3,4.293-3h13.643l2.556-9.514 H143.921z" />
                        <polygon fill="currentColor" points="165.115,23.07 152.932,69.819 163.225,69.819 175.398,23.07" />
                        <path fill="currentColor" d="M202.781,23.07c-18.121,0.065-27.604,12.133-30.614,23.375c-3.566,13.33,3.53,23.375,16.507,23.375h8.696 l2.546-9.513h-8.693c-4.857,0-11.536-3.822-8.844-13.862c2.138-7.98,9.919-13.86,18.454-13.86h5.522l2.551-9.514H202.781z" />
                      </g>
                    </svg>
                  </div>
                </Link>

                {/* Small Box: Adidas */}
                <Link
                  href="/shop?brand=Adidas"
                  className="group relative flex-[1] h-full rounded-lg sm:rounded-2xl bg-transparent border border-[#942E3A]/15 hover:border-[#942E3A] hover:bg-black/[0.02] transition-all duration-300 flex items-center justify-center p-0.5 sm:p-2 lg:p-3 text-center overflow-hidden"
                >
                  <div className="flex items-center justify-center w-full h-full p-1 transition-transform duration-300 group-hover:scale-105">
                    <svg viewBox="0 0 24 24" className="w-14 sm:w-20 lg:w-24 h-auto max-h-[75%] fill-[#942E3A]">
                      <path d="M23.422 19.539h-4.885l-7.394-11.458h4.885l7.394 11.458zm-7.61 0h-4.885l-5.06-7.844h4.885l5.06 7.844zm-7.61 0H3.317l-2.727-4.229h4.885l2.727 4.229z" />
                    </svg>
                  </div>
                </Link>
              </div>

              {/* BOTTOM ROW: Small Box (Nike) + Wide Box (Dior) */}
              <div className="flex-1 flex flex-row flex-nowrap gap-1.5 sm:gap-2.5 lg:gap-3.5 min-h-0">
                {/* Small Box: Nike */}
                <Link
                  href="/shop?brand=Nike"
                  className="group relative flex-[1] h-full rounded-lg sm:rounded-2xl bg-transparent border border-[#942E3A]/15 hover:border-[#942E3A] hover:bg-black/[0.02] transition-all duration-300 flex items-center justify-center p-0.5 sm:p-2 lg:p-3 text-center overflow-hidden"
                >
                  <div className="flex items-center justify-center w-full h-full p-1 transition-transform duration-300 group-hover:scale-105">
                    <svg viewBox="0 0 24 24" className="w-14 sm:w-20 lg:w-24 h-auto max-h-[75%] fill-[#942E3A]">
                      <path d="M24 7.8L6.442 15.276c-1.456.616-2.679.925-3.668.925-1.12 0-1.933-.392-2.437-1.177-.317-.504-.41-1.143-.28-1.918.13-.775.476-1.6 1.036-2.478.467-.71 1.232-1.643 2.297-2.8a6.122 6.122 0 00-.784 1.848c-.28 1.195-.028 2.072.756 2.632.373.261.886.392 1.54.392.522 0 1.11-.084 1.764-.252L24 7.8z" />
                    </svg>
                  </div>
                </Link>

                {/* Wide Box: Dior */}
                <Link
                  href="/shop?brand=Dior"
                  className="group relative flex-[2] h-full rounded-lg sm:rounded-2xl bg-transparent border border-[#942E3A]/15 hover:border-[#942E3A] hover:bg-black/[0.02] transition-all duration-300 flex items-center justify-center p-0.5 sm:p-3 lg:p-4 text-center overflow-hidden"
                >
                  <div className="flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                    <span className="font-serif font-black text-xs sm:text-xl lg:text-2xl tracking-[0.15em] sm:tracking-[0.25em] text-[#942E3A] uppercase">
                      DIOR
                    </span>
                  </div>
                </Link>
              </div>

            </StaggerItem>

            {/* RIGHT COLUMN (flex-[1]) -> Full Height Puma */}
            <StaggerItem className="flex-[1] min-w-0 shrink-0 flex flex-col" scale={true}>
              <Link
                href="/shop?brand=Puma"
                className="group relative w-full h-full min-h-[115px] sm:min-h-[210px] lg:min-h-[268px] rounded-lg sm:rounded-2xl bg-transparent border border-[#942E3A]/15 hover:border-[#942E3A] hover:bg-black/[0.02] transition-all duration-300 flex flex-col items-center justify-center p-0.5 sm:p-3 lg:p-4 text-center overflow-hidden"
              >
                <div className="flex items-center justify-center w-full h-full p-1 transition-transform duration-300 group-hover:scale-105">
                  <svg viewBox="0 0 24 24" className="w-14 sm:w-20 lg:w-24 h-auto max-h-[75%] fill-[#942E3A]">
                    <path d="M23.845 3.008c-.417-.533-1.146-.106-1.467.08-2.284 1.346-2.621 3.716-3.417 5.077-.626 1.09-1.652 1.89-2.58 1.952-.686.049-1.43-.084-2.168-.405-1.807-.781-2.78-1.792-3.017-1.97-.487-.37-4.23-4.015-7.28-4.164 0 0-.372-.75-.465-.763-.222-.025-.45.451-.616.501-.15.053-.413-.512-.565-.487-.153.02-.302.586-.6.877-.22.213-.486.2-.637.463-.052.096-.034.265-.093.42-.127.32-.551.354-.555.697 0 .381.357.454.669.72.248.212.265.362.554.461.258.088.632-.187.964-.088.277.081.543.14.602.423.054.256 0 .658-.34.613-.112-.015-.598-.174-1.198-.11-.725.077-1.553.309-1.634 1.11-.041.447.514.97 1.055.866.371-.071.196-.506.399-.716.267-.27 1.772.944 3.172.944.593 0 1.031-.15 1.467-.605.04-.029.093-.102.155-.11a.632.632 0 01.195.088c1.131.897 1.984 2.7 6.13 2.721.582.007 1.25.279 1.796.777.48.433.764 1.125 1.037 1.825.418 1.053 1.161 2.069 2.292 3.203.06.068.99.78 1.06.833.012.01.084.167.053.255-.02.69-.123 2.67 1.365 2.753.366.02.275-.231.275-.41-.005-.341-.065-.685.113-1.04.253-.478-.526-.709-.509-1.756.019-.784-.645-.651-.984-1.25-.19-.343-.368-.532-.35-.946.073-2.38-.517-3.948-.805-4.327-.227-.294-.423-.403-.207-.54 1.24-.815 1.525-1.574 1.525-1.574.66-1.541 1.256-2.945 2.075-3.57.166-.12.589-.44.852-.56.763-.362 1.173-.578 1.388-.788.356-.337.635-1.053.294-1.48z" />
                  </svg>
                </div>
              </Link>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* 3. CATEGORY TITLE */}
      <section className="px-2 sm:px-4 lg:px-6">
        <ScrollReveal>
          <div className="mx-auto max-w-[94vw] lg:max-w-[1320px] text-center border-b border-[#D8B46A]/40 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D8B46A] block">DE ROMA</span>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#942E3A] font-playfair tracking-tight mt-1">
              {t("home.featuredCollection")}
            </h2>
          </div>
        </ScrollReveal>
      </section>

      {/* 4. PRODUCT GRID (Infinite Scroll Row) */}
      <section className="px-2 sm:px-4 lg:px-6">
        <ScrollReveal>
          <div className="mx-auto max-w-[94vw] lg:max-w-[1320px]">
            {displayForYouProducts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-[#D8B46A] p-6">
                <ShoppingBag className="h-8 w-8 text-[#D8B46A] mx-auto mb-2" />
                <h3 className="text-sm font-bold text-[#942E3A]">{t("shopPage.noProductsFound")}</h3>
                <p className="text-[11px] text-[#D8B46A] mt-1">{t("shopPage.subtitle")}</p>
              </div>
            ) : (
              <>
                <style dangerouslySetInnerHTML={{ __html: `
                  .no-scrollbar::-webkit-scrollbar {
                    display: none !important;
                  }
                `}} />
                <div
                  ref={scrollRef}
                  onMouseDown={handleMouseDown}
                  className="flex overflow-x-auto flex-nowrap gap-3 sm:gap-4 py-4 px-1 no-scrollbar cursor-grab active:cursor-grabbing select-none"
                  style={{ 
                    WebkitOverflowScrolling: "touch",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none"
                  }}
                >
                  {repeatedProducts.map((product, idx) => (
                    <div
                      key={`${product.id}-${idx}`}
                      className="h-full w-[calc((94vw-20px)/2)] sm:w-[230px] shrink-0 pointer-events-auto"
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </ScrollReveal>
      </section>

      {/* 4.5 BEST SELLERS SECTION */}
      <section className="px-2 sm:px-4 lg:px-6">
        <ScrollReveal>
          <div className="mx-auto max-w-[94vw] lg:max-w-[1320px] space-y-6">
            <div className="text-center border-b border-[#D8B46A]/40 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D8B46A] block">DE ROMA</span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#942E3A] font-playfair tracking-tight mt-1">
                {t("home.bestSellers")}
              </h2>
            </div>

            <div
              ref={bestsellerScrollRef}
              onMouseDown={handleBestsellerMouseDown}
              className="flex overflow-x-auto flex-nowrap gap-3 sm:gap-4 py-4 px-1 no-scrollbar cursor-grab active:cursor-grabbing select-none"
              style={{ 
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
                msOverflowStyle: "none"
              }}
            >
              {displayBestsellerProducts.map((product) => (
                <div
                  key={`bestseller-${product.id}`}
                  className="h-full w-[calc((94vw-20px)/2)] sm:w-[230px] shrink-0 pointer-events-auto"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

    </div>
  );
}
