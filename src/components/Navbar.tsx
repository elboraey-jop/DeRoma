"use client";

import { Fragment, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, Search, Heart, Menu, X, User, Home, Store, Info, ShieldCheck, PackageSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cartStore";
import { useWishlist } from "@/lib/wishlistStore";
import { logoutCustomerAction } from "@/app/auth-actions";
import { motion, AnimatePresence } from "framer-motion";
import { useStoreI18n } from "@/providers/StoreI18nContext";
import StoreLangToggle from "@/components/StoreLangToggle";

export default function Navbar({ hasAnnouncement = false }: { hasAnnouncement?: boolean }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { count } = useWishlist();
  const isWishlisted = count > 0;
  const pathname = usePathname();
  const { setCartOpen, cartCount } = useCart();
  const { t, dir, lang } = useStoreI18n();

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

  const navLinks: { labelKey: string; href: string; icon: typeof Home }[] = [
    { labelKey: "nav.home", href: "/", icon: Home },
    { labelKey: "nav.shop", href: "/shop", icon: Store },
    { labelKey: "nav.about", href: "/about", icon: Info },
    { labelKey: "nav.privacy", href: "/privacy", icon: ShieldCheck },
    { labelKey: "nav.trackOrder", href: "/track", icon: PackageSearch },
  ];

  const shopCategories = [
    { labelKey: "nav.categories.shoes", href: "/shop", comingSoon: false },
    { labelKey: "nav.categories.bags", href: "/shop/bags", comingSoon: true },
    { labelKey: "nav.categories.perfumes", href: "/shop/perfumes", comingSoon: true },
    { labelKey: "nav.categories.accessories", href: "/shop/accessories", comingSoon: true },
  ];

  return (
    <div className={cn(
      "w-full px-3 sm:px-4 lg:px-6 pointer-events-none",
      hasAnnouncement ? "pt-1.5 sm:pt-2" : "pt-3"
    )} dir={dir}>
      <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between gap-2 sm:gap-3">
        
        {/* ELEMENT 1: Main Compact Floating Pill Card */}
        <header className="relative pointer-events-auto flex min-w-0 flex-1 h-12 sm:h-12 items-center justify-between rounded-[1.35rem] sm:rounded-full bg-[#942E3A]/95 text-white backdrop-blur-xl px-3 sm:px-5 shadow-xl border border-white/20 transition-all duration-300">
          
          {/* Left Side (or Right in RTL): Mobile Menu + Search on mobile; Brand Logo on desktop */}
          <div className="flex items-center gap-1 z-10">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-full p-1.5 text-[#FFF9EC]/90 hover:bg-white/10 hover:text-[#FFF9EC] lg:hidden transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            {/* Mobile Search button */}
            <button
              onClick={handleSearchClick}
              className="p-1.5 text-[#FFF9EC]/90 hover:text-[#FFF9EC] hover:bg-white/10 rounded-full transition-colors lg:hidden"
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
          <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:hidden flex min-w-0 items-center gap-1.5 group z-0">
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
                      : "text-[#FFF9EC]/90 hover:text-[#FFF9EC] hover:bg-white/5"
                  )}
                >
                  {t(link.labelKey)}
                </Link>
              );
            })}
          </nav>

          {/* Right Side: Desktop Search, Sign In, AND Language Toggle */}
          <div className="hidden lg:flex items-center shrink-0 gap-1.5 border-l border-white/20 rtl:border-l-0 rtl:border-r rtl:pl-0 rtl:pr-2 pl-2 z-10">
            <AnimatePresence>
              {showSearchInput && (
                <form onSubmit={handleSearchSubmit}>
                  <motion.input
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 140, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    type="text"
                    placeholder={t("nav.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mr-1.5 rtl:mr-0 rtl:ml-1.5 text-[11px] bg-white/10 border border-white/20 rounded-full px-2.5 py-0.5 text-white placeholder-stone-300 focus:outline-none focus:ring-1 focus:ring-[#942E3A]"
                    autoFocus
                  />
                </form>
              )}
            </AnimatePresence>

            <button
              onClick={handleSearchClick}
              className="p-1.5 text-[#FFF9EC]/90 hover:text-[#FFF9EC] hover:bg-white/10 rounded-full transition-colors"
              aria-label="Search"
            >
              <Search className="h-3.5 w-3.5" />
            </button>

            {/* Profile / Sign In Link */}
            {isLoggedIn ? (
              <Link
                href="/profile"
              className="p-1.5 text-[#FFF9EC]/90 hover:text-[#FFF9EC] hover:bg-white/10 rounded-full transition-colors flex items-center justify-center shrink-0"
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
                <span>{t("nav.signIn")}</span>
              </Link>
            )}

            {/* Language Switcher Pill next to Sign In */}
            <StoreLangToggle variant="desktop" />
          </div>

          {/* Mobile search overlay container */}
          <AnimatePresence>
            {showMobileSearch && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: "-50%" }}
                animate={{ opacity: 1, scale: 1, y: "-50%" }}
                exit={{ opacity: 0, scale: 0.95, y: "-50%" }}
                transition={{ duration: 0.15 }}
                className="absolute right-2 rtl:right-auto rtl:left-2 top-1/2 -translate-y-1/2 w-48 h-8 rounded-full bg-[#942E3A]/95 text-white backdrop-blur-xl border border-white/20 px-2.5 shadow-xl lg:hidden flex items-center gap-1.5 z-50 pointer-events-auto"
              >
                <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center pl-0.5">
                  <Search className="w-3.5 h-3.5 text-[#D8B46A] mr-1.5 rtl:mr-0 rtl:ml-1.5 shrink-0" />
                  <input
                    type="text"
                    placeholder={t("nav.searchAction")}
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
          href="/wishlist"
          className="relative pointer-events-auto h-11 w-11 sm:h-12 sm:w-12 shrink-0 rounded-full bg-[#EADFC8] text-[#6B1F2A] backdrop-blur-xl border border-white/20 shadow-xl flex items-center justify-center hover:bg-[#DFD4BC] transition-all hover:scale-105 active:scale-95"
          aria-label="Wishlist"
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-[#942E3A] text-[#942E3A]" : "text-[#6B1F2A]"}`} />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 rtl:-left-1 rtl:right-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#942E3A] text-[10px] font-extrabold text-[#FFF9EB] border border-white/20 shadow-md animate-in zoom-in-75 duration-200">
              {count}
            </span>
          )}
        </Link>

        {/* ELEMENT 3: Independent Shopping Bag Floating Pill Button */}
        <button
          onClick={() => setCartOpen(true)}
          className="pointer-events-auto h-11 sm:h-12 shrink-0 rounded-full bg-[#EADFC8] text-[#6B1F2A] backdrop-blur-xl px-2.5 sm:px-4 shadow-md border border-white/20 flex items-center gap-1 sm:gap-1.5 hover:bg-[#DFD4BC] transition-all hover:scale-105 active:scale-95"
          aria-label="Shopping Bag"
        >
          <ShoppingBag className="h-3.5 w-3.5 text-[#6B1F2A]" />
          <span className="text-[11px] font-extrabold hidden sm:inline text-[#6B1F2A]">{t("nav.bag")}</span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#942E3A] text-[10px] font-extrabold text-[#FFF9EB] shadow-xs border border-white/20 sm:ml-0.5">
            {cartCount}
          </span>
        </button>

      </div>

      {/* Mobile Drawer (Sidebar) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="pointer-events-auto fixed inset-0 z-[70] bg-[#8B7CC7]/45 backdrop-blur-[2px] lg:hidden"
            />

            {/* Sidebar Panel - Adjusts position and slide direction for RTL */}
            <motion.div
              initial={{ x: dir === "rtl" ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: dir === "rtl" ? "100%" : "-100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
              className={cn(
                "pointer-events-auto fixed inset-y-0 z-[75] flex w-full max-w-[290px] flex-col bg-[#942E3A] text-[#FFF9EB] shadow-2xl lg:hidden border-white/10 overflow-hidden",
                dir === "rtl" ? "right-0 border-l rounded-l-[1.75rem]" : "left-0 border-r rounded-r-[1.75rem]"
              )}
              dir={dir}
            >
              {/* Header inside drawer */}
              <div className="flex items-center justify-between px-5 pt-5 pb-1">
                <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2">
                  <span className="text-xl font-extrabold tracking-tight text-white font-playfair">
                    DeRoma
                  </span>
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1.5 text-stone-300 hover:bg-white/10 hover:text-white transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Search Box in drawer */}
              <div className="px-5 pt-1 pb-2">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
                    setIsOpen(false);
                  }
                }} className="relative flex h-8 items-center bg-white/10 border border-white/15 rounded-full px-2.5">
                  <Search className="w-3.5 h-3.5 text-[#D8B46A] mr-1.5 rtl:mr-0 rtl:ml-1.5 shrink-0" />
                  <input
                    type="text"
                    placeholder={t("nav.searchFootwear")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-[11px] bg-transparent focus:outline-none text-white placeholder-stone-300 border-0 p-0"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-stone-300 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </form>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-wider text-[#FFF9EC]/65 px-3 mb-2">
                  {t("nav.navigation")}
                </p>
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Fragment key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "text-xs font-semibold py-2 px-3 rounded-xl transition-all flex justify-between items-center",
                          isActive
                            ? "bg-[#FFF9EB] text-[#942E3A] font-bold shadow-xs"
                    : "text-[#FFF9EC]/90 hover:text-[#FFF9EC] hover:bg-white/10"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <link.icon className={cn("h-3.5 w-3.5", isActive ? "text-[#942E3A]" : "text-[#D8B46A]")} />
                          <span>{t(link.labelKey)}</span>
                        </span>
                        <span className={cn(
                          "text-[10px]",
                          isActive ? "text-[#942E3A]" : "text-stone-400"
                        )}>{dir === "rtl" ? "←" : "→"}</span>
                      </Link>

                      {link.href === "/shop" && (
                        <div className="mb-2 ml-8 rtl:ml-0 rtl:mr-8 border-l rtl:border-l-0 rtl:border-r border-white/15 pl-3 rtl:pl-0 rtl:pr-3">
                          <div className="flex flex-col gap-0.5">
                            {shopCategories.map((category) => (
                              <Link
                                key={category.href}
                                href={category.href}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-between gap-2 px-1 py-1 text-[10px] font-semibold text-[#FFF9EC]/80 transition-colors hover:text-white"
                              >
                                <span>{t(category.labelKey)}</span>
                                {category.comingSoon && (
                                  <span className="text-[8px] font-bold uppercase tracking-wide text-[#FFF9EC]/60 bg-white/10 px-1.5 py-0.5 rounded-full border border-white/10">
                                    {t("nav.categories.comingSoon")}
                                  </span>
                                )}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </Fragment>
                  );
                })}

                {/* Additional Pages */}
                <div className="pt-4 border-t border-white/10 mt-4 space-y-1">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-[#FFF9EC]/65 px-3 mb-2">
                    {t("nav.shopAndOrders")}
                  </p>
                  
                  {/* Wishlist Shortcut */}
                  <Link
                    href="/wishlist"
                    onClick={() => setIsOpen(false)}
                    className="text-xs font-semibold py-2 px-3 rounded-xl text-[#FFF9EC]/90 hover:text-[#FFF9EC] hover:bg-white/10 transition-all flex justify-between items-center"
                  >
                    <div className="flex items-center gap-2">
                      <Heart className="w-3.5 h-3.5 fill-[#D8B46A]/20 text-[#D8B46A]" />
                      <span>{t("nav.wishlist")}</span>
                    </div>
                    <span className="text-[10px] text-stone-400">{dir === "rtl" ? "←" : "→"}</span>
                  </Link>
                </div>

                {/* Language Switcher Section in Drawer */}
                <div className="pt-3">
                  <StoreLangToggle variant="mobile" />
                </div>
              </nav>

              {/* Profile / Account section at the bottom */}
              <div className="p-4 border-t border-white/10 bg-black/10">
                {isLoggedIn ? (
                  <div className="space-y-2">
                    <Link
                      href="/profile"
                      onClick={() => setIsOpen(false)}
                      className="text-xs font-semibold py-2.5 px-3 rounded-xl bg-[#FFF9EB] text-[#942E3A] hover:bg-white transition-all flex items-center gap-2.5 shadow-sm"
                    >
                      <User className="w-4 h-4 text-[#942E3A]" />
                      <div className="flex flex-col text-left rtl:text-right">
                        <span className="text-xs font-bold leading-tight">{t("nav.myAccount")}</span>
                        <span className="text-[9px] text-[#942E3A]/70 leading-none">{t("nav.viewProfile")}</span>
                      </div>
                    </Link>
                    <button
                      onClick={async () => {
                        await logoutCustomerAction();
                        localStorage.removeItem("isLoggedIn");
                        localStorage.removeItem("customerName");
                        localStorage.removeItem("customerEmail");
                        window.dispatchEvent(new Event("auth-change"));
                        setIsLoggedIn(false);
                        setIsOpen(false);
                        router.push("/");
                      }}
                      className="w-full text-[10px] font-bold py-1.5 px-3 rounded-lg text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 transition-all text-center border border-rose-500/25"
                    >
                      {t("nav.signOut")}
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="text-xs font-bold py-2.5 px-3 rounded-xl bg-[#D8B46A] text-white hover:bg-[#B8934A] transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <User className="w-4 h-4" />
                    <span>{t("nav.signInToAccount")}</span>
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
