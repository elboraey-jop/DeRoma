"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  CreditCard,
  LockKeyhole,
  MapPin,
  MessageSquare,
  PackageCheck,
  Phone,
  Search,
  ShoppingBag,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useCart } from "@/lib/cartStore";
import { formatCurrency } from "@/lib/utils";
import { createOrder } from "@/app/actions";

import {
  calculateShippingFee,
  ShippingSettingsData,
  ShippingZoneData,
} from "@/lib/shippingHelper";

interface GovItem {
  en: string;
  ar: string;
  fee: number;
}

const LEGACY_GOVERNORATES: GovItem[] = [
  { en: "Cairo", ar: "Ø§Ù„Ù‚Ø§Ù‡Ø±Ø©", fee: 50 },
  { en: "Giza", ar: "Ø§Ù„Ø¬ÙŠØ²Ø©", fee: 50 },
  { en: "Alexandria", ar: "Ø§Ù„Ø¥Ø³ÙƒÙ†Ø¯Ø±ÙŠØ©", fee: 60 },
  { en: "Qalyubia", ar: "Ø§Ù„Ù‚Ù„ÙŠÙˆØ¨ÙŠØ©", fee: 70 },
  { en: "Sharqia", ar: "Ø§Ù„Ø´Ø±Ù‚ÙŠØ©", fee: 70 },
  { en: "Dakahlia", ar: "Ø§Ù„Ø¯Ù‚Ù‡Ù„ÙŠØ©", fee: 70 },
  { en: "Monufia", ar: "Ø§Ù„Ù…Ù†ÙˆÙÙŠØ©", fee: 70 },
  { en: "Gharbia", ar: "Ø§Ù„ØºØ±Ø¨ÙŠØ©", fee: 70 },
  { en: "Kafr El Sheikh", ar: "ÙƒÙØ± Ø§Ù„Ø´ÙŠØ®", fee: 70 },
  { en: "Damietta", ar: "Ø¯Ù…ÙŠØ§Ø·", fee: 70 },
  { en: "Port Said", ar: "Ø¨ÙˆØ±Ø³Ø¹ÙŠØ¯", fee: 70 },
  { en: "Ismailia", ar: "Ø§Ù„Ø¥Ø³Ù…Ø§Ø¹ÙŠÙ„ÙŠØ©", fee: 70 },
  { en: "Suez", ar: "Ø§Ù„Ø³ÙˆÙŠØ³", fee: 70 },
  { en: "Fayoum", ar: "Ø§Ù„ÙÙŠÙˆÙ…", fee: 90 },
  { en: "Beni Suef", ar: "Ø¨Ù†ÙŠ Ø³ÙˆÙŠÙ", fee: 90 },
  { en: "Minya", ar: "Ø§Ù„Ù…Ù†ÙŠØ§", fee: 90 },
  { en: "Asyut", ar: "Ø£Ø³ÙŠÙˆØ·", fee: 90 },
  { en: "Sohag", ar: "Ø³ÙˆÙ‡Ø§Ø¬", fee: 90 },
  { en: "Qena", ar: "Ù‚Ù†Ø§", fee: 90 },
  { en: "Luxor", ar: "Ø§Ù„Ø£Ù‚ØµØ±", fee: 90 },
  { en: "Aswan", ar: "Ø£Ø³ÙˆØ§Ù†", fee: 90 },
  { en: "Red Sea", ar: "Ø§Ù„Ø¨Ø­Ø± Ø§Ù„Ø£Ø­Ù…Ø±", fee: 120 },
  { en: "New Valley", ar: "Ø§Ù„ÙˆØ§Ø¯ÙŠ Ø§Ù„Ø¬Ø¯ÙŠØ¯", fee: 120 },
  { en: "Matrouh", ar: "Ù…Ø·Ø±ÙˆØ­", fee: 120 },
  { en: "North Sinai", ar: "Ø´Ù…Ø§Ù„ Ø³ÙŠÙ†Ø§Ø¡", fee: 120 },
  { en: "South Sinai", ar: "Ø¬Ù†ÙˆØ¨ Ø³ÙŠÙ†Ø§Ø¡", fee: 120 },
];

