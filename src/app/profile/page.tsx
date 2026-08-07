"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  LogOut,
  Package,
  User,
  MapPin,
  Phone,
  Mail,
  Clock,
  Edit2,
  X,
  Check,
  Loader2,
  ShoppingBag,
  ChevronDown,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getCustomerProfileAction,
  updateCustomerProfileAction,
  logoutCustomerAction,
} from "@/app/auth-actions";
import { formatCurrency } from "@/lib/utils";
import { GOVERNORATES, CENTERS_BY_GOVERNORATE } from "@/lib/locations";
import { ProfileSkeleton } from "@/components/Skeletons";

interface OrderItemView {
  id: string;
  productName: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

interface OrderView {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  totalPrice: number;
  shippingCost: number;
  subtotalPrice: number;
  discountAmount: number;
  paymentMethod: string;
  governorate: string;
  city: string;
  address: string;
  items: OrderItemView[];
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  phone2?: string;
  governorate: string;
  city: string;
  address: string;
  orders: OrderView[];
}

function getStatusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "delivered") {
    return {
      label: "Delivered",
      classes: "text-emerald-700 bg-emerald-50 border-emerald-200",
    };
  }
  if (s === "shipped" || s === "in_transit" || s === "in transit") {
    return {
      label: "In Transit",
      classes: "text-amber-700 bg-amber-50 border-amber-200",
    };
  }
  if (s === "processing") {
    return {
      label: "Processing",
      classes: "text-blue-700 bg-blue-50 border-blue-200",
    };
  }
  if (s === "cancelled" || s === "canceled") {
    return {
      label: "Cancelled",
      classes: "text-rose-700 bg-rose-50 border-rose-200",
    };
  }
  return {
    label: "Pending",
    classes: "text-stone-700 bg-stone-100 border-stone-200",
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editPhone2, setEditPhone2] = useState("");
  const [editGov, setEditGov] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Dynamic Greeting State
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const from = params.get("from");
      if (from === "register") {
        setGreeting("Welcome to DeRoma");
      } else if (from === "login") {
        setGreeting("Welcome back");
      } else {
        setGreeting("Hello");
      }
    }
  }, []);
  const [isGovMenuOpen, setIsGovMenuOpen] = useState(false);
  const [isCityMenuOpen, setIsCityMenuOpen] = useState(false);
  const [govSearch, setGovSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const govMenuRef = useRef<HTMLDivElement>(null);
  const cityMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeMenu = (event: PointerEvent) => {
      const target = event.target as Node;
      if (govMenuRef.current && !govMenuRef.current.contains(target)) {
        setIsGovMenuOpen(false);
      }
      if (cityMenuRef.current && !cityMenuRef.current.contains(target)) {
        setIsCityMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeMenu);
    return () => document.removeEventListener("pointerdown", closeMenu);
  }, []);

  const availableCities = editGov ? CENTERS_BY_GOVERNORATE[editGov] || [editGov] : [];
  const filteredGovs = GOVERNORATES.filter((g) =>
    g.toLowerCase().includes(govSearch.trim().toLowerCase())
  );
  const filteredCities = availableCities.filter((c) =>
    c.toLowerCase().includes(citySearch.trim().toLowerCase())
  );

  const loadProfile = async () => {
    setLoading(true);
    const res = await getCustomerProfileAction();
    if (!res.success || !res.profile) {
      localStorage.removeItem("isLoggedIn");
      window.dispatchEvent(new Event("auth-change"));
      router.push("/login");
      return;
    }

    setProfile(res.profile);
    setEditName(res.profile.name || "");
    setEditPhone(res.profile.phone || "");
    setEditPhone2(res.profile.phone2 || "");
    setEditGov(res.profile.governorate || "");
    setEditCity(res.profile.city || "");
    setEditAddress(res.profile.address || "");
    setLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleLogout = async () => {
    await logoutCustomerAction();
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("customerName");
    localStorage.removeItem("customerEmail");
    window.dispatchEvent(new Event("auth-change"));
    router.push("/");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");
    setIsSaving(true);

    const res = await updateCustomerProfileAction({
      name: editName,
      phone: editPhone,
      phone2: editPhone2,
      governorate: editGov,
      city: editCity,
      address: editAddress,
    });

    setIsSaving(false);

    if (!res.success) {
      setSaveError(res.error || "Failed to update profile.");
      return;
    }

    localStorage.setItem("customerName", editName);
    setIsEditing(false);
    await loadProfile();
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[#FFF9EB] text-[#942E3A] font-outfit py-12 px-4 sm:px-6 lg:px-8" dir="ltr">
      <div className="max-w-[1000px] mx-auto space-y-10">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#942E3A] hover:text-[#942E3A] transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </Link>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-[#942E3A]/40 hover:bg-[#942E3A]/10 px-4 py-2 text-xs font-bold text-[#942E3A] transition-all w-fit cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>

        {/* Heading */}
        <section className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#942E3A]">My Dashboard</span>
          <h1 className="text-3xl sm:text-4xl font-black font-playfair tracking-tight text-[#942E3A]">
            {greeting}, {profile.name.split(" ")[0]}!
          </h1>
        </section>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Account details */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#FFF9EB]/20 border border-[#942E3A]/30 rounded-3xl p-6 shadow-xs space-y-5 relative">
              <div className="flex items-center justify-between border-b border-[#942E3A]/20 pb-3">
                <h2 className="text-lg font-bold font-playfair flex items-center gap-2">
                  <User className="w-4.5 h-4.5 text-[#942E3A]" />
                  <span>Account Info</span>
                </h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#942E3A] hover:underline"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="space-y-4 text-xs">
                
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-[#942E3A] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Full Name</p>
                    <p className="font-semibold text-sm mt-0.5">{profile.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#942E3A] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Email Address</p>
                    <p className="font-semibold text-sm mt-0.5">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#942E3A] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Contact Phone</p>
                    <p className="font-semibold text-sm mt-0.5">
                      {profile.phone ? profile.phone : <span className="text-stone-400 italic">Not added yet</span>}
                    </p>
                    {profile.phone2 && <p className="text-[11px] text-stone-500 mt-0.5">Alt: {profile.phone2}</p>}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#942E3A] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Default Shipping Address</p>
                    {profile.address || profile.city || profile.governorate ? (
                      <p className="font-semibold leading-relaxed mt-0.5">
                        {[profile.address, profile.city, profile.governorate].filter(Boolean).join(", ")}
                      </p>
                    ) : (
                      <p className="text-stone-400 italic mt-0.5">Not added yet</p>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: Order History */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#FFF9EB]/20 border border-[#942E3A]/30 rounded-3xl p-6 shadow-xs space-y-5">
              <h2 className="text-lg font-bold font-playfair border-b border-[#942E3A]/20 pb-3 flex items-center gap-2">
                <Package className="w-4.5 h-4.5 text-[#942E3A]" />
                <span>My Orders ({profile.orders.length})</span>
              </h2>

              {profile.orders.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <ShoppingBag className="w-10 h-10 text-[#942E3A]/30 mx-auto" />
                  <p className="text-sm font-bold text-[#942E3A]">No orders placed yet</p>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    When you order from DeRoma Store, your order details and delivery status will appear here!
                  </p>
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#942E3A] text-white text-xs font-bold shadow-md hover:bg-[#7a2430] transition-all"
                  >
                    <span>Browse Shop</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {profile.orders.map((order) => {
                    const statusBadge = getStatusBadge(order.status);
                    const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    });

                    return (
                      <div
                        key={order.id}
                        className="bg-white border border-[#942E3A]/20 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 shadow-xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-3 gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-[#942E3A]">{order.orderNumber}</span>
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${statusBadge.classes}`}>
                                {statusBadge.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                              <Clock className="w-3 h-3" />
                              <span>Order Date: {formattedDate}</span>
                            </div>
                          </div>

                          {(order.status.toLowerCase() === "shipped" || order.status.toLowerCase().includes("transit")) && (
                            <Link
                              href={`/track?order=${order.orderNumber}`}
                              className="text-[11px] font-bold text-[#942E3A] hover:underline self-start sm:self-auto"
                            >
                              Track Shipment &rarr;
                            </Link>
                          )}
                        </div>

                        {/* Order Items */}
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center text-xs">
                              <div>
                                <span className="font-bold text-[#942E3A]">{item.productName}</span>
                                <div className="text-[11px] text-stone-500 gap-2 flex">
                                  {item.size && <span>Size: {item.size}</span>}
                                  {item.color && <span>• Color: {item.color}</span>}
                                  <span>• Qty: {item.quantity}</span>
                                </div>
                              </div>
                              <span className="font-numeric font-bold text-[#942E3A]">
                                {formatCurrency(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-stone-100 pt-2 flex items-center justify-between text-xs font-bold text-[#942E3A]">
                          <span className="text-stone-500 font-normal">Total Price:</span>
                          <span className="text-sm font-numeric font-extrabold">{formatCurrency(order.totalPrice)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
            onClick={() => setIsEditing(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#FFF9EB] rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#942E3A]/30 shadow-2xl space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#942E3A]/20 pb-3">
                <h3 className="text-lg font-bold font-playfair text-[#942E3A]">Edit Profile Details</h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1 rounded-full text-stone-400 hover:text-[#942E3A] hover:bg-[#942E3A]/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                
                <div className="space-y-1">
                  <label className="font-bold text-[#942E3A]">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#942E3A]/30 bg-white text-[#942E3A] focus:outline-none focus:ring-1 focus:ring-[#942E3A]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#942E3A]">Contact Phone</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="01012345678"
                      className="w-full px-3 py-2.5 rounded-xl border border-[#942E3A]/30 bg-white text-[#942E3A] focus:outline-none focus:ring-1 focus:ring-[#942E3A]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#942E3A]">Alt Phone</label>
                    <input
                      type="text"
                      value={editPhone2}
                      onChange={(e) => setEditPhone2(e.target.value)}
                      placeholder="Optional"
                      className="w-full px-3 py-2.5 rounded-xl border border-[#942E3A]/30 bg-white text-[#942E3A] focus:outline-none focus:ring-1 focus:ring-[#942E3A]"
                    />
                  </div>
                </div>

                {/* Searchable Dropdowns for Governorate & City */}
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* Governorate Dropdown */}
                  <div ref={govMenuRef} className="space-y-1 relative">
                    <label className="font-bold text-[#942E3A]">Governorate</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsGovMenuOpen((open) => !open);
                        setGovSearch("");
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#942E3A]/30 bg-white text-[#942E3A] flex items-center justify-between text-xs focus:outline-none focus:ring-1 focus:ring-[#942E3A]"
                    >
                      <span className={editGov ? "text-[#942E3A] font-semibold" : "text-stone-400"}>
                        {editGov || "Select Governorate"}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-[#942E3A] transition-transform ${isGovMenuOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isGovMenuOpen && (
                      <div
                        data-lenis-prevent="true"
                        onWheel={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                        style={{ WebkitOverflowScrolling: "touch" }}
                        className="absolute left-0 right-0 z-50 mt-1 max-h-56 overflow-y-auto overscroll-contain touch-pan-y rounded-2xl border border-[#942E3A]/20 bg-white p-1.5 shadow-xl"
                      >
                        <div className="sticky top-0 z-10 bg-white pb-1">
                          <div className="relative">
                            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#942E3A]" />
                            <input
                              type="search"
                              value={govSearch}
                              onChange={(e) => setGovSearch(e.target.value)}
                              placeholder="Search..."
                              className="w-full rounded-xl border border-[#942E3A]/20 bg-[#FFF9EB]/60 pl-8 pr-2.5 py-1.5 text-xs text-[#942E3A] outline-none focus:border-[#942E3A]"
                            />
                          </div>
                        </div>
                        {filteredGovs.map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => {
                              setEditGov(g);
                              setEditCity("");
                              setIsGovMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs rounded-xl transition ${
                              editGov === g
                                ? "bg-[#942E3A] text-white font-bold"
                                : "text-[#942E3A] hover:bg-[#FFF9EB]"
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                        {filteredGovs.length === 0 && (
                          <p className="px-3 py-3 text-center text-xs text-stone-400">No governorate found</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* City Dropdown */}
                  <div ref={cityMenuRef} className="space-y-1 relative">
                    <label className="font-bold text-[#942E3A]">City / Area</label>
                    <button
                      type="button"
                      disabled={!editGov}
                      onClick={() => {
                        setIsCityMenuOpen((open) => !open);
                        setCitySearch("");
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#942E3A]/30 bg-white text-[#942E3A] flex items-center justify-between text-xs focus:outline-none focus:ring-1 focus:ring-[#942E3A] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className={editCity ? "text-[#942E3A] font-semibold truncate" : "text-stone-400 truncate"}>
                        {editCity || (editGov ? "Select City" : "Select Governorate")}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-[#942E3A] shrink-0 transition-transform ${isCityMenuOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isCityMenuOpen && editGov && (
                      <div
                        data-lenis-prevent="true"
                        onWheel={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                        style={{ WebkitOverflowScrolling: "touch" }}
                        className="absolute left-0 right-0 z-50 mt-1 max-h-56 overflow-y-auto overscroll-contain touch-pan-y rounded-2xl border border-[#942E3A]/20 bg-white p-1.5 shadow-xl"
                      >
                        <div className="sticky top-0 z-10 bg-white pb-1">
                          <div className="relative">
                            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#942E3A]" />
                            <input
                              type="search"
                              value={citySearch}
                              onChange={(e) => setCitySearch(e.target.value)}
                              placeholder="Search..."
                              className="w-full rounded-xl border border-[#942E3A]/20 bg-[#FFF9EB]/60 pl-8 pr-2.5 py-1.5 text-xs text-[#942E3A] outline-none focus:border-[#942E3A]"
                            />
                          </div>
                        </div>
                        {filteredCities.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              setEditCity(c);
                              setIsCityMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs rounded-xl transition ${
                              editCity === c
                                ? "bg-[#942E3A] text-white font-bold"
                                : "text-[#942E3A] hover:bg-[#FFF9EB]"
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                        {filteredCities.length === 0 && (
                          <p className="px-3 py-3 text-center text-xs text-stone-400">No city found</p>
                        )}
                      </div>
                    )}
                  </div>

                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#942E3A]">Detailed Address</label>
                  <textarea
                    rows={2}
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="Street, Building No, Apartment"
                    className="w-full px-3 py-2.5 rounded-xl border border-[#942E3A]/30 bg-white text-[#942E3A] focus:outline-none focus:ring-1 focus:ring-[#942E3A]"
                  />
                </div>

                {saveError && (
                  <p className="text-[11px] font-bold text-red-600 bg-red-50 p-2 rounded-lg text-center">
                    {saveError}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2.5 rounded-full border border-[#942E3A]/30 text-[#942E3A] font-bold text-xs hover:bg-[#942E3A]/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-2.5 rounded-full bg-[#942E3A] text-white font-bold text-xs hover:bg-[#7a2430] transition-all flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>Save Changes</span>
                  </button>
                </div>

              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
