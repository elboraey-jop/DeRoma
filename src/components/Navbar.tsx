"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, Search, Heart, Menu, X, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cartStore";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const pathname = usePathname();
  const { setCartOpen, cartCount } = useCart();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchInput(false);
      setShowMobileSearch(false);
    }
  };

  const handleSearchClick = () => {
    if (window.innerWidth < 1024) {
      setShowMobileSearch(!showMobileSearch);
      setShowSearchInput(false);
    } else {
      setShowSearchInput(!showSearchInput);
      setShowMobileSearch(false);
    }
  };

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");

    const handleAuthChange = () => {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    };

    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const navLinks: { label: string; href: string; highlight?: boolean }[] = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "About Us", href: "/about" },
    { label: "Our Privacy", href: "/privacy" },
  ];

  return (
    <div className="sticky top-0 z-50 w-full px-3 pt-3 sm:px-4 lg:px-6 pointer-events-none mb-4 sm:mb-6" dir="ltr">
      <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between gap-2 sm:gap-3">
        
        {/* ELEMENT 1: Main Compact Floating Pill Card */}
        <header className="relative pointer-events-auto flex min-w-0 flex-1 h-12 sm:h-12 items-center justify-between rounded-[1.35rem] sm:rounded-full bg-[#942E3A]/95 text-white backdrop-blur-xl px-3 sm:px-5 shadow-xl border border-white/20 transition-all duration-300">
          
          {/* Left Side: Mobile Menu + Mobile Search on mobile; Desktop Logo on desktop */}
          <div className="flex items-center gap-1 z-10">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-full p-1.5 text-stone-200 hover:bg-white/10 hover:text-white lg:hidden transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            {/* Mobile Search button */}
            <button
              onClick={handleSearchClick}
              className="p-1.5 text-stone-200 hover:text-white hover:bg-white/10 rounded-full transition-colors lg:hidden"
              aria-label="Search"
            >
              <Search className="h-3.5 w-3.5" />
            </button>

            {/* Brand Logo - Desktop */}
            <Link href="/" className="hidden lg:flex min-w-0 items-center gap-1.5 group shrink">
              <span className="truncate text-base sm:text-lg font-extrabold tracking-tight text-white font-playfair">
                DeRoma
              </span>
            </Link>
          </div>

          {/* Absolutely centered Brand Logo for Mobile */}
          <Link href="/" className="absolute left-[56%] top-1/2 -translate-x-1/2 -translate-y-1/2 lg:hidden flex min-w-0 items-center gap-1.5 group z-0">
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-white font-playfair">
              DeRoma
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-x-0.5 bg-white/10 p-0.5 rounded-full border border-white/10 mx-2 z-10">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-[11px] font-semibold px-3 py-1 rounded-full transition-all duration-200 whitespace-nowrap",
                    isActive
                      ? "bg-[#FFF9EB] text-[#942E3A] shadow-xs font-bold"
                      : "text-stone-200 hover:text-[#FFF9EB] hover:bg-white/5"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Side: Desktop Search & Profile */}
          <div className="hidden lg:flex items-center shrink-0 gap-1.5 border-l border-white/20 pl-2 z-10">
            <AnimatePresence>
              {showSearchInput && (
                <form onSubmit={handleSearchSubmit}>
                  <motion.input
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 140, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    type="text"
                    placeholder="Search shoes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mr-1.5 text-[11px] bg-white/10 border border-white/20 rounded-full px-2.5 py-0.5 text-white placeholder-stone-300 focus:outline-none focus:ring-1 focus:ring-[#942E3A]"
                    autoFocus
                  />
                </form>
              )}
            </AnimatePresence>

            <button
              onClick={handleSearchClick}
              className="p-1.5 text-stone-200 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              aria-label="Search"
            >
              <Search className="h-3.5 w-3.5" />
            </button>

            {/* Profile / Sign In Link */}
            {isLoggedIn ? (
              <Link
                href="/profile"
                className="p-1.5 text-stone-200 hover:text-white hover:bg-white/10 rounded-full transition-colors flex items-center justify-center shrink-0"
                aria-label="Profile"
              >
                <User className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-[10px] sm:text-[11px] font-bold text-[#FFF9EB] hover:text-white hover:bg-white/10 transition-all p-1.5 sm:px-2.5 sm:py-1 rounded-full bg-white/10 flex items-center gap-1 shrink-0"
              >
                <User className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile search overlay container */}
          <AnimatePresence>
            {showMobileSearch && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: "-50%" }}
                animate={{ opacity: 1, scale: 1, y: "-50%" }}
                exit={{ opacity: 0, scale: 0.95, y: "-50%" }}
                transition={{ duration: 0.15 }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-48 h-8 rounded-full bg-[#942E3A]/95 text-white backdrop-blur-xl border border-white/20 px-2.5 shadow-xl lg:hidden flex items-center gap-1.5 z-50 pointer-events-auto"
              >
                <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center pl-0.5">
                  <Search className="w-3.5 h-3.5 text-[#D8B46A] mr-1.5 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-[11px] !bg-transparent !border-0 !p-0 !m-0 !h-full focus:outline-none focus:ring-0 !shadow-none text-white placeholder-stone-300"
                    autoFocus
                  />
                </form>
                <button 
                  onClick={() => {
                    setSearchQuery("");
                    setShowMobileSearch(false);
                  }}
                  type="button"
                  className="p-0.5 text-stone-300 hover:text-white rounded-full transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* ELEMENT 2: Independent Wishlist Circle Button */}
        <Link
          href="/shop?wishlist=true"
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="pointer-events-auto h-11 w-11 sm:h-12 sm:w-12 shrink-0 rounded-full bg-[#D8B46A]/95 text-[#FFF9EB] backdrop-blur-xl border border-white/20 shadow-xl flex items-center justify-center hover:bg-[#B8934A] transition-all hover:scale-105 active:scale-95"
          aria-label="Wishlist"
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-white text-white" : "text-stone-200"}`} />
        </Link>

        {/* ELEMENT 3: Independent Shopping Bag Floating Pill Button */}
        <button
          onClick={() => setCartOpen(true)}
          className="pointer-events-auto h-11 sm:h-12 shrink-0 rounded-full bg-[#D8B46A] text-[#FFF9EB] backdrop-blur-xl px-2.5 sm:px-4 shadow-md border border-white/20 flex items-center gap-1 sm:gap-1.5 hover:bg-[#B8934A] transition-all hover:scale-105 active:scale-95"
          aria-label="Shopping Bag"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span className="text-[11px] font-extrabold hidden sm:inline">Bag</span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#942E3A] text-[10px] font-extrabold text-[#FFF9EB] shadow-xs border border-white/20 sm:ml-0.5">
            {cartCount}
          </span>
        </button>

      </div>

      {/* Floating Mobile Drawer Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 6, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto mx-auto w-full max-w-[1320px] rounded-[1.5rem] bg-[#942E3A] border border-white/20 p-4 text-white shadow-xl lg:hidden mt-2"
          >
            <div className="flex items-center bg-white/10 border border-white/15 rounded-full px-3 py-1.5 mb-3">
              <Search className="w-3.5 h-3.5 text-stone-300 mr-2" />
              <input
                type="text"
                placeholder="Search women's shoes..."
                className="w-full text-xs bg-transparent focus:outline-none text-white placeholder-stone-300"
              />
            </div>

            <nav className="flex flex-col gap-y-0.5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors flex justify-between items-center",
                      isActive
                        ? "bg-[#FFF9EB] text-[#942E3A]"
                        : "text-stone-200 hover:text-[#FFF9EB] hover:bg-white/10"
                    )}
                  >
                    <span>{link.label}</span>
                    <span className={cn(
                      "text-[9px]",
                      isActive ? "text-[#FFF9EB]" : "text-stone-400"
                    )}>&rarr;</span>
                  </Link>
                );
              })}
              
              <div className="border-t border-white/10 my-2 pt-2">
                {isLoggedIn ? (
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="text-xs font-semibold text-stone-200 hover:text-white py-1.5 px-3 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>My Profile</span>
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="text-xs font-semibold text-stone-200 hover:text-white py-1.5 px-3 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </Link>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