const GOVERNORATES: GovItem[] = [
  { en: "Cairo", ar: "القاهرة", fee: 50 },
  { en: "Giza", ar: "الجيزة", fee: 50 },
  { en: "Alexandria", ar: "الإسكندرية", fee: 60 },
  { en: "Qalyubia", ar: "القليوبية", fee: 70 },
  { en: "Sharqia", ar: "الشرقية", fee: 70 },
  { en: "Dakahlia", ar: "الدقهلية", fee: 70 },
  { en: "Monufia", ar: "المنوفية", fee: 70 },
  { en: "Gharbia", ar: "الغربية", fee: 70 },
  { en: "Kafr El Sheikh", ar: "كفر الشيخ", fee: 70 },
  { en: "Damietta", ar: "دمياط", fee: 70 },
  { en: "Port Said", ar: "بورسعيد", fee: 70 },
  { en: "Ismailia", ar: "الإسماعيلية", fee: 70 },
  { en: "Suez", ar: "السويس", fee: 70 },
  { en: "Fayoum", ar: "الفيوم", fee: 90 },
  { en: "Beni Suef", ar: "بني سويف", fee: 90 },
  { en: "Minya", ar: "المنيا", fee: 90 },
  { en: "Asyut", ar: "أسيوط", fee: 90 },
  { en: "Sohag", ar: "سوهاج", fee: 90 },
  { en: "Qena", ar: "قنا", fee: 90 },
  { en: "Luxor", ar: "الأقصر", fee: 90 },
  { en: "Aswan", ar: "أسوان", fee: 90 },
  { en: "Red Sea", ar: "البحر الأحمر", fee: 120 },
  { en: "New Valley", ar: "الوادي الجديد", fee: 120 },
  { en: "Matrouh", ar: "مطروح", fee: 120 },
  { en: "North Sinai", ar: "شمال سيناء", fee: 120 },
  { en: "South Sinai", ar: "جنوب سيناء", fee: 120 },
];

