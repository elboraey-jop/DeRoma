"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, ArrowUpDown, X, Check, ChevronDown } from "lucide-react";
import ProductCard, { ProductWithVariants, COLOR_TRANSLATIONS } from "@/components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ScrollReveal";
import { useIsMobile } from "@/lib/useIsMobile";

interface ShopClientProps {
  initialProducts: ProductWithVariants[];
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
      return "#942E3A";
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

export default function ShopClient({ initialProducts }: ShopClientProps) {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("q") || "";
  const brands = ["New Balance", "Adidas", "Nike", "ASICS"];
  const initialBrands = searchParams.getAll("brand").flatMap((value) => value.split(","));
  const normalizedInitialBrands = brands.filter((brand) =>
    initialBrands.some((value) => value.trim().toLowerCase() === brand.toLowerCase())
  );
  const initialCat = searchParams.get("category") || "all";

  const [search, setSearch] = useState(initialSearch);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(normalizedInitialBrands);
  const [activeCategory, setActiveCategory] = useState(initialCat);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const isMobile = useIsMobile();
  const sortMenuRef = useRef<HTMLDivElement>(null);

  const sortOptions = [
    { value: "newest", label: "Newest Arrivals" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
  ];

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setSearch(q);
    const requestedBrands = searchParams.getAll("brand").flatMap((value) => value.split(","));
    setSelectedBrands(
      brands.filter((brand) => requestedBrands.some((value) => value.trim().toLowerCase() === brand.toLowerCase()))
    );
    const cat = searchParams.get("category") || "all";
    setActiveCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowSortMenu(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const allSizes = useMemo(() => {
    const sizes = new Set<string>();
    initialProducts.forEach((p) => p.variants.forEach((v) => sizes.add(v.size)));
    return Array.from(sizes).sort((a, b) => Number(a) - Number(b));
  }, [initialProducts]);

  const allColors = useMemo(() => {
    const colors = new Set<string>();
    initialProducts.forEach((p) => p.variants.forEach((v) => colors.add(v.color)));
    return Array.from(colors);
  }, [initialProducts]);

  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    if (search.trim() !== "") {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (activeCategory !== "all") {
      result = result.filter(
        (p) => (p.subcategory || p.category).toLowerCase() === activeCategory.toLowerCase(),
      );
    }

    if (selectedBrands.length > 0) {
      result = result.filter((p) => Boolean(p.brand && selectedBrands.includes(p.brand)));
    }

    if (selectedSizes.length > 0) {
      result = result.filter((p) =>
        p.variants.some((v) => selectedSizes.includes(v.size) && v.stock > 0)
      );
    }

    if (selectedColors.length > 0) {
      result = result.filter((p) =>
        p.variants.some((v) => selectedColors.includes(v.color))
      );
    }

    if (sortBy === "price-asc") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    }

    return result;
  }, [initialProducts, search, activeCategory, selectedBrands, selectedSizes, selectedColors, sortBy]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((item) => item !== brand) : [...prev, brand]
    );
    setActiveCategory("all");
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const clearFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedBrands([]);
    setSearch("");
    setActiveCategory("all");
    setSortBy("newest");
  };

  const hasActiveFilters =
    selectedBrands.length > 0 || selectedSizes.length > 0 || selectedColors.length > 0 || search !== "" || activeCategory !== "all";

