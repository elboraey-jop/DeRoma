"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, ArrowUpDown, X, Check } from "lucide-react";
import ProductCard, { ProductWithVariants, COLOR_TRANSLATIONS } from "@/components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";

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

export default function ShopClient({ initialProducts }: ShopClientProps) {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("q") || searchParams.get("brand") || "";
  const initialCat = searchParams.get("category") || "all";

  const [search, setSearch] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState(initialCat);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q") || searchParams.get("brand") || "";
    setSearch(q);
    const cat = searchParams.get("category") || "all";
    setActiveCategory(cat);
  }, [searchParams]);

  const categories = [
    { id: "all", name: "All Shoes" },
    { id: "heels", name: "Heels & Pumps" },
    { id: "flats", name: "Flats & Mules" },
    { id: "sandals", name: "Sandals" },
    { id: "boots", name: "Luxury Boots" },
    { id: "sneakers", name: "Chic Sneakers" },
  ];

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
      result = result.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase());
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
  }, [initialProducts, search, activeCategory, selectedSizes, selectedColors, sortBy]);

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
    setSearch("");
    setActiveCategory("all");
    setSortBy("newest");
  };

  const hasActiveFilters =
    selectedSizes.length > 0 || selectedColors.length > 0 || search !== "" || activeCategory !== "all";

  return (
    <div className="mx-auto max-w-[94vw] lg:max-w-[1320px] px-2 sm:px-4 lg:px-6 py-6 bg-[#FFF9EB] text-[#005F6B]" dir="ltr">
      {/* Page Title */}
      <div className="mb-4 text-left space-y-0.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#F88379]">FOR HER</span>
        <h1 className="text-2xl font-extrabold text-[#005F6B] font-playfair">Women's Footwear Boutique</h1>
        <p className="text-xs text-[#F88379]">Explore our curated collection of luxury handcrafted women's shoes.</p>
      </div>

      {/* Search & Sort Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#F88379]" />
          <input
            type="text"
            placeholder="Search for heels, flats, boots..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-[#F88379] bg-white py-3 pl-10 pr-4 text-xs text-[#005F6B] placeholder-[#F88379] outline-none focus:border-[#005F6B] transition-colors font-sans shadow-xs"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#F88379] hover:text-[#005F6B] rounded-full"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-x-2">
          {/* Mobile Filters Toggle */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex sm:hidden items-center justify-center gap-x-2 rounded-full border border-[#F88379] bg-white px-5 py-3 text-xs font-bold text-[#005F6B] hover:bg-[#F2D4D7]"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="h-2 w-2 rounded-full bg-[#005F6B]" />
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="relative flex items-center rounded-full border border-[#F88379] bg-white px-4 py-2 text-xs text-[#005F6B]">
            <ArrowUpDown className="h-4 w-4 mr-2 text-[#F88379]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent font-bold outline-none cursor-pointer text-[#005F6B] pr-4 pl-1 appearance-none text-xs"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid & Filters */}
      <div className="flex gap-x-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block w-64 flex-shrink-0 space-y-6">
          {/* Categories */}
          <div className="rounded-3xl border border-[#F88379]/40 bg-[#F2D4D7]/20 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-[#005F6B] mb-3 pb-2 border-b border-[#F88379]/30 font-playfair uppercase tracking-wider">Categories</h3>
            <div className="flex flex-col gap-y-1">
              {categories.map((cat) => {
                const isActive = cat.id === activeCategory;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`text-left text-xs py-2 px-3 rounded-xl font-bold transition-all ${
                      isActive
                        ? "bg-[#F88379] text-[#FFF9EB] shadow-xs"
                        : "text-[#005F6B] hover:bg-[#F2D4D7] hover:text-[#005F6B]"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sizes */}
          <div className="rounded-3xl border border-[#F88379]/40 bg-[#F2D4D7]/20 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-[#005F6B] mb-3 pb-2 border-b border-[#F88379]/30 font-playfair uppercase tracking-wider">Women's Sizes</h3>
            <div className="grid grid-cols-4 gap-2">
              {allSizes.map((size) => {
                const isSelected = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`rounded-xl py-2 text-xs font-bold transition-all border ${
                      isSelected
                        ? "bg-[#F88379] border-[#F88379] text-[#FFF9EB] shadow-xs"
                        : "bg-[#FFF9EB] border-[#F88379] text-[#005F6B] hover:bg-[#F2D4D7]"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Colors */}
          <div className="rounded-3xl border border-[#F88379]/40 bg-[#F2D4D7]/20 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-[#005F6B] mb-3 pb-2 border-b border-[#F88379]/30 font-playfair uppercase tracking-wider">Color Options</h3>
            <div className="flex flex-wrap gap-2">
              {allColors.map((color) => {
                const isSelected = selectedColors.includes(color);
                const hex = getColorHex(color);
                return (
                  <button
                    key={color}
                    onClick={() => toggleColor(color)}
                    className={`h-8 w-8 rounded-full border-2 transition-all flex items-center justify-center ${
                      isSelected ? "scale-110 border-[#F88379] ring-2 ring-[#F88379] ring-offset-2" : "border-stone-200"
                    }`}
                    style={{ backgroundColor: hex }}
                    title={color}
                  >
                    {isSelected && <Check className={`h-3.5 w-3.5 ${color === "أبيض" ? "text-[#005F6B]" : "text-white"}`} />}
                  </button>
                );
              })}
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="w-full text-center py-2 text-xs font-bold text-[#005F6B] hover:underline"
            >
              Clear All Filters
            </button>
          )}
        </aside>

        {/* Product Cards Grid */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[2rem] border border-[#F88379] p-8">
              <Search className="h-10 w-10 text-[#F88379] mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#005F6B]">No shoes match your criteria</h3>
              <p className="text-xs text-[#F88379] mt-1 mb-4">Try clearing some of your filters or searching for another term.</p>
              <button
                onClick={clearFilters}
                className="px-6 py-2.5 rounded-full bg-[#005F6B] text-white text-xs font-bold"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:gap-6 lg:grid-cols-3">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