const CENTERS_BY_GOVERNORATE: Record<string, string[]> = {
  Cairo: ["Cairo", "Heliopolis", "Nasr City", "New Cairo", "Maadi", "Mokattam", "Shubra", "Ain Shams", "El Marg", "Dar El Salam", "Al Salam City"],
  Giza: ["Giza", "6th of October", "Sheikh Zayed", "Abu El Nomros", "Al Ayyat", "Al Badrasheen", "Al Hawamidya", "Al Saf", "Atfih", "Awsim", "Kerdasa", "Manshiyat Al Qanater", "Warrak"],
  Alexandria: ["Alexandria", "Borg El Arab"],
  Qalyubia: ["Banha", "Kafr Shukr", "Qalyub", "Al Khanka", "Shubra El Kheima", "Shibin El Qanater", "Toukh", "Qaha"],
  Sharqia: ["Zagazig", "Abu Hammad", "Abu Kabir", "Al Ibrahimiyah", "Belbeis", "Deyerb Negm", "Faqous", "Hihya", "Kafr Saqr", "Minya Al Qamh", "Mashtoul El Souq", "El Qurein", "10th of Ramadan"],
  Dakahlia: ["Mansoura", "Aga", "Bilqas", "Dekernes", "El Gamalia", "Manzala", "Mit Ghamr", "Mit Salsil", "Nabaroh", "Sherbin", "Talkha", "Temay El Amdeed", "El Senbellawein", "Bani Ubaid"],
  Monufia: ["Shibin El Kom", "Ashmoun", "El Bagour", "El Shohada", "Menouf", "Quesna", "Sadat", "Tala", "Berket El Sabe"],
  Gharbia: ["Tanta", "Kafr El Zayat", "El Mahalla El Kubra", "Basyoun", "Zefta", "Samanoud", "Santa", "Qutour"],
  "Kafr El Sheikh": ["Kafr El Sheikh", "Baltim", "El Burullus", "Desouk", "El Hamoul", "Metoubes", "Qallin", "Sidi Salem", "Fouh", "El Riyad"],
  Damietta: ["Damietta", "Faraskour", "Kafr Saad", "Kafr El Battikh", "Zarqa", "Ras El Bar"],
  "Port Said": ["Port Said", "Port Fouad"],
  Ismailia: ["Ismailia", "Fayed", "Qantara East", "Qantara West", "Tell El Kebir", "Abu Suwir", "El Qassasin"],
  Suez: ["Suez", "Ain Sokhna", "Ataka"],
  Fayoum: ["Fayoum", "Ibshway", "Itsa", "Sinnuris", "Tamiya", "Youssef El Seddik"],
  "Beni Suef": ["Beni Suef", "Al Wasta", "Nasser", "Ihnasia", "Biba", "Sumusta", "El Fashn"],
  Minya: ["Minya", "Abu Qurqas", "Beni Mazar", "Deir Mawas", "Maghagha", "Mallawi", "Matai", "Samalut", "Adwa"],
  Asyut: ["Asyut", "Abnoub", "Abu Tig", "Al Badari", "Al Qusiya", "Dairut", "Manfalut", "Sahel Selim", "Sedfa", "El Ghanayem"],
  Sohag: ["Sohag", "Akhmim", "Al Baliana", "Al Maragha", "Al Munshah", "Dar El Salam", "Girga", "Juhayna", "Sakulta", "Tahta", "Tima"],
  Qena: ["Qena", "Abu Tesht", "Deshna", "Farshout", "Nag Hammadi", "Naqada", "Qift", "Qus", "El Waqf"],
  Luxor: ["Luxor", "Esna", "Armant", "El Tod", "El Qurna"],
  Aswan: ["Aswan", "Abu Simbel", "Daraw", "Edfu", "Kom Ombo", "Nasr El Nuba"],
  "Red Sea": ["Hurghada", "Safaga", "El Quseir", "Marsa Alam", "Ras Gharib", "Shalateen"],
  "New Valley": ["Kharga", "Dakhla", "Farafra", "Baris", "Balat"],
  Matrouh: ["Marsa Matrouh", "El Hammam", "El Alamein", "El Dabaa", "Sidi Barrani", "Sallum", "Siwa", "Nagila"],
  "North Sinai": ["Al Arish", "Bir El Abd", "Sheikh Zuweid", "Rafah", "Al Hasana", "Nakhl"],
  "South Sinai": ["Tor Sinai", "Sharm El Sheikh", "Dahab", "Nuweiba", "Taba", "Saint Catherine", "Abu Rudeis", "Abu Zenima", "Ras Sidr"],
};

const inputClass =
  "mt-2 h-12 w-full rounded-xl border border-[#eadfd6] bg-[#fffdfa] px-4 text-sm text-[#481827] outline-none transition placeholder:text-[#a99ca0] focus:border-[#942e3a] focus:ring-4 focus:ring-[#942e3a]/10";