  return (
    <div className="mx-auto max-w-[94vw] lg:max-w-[1320px] px-2 sm:px-4 lg:px-6 pb-6 pt-1 sm:py-6 bg-[#FFF9EB] text-[#942E3A]" dir="ltr">


      {/* Search & Sort Bar */}
      <div className="mb-6 flex flex-row items-center gap-2 sm:gap-3">
        {/* Search */}
        <div className="relative order-2 min-w-0 flex-1 sm:order-none">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D8B46A]" />
          <input
            type="text"
            placeholder="Search for heels, flats, boots..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-[#D8B46A] bg-white py-3 pl-10 pr-4 text-xs text-[#942E3A] placeholder-[#D8B46A] outline-none focus:border-[#942E3A] transition-colors font-sans shadow-xs"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#D8B46A] hover:text-[#942E3A] rounded-full"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="contents shrink-0 gap-x-2 sm:flex">
          {/* Mobile Filters Toggle */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="order-1 flex md:hidden items-center justify-center gap-x-1.5 rounded-full border border-[#D8B46A] bg-white px-3 py-3 text-xs font-bold text-[#942E3A] hover:bg-[#F2E7D5] whitespace-nowrap sm:order-none"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="h-2 w-2 rounded-full bg-[#942E3A]" />
            )}
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="order-3 sm:order-none hidden sm:flex h-[42px] items-center justify-center gap-x-1.5 rounded-full bg-[#942E3A] px-4 text-xs font-bold text-white hover:bg-[#76232D] transition-colors whitespace-nowrap shadow-md shadow-[#942E3A]/10"
            >
              <X className="h-3.5 w-3.5 text-[#D8B46A]" />
              <span>Clear Filters</span>
            </button>
          )}

          {/* Sort Dropdown */}
          <div ref={sortMenuRef} className="order-4 relative sm:order-none">
            <button
              type="button"
              onClick={() => setShowSortMenu((current) => !current)}
              aria-haspopup="listbox"
              aria-expanded={showSortMenu}
              className="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-[#D8B46A] bg-white text-xs text-[#942E3A] transition-colors hover:bg-[#F2E7D5] sm:h-auto sm:w-auto sm:justify-start sm:px-4 sm:py-3"
            >
              <ArrowUpDown className="h-4 w-4 text-[#D8B46A] sm:mr-2" />
              <span className="hidden font-bold sm:inline">
                {sortOptions.find((option) => option.value === sortBy)?.label}
              </span>
              <ChevronDown className="ml-2 hidden h-3.5 w-3.5 text-[#D8B46A] sm:inline" />
            </button>

            {showSortMenu && (
              <div
                role="listbox"
                aria-label="Sort products"
                className="absolute right-0 top-full z-40 mt-2 w-52 overflow-hidden rounded-2xl border border-[#D8B46A]/60 bg-[#FFF9EB] p-1.5 shadow-[0_14px_30px_rgba(93,13,24,0.18)]"
              >
                <p className="px-3 pb-1.5 pt-2 text-[9px] font-bold uppercase tracking-[0.16em] text-[#D8B46A]">
                  Sort by
                </p>
                {sortOptions.map((option) => {
                  const isSelected = sortBy === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSortMenu(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-colors ${
                        isSelected
                          ? "bg-[#942E3A] text-[#FFF9EB]"
                          : "text-[#942E3A] hover:bg-[#F2E7D5]"
                      }`}
                    >
                      <span>{option.label}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-[#D8B46A]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid & Filters */}
      <div className="flex gap-x-8">
        {/* Desktop Sidebar Filters */}
        <StaggerContainer className="hidden md:block w-64 flex-shrink-0 space-y-6">
          {/* Brands */}
          <StaggerItem direction="left" className="rounded-3xl border border-[#D8B46A]/40 bg-[#F2E7D5]/20 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-[#942E3A] mb-3 pb-2 border-b border-[#D8B46A]/30 font-playfair uppercase tracking-wider">Brands</h3>
            <div className="flex flex-col gap-y-1">
              {brands.map((brand) => {
                const isActive = selectedBrands.includes(brand);
                return (
                  <button
                    key={brand}
                    onClick={() => toggleBrand(brand)}
                    className={`text-left text-xs py-2 px-3 rounded-xl font-bold transition-all ${
                      isActive
                        ? "bg-[#D8B46A] text-[#FFF9EB] shadow-xs"
                        : "text-[#942E3A] hover:bg-[#F2E7D5] hover:text-[#942E3A]"
                    }`}
                  >
                    {brand}
                  </button>
                );
              })}
            </div>
          </StaggerItem>

          {/* Sizes */}
          <StaggerItem direction="left" className="rounded-3xl border border-[#D8B46A]/40 bg-[#F2E7D5]/20 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-[#942E3A] mb-3 pb-2 border-b border-[#D8B46A]/30 font-playfair uppercase tracking-wider">Women's Sizes</h3>
            <div className="grid grid-cols-4 gap-2">
              {allSizes.map((size) => {
                const isSelected = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`rounded-xl py-2 text-xs font-bold transition-all border ${
                      isSelected
                        ? "bg-[#D8B46A] border-[#D8B46A] text-[#FFF9EB] shadow-xs"
                        : "bg-[#FFF9EB] border-[#D8B46A] text-[#942E3A] hover:bg-[#F2E7D5]"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </StaggerItem>

          {/* Colors */}
          <StaggerItem direction="left" className="rounded-3xl border border-[#D8B46A]/40 bg-[#F2E7D5]/20 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-[#942E3A] mb-3 pb-2 border-b border-[#D8B46A]/30 font-playfair uppercase tracking-wider">Color Options</h3>
            <div className="flex flex-wrap gap-2">
              {allColors.map((color) => {
                const isSelected = selectedColors.includes(color);
                const hex = getColorHex(color);
                return (
                  <button
                    key={color}
                    onClick={() => toggleColor(color)}
                    className={`h-8 w-8 rounded-full border-2 transition-all flex items-center justify-center ${
                      isSelected ? "scale-110 border-[#D8B46A] ring-2 ring-[#D8B46A] ring-offset-2" : "border-stone-200"
                    }`}
                    style={{ backgroundColor: hex }}
                    title={color}
                  >
                    {isSelected && <Check className={`h-3.5 w-3.5 ${color === "أبيض" || color === "White" ? "text-[#942E3A]" : "text-white"}`} />}
                  </button>
                );
              })}
            </div>
          </StaggerItem>

          {hasActiveFilters && (
            <StaggerItem direction="left" className="w-full">
              <button
                onClick={clearFilters}
                className="w-full text-center py-2 text-xs font-bold text-[#942E3A] hover:underline"
              >
                Clear All Filters
              </button>
            </StaggerItem>
          )}
        </StaggerContainer>

        {/* Product Cards Grid */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[2rem] border border-[#D8B46A] p-8">
              <Search className="h-10 w-10 text-[#D8B46A] mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#942E3A]">No shoes match your criteria</h3>
              <p className="text-xs text-[#D8B46A] mt-1 mb-4">Try clearing some of your filters or searching for another term.</p>
              <button
                onClick={clearFilters}
                className="px-6 py-2.5 rounded-full bg-[#942E3A] text-white text-xs font-bold"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            isMobile ? (
              <div className="grid grid-cols-2 justify-items-center gap-2 w-full">
                {filteredProducts.map((p) => (
                  <div key={p.id} className="w-full flex justify-center">
                    <ProductCard product={p} mobileOptimized />
                  </div>
                ))}
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-2 justify-items-center gap-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4 w-full"
              >
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((p) => (
                    <motion.div
                      layout
                      key={p.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="w-full flex justify-center"
                    >
                      <ProductCard product={p} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              transition={{ duration: isMobile ? 0.08 : 0.2 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 z-[70] bg-black/45"
            />

            {/* Drawer Content */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: isMobile ? 0.12 : 0.25, ease: "easeOut" }}
              className="fixed bottom-0 left-0 right-0 z-[75] flex h-[78vh] max-h-full flex-col overflow-hidden rounded-t-[1.75rem] bg-[#FFF9EB] text-[#942E3A] shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#D8B46A]/40 bg-[#942E3A] px-5 py-4">
                <div className="flex items-center gap-x-2">
                  <SlidersHorizontal className="h-5 w-5 text-[#D8B46A]" />
                  <h2 className="text-lg font-bold font-playfair uppercase tracking-wider text-[#FFF9EB]">Filters</h2>
                </div>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="rounded-full p-1 text-[#FFF9EB] transition-colors hover:bg-white/10 hover:text-[#D8B46A]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable Filters List */}
              <div className="flex-1 overflow-y-auto space-y-6 px-5 py-5 no-scrollbar">
                {/* Brands */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#D8B46A]">Brands</h3>
                  <div className="flex flex-col gap-y-1">
                    {brands.map((brand) => {
                      const isActive = selectedBrands.includes(brand);
                      return (
                        <button
                          key={brand}
                          onClick={() => toggleBrand(brand)}
                          className={`text-left text-xs py-2.5 px-4 rounded-xl font-bold transition-all ${
                            isActive
                              ? "bg-[#D8B46A] text-[#FFF9EB] shadow-xs"
                              : "text-[#942E3A] hover:bg-[#F2E7D5] bg-white border border-[#D8B46A]/20"
                          }`}
                        >
                          {brand}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sizes */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#D8B46A]">Sizes</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {allSizes.map((size) => {
                      const isSelected = selectedSizes.includes(size);
                      return (
                        <button
                          key={size}
                          onClick={() => toggleSize(size)}
                          className={`rounded-xl py-2.5 text-xs font-bold transition-all border ${
                            isSelected
                              ? "bg-[#D8B46A] border-[#D8B46A] text-[#FFF9EB] shadow-xs"
                              : "bg-white border-[#D8B46A] text-[#942E3A] hover:bg-[#F2E7D5]"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Colors */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#D8B46A]">Colors</h3>
                  <div className="flex flex-wrap gap-2">
                    {allColors.map((color) => {
                      const isSelected = selectedColors.includes(color);
                      const hex = getColorHex(color);
                      return (
                        <button
                          key={color}
                          onClick={() => toggleColor(color)}
                          className={`h-9 w-9 rounded-full border-2 transition-all flex items-center justify-center ${
                            isSelected ? "scale-110 border-[#D8B46A] ring-2 ring-[#D8B46A] ring-offset-2" : "border-stone-200"
                          }`}
                          style={{ backgroundColor: hex }}
                          title={color}
                        >
                          {isSelected && <Check className={`h-4 w-4 ${color === "أبيض" || color === "White" ? "text-[#942E3A]" : "text-white"}`} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="mt-auto flex gap-3 border-t border-[#D8B46A]/40 bg-white/95 px-5 py-4">
                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      clearFilters();
                      setShowMobileFilters(false);
                    }}
                    className="flex-1 py-3 rounded-full border border-[#942E3A] text-xs font-bold text-[#942E3A] text-center hover:bg-[#F2E7D5] transition-colors"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 py-3 rounded-full bg-[#942E3A] text-xs font-bold text-white text-center hover:bg-[#942E3A]/90 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
