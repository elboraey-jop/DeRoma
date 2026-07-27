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
  ShieldCheck,
  Headphones,
  RotateCcw,
  Activity,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Quote,
  Star
} from "lucide-react";
import ProductCard, { ProductWithVariants } from "./ProductCard";

export default function HomeClient({ products }: { products: ProductWithVariants[] }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [activeReview, setActiveReview] = useState(0);
  const [reviewDirection, setReviewDirection] = useState(1);
  const [isReviewLeaving, setIsReviewLeaving] = useState(false);
  const [returningReview, setReturningReview] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bestsellerScrollRef = useRef<HTMLDivElement>(null);

  const cardWidth = 246; // 230px card + 16px gap
  const singleCopyWidth = products.length * cardWidth;
  const repeatCount = Math.max(8, Math.ceil(8000 / (singleCopyWidth || 1)));

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || products.length === 0) return;

    const singleWidth = container.scrollWidth / repeatCount;
    const middleIndex = Math.floor(repeatCount / 2);
    container.scrollLeft = middleIndex * singleWidth;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const singleWidth = container.scrollWidth / repeatCount;
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
      const singleWidth = container.scrollWidth / repeatCount;
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 120 } },
  };

  const heroCards = [
    // CARD 1: RETRO SNEAKERS
    {
      id: 1,
      tag: "THE FEMININE EDIT",
      title: "Soft Sport Icons",
      desc: "Pastel runners and everyday silhouettes for easy comfort, soft colour, and feminine street style.",
      href: "/shop?category=retro",
      image: "/banners/hero-1-desktop.webp",
      mobileImage: "/banners/hero-1-mobile.webp"
    },
    // CARD 2: PERFORMANCE SNEAKERS
    {
      id: 2,
      tag: "NEW RELEASE",
      title: "Performance Running & Gym",
      desc: "Super-lightweight cushioned trainers from Asics & Nike engineered for gym workouts, daily running, and support.",
      href: "/shop?category=running",
      image: "/banners/hero-2-desktop.webp",
      mobileImage: "/banners/hero-2-mobile.webp"
    },
    // CARD 3: CHUNKY PLATFORMS
    {
      id: 3,
      tag: "LIFESTYLE DROP",
      title: "Chunky & Platform Soles",
      desc: "Bold elevated profiles combined with soft memory foam footbeds for maximum casual comfort.",
      href: "/shop?category=chunky",
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
  const currentTheme = cardThemes[currentIndex];

  const reviews = [
    {
      brand: "NEW BALANCE",
      initials: "NB",
      model: "530 Beige",
      rating: 5,
      quote: "The fit is perfect and the quality feels even better in person. DeRoma made choosing my everyday pair effortless.",
      name: "Mariam A.",
      detail: "Verified DeRoma customer",
    },
    {
      brand: "ADIDAS",
      initials: "AD",
      model: "Handball Spezial",
      rating: 4,
      quote: "Exactly the pair I was looking for. The delivery was quick, the packaging was beautiful, and the shoes are so comfortable.",
      name: "Youssef M.",
      detail: "Verified DeRoma customer",
    },
    {
      brand: "ASICS",
      initials: "AS",
      model: "Gel-Kayano 14",
      rating: 5,
      quote: "Finally found a stylish running shoe that feels light all day. The sizing guide was spot on.",
      name: "Nour K.",
      detail: "Verified DeRoma customer",
    },
    {
      brand: "NIKE",
      initials: "NK",
      model: "V2K Run",
      rating: 4,
      quote: "The whole experience feels premium—from browsing the collection to wearing my new favourite sneakers.",
      name: "Omar H.",
      detail: "Verified DeRoma customer",
    },
    {
      brand: "PUMA",
      initials: "PM",
      model: "Palermo Vintage",
      rating: 3,
      quote: "A beautiful everyday sneaker with a really easy-to-style colourway. I have been wearing it nonstop.",
      name: "Salma R.",
      detail: "Verified DeRoma customer",
    },
    {
      brand: "ADIDAS",
      initials: "AD",
      model: "Campus 00s",
      rating: 5,
      quote: "The sizing advice helped me choose confidently, and the pair arrived exactly as pictured.",
      name: "Jana E.",
      detail: "Verified DeRoma customer",
    },
    {
      brand: "NEW BALANCE",
      initials: "NB",
      model: "327 Burgundy",
      rating: 4,
      quote: "Super light, very comfortable, and the burgundy detail makes the whole outfit feel more special.",
      name: "Farah S.",
      detail: "Verified DeRoma customer",
    },
    {
      brand: "NIKE",
      initials: "NK",
      model: "Court Vision Low",
      rating: 3,
      quote: "Clean design and a comfortable sole for daily wear. The delivery experience was smooth from start to finish.",
      name: "Lina M.",
      detail: "Verified DeRoma customer",
    },
  ];

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
      window.setTimeout(() => setReturningReview(null), 900);
    }, 620);
  };

  const selectReview = (index: number) => {
    setReviewDirection(index >= activeReview ? 1 : -1);
    setActiveReview(index);
  };

  const handleReviewDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number }; velocity: { x: number } }) => {
    if (Math.abs(info.offset.x) > 45 || Math.abs(info.velocity.x) > 350) {
      // A hand swipe always dismisses the front card and reveals the card underneath.
      // The swipe direction only controls the visual direction of the exit.
      changeReview(1, info.offset.x < 0 ? 1 : -1);
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

  const filteredProducts = products;
  const repeatedProducts = Array(repeatCount).fill(filteredProducts).flat();

  return (
    <div className="w-full flex flex-col space-y-8 pb-16 bg-[#FFF9EB] text-[#942E3A]" dir="ltr">
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

                {false && currentIndex === 0 && (
                  <div className="relative flex h-[420px] flex-col overflow-hidden bg-[#942E3A] text-[#FFF9EB] sm:grid sm:grid-cols-1 sm:grid-rows-[1.22fr_0.78fr] sm:h-[440px] lg:h-[460px] lg:grid-cols-[0.88fr_1.12fr] lg:grid-rows-1">
                    {/* Quiet brand canvas */}
                    <div className="pointer-events-none absolute -bottom-40 -left-20 h-[430px] w-[430px] rounded-full border border-[#D8B46A]/15" />
                    <div className="pointer-events-none absolute -bottom-28 -left-8 h-[300px] w-[300px] rounded-full border border-[#D8B46A]/10" />
                    <div className="pointer-events-none absolute right-[38%] top-1/2 hidden -translate-y-1/2 select-none font-sans text-[180px] font-black leading-none tracking-[-0.12em] text-white/[0.035] lg:block">D</div>

                    {/* Editorial copy */}
                    <div className="relative z-20 flex h-full flex-col justify-between p-5 pb-[128px] sm:p-9 sm:pb-9 lg:p-12">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="font-playfair text-lg font-semibold text-[#D8B46A]">DeRoma</span>
                          <span className="h-px w-8 bg-[#D8B46A]/60" />
                          <span className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#FFF9EB]/55">Edition 01</span>
                        </div>
                        <span className="text-[10px] font-bold tracking-[0.18em] text-[#D8B46A]">01 / 03</span>
                      </div>

                      <div className="max-w-[390px] py-3 sm:py-5 lg:py-0">
                        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#D8B46A]">{currentCard.tag}</p>
                        <h1 className="font-playfair text-[2.35rem] font-normal leading-[0.9] tracking-[-0.045em] text-[#FFF9EB] sm:text-5xl lg:text-[3.9rem]">Soft<br />Sport<br /><em className="text-[#D8B46A]">Icons</em></h1>
                        <p className="mt-4 max-w-[330px] text-[11px] leading-relaxed text-[#FFF9EB]/70 sm:text-sm">A feminine everyday edit in soft colour, easy comfort, and unmistakable street style.</p>
                        <Link href={currentCard.href} className="group mt-5 inline-flex items-center gap-4 rounded-full bg-[#FFF9EB] py-2 pl-5 pr-2 text-[11px] font-bold text-[#942E3A] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#D8B46A]">
                          <span>Shop the collection</span>
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#942E3A] text-[#FFF9EB] transition-transform duration-300 group-hover:translate-x-0.5"><ArrowRight className="h-4 w-4" /></span>
                        </Link>
                      </div>

                      <div className="flex items-center gap-4 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#FFF9EB]/55">
                        <span>New Balance</span><span className="h-1 w-1 rounded-full bg-[#D8B46A]" /><span>Adidas</span><span className="h-1 w-1 rounded-full bg-[#D8B46A]" /><span>Daily icons</span>
                      </div>
                    </div>

                    {/* Product portrait */}
                    <div className="absolute bottom-4 left-4 right-4 z-10 h-[105px] min-h-0 p-0 sm:relative sm:inset-auto sm:h-auto sm:p-7 sm:pt-0 lg:min-h-0 lg:p-8 lg:pl-0 lg:pr-10 lg:py-10">
                      <div className="relative h-full min-h-0 overflow-hidden rounded-[1.5rem] border border-[#FFF9EB]/50 bg-[#FFF9EB] shadow-[0_22px_50px_rgba(28,10,14,0.25)] sm:rounded-[2rem] lg:min-h-0">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_28%,rgba(216,180,106,0.32),transparent_26%),linear-gradient(145deg,#fff9eb_0%,#f3dfd1_100%)]" />
                        <div className="absolute inset-x-5 top-14 h-px bg-[#942E3A]/15" />
                        <div className="absolute inset-x-5 bottom-14 h-px bg-[#942E3A]/15" />
                        <div className="absolute left-5 top-5 z-10 flex items-center gap-2 text-[#942E3A]/60"><span className="h-1.5 w-1.5 rounded-full bg-[#D8B46A]" /><span className="text-[9px] font-bold uppercase tracking-[0.22em]">New Balance · 9060</span></div>
                        <Image src={currentCard.image} alt={currentCard.title} fill className="relative z-[1] scale-[1.3] object-contain p-0 mix-blend-multiply transition-transform duration-700 hover:scale-[1.38] sm:scale-[1.38] sm:hover:scale-[1.46] lg:scale-[1.45] lg:hover:scale-[1.52]" priority />
                        <div className="absolute bottom-5 left-5 z-10 font-playfair text-2xl italic text-[#942E3A]">01</div>
                        <div className="absolute bottom-5 right-5 z-10 text-right"><p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#942E3A]/55">Pastel pink</p><p className="mt-1 font-playfair text-xl italic text-[#942E3A]">Everyday, elevated.</p></div>
                      </div>
                    </div>
                  </div>
                )}

                {false && currentIndex === 1 && (
                  <div className="w-full h-full p-5 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 items-center gap-6 relative min-h-[420px] sm:min-h-[440px] lg:min-h-[460px] overflow-hidden text-left">
                    {/* Large outline text watermark behind everything */}
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[90px] sm:text-[130px] lg:text-[160px] font-black text-[#942E3A]/5 select-none uppercase tracking-widest font-sans pointer-events-none z-0">
                      SNEAKERS
                    </div>

                    {/* Left Column: Floating Content Box */}
                    <div className="lg:col-span-6 z-20 flex flex-col justify-center pointer-events-auto">
                      <div className="bg-[#942E3A] text-[#FFF9EB] p-5 sm:p-7 rounded-2xl max-w-sm shadow-xl flex flex-col space-y-3.5">
                        <span className="text-[#FFF9EB]/60 text-[9px] font-bold uppercase tracking-widest font-sans">
                          {currentCard.tag}
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight uppercase font-sans text-[#FFF9EB]">
                          {currentCard.title}
                        </h1>
                        <p className="text-[11px] sm:text-xs text-stone-200 font-light leading-relaxed">
                          {currentCard.desc}
                        </p>
                        <Link
                          href={currentCard.href}
                          className="inline-flex items-center justify-center rounded-full bg-[#FFF9EB] text-[#942E3A] hover:bg-[#FFF9EB]/90 px-5 py-2 text-xs font-bold transition-all w-fit shadow-md"
                        >
                          <span>Shop Sneakers</span>
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* Right Column: Large Floating Shoe */}
                    <div className="lg:col-span-6 relative flex justify-center items-center pointer-events-auto z-10">
                      <div className="relative w-full max-w-[220px] sm:max-w-[280px] aspect-[4/3] flex items-center justify-center">
                        {/* Soft backing glow */}
                        <div className="absolute w-[80%] h-[80%] rounded-full bg-[#942E3A]/10 blur-2xl z-0" />
                        
                        {/* Image wrapper */}
                        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-md border border-[#942E3A]/5 z-10">
                          <Image
                            src={currentCard.image}
                            alt={currentCard.title}
                            fill
                            className="object-cover transition-transform duration-700 hover:scale-105"
                            priority
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {false && currentIndex === 2 && (
                  <div className="w-full h-full p-5 sm:p-8 lg:p-10 flex flex-col justify-center items-center text-center relative min-h-[420px] sm:min-h-[440px] lg:min-h-[460px]">
                    {/* Frame Portrait of Boots */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-[#942E3A]/20 p-1.5 shadow-2xl flex items-center justify-center overflow-hidden mb-5">
                      <div className="relative w-full h-full rounded-full overflow-hidden">
                        <Image
                          src={currentCard.image}
                          alt={currentCard.title}
                          fill
                          className="object-cover transition-transform duration-700 hover:scale-105"
                          priority
                        />
                      </div>
                    </div>

                    {/* Typography */}
                    <div className="flex flex-col items-center space-y-2 max-w-md pointer-events-auto">
                      <span className="text-[#D8B46A] text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase font-sans">
                        {currentCard.tag}
                      </span>
                      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif italic text-[#942E3A] tracking-tight leading-tight">
                        {currentCard.title}
                      </h1>
                      <p className="text-xs sm:text-sm text-[#942E3A]/70 font-sans font-light max-w-sm leading-relaxed mt-1">
                        {currentCard.desc}
                      </p>
                      
                      <div className="pt-4">
                        <Link
                          href={currentCard.href}
                          className="group inline-flex items-center gap-1.5 text-xs font-semibold text-[#942E3A] hover:text-[#942E3A]/80 transition-colors"
                        >
                          <span>Explore Platforms</span>
                          <ArrowRight className="h-3.5 w-3.5 translate-x-0 group-hover:translate-x-1.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Responsive artwork supplied by DeRoma */}
                <picture className="absolute inset-0 z-10 block h-full w-full">
                  <source media="(max-width: 639px)" srcSet={currentCard.mobileImage} />
                  <img
                    src={currentCard.image}
                    alt={currentCard.title}
                    className="h-full w-full select-none object-cover"
                    draggable={false}
                  />
                </picture>

                {currentIndex === 0 && (
                  <Link
                    href={currentCard.href}
                    onPointerDown={(event) => event.stopPropagation()}
                    className="absolute bottom-[3.8%] left-[39.8%] z-20 inline-flex -translate-x-1/2 items-center justify-center rounded-full bg-[#942E3A] px-4 py-2 text-[10px] font-bold tracking-wide text-[#FFF9EB] shadow-md transition-transform hover:scale-105 hover:bg-[#7d2530] sm:bottom-[8%] sm:left-[27.5%] sm:px-8 sm:py-3 sm:text-sm"
                  >
                    SHOP NOW
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
                  <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#D8B46A]">THE DE ROMA EDIT</span>
                  <h2 className="mt-1 font-playfair text-xl font-semibold leading-tight sm:text-2xl">Loved by every step.</h2>
                  <div className="mt-3 flex items-center gap-1.5 text-[#D8B46A]" aria-label="5 out of 5 stars">
                    {Array.from({ length: 5 }).map((_, index) => <Star key={index} className="h-3.5 w-3.5 fill-current" />)}
                    <span className="ml-1 text-[10px] font-semibold text-[#FFF9EB]/75">4.9 / 5</span>
                  </div>
                  <p className="mt-3 hidden max-w-[190px] text-[10px] leading-relaxed text-[#FFF9EB]/60 sm:block">Swipe the cards to discover what our sneaker community is saying.</p>
                </div>

                <div className="relative min-w-0 flex-1 sm:h-[190px]">
                  <div className="relative mx-auto h-[220px] w-full max-w-[620px] sm:h-full">
                    {[0, 1, 2, ...(returningReview !== null ? [3] : [])].map((stackPosition) => {
                      const isReturning = stackPosition === 3 && returningReview !== null;
                      const reviewIndex = isReturning ? returningReview : (activeReview + stackPosition) % reviews.length;
                      const review = reviews[reviewIndex];
                      const isFront = stackPosition === 0;

                      return (
                        <motion.article
                          key={isReturning ? `${review.model}-returning` : review.model}
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
                            ? { duration: 0.62, ease: [0.22, 1, 0.36, 1] }
                            : isReturning
                              ? { duration: 0.9, ease: [0.22, 1, 0.36, 1] }
                            : { type: "spring", stiffness: 150, damping: 26, mass: 0.9 }}
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
                            <p className="max-w-[540px] font-playfair text-base leading-snug sm:text-lg">“{review.quote}”</p>
                            <div className="flex items-center justify-between gap-3 text-[10px]">
                              <span className="font-bold tracking-[0.14em] text-[#D8B46A]">{review.brand}</span>
                              <span className="text-[#942E3A]/55">{review.detail}</span>
                            </div>
                          </div>
                        </motion.article>
                      );
                    })}
                  </div>
                  <div className="absolute -bottom-1 left-0 right-0 z-40 flex items-center justify-center gap-1.5 sm:-bottom-3">
                    {reviews.map((review, index) => <button key={`${review.brand}-${index}`} type="button" onClick={() => selectReview(index)} aria-label={`Show ${review.brand} review`} className={`h-1.5 rounded-full transition-all duration-300 ${index === activeReview ? "w-6 bg-[#D8B46A]" : "w-1.5 bg-[#FFF9EB]/45 hover:bg-[#FFF9EB]"}`} />)}
                  </div>
                </div>

                <div className="absolute right-0 top-0 z-40 flex gap-1.5 sm:right-0 sm:top-auto sm:bottom-1">
                  <button type="button" onClick={() => changeReview(-1)} aria-label="Previous review" className="rounded-full border border-[#FFF9EB]/25 bg-[#942E3A]/60 p-1.5 transition-colors hover:border-[#D8B46A] hover:text-[#D8B46A]"><ChevronLeft className="h-4 w-4" /></button>
                  <button type="button" onClick={() => changeReview(1)} aria-label="Next review" className="rounded-full border border-[#FFF9EB]/25 bg-[#942E3A]/60 p-1.5 transition-colors hover:border-[#D8B46A] hover:text-[#D8B46A]"><ChevronRight className="h-4 w-4" /></button>
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
                OUR COLLECTIONS
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D8B46A] block">FOR HER</span>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#942E3A] font-playfair tracking-tight mt-1">
              BOUTIQUE HIGHLIGHTS
            </h2>
          </div>
        </ScrollReveal>
      </section>

      {/* 4. PRODUCT GRID (Infinite Scroll Row) */}
      <section className="px-2 sm:px-4 lg:px-6">
        <ScrollReveal>
          <div className="mx-auto max-w-[94vw] lg:max-w-[1320px]">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-[#D8B46A] p-6">
                <ShoppingBag className="h-8 w-8 text-[#D8B46A] mx-auto mb-2" />
                <h3 className="text-sm font-bold text-[#942E3A]">No shoes found</h3>
                <p className="text-[11px] text-[#D8B46A] mt-1">Explore our full boutique collection to view all women's styles.</p>
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

      {/* 8. TRUST FOOTNOTE BAR */}
      <section className="px-2 sm:px-4 lg:px-6">
        <StaggerContainer className="w-full mx-auto max-w-[94vw] lg:max-w-[1320px] grid !grid-cols-4 gap-x-1.5 gap-y-0 sm:gap-y-6 sm:gap-x-4 bg-white border border-[#D8B46A]/45 rounded-2xl p-3 sm:p-5 shadow-xs">
          
          <StaggerItem direction="up" scale={true} className="w-full min-w-0 flex flex-col items-center text-center gap-1 sm:gap-2 justify-center">
            <div className="p-1.5 sm:p-2 rounded-xl bg-[#FFF9EB] text-[#D8B46A] shrink-0 sm:mb-1">
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="flex flex-col items-center w-full">
              <p className="text-[9px] sm:text-xs font-bold text-[#942E3A] leading-tight">Quick Fitting</p>
              <p className="text-[7px] sm:text-[9px] text-[#D8B46A] mt-0.5 leading-snug max-w-[72px] sm:max-w-[130px]">Try on sizes at your door</p>
            </div>
          </StaggerItem>

          <StaggerItem direction="up" scale={true} className="w-full min-w-0 flex flex-col items-center text-center gap-1 sm:gap-2 justify-center">
            <div className="p-1.5 sm:p-2 rounded-xl bg-[#FFF9EB] text-[#D8B46A] shrink-0 sm:mb-1">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="flex flex-col items-center w-full">
              <p className="text-[9px] sm:text-xs font-bold text-[#942E3A] leading-tight">Mirror Quality</p>
              <p className="text-[7px] sm:text-[9px] text-[#D8B46A] mt-0.5 leading-snug max-w-[72px] sm:max-w-[130px]">Nike & New Balance sports</p>
            </div>
          </StaggerItem>

          <StaggerItem direction="up" scale={true} className="w-full min-w-0 flex flex-col items-center text-center gap-1 sm:gap-2 justify-center">
            <div className="p-1.5 sm:p-2 rounded-xl bg-[#FFF9EB] text-[#D8B46A] shrink-0 sm:mb-1">
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="flex flex-col items-center w-full">
              <p className="text-[9px] sm:text-xs font-bold text-[#942E3A] leading-tight">Sole Cushioning</p>
              <p className="text-[7px] sm:text-[9px] text-[#D8B46A] mt-0.5 leading-snug max-w-[72px] sm:max-w-[130px]">Perfect for running & gym</p>
            </div>
          </StaggerItem>

          <StaggerItem direction="up" scale={true} className="w-full min-w-0 flex flex-col items-center text-center gap-1 sm:gap-2 justify-center">
            <div className="p-1.5 sm:p-2 rounded-xl bg-[#FFF9EB] text-[#D8B46A] shrink-0 sm:mb-1">
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="flex flex-col items-center w-full">
              <p className="text-[9px] sm:text-xs font-bold text-[#942E3A] leading-tight">Easy Exchanges</p>
              <p className="text-[7px] sm:text-[9px] text-[#D8B46A] mt-0.5 leading-snug max-w-[72px] sm:max-w-[130px]">Fast swap for perfect fit</p>
            </div>
          </StaggerItem>

        </StaggerContainer>
      </section>

      {/* 4.5 BEST SELLERS SECTION */}
      <section className="px-2 sm:px-4 lg:px-6">
        <ScrollReveal>
          <div className="mx-auto max-w-[94vw] lg:max-w-[1320px] space-y-6">
            <div className="text-center border-b border-[#D8B46A]/40 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D8B46A] block">BEST SELLERS</span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#942E3A] font-playfair tracking-tight mt-1">
                BESTSELLER HIGHLIGHTS
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
              {products.slice(0, 4).map((product) => (
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