function FieldLabel({ icon: Icon, children, optional = false }: { icon: typeof UserRound; children: React.ReactNode; optional?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[#5f4a50]">
      <Icon className="h-3.5 w-3.5 text-[#942e3a]" />
      <span>{children}</span>
      {optional && <span className="font-normal normal-case tracking-normal text-[#a99ca0]">(optional)</span>}
    </label>
  );
}

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phone2, setPhone2] = useState("");
  const [selectedGovEn, setSelectedGovEn] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isGovMenuOpen, setIsGovMenuOpen] = useState(false);
  const [govSearch, setGovSearch] = useState("");
  const [isCenterMenuOpen, setIsCenterMenuOpen] = useState(false);
  const [centerSearch, setCenterSearch] = useState("");
  const [adminShippingData, setAdminShippingData] = useState<{
    zones: ShippingZoneData[];
    settings: ShippingSettingsData;
  }>({ zones: [], settings: null });

  useEffect(() => {
    fetch("/api/shipping")
      .then((response) => (response.ok ? response.json() : { zones: [], settings: null }))
      .then((data) => {
        if (Array.isArray(data)) {
          setAdminShippingData({ zones: data, settings: null });
        } else {
          setAdminShippingData({ zones: data.zones || [], settings: data.settings || null });
        }
      })
      .catch(() => null);
  }, []);

  const governorates = GOVERNORATES;
  const govMenuRef = useRef<HTMLDivElement>(null);
  const centerMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    const closeMenu = (event: PointerEvent) => {
      const target = event.target as Node;
      if (govMenuRef.current && !govMenuRef.current.contains(target)) setIsGovMenuOpen(false);
      if (centerMenuRef.current && !centerMenuRef.current.contains(target)) setIsCenterMenuOpen(false);
    };

    document.addEventListener("pointerdown", closeMenu);
    return () => document.removeEventListener("pointerdown", closeMenu);
  }, []);

  if (!isMounted) return null;

  const activeGov = governorates.find((gov) => gov.en === selectedGovEn);
  const filteredGovernorates = governorates.filter((gov) =>
    gov.en.toLowerCase().includes(govSearch.trim().toLowerCase())
  );
  const availableCenters = selectedGovEn ? CENTERS_BY_GOVERNORATE[selectedGovEn] || [] : [];
  const filteredCenters = availableCenters.filter((center) =>
    center.toLowerCase().includes(centerSearch.trim().toLowerCase())
  );
  const shippingCost = selectedGovEn
    ? calculateShippingFee({
        governorate: selectedGovEn,
        city,
        subtotal: cartTotal,
        zones: adminShippingData.zones,
        settings: adminShippingData.settings,
      })
    : 0;
  const grandTotal = cartTotal + shippingCost;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!name || !phone || !selectedGovEn || !city || !address) {
      setError("Please complete all required fields before placing your order.");
      return;
    }

    if (cart.length === 0) {
      setError("Your bag is empty. Please add items to checkout.");
      return;
    }

    setLoading(true);
    try {
      const result = await createOrder({
        customerName: name,
        customerPhone: phone,
        customerPhone2: phone2,
        governorate: activeGov?.ar || "",
        city,
        address,
        notes,
        couponCode,
        items: cart.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      });

      if (result.success && result.orderNumber) {
        clearCart();
        router.push(
          `/checkout/success?orderNumber=${result.orderNumber}&name=${encodeURIComponent(name)}&total=${result.totalPrice}&shipping=${result.shippingCost}&gov=${encodeURIComponent(selectedGovEn)}`
        );
      } else {
        setError(result.error || "Something went wrong. Please try again.");
      }
    } catch (submitError) {
      console.error(submitError);
      setError("We could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main className="min-h-[70vh] bg-[#fffaf0] px-4 py-16 sm:py-24" dir="ltr">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#942e3a]/10 text-[#942e3a]">
            <ShoppingBag className="h-9 w-9" />
          </div>
          <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.28em] text-[#c49a50]">Your DeRoma bag</p>
          <h1 className="mt-2 font-playfair text-3xl font-semibold text-[#481827]">Your bag is empty</h1>
          <p className="mt-3 text-sm leading-6 text-[#806e73]">Discover your next favourite pair and come back here when you are ready to checkout.</p>
          <Link href="/shop" className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-[#942e3a] px-7 text-sm font-bold text-white shadow-lg shadow-[#942e3a]/20 transition hover:bg-[#76232d]">
            Browse the shop <ArrowLeft className="h-4 w-4 rotate-180" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden bg-[#fffaf0] px-3 py-6 text-[#481827] sm:px-6 sm:py-12 lg:px-8" dir="ltr">
      <div className="mx-auto w-full min-w-0 max-w-6xl">
        <div className="mb-8 flex flex-col items-center gap-5 border-b border-[#eadfd6] pb-7 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <div>
            <Link href="/shop" className="flex w-full items-center justify-start gap-2 text-left text-xs font-semibold text-[#806e73] transition hover:text-[#942e3a] sm:inline-flex sm:w-auto">
              <ArrowLeft className="h-4 w-4" /> Continue shopping
            </Link>
            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.3em] text-[#c49a50]">DeRoma checkout</p>
            <h1 className="mt-1 font-playfair text-3xl font-semibold sm:text-4xl">Complete your order</h1>
          </div>

          <div className="flex items-center justify-center gap-3 text-xs font-semibold text-[#806e73]">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#942e3a] text-white"><Check className="h-4 w-4" /></span>
            <span className="text-[#942e3a]">Bag</span>
            <span className="h-px w-8 bg-[#d8b46a] sm:w-12" />
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#942e3a] text-white">2</span>
            <span className="text-[#942e3a]">Details</span>
            <span className="h-px w-8 bg-[#eadfd6] sm:w-12" />
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#d8c9c0] bg-white">3</span>
            <span className="hidden sm:inline">Confirmation</span>
          </div>
        </div>

        {error && (
          <div role="alert" className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            <span className="mt-0.5">!</span>{error}
          </div>
        )}

        <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
          <form id="checkout-form" onSubmit={handleSubmit} className="order-2 min-w-0 space-y-5 lg:order-1">
            <section className="rounded-3xl border border-[#eadfd6] bg-white p-5 shadow-[0_14px_40px_rgba(73,24,39,0.05)] sm:p-7">
              <div className="mb-6 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#942e3a]/10 text-[#942e3a]"><UserRound className="h-5 w-5" /></div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c49a50]">Step 02</p>
                  <h2 className="mt-1 font-playfair text-xl font-semibold">Delivery details</h2>
                  <p className="mt-1 text-xs leading-5 text-[#806e73]">Tell us where to deliver your new pair.</p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div><FieldLabel icon={UserRound}>Full name *</FieldLabel><input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Yasmin Mohamed" className={inputClass} /></div>
                <div><FieldLabel icon={Phone}>Primary phone *</FieldLabel><input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010 1234 5678" className={inputClass} /></div>
                <div><FieldLabel icon={Phone} optional>Alternative phone</FieldLabel><input type="tel" value={phone2} onChange={(e) => setPhone2(e.target.value)} placeholder="Another number" className={inputClass} /></div>
                <div ref={govMenuRef} className="relative">
                  <FieldLabel icon={MapPin}>Governorate *</FieldLabel>
                  <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={isGovMenuOpen}
                    onClick={() => {
                      setIsGovMenuOpen((open) => !open);
                      setGovSearch("");
                    }}
                    className={`${inputClass} flex min-w-0 items-center justify-between overflow-hidden text-left ${selectedGovEn ? "text-[#481827]" : "text-[#a99ca0]"}`}
                  >
                    <span>{selectedGovEn ? `${selectedGovEn} · ${activeGov?.fee} EGP delivery` : "Select governorate"}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-[#942e3a] transition-transform ${isGovMenuOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isGovMenuOpen && (
                    <div role="listbox" aria-label="Governorate" className="hide-scrollbar absolute left-0 right-0 z-50 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-[#eadfd6] bg-white p-1.5 shadow-[0_18px_40px_rgba(73,24,39,0.16)]">
                      <div className="sticky top-0 z-10 bg-white pb-1.5">
                        <div className="relative">
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#942e3a]" />
                          <input
                            type="search"
                            value={govSearch}
                            onChange={(event) => setGovSearch(event.target.value)}
                            onClick={(event) => event.stopPropagation()}
                            placeholder="Search governorate..."
                            aria-label="Search governorates"
                            className="h-11 w-full rounded-xl border border-[#eadfd6] bg-[#fffaf0] pl-9 pr-3 text-sm text-[#481827] outline-none placeholder:text-[#a99ca0] focus:border-[#942e3a] focus:ring-2 focus:ring-[#942e3a]/10"
                          />
                        </div>
                      </div>
                      {!govSearch && <button type="button" role="option" aria-selected={!selectedGovEn} onClick={() => { setSelectedGovEn(""); setCity(""); setIsGovMenuOpen(false); setGovSearch(""); }} className={`w-full rounded-xl px-3 py-3 text-left text-sm transition ${!selectedGovEn ? "bg-[#942e3a] text-white" : "text-[#806e73] hover:bg-[#fff5e8] hover:text-[#942e3a]"}`}>Select governorate</button>}
                      {filteredGovernorates.map((gov) => {
                        const isSelected = gov.en === selectedGovEn;
                        return <button key={gov.en} type="button" role="option" aria-selected={isSelected} onClick={() => { setSelectedGovEn(gov.en); setCity(""); setCenterSearch(""); setIsGovMenuOpen(false); setGovSearch(""); }} className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${isSelected ? "bg-[#942e3a] font-bold text-white" : "text-[#481827] hover:bg-[#fff5e8] hover:text-[#942e3a]"}`}><span>{gov.en}</span><span className={`shrink-0 text-xs ${isSelected ? "text-[#fffaf0]/80" : "text-[#b8934a]"}`}>{gov.fee} EGP</span></button>;
                      })}
                      {filteredGovernorates.length === 0 && <p className="px-3 py-4 text-center text-sm text-[#806e73]">No governorate found</p>}
                    </div>
                  )}
                </div>
                <div ref={centerMenuRef} className="relative sm:col-span-2">
                  <FieldLabel icon={MapPin}>City / area *</FieldLabel>
                  <button
                    type="button"
                    disabled={!selectedGovEn}
                    aria-haspopup="listbox"
                    aria-expanded={isCenterMenuOpen}
                    onClick={() => {
                      setIsCenterMenuOpen((open) => !open);
                      setCenterSearch("");
                    }}
                    className={`${inputClass} flex min-w-0 items-center justify-between overflow-hidden text-left ${city ? "text-[#481827]" : "text-[#a99ca0]"} disabled:cursor-not-allowed disabled:bg-[#f8f3ed] disabled:opacity-70`}
                  >
                    <span>{city || (selectedGovEn ? "Select city / center" : "Select governorate first")}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-[#942e3a] transition-transform ${isCenterMenuOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isCenterMenuOpen && selectedGovEn && (
                    <div role="listbox" aria-label="City or center" className="hide-scrollbar absolute left-0 right-0 z-40 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-[#eadfd6] bg-white p-1.5 shadow-[0_18px_40px_rgba(73,24,39,0.16)]">
                      <div className="sticky top-0 z-10 bg-white pb-1.5">
                        <div className="relative">
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#942e3a]" />
                          <input type="search" value={centerSearch} onChange={(event) => setCenterSearch(event.target.value)} onClick={(event) => event.stopPropagation()} placeholder="Search city or center..." aria-label="Search cities and centers" className="h-11 w-full rounded-xl border border-[#eadfd6] bg-[#fffaf0] pl-9 pr-3 text-sm text-[#481827] outline-none placeholder:text-[#a99ca0] focus:border-[#942e3a] focus:ring-2 focus:ring-[#942e3a]/10" />
                        </div>
                      </div>
                      {filteredCenters.map((center) => <button key={center} type="button" role="option" aria-selected={center === city} onClick={() => { setCity(center); setIsCenterMenuOpen(false); setCenterSearch(""); }} className={`flex w-full items-center rounded-xl px-3 py-3 text-left text-sm transition ${center === city ? "bg-[#942e3a] font-bold text-white" : "text-[#481827] hover:bg-[#fff5e8] hover:text-[#942e3a]"}`}>{center}</button>)}
                      {filteredCenters.length === 0 && <p className="px-3 py-4 text-center text-sm text-[#806e73]">No city or center found</p>}
                    </div>
                  )}
                </div>
                <div className="sm:col-span-2"><FieldLabel icon={MapPin}>Detailed address *</FieldLabel><textarea required rows={3} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, building number, apartment number..." className={`${inputClass} h-auto resize-none py-3`} /></div>
                <div className="sm:col-span-2"><FieldLabel icon={MessageSquare} optional>Delivery notes</FieldLabel><textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Call before delivery, leave with the guard..." className={`${inputClass} h-auto resize-none py-3`} /></div>
              </div>
            </section>

            <section className="rounded-3xl border border-[#eadfd6] bg-white p-5 shadow-[0_14px_40px_rgba(73,24,39,0.05)] sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#d8b46a]/20 text-[#9a742b]"><CreditCard className="h-5 w-5" /></div>
                <div><h2 className="font-playfair text-xl font-semibold">Payment method</h2><p className="mt-1 text-xs text-[#806e73]">Simple, secure payment at your doorstep.</p></div>
              </div>
              <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border-2 border-[#942e3a] bg-[#fffaf0] p-4">
                <div className="flex items-center gap-3"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#942e3a] text-white"><Check className="h-3 w-3" /></span><div><p className="text-sm font-bold">Cash on delivery</p><p className="mt-1 text-[11px] text-[#806e73]">Inspect and try on before you pay.</p></div></div>
                <span className="hidden rounded-full bg-[#942e3a]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#942e3a] sm:inline">COD</span>
              </div>
            </section>
          </form>

          <aside className="order-1 min-w-0 space-y-5 lg:order-2 lg:sticky lg:top-6">
            <section className="rounded-3xl bg-[#942e3a] p-5 text-[#fffaf0] shadow-[0_18px_45px_rgba(148,46,58,0.2)] sm:p-6">
              <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#d8b46a]">Your bag</p><h2 className="mt-1 font-playfair text-2xl font-semibold">Order summary</h2></div><span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"><ShoppingBag className="h-5 w-5" /></span></div>
              <div className="my-5 h-px bg-white/15" />
              <div className="hide-scrollbar max-h-64 space-y-4 overflow-y-auto pr-1">
                {cart.map((item) => <div key={item.variantId} className="flex items-center gap-3"><div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white"><Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{item.name}</p><p className="mt-1 text-[11px] text-white/65">{item.color} · Size {item.size}</p><p className="mt-1 text-[11px] text-white/65">Quantity: {item.quantity}</p></div><p className="shrink-0 text-sm font-bold">{formatCurrency(item.price * item.quantity)}</p></div>)}
              </div>
              <div className="my-5 h-px bg-white/15" />
              <div className="mb-4 flex gap-2"><input value={couponCode} onChange={(event) => setCouponCode(event.target.value.toUpperCase())} placeholder="Coupon code" className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-xs text-white placeholder:text-white/45 outline-none" /><span className="flex items-center text-[10px] font-bold text-[#d8b46a]">Applied at checkout</span></div><div className="space-y-3 text-sm"><div className="flex justify-between text-white/70"><span>Subtotal</span><span className="font-semibold text-white">{formatCurrency(cartTotal)}</span></div><div className="flex justify-between text-white/70"><span>Delivery</span><span className="font-semibold text-white">{selectedGovEn ? `${shippingCost} EGP` : "Select governorate"}</span></div><div className="flex items-end justify-between border-t border-white/15 pt-4"><span className="font-bold">Total*</span><span className="font-playfair text-2xl font-semibold">{formatCurrency(grandTotal)}</span></div><p className="text-[10px] text-white/50">*Coupon discounts are validated and applied securely when the order is placed.</p></div>
              <button form="checkout-form" type="submit" disabled={loading} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#d8b46a] px-5 py-3.5 text-sm font-bold text-[#481827] shadow-lg transition hover:bg-[#e5c785] disabled:cursor-not-allowed disabled:opacity-60">{loading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#481827] border-t-transparent" /> : <><span>Place order</span><ArrowLeft className="h-4 w-4 rotate-180" /></>}</button>
              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-white/60"><LockKeyhole className="h-3.5 w-3.5" /> Your details are kept private</div>
            </section>

            <section className="rounded-3xl border border-[#eadfd6] bg-white p-5 sm:p-6">
              <div className="flex gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#d8b46a]/20 text-[#9a742b]"><PackageCheck className="h-5 w-5" /></div><div><h3 className="text-sm font-bold">Try before you pay</h3><p className="mt-1 text-xs leading-5 text-[#806e73]">Check the fit at your doorstep. If it is not right, return it with the courier and pay only the delivery fee.</p></div></div>
              <div className="mt-4 flex items-center gap-2 border-t border-[#eadfd6] pt-4 text-[10px] font-bold uppercase tracking-[0.12em] text-[#942e3a]"><ShieldCheck className="h-4 w-4" /> Secure checkout</div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
