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
  Tag,
  UserRound,
} from "lucide-react";
import { useCart } from "@/lib/cartStore";
import { useToast } from "@/providers/ToastProvider";
import { formatCurrency } from "@/lib/utils";
import { createOrder } from "@/app/actions";

import {
  calculateShippingFee,
  ShippingSettingsData,
  ShippingZoneData,
} from "@/lib/shippingHelper";
import {
  trackAddPaymentInfo,
  trackAddShippingInfo,
  trackBeginCheckout,
  trackCheckoutError,
  trackPromoCodeApplied,
  trackPurchase,
} from "@/lib/analytics";

import { useStoreI18n } from "@/providers/StoreI18nContext";
import { useSiteSettings } from "@/providers/SiteSettingsProvider";

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
  const { lang } = useStoreI18n();

  /* const renderPaymentDetails = () => {
    if (paymentMethod === "cod") return null;

    return (
      <div className={`rounded-2xl border p-4 ${paymentMethod === "instapay" ? "border-purple-200 bg-purple-50/70" : "border-emerald-200 bg-emerald-50/70"}`}>
        <div className="flex items-center justify-between gap-3"><h3 className={`font-playfair text-lg font-bold ${paymentMethod === "instapay" ? "text-purple-800" : "text-emerald-800"}`}>{paymentMethod === "instapay" ? "InstaPay Transfer Details" : "E-Wallet Transfer Details"}</h3><span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold text-[#942e3a]">PAYMENT PENDING</span></div>
        <p className="mt-2 text-xs leading-5 text-[#416866]">{isArabic ? `حوّل إجمالي ${formatPrice(grandTotal)} إلى الرقم التالي، ثم أرسل صورة التحويل على واتساب.` : `Transfer ${formatPrice(grandTotal)} to the account below, then send the transfer screenshot on WhatsApp.`}</p>
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-white bg-white p-3"><div><p className="text-[10px] font-bold uppercase tracking-wider text-[#9a8586]">{paymentAccountLabel}</p><p className="mt-1 text-xl font-black tracking-[0.12em] text-[#164d49]">{paymentAccount || (isArabic ? "غير متاح" : "Not configured")}</p></div><button type="button" onClick={() => { navigator.clipboard?.writeText(paymentAccount); setCopiedPayment(true); }} className="rounded-lg border border-[#eadfd6] px-3 py-2 text-xs font-bold text-[#942e3a]">{copiedPayment ? (isArabic ? "تم النسخ" : "Copied") : (isArabic ? "نسخ" : "Copy")}</button></div>
        <div className="mt-3 rounded-xl border border-[#eadfd6] bg-white p-3"><label className="text-xs font-bold text-[#164d49]">{isArabic ? "رقم الهاتف المحول منه" : "Transfer-from phone number"}</label><input type="tel" value={paymentSenderPhone} onChange={(event) => setPaymentSenderPhone(event.target.value)} placeholder="01012345678" className={`${inputClass} mt-2 h-11`} />{touched.paymentSenderPhone && (!paymentSenderPhone.trim() || !egPhoneRegex.test(paymentSenderPhone.replace(/[\s\-\+]/g, "").replace(/^20/, ""))) && <p className="mt-1 text-[11px] text-rose-600">{isArabic ? "اكتب رقم الهاتف الذي تم التحويل منه بشكل صحيح." : "Enter the valid phone number used for the transfer."}</p>}</div>
        <a href={whatsappPaymentHref} target="_blank" rel="noreferrer" className="mt-3 flex h-11 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 text-xs font-bold text-white transition hover:bg-[#1da851]"><MessageSquare className="h-4 w-4" /> {isArabic ? `إرسال صورة التحويل على واتساب ${paymentAccountLabel}` : `Send proof on WhatsApp to ${paymentAccountLabel}`}</a>
        <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-blue-800">{isArabic ? "بعد إتمام الطلب اضغط زر واتساب وأرسل صورة التحويل مع الرسالة الجاهزة. سيظل الطلب بانتظار تأكيد الدفع حتى يراجعه الأدمن." : "After placing the order, tap WhatsApp and send the transfer screenshot with the prepared message. The order will stay pending payment until the admin confirms it."}</div>
      </div>
    );
  }; */

  return (
    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[#5f4a50]">
      <Icon className="h-3.5 w-3.5 text-[#942e3a]" />
      <span>{children}</span>
      {optional && <span className="font-normal normal-case tracking-normal text-[#a99ca0]">{lang === "ar" ? "(اختياري)" : "(optional)"}</span>}
    </label>
  );
}

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { toast } = useToast();
  const { t, formatPrice, formatNumber, dir, lang } = useStoreI18n();
  const siteSettings = useSiteSettings();
  const router = useRouter();
  const isArabic = lang === "ar";
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [phone2, setPhone2] = useState("");
  const [selectedGovEn, setSelectedGovEn] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "instapay" | "wallet">("cod");
  const [paymentSenderPhone, setPaymentSenderPhone] = useState("");
  const [copiedPayment, setCopiedPayment] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoIsFreeShipping, setPromoIsFreeShipping] = useState(false);
  const [promoMessage, setPromoMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const hasTrackedBeginCheckout = useRef(false);
  const lastTrackedShippingInfo = useRef("");

  const handleApplyCoupon = async () => {
    const clean = couponCode.trim().toUpperCase();
    if (!clean) return;
    setPromoLoading(true);
    setPromoError("");

    try {
      const response = await fetch("/api/promotions/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: clean,
          subtotal: cartTotal,
          items: cart,
        }),
      });
      const data = await response.json();
      if (data.valid) {
        setCouponApplied(true);
        setAppliedDiscount(Number(data.discountAmount) || 0);
        setPromoIsFreeShipping(Boolean(data.isFreeShipping));
        const successMessage = isArabic ? `تم تطبيق كود الخصم ${clean} بنجاح.` : (data.message || `Code ${clean} applied!`);
        setPromoMessage(successMessage);
        setPromoError("");
        trackPromoCodeApplied(clean, Number(data.discountAmount) || 0);
        toast.success(successMessage, isArabic ? "كود الخصم" : "PROMO CODE");
      } else {
        const err = isArabic ? "كود الخصم غير صالح." : (data.error || "Invalid promo code.");
        setPromoError(err);
        setCouponApplied(false);
        setAppliedDiscount(0);
        setPromoIsFreeShipping(false);
        toast.error(err, isArabic ? "كود الخصم" : "PROMO CODE");
      }
    } catch {
      const msg = isArabic ? "تعذر التحقق من كود الخصم. حاول مرة أخرى." : "Unable to validate promo code. Please try again.";
      setPromoError(msg);
      toast.error(msg, isArabic ? "كود الخصم" : "PROMO CODE");
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponApplied(false);
    setAppliedDiscount(0);
    setPromoIsFreeShipping(false);
    setPromoError("");
    setPromoMessage("");
    toast.info(isArabic ? "تمت إزالة كود الخصم." : "Promo code removed.", isArabic ? "كود الخصم" : "PROMO CODE");
  };

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

  const adminShippingFeeFor = (governorate: string, selectedCity = "") =>
    calculateShippingFee({
      governorate,
      city: selectedCity,
      subtotal: 0,
      zones: adminShippingData.zones,
      settings: null,
    });
  const governorates = GOVERNORATES.map((gov) => ({
    ...gov,
    fee: adminShippingData.zones.length > 0
      ? adminShippingFeeFor(gov.en)
      : gov.fee,
  }));
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

  const activeGov = governorates.find((gov) => gov.en === selectedGovEn);
  const activeGovernorateFee = selectedGovEn
    ? adminShippingData.zones.length > 0
      ? adminShippingFeeFor(selectedGovEn)
      : activeGov?.fee ?? 0
    : 0;
  const filteredGovernorates = governorates.filter((gov) =>
    gov.en.toLowerCase().includes(govSearch.trim().toLowerCase())
  );
  const availableCenters = selectedGovEn ? CENTERS_BY_GOVERNORATE[selectedGovEn] || [] : [];
  const filteredCenters = availableCenters.filter((center) =>
    center.toLowerCase().includes(centerSearch.trim().toLowerCase())
  );
  const isFreeShippingUnlocked = Boolean(
    promoIsFreeShipping ||
      (adminShippingData.settings?.freeShippingEnabled &&
        adminShippingData.settings.freeShippingThreshold !== null &&
        cartTotal >= Number(adminShippingData.settings.freeShippingThreshold))
  );
  const cityShippingFee = (center: string) =>
    isFreeShippingUnlocked
      ? 0
      : adminShippingData.zones.length > 0
        ? adminShippingFeeFor(selectedGovEn, center)
        : activeGovernorateFee;

  const shippingCost = isFreeShippingUnlocked
    ? 0
    : selectedGovEn
    ? calculateShippingFee({
        governorate: selectedGovEn,
        city,
        subtotal: cartTotal,
        zones: adminShippingData.zones,
        settings: adminShippingData.settings,
      })
    : 0;
  const grandTotal = Math.max(0, cartTotal - appliedDiscount) + shippingCost;
  const paymentAccount = paymentMethod === "instapay" ? siteSettings.instapayAccount : siteSettings.walletNumber;
  const paymentAccountLabel = paymentMethod === "instapay" ? "InstaPay" : siteSettings.walletProvider;
  const paymentAccountDigits = paymentAccount.replace(/[^0-9]/g, "");
  const paymentWhatsappDigits = paymentAccountDigits.startsWith("0") ? `20${paymentAccountDigits.slice(1)}` : paymentAccountDigits;
  const whatsappPaymentHref = `https://wa.me/${paymentWhatsappDigits}?text=${encodeURIComponent(isArabic ? "مرحباً DeRoma، سأرسل صورة التحويل وإثبات الدفع بعد إتمام الطلب." : "Hello DeRoma, I will send the transfer screenshot after placing my order.")}`;
  const analyticsItems = cart.map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    color: item.color,
    size: item.size,
  }));

  useEffect(() => {
    if (!isMounted || hasTrackedBeginCheckout.current || cart.length === 0) return;

    hasTrackedBeginCheckout.current = true;
    trackBeginCheckout({
      value: cartTotal,
      items: analyticsItems,
      coupon: couponApplied ? couponCode : undefined,
    });
  }, [analyticsItems, cart.length, cartTotal, couponApplied, couponCode, isMounted]);

  useEffect(() => {
    if (!isMounted || cart.length === 0 || !selectedGovEn || !city) return;

    const shippingKey = `${selectedGovEn}|${city}|${shippingCost}|${grandTotal}`;
    if (lastTrackedShippingInfo.current === shippingKey) return;
    lastTrackedShippingInfo.current = shippingKey;

    trackAddShippingInfo({
      value: grandTotal,
      shipping: shippingCost,
      shipping_tier: `${selectedGovEn} - ${city}`,
      coupon: couponApplied ? couponCode : undefined,
      items: analyticsItems,
    });
  }, [
    analyticsItems,
    cart.length,
    city,
    couponApplied,
    couponCode,
    grandTotal,
    isMounted,
    selectedGovEn,
    shippingCost,
  ]);

  const egPhoneRegex = /^01[0125]\d{8}$/;

  const cleanFirst = firstName.trim();
  const cleanLast = lastName.trim();
  const cleanPhone = phone.replace(/[\s\-\+]/g, "").replace(/^20/, "");
  const cleanPhone2 = phone2 ? phone2.replace(/[\s\-\+]/g, "").replace(/^20/, "") : "";

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    let err = "";
    if (field === "firstName" && (!cleanFirst || cleanFirst.length < 2)) {
      err = !cleanFirst ? (isArabic ? "الاسم الأول مطلوب." : "First name is required.") : (isArabic ? "يجب أن يتكون الاسم الأول من حرفين على الأقل." : "First name must be at least 2 characters.");
    } else if (field === "lastName" && (!cleanLast || cleanLast.length < 2)) {
      err = !cleanLast ? (isArabic ? "اسم العائلة مطلوب." : "Second name is required.") : (isArabic ? "يجب أن يتكون اسم العائلة من حرفين على الأقل." : "Second name must be at least 2 characters.");
    } else if (field === "phone" && (!phone.trim() || !egPhoneRegex.test(cleanPhone))) {
      err = !phone.trim() ? (isArabic ? "رقم الهاتف الأساسي مطلوب." : "Primary phone is required.") : (isArabic ? "يجب إدخال رقم هاتف مصري صحيح مكون من 11 رقمًا، مثل 01012345678." : "Primary phone must be a valid 11-digit Egyptian mobile number (e.g. 01012345678).");
    } else if (field === "phone2" && phone2.trim() && !egPhoneRegex.test(cleanPhone2)) {
      err = isArabic ? "يجب إدخال رقم هاتف بديل مصري صحيح مكون من 11 رقمًا." : "Alternative phone must be a valid 11-digit Egyptian mobile number.";
    } else if (field === "governorate" && !selectedGovEn) {
      err = isArabic ? "يرجى اختيار المحافظة." : "Please select a governorate.";
    } else if (field === "city" && !city) {
      err = isArabic ? "يرجى اختيار المدينة أو المنطقة." : "Please select a city or area.";
    } else if (field === "address" && (!address.trim() || address.trim().length < 5)) {
      err = !address.trim() ? (isArabic ? "العنوان بالتفصيل مطلوب." : "Detailed address is required.") : (isArabic ? "يجب ألا يقل العنوان بالتفصيل عن 5 أحرف." : "Detailed address must be at least 5 characters.");
    }

    if (err) {
      toast.error(err, "INVALID FIELD");
    }
  };

  const fieldErrors: Record<string, string> = {
    firstName: touched.firstName ? (!cleanFirst ? (isArabic ? "الاسم الأول مطلوب." : "First name is required.") : cleanFirst.length < 2 ? (isArabic ? "يجب أن يتكون الاسم الأول من حرفين على الأقل." : "First name must be at least 2 characters.") : "") : "",
    lastName: touched.lastName ? (!cleanLast ? (isArabic ? "اسم العائلة مطلوب." : "Second name is required.") : cleanLast.length < 2 ? (isArabic ? "يجب أن يتكون اسم العائلة من حرفين على الأقل." : "Second name must be at least 2 characters.") : "") : "",
    phone: touched.phone ? (!phone.trim() ? (isArabic ? "رقم الهاتف الأساسي مطلوب." : "Primary phone is required.") : !egPhoneRegex.test(cleanPhone) ? (isArabic ? "يجب إدخال رقم هاتف مصري صحيح مكون من 11 رقمًا، مثل 01012345678." : "Primary phone must be a valid 11-digit Egyptian mobile number (e.g. 01012345678).") : "") : "",
    phone2: touched.phone2 && phone2.trim() && !egPhoneRegex.test(cleanPhone2) ? (isArabic ? "يجب إدخال رقم هاتف بديل مصري صحيح مكون من 11 رقمًا." : "Alternative phone must be a valid 11-digit Egyptian mobile number.") : "",
    governorate: touched.governorate ? (!selectedGovEn ? (isArabic ? "يرجى اختيار المحافظة." : "Please select a governorate.") : "") : "",
    city: touched.city ? (!city ? (isArabic ? "يرجى اختيار المدينة أو المنطقة." : "Please select a city or area.") : "") : "",
    address: touched.address ? (!address.trim() ? (isArabic ? "العنوان بالتفصيل مطلوب." : "Detailed address is required.") : address.trim().length < 5 ? (isArabic ? "يجب ألا يقل العنوان بالتفصيل عن 5 أحرف." : "Detailed address must be at least 5 characters.") : "") : "",
  };

  const getFieldClass = (err?: string) =>
    `${inputClass} ${err ? "border-rose-500 ring-2 ring-rose-500/10 bg-rose-50/20 text-rose-950 focus:border-rose-600 focus:ring-rose-500/20" : ""}`;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    setTouched({
      firstName: true,
      lastName: true,
      phone: true,
      phone2: true,
      paymentSenderPhone: paymentMethod !== "cod",
      governorate: true,
      city: true,
      address: true,
    });

    if (
      !cleanFirst || cleanFirst.length < 2 ||
      !cleanLast || cleanLast.length < 2 ||
      !phone.trim() || !egPhoneRegex.test(cleanPhone) ||
      (phone2.trim() && !egPhoneRegex.test(cleanPhone2)) ||
      (paymentMethod !== "cod" && (!paymentSenderPhone.trim() || !egPhoneRegex.test(paymentSenderPhone.replace(/[\s\-\+]/g, "").replace(/^20/, "")))) ||
      !selectedGovEn ||
      !city ||
      !address || address.trim().length < 5
    ) {
      const msg = isArabic ? "يرجى تصحيح البيانات المظللة قبل تأكيد الطلب." : "Please fix the highlighted errors before placing your order.";
      setError(msg);
      toast.error(msg, isArabic ? "إتمام الطلب" : "CHECKOUT");
      trackCheckoutError("validation_failed", "delivery_details");
      return;
    }
    if (cart.length === 0) {
      const msg = isArabic ? "حقيبة التسوق فارغة. أضف منتجات لإتمام الطلب." : "Your bag is empty. Please add items to checkout.";
      setError(msg);
      toast.error(msg, isArabic ? "إتمام الطلب" : "CHECKOUT");
      trackCheckoutError("empty_cart", "checkout");
      return;
    }

    trackAddPaymentInfo({
      value: grandTotal,
      payment_type: paymentMethod,
      coupon: couponApplied ? couponCode : undefined,
      items: analyticsItems,
    });

    setLoading(true);
    try {
      const result = await createOrder({
        customerFirstName: cleanFirst,
        customerLastName: cleanLast,
        customerName: `${cleanFirst} ${cleanLast}`,
        customerPhone: cleanPhone,
        customerPhone2: cleanPhone2 || undefined,
        paymentMethod,
        paymentSenderPhone: paymentMethod === "cod" ? undefined : paymentSenderPhone,
        governorate: selectedGovEn,
        city,
        address: address.trim(),
        notes: notes.trim(),
        couponCode: couponApplied ? couponCode : undefined,
        items: cart.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      });

      if (result.success && result.orderNumber) {
        trackPurchase({
          transaction_id: result.orderNumber,
          event_id: result.eventId,
          google_enhanced_conversion_data: result.enhancedConversionData,
          value: Number(result.totalPrice ?? grandTotal),
          shipping: Number(result.shippingCost ?? shippingCost),
          coupon: couponApplied ? couponCode : undefined,
          items: analyticsItems,
        });
        toast.success(isArabic ? `تم تأكيد الطلب ${result.orderNumber} بنجاح!` : `Order ${result.orderNumber} placed successfully!`, isArabic ? "تم تأكيد الطلب" : "ORDER CONFIRMED");
        clearCart();
        const fullCustomerName = `${firstName.trim()} ${lastName.trim()}`;
        router.push(
          `/checkout/success?orderNumber=${result.orderNumber}&name=${encodeURIComponent(fullCustomerName)}&total=${result.totalPrice}&shipping=${result.shippingCost}&gov=${encodeURIComponent(selectedGovEn)}&paymentMethod=${paymentMethod}`
        );
      } else {
        const err = isArabic ? "حدث خطأ ما. حاول مرة أخرى." : (result.error || "Something went wrong. Please try again.");
        setError(err);
        toast.error(err, isArabic ? "فشل الطلب" : "ORDER FAILED");
        trackCheckoutError("order_create_failed", "place_order");
      }
    } catch (submitError) {
      console.error(submitError);
      const msg = isArabic ? "تعذر الاتصال بالخادم. حاول مرة أخرى." : "We could not connect to the server. Please try again.";
      setError(msg);
      toast.error(msg, isArabic ? "خطأ في الاتصال" : "CONNECTION ERROR");
      trackCheckoutError("connection_error", "place_order");
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  if (cart.length === 0) {
    return (
      <main className="min-h-[70vh] bg-[#fffaf0] px-4 py-16 sm:py-24" dir={dir}>
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#942e3a]/10 text-[#942e3a]">
            <ShoppingBag className="h-9 w-9" />
          </div>
          <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.28em] text-[#c49a50]">DeRoma</p>
          <h1 className="mt-2 font-playfair text-3xl font-semibold text-[#481827]">{t("cart.emptyTitle")}</h1>
          <p className="mt-3 text-sm leading-6 text-[#806e73]">{t("cart.emptyDesc")}</p>
          <Link href="/shop" className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-[#942e3a] px-7 text-sm font-bold text-white shadow-lg shadow-[#942e3a]/20 transition hover:bg-[#76232d]">
            {t("cart.startShopping")} {dir === "rtl" ? <ArrowLeft className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4 rotate-180" />}
          </Link>
        </div>
      </main>
    );
  }

  const renderPaymentDetails = () => {
    if (paymentMethod === "cod") return null;

    return (
      <div className={`rounded-2xl border p-4 ${paymentMethod === "instapay" ? "border-purple-200 bg-purple-50/70" : "border-emerald-200 bg-emerald-50/70"}`}>
        <div className="flex items-center justify-between gap-3"><h3 className={`font-playfair text-lg font-bold ${paymentMethod === "instapay" ? "text-purple-800" : "text-emerald-800"}`}>{paymentMethod === "instapay" ? "InstaPay Transfer Details" : "E-Wallet Transfer Details"}</h3><span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold text-[#942e3a]">PAYMENT PENDING</span></div>
        <p className="mt-2 text-xs leading-5 text-[#416866]">{isArabic ? `حوّل إجمالي ${formatPrice(grandTotal)} إلى الرقم التالي، ثم أرسل صورة التحويل على واتساب.` : `Transfer ${formatPrice(grandTotal)} to the account below, then send the transfer screenshot on WhatsApp.`}</p>
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-white bg-white p-3"><div><p className="text-[10px] font-bold uppercase tracking-wider text-[#9a8586]">{paymentAccountLabel}</p><p className="mt-1 text-xl font-black tracking-[0.12em] text-[#164d49]">{paymentAccount || (isArabic ? "غير متاح" : "Not configured")}</p></div><button type="button" onClick={() => { navigator.clipboard?.writeText(paymentAccount); setCopiedPayment(true); }} className="rounded-lg border border-[#eadfd6] px-3 py-2 text-xs font-bold text-[#942e3a]">{copiedPayment ? (isArabic ? "تم النسخ" : "Copied") : (isArabic ? "نسخ" : "Copy")}</button></div>
        <div className="mt-3 rounded-xl border border-[#eadfd6] bg-white p-3"><label className="text-xs font-bold text-[#164d49]">{isArabic ? "رقم الهاتف المحول منه" : "Transfer-from phone number"}</label><input type="tel" value={paymentSenderPhone} onChange={(event) => setPaymentSenderPhone(event.target.value)} placeholder="01012345678" className={`${inputClass} mt-2 h-11`} />{touched.paymentSenderPhone && (!paymentSenderPhone.trim() || !egPhoneRegex.test(paymentSenderPhone.replace(/[\s\-\+]/g, "").replace(/^20/, ""))) && <p className="mt-1 text-[11px] text-rose-600">{isArabic ? "اكتب رقم الهاتف الذي تم التحويل منه بشكل صحيح." : "Enter the valid phone number used for the transfer."}</p>}</div>
        <a href={whatsappPaymentHref} target="_blank" rel="noreferrer" className="mt-3 flex h-11 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 text-xs font-bold text-white transition hover:bg-[#1da851]"><MessageSquare className="h-4 w-4" /> {isArabic ? `إرسال صورة التحويل على واتساب ${paymentAccountLabel}` : `Send proof on WhatsApp to ${paymentAccountLabel}`}</a>
        <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-blue-800">{isArabic ? "بعد إتمام الطلب اضغط زر واتساب وأرسل صورة التحويل مع الرسالة الجاهزة. سيظل الطلب بانتظار تأكيد الدفع حتى يراجعه الأدمن." : "After placing the order, tap WhatsApp and send the transfer screenshot with the prepared message. The order will stay pending payment until the admin confirms it."}</div>
      </div>
    );
  };

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden bg-[#fffaf0] px-3 py-6 text-[#481827] sm:px-6 sm:py-12 lg:px-8" dir={dir}>
      <div className="mx-auto w-full min-w-0 max-w-6xl">
        <div className="mb-8 flex flex-col items-center gap-5 border-b border-[#eadfd6] pb-7 text-center sm:flex-row sm:items-end sm:justify-between rtl:sm:text-right ltr:sm:text-left">
          <div>
            <Link href="/shop" className="flex w-full items-center justify-start gap-2 text-xs font-semibold text-[#806e73] transition hover:text-[#942e3a] sm:inline-flex sm:w-auto">
              {dir === "rtl" ? <ArrowLeft className="h-4 w-4 rotate-180" /> : <ArrowLeft className="h-4 w-4" />} {t("nav.shop")}
            </Link>
            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.3em] text-[#c49a50]">DeRoma</p>
            <h1 className="mt-1 font-playfair text-3xl font-semibold sm:text-4xl">{t("checkout.title")}</h1>
          </div>

          <div className="flex items-center justify-center gap-3 text-xs font-semibold text-[#806e73]">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#942e3a] text-white"><Check className="h-4 w-4" /></span>
            <span className="text-[#942e3a]">{t("nav.bag")}</span>
            <span className="h-px w-8 bg-[#d8b46a] sm:w-12" />
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#942e3a] text-white">2</span>
            <span className="text-[#942e3a]">{t("checkout.title")}</span>
          </div>
        </div>

        <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
          <form id="checkout-form" onSubmit={handleSubmit} className="order-2 min-w-0 space-y-5 lg:order-1">
            <section className="rounded-3xl border border-[#eadfd6] bg-white p-5 shadow-[0_14px_40px_rgba(73,24,39,0.05)] sm:p-7">
              <div className="mb-6 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#942e3a]/10 text-[#942e3a]"><UserRound className="h-5 w-5" /></div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c49a50]">{isArabic ? "الخطوة 02" : "Step 02"}</p>
                  <h2 className="mt-1 font-playfair text-xl font-semibold">{t("checkout.expressCheckout")}</h2>
                  <p className="mt-1 text-xs leading-5 text-[#806e73]">{t("checkout.shippingAddress")}</p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <FieldLabel icon={UserRound}>{t("checkout.firstName")} *</FieldLabel>
                  <input
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onBlur={() => handleBlur("firstName")}
                    placeholder={t("checkout.firstName")}
                    className={getFieldClass(fieldErrors.firstName)}
                  />
                  {fieldErrors.firstName && <p className="mt-1.5 text-xs font-bold text-rose-600">{fieldErrors.firstName}</p>}
                </div>
                <div>
                  <FieldLabel icon={UserRound}>{t("checkout.lastName")} *</FieldLabel>
                  <input
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onBlur={() => handleBlur("lastName")}
                    placeholder={t("checkout.lastName")}
                    className={getFieldClass(fieldErrors.lastName)}
                  />
                  {fieldErrors.lastName && <p className="mt-1.5 text-xs font-bold text-rose-600">{fieldErrors.lastName}</p>}
                </div>
                <div>
                  <FieldLabel icon={Phone}>{t("checkout.phone")} *</FieldLabel>
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onBlur={() => handleBlur("phone")}
                    placeholder="010 1234 5678"
                    className={getFieldClass(fieldErrors.phone)}
                  />
                  {fieldErrors.phone && <p className="mt-1.5 text-xs font-bold text-rose-600">{fieldErrors.phone}</p>}
                </div>
                <div>
                  <FieldLabel icon={Phone} optional>{t("login.phoneLabel")} (2)</FieldLabel>
                  <input
                    type="tel"
                    value={phone2}
                    onChange={(e) => setPhone2(e.target.value)}
                    onBlur={() => handleBlur("phone2")}
                    placeholder="011 ..."
                    className={getFieldClass(fieldErrors.phone2)}
                  />
                  {fieldErrors.phone2 && <p className="mt-1.5 text-xs font-bold text-rose-600">{fieldErrors.phone2}</p>}
                </div>
                <div ref={govMenuRef} className="relative">
                  <FieldLabel icon={MapPin}>{t("checkout.governorate")} *</FieldLabel>
                  <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={isGovMenuOpen}
                    onClick={() => {
                      setIsGovMenuOpen((open) => !open);
                      setGovSearch("");
                      handleBlur("governorate");
                    }}
                    className={`${getFieldClass(fieldErrors.governorate)} flex min-w-0 items-center justify-between overflow-hidden text-left rtl:text-right ${selectedGovEn ? "text-[#481827]" : "text-[#a99ca0]"}`}
                  >
                    <span>{selectedGovEn ? <span>{selectedGovEn} · {isFreeShippingUnlocked ? <span className="font-bold text-emerald-700">{t("checkout.free")}</span> : formatPrice(activeGov?.fee || 50)}</span> : (isFreeShippingUnlocked ? <span>{t("checkout.selectGovernorate")} (<span className="font-bold text-emerald-700">{t("checkout.free")}</span>)</span> : t("checkout.selectGovernorate"))}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-[#942e3a] transition-transform ${isGovMenuOpen ? "rotate-180" : ""}`} />
                  </button>
                  {fieldErrors.governorate && <p className="mt-1.5 text-xs font-bold text-rose-600">{fieldErrors.governorate}</p>}
                  {isGovMenuOpen && (
                    <div
                      data-lenis-prevent="true"
                      role="listbox"
                      aria-label={isArabic ? "المحافظة" : "Governorate"}
                      onWheel={(event) => event.stopPropagation()}
                      onTouchMove={(event) => event.stopPropagation()}
                      style={{ WebkitOverflowScrolling: "touch" }}
                      className="absolute left-0 right-0 z-50 mt-2 max-h-60 overflow-y-auto overscroll-contain touch-pan-y rounded-2xl border border-[#eadfd6] bg-white p-1.5 shadow-[0_18px_40px_rgba(73,24,39,0.16)]"
                    >
                      <div className="sticky top-0 z-10 bg-white pb-1.5">
                        <div className="relative">
                          <Search className="pointer-events-none absolute left-3 rtl:left-auto rtl:right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#942e3a]" />
                          <input
                            type="search"
                            value={govSearch}
                            onChange={(event) => setGovSearch(event.target.value)}
                            onClick={(event) => event.stopPropagation()}
                            placeholder={t("nav.searchAction")}
                            aria-label={isArabic ? "البحث عن المحافظات" : "Search governorates"}
                            className="h-11 w-full rounded-xl border border-[#eadfd6] bg-[#fffaf0] pl-9 pr-3 rtl:pl-3 rtl:pr-9 text-sm text-[#481827] outline-none placeholder:text-[#a99ca0] focus:border-[#942e3a] focus:ring-2 focus:ring-[#942e3a]/10"
                          />
                        </div>
                      </div>
                      {!govSearch && <button type="button" role="option" aria-selected={!selectedGovEn} onClick={() => { setSelectedGovEn(""); setCity(""); setIsGovMenuOpen(false); setGovSearch(""); handleBlur("governorate"); }} className={`w-full rounded-xl px-3 py-3 text-left rtl:text-right text-sm transition ${!selectedGovEn ? "bg-[#942e3a] text-white" : "text-[#806e73] hover:bg-[#fff5e8] hover:text-[#942e3a]"}`}>{t("checkout.selectGovernorate")}</button>}
                      {filteredGovernorates.map((gov) => {
                        const isSelected = gov.en === selectedGovEn;
                        const displayName = gov.en;
                        return <button key={gov.en} type="button" role="option" aria-selected={isSelected} onClick={() => { setSelectedGovEn(gov.en); setCity(""); setCenterSearch(""); setIsGovMenuOpen(false); setGovSearch(""); handleBlur("governorate"); }} className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left rtl:text-right text-sm transition ${isSelected ? "bg-[#942e3a] font-bold text-white" : "text-[#481827] hover:bg-[#fff5e8] hover:text-[#942e3a]"}`}><span>{displayName}</span><span className={`shrink-0 text-xs ${isSelected ? (isFreeShippingUnlocked ? "text-emerald-200 font-bold" : "text-[#fffaf0]/80") : (isFreeShippingUnlocked ? "text-emerald-600 font-bold" : "text-[#b8934a]")}`}>{isFreeShippingUnlocked ? t("checkout.free") : formatPrice(gov.fee)}</span></button>;
                      })}
                    </div>
                  )}
                </div>
                <div ref={centerMenuRef} className="relative">
                  <FieldLabel icon={MapPin}>{t("checkout.city")} *</FieldLabel>
                  <button
                    type="button"
                    disabled={!selectedGovEn}
                    aria-haspopup="listbox"
                    aria-expanded={isCenterMenuOpen}
                    onClick={() => {
                      setIsCenterMenuOpen((open) => !open);
                      setCenterSearch("");
                      handleBlur("city");
                    }}
                    className={`${getFieldClass(fieldErrors.city)} flex min-w-0 items-center justify-between overflow-hidden text-left rtl:text-right ${city ? "text-[#481827]" : "text-[#a99ca0]"} disabled:cursor-not-allowed disabled:bg-[#f8f3ed] disabled:opacity-70`}
                  >
                    <span>{city || (selectedGovEn ? t("checkout.selectCity") : t("checkout.selectGovernorate"))}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-[#942e3a] transition-transform ${isCenterMenuOpen ? "rotate-180" : ""}`} />
                  </button>
                  {fieldErrors.city && <p className="mt-1.5 text-xs font-bold text-rose-600">{fieldErrors.city}</p>}
                  {isCenterMenuOpen && selectedGovEn && (
                    <div
                      data-lenis-prevent="true"
                      role="listbox"
                      aria-label={isArabic ? "المدينة أو المنطقة" : "City or center"}
                      onWheel={(event) => event.stopPropagation()}
                      onTouchMove={(event) => event.stopPropagation()}
                      style={{ WebkitOverflowScrolling: "touch" }}
                      className="absolute left-0 right-0 z-40 mt-2 max-h-60 overflow-y-auto overscroll-contain touch-pan-y rounded-2xl border border-[#eadfd6] bg-white p-1.5 shadow-[0_18px_40px_rgba(73,24,39,0.16)]"
                    >
                      <div className="sticky top-0 z-10 bg-white pb-1.5">
                        <div className="relative">
                          <Search className="pointer-events-none absolute left-3 rtl:left-auto rtl:right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#942e3a]" />
                          <input type="search" value={centerSearch} onChange={(event) => setCenterSearch(event.target.value)} onClick={(event) => event.stopPropagation()} placeholder={t("nav.searchAction")} aria-label={isArabic ? "البحث عن المدن والمراكز" : "Search cities and centers"} className="h-11 w-full rounded-xl border border-[#eadfd6] bg-[#fffaf0] pl-9 pr-3 rtl:pl-3 rtl:pr-9 text-sm text-[#481827] outline-none placeholder:text-[#a99ca0] focus:border-[#942e3a] focus:ring-2 focus:ring-[#942e3a]/10" />
                        </div>
                      </div>
                      {filteredCenters.map((c) => <button key={c} type="button" role="option" aria-selected={c === city} onClick={() => { setCity(c); setIsCenterMenuOpen(false); setCenterSearch(""); handleBlur("city"); }} className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left rtl:text-right text-sm transition ${c === city ? "bg-[#942e3a] font-bold text-white" : "text-[#481827] hover:bg-[#fff5e8] hover:text-[#942e3a]"}`}><span>{c}</span><span className={`shrink-0 text-xs ${c === city ? "text-[#fffaf0]/80" : "text-[#b8934a]"}`}>{isFreeShippingUnlocked ? t("checkout.free") : formatPrice(cityShippingFee(c))}</span></button>)}
                    </div>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel icon={MapPin}>{t("checkout.address")} *</FieldLabel>
                  <textarea
                    required
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onBlur={() => handleBlur("address")}
                    placeholder={t("checkout.address")}
                    className={`${getFieldClass(fieldErrors.address)} h-auto resize-none py-3`}
                  />
                  {fieldErrors.address && <p className="mt-1.5 text-xs font-bold text-rose-600">{fieldErrors.address}</p>}
                </div>
                <div className="sm:col-span-2"><FieldLabel icon={MessageSquare}>{t("checkout.notes")}</FieldLabel><textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("checkout.notes")} className={`${inputClass} h-auto resize-none py-3`} /></div>
              </div>
            </section>

            <section className="rounded-3xl border border-[#eadfd6] bg-white p-5 shadow-[0_14px_40px_rgba(73,24,39,0.05)] sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#d8b46a]/20 text-[#9a742b]"><CreditCard className="h-5 w-5" /></div>
                <div><h2 className="font-playfair text-xl font-semibold">{t("checkout.paymentMethod")}</h2><p className="mt-1 text-xs text-[#806e73]">{isArabic ? "اختار طريقة الدفع المناسبة لك" : "Choose how you would like to pay"}</p></div>
              </div>
              <div className="mt-5 space-y-3">
                {([
                  { value: "cod" as const, title: isArabic ? "الدفع عند الاستلام" : "Cash on delivery", desc: isArabic ? "ادفع عند استلام طلبك" : "Pay when you receive your order", badge: "COD" },
                  { value: "instapay" as const, title: "InstaPay", desc: isArabic ? "تحويل فوري عبر InstaPay" : "Instant transfer via InstaPay", badge: "INSTAPAY" },
                  { value: "wallet" as const, title: isArabic ? "المحفظة الإلكترونية" : "Mobile wallet", desc: isArabic ? "فودافون كاش أو أورنج أو اتصالات" : "Vodafone Cash, Orange, Etisalat", badge: "WALLET" },
                ]).map((option) => {
                  const selected = paymentMethod === option.value;
                  return <div key={option.value} className="space-y-3"><button type="button" onClick={() => { setPaymentMethod(option.value); setCopiedPayment(false); }} className={`flex w-full items-center justify-between gap-3 rounded-2xl border-2 p-4 text-left transition ${selected ? "border-[#942e3a] bg-[#fffaf0] shadow-[0_0_0_3px_rgba(148,46,58,.08)]" : "border-[#eadfd6] bg-white hover:border-[#942e3a]/40"}`}>
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${selected ? "border-[#942e3a] bg-[#942e3a]" : "border-[#b9c6c7]"}`}>{selected && <Check className="h-3 w-3 text-white" />}</span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-[#164d49]">{option.title}</span><span className="mt-1 block text-[11px] text-[#806e73]">{option.desc}</span></span>
                    <span className="hidden rounded-full bg-[#942e3a]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#942e3a] sm:inline">{option.badge}</span>
                  </button>{selected && option.value !== "cod" && renderPaymentDetails()}</div>;
                })}
              </div>
              {false && paymentMethod !== "cod" && (
                <div className={`mt-4 rounded-2xl border p-4 ${paymentMethod === "instapay" ? "border-purple-200 bg-purple-50/70" : "border-emerald-200 bg-emerald-50/70"}`}>
                  <div className="flex items-center justify-between gap-3"><h3 className={`font-playfair text-lg font-bold ${paymentMethod === "instapay" ? "text-purple-800" : "text-emerald-800"}`}>{paymentMethod === "instapay" ? "InstaPay Transfer Details" : "E-Wallet Transfer Details"}</h3><span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold text-[#942e3a]">PAYMENT PENDING</span></div>
                  <p className="mt-2 text-xs leading-5 text-[#416866]">{isArabic ? `حوّل إجمالي ${formatPrice(grandTotal)} إلى الرقم التالي، ثم أرسل صورة التحويل على واتساب.` : `Transfer ${formatPrice(grandTotal)} to the account below, then send the transfer screenshot on WhatsApp.`}</p>
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-white bg-white p-3"><div><p className="text-[10px] font-bold uppercase tracking-wider text-[#9a8586]">{paymentAccountLabel}</p><p className="mt-1 text-xl font-black tracking-[0.12em] text-[#164d49]">{paymentAccount || (isArabic ? "غير متاح" : "Not configured")}</p></div><button type="button" onClick={() => { navigator.clipboard?.writeText(paymentAccount); setCopiedPayment(true); }} className="rounded-lg border border-[#eadfd6] px-3 py-2 text-xs font-bold text-[#942e3a]">{copiedPayment ? (isArabic ? "تم النسخ" : "Copied") : (isArabic ? "نسخ" : "Copy")}</button></div>
                  <div className="mt-3 rounded-xl border border-[#eadfd6] bg-white p-3"><label className="text-xs font-bold text-[#164d49]">{isArabic ? "رقم الهاتف المحول منه" : "Transfer-from phone number"}</label><input type="tel" value={paymentSenderPhone} onChange={(event) => setPaymentSenderPhone(event.target.value)} placeholder="01012345678" className={`${inputClass} mt-2 h-11`} />{touched.paymentSenderPhone && (!paymentSenderPhone.trim() || !egPhoneRegex.test(paymentSenderPhone.replace(/[\s\-\+]/g, "").replace(/^20/, ""))) && <p className="mt-1 text-[11px] text-rose-600">{isArabic ? "اكتب رقم الهاتف الذي تم التحويل منه بشكل صحيح." : "Enter the valid phone number used for the transfer."}</p>}</div>
                  <a href={whatsappPaymentHref} target="_blank" rel="noreferrer" className="mt-3 flex h-11 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 text-xs font-bold text-white transition hover:bg-[#1da851]"><MessageSquare className="h-4 w-4" /> {isArabic ? `إرسال صورة التحويل على واتساب ${paymentAccountLabel}` : `Send proof on WhatsApp to ${paymentAccountLabel}`}</a>
                  <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-blue-800">{isArabic ? "بعد إتمام الطلب اضغط زر واتساب وأرسل صورة التحويل مع الرسالة الجاهزة. سيظل الطلب بانتظار تأكيد الدفع حتى يراجعه الأدمن." : "After placing the order, tap WhatsApp and send the transfer screenshot with the prepared message. The order will stay pending payment until the admin confirms it."}</div>
                </div>
              )}
            </section>
          </form>

          <aside className="order-1 min-w-0 space-y-5 lg:order-2 lg:sticky lg:top-6">
            <section className="rounded-3xl bg-[#942e3a] p-5 text-[#fffaf0] shadow-[0_18px_45px_rgba(148,46,58,0.2)] sm:p-6">
              <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#d8b46a]">{t("nav.bag")}</p><h2 className="mt-1 font-playfair text-2xl font-semibold">{t("checkout.orderSummary")}</h2></div><span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"><ShoppingBag className="h-5 w-5" /></span></div>
              <div className="my-5 h-px bg-white/15" />
              <div className="hide-scrollbar max-h-64 space-y-4 overflow-y-auto pr-1">
                {cart.map((item) => <div key={item.variantId} className="flex items-center gap-3"><div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white"><Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{item.name}</p><p className="mt-1 text-[11px] text-white/65">{item.color} · {t("cart.size")} {formatNumber(item.size)}</p><p className="mt-1 text-[11px] text-white/65">{t("cart.quantity")}: {formatNumber(item.quantity)}</p></div><p className="shrink-0 text-sm font-bold">{formatPrice(item.price * item.quantity)}</p></div>)}
              </div>
              <div className="my-5 h-px bg-white/15" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-white/70">
                  <span>{t("checkout.subtotal")}</span>
                  <span className="font-semibold text-white">{formatPrice(cartTotal)}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-300 font-semibold">
                    <span>{isArabic ? "الخصم" : "Discount"} ({couponCode})</span>
                    <span>-{formatPrice(appliedDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white/70">
                  <span>{t("checkout.shippingFee")}</span>
                  <span className={isFreeShippingUnlocked ? "font-bold text-emerald-400" : "font-semibold text-[#d8b46a]"}>
                    {isFreeShippingUnlocked ? t("checkout.free") : selectedGovEn ? formatPrice(shippingCost) : t("checkout.selectGovernorate")}
                  </span>
                </div>
                <div className="flex items-end justify-between border-t border-white/15 pt-4">
                  <span className="font-bold">{t("checkout.total")}</span>
                  <span className="font-playfair text-2xl font-semibold">{formatPrice(grandTotal)}</span>
                </div>
              </div>
              <button form="checkout-form" type="submit" disabled={loading} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#d8b46a] px-5 py-3.5 text-sm font-bold text-[#481827] shadow-lg transition hover:bg-[#e5c785] disabled:cursor-not-allowed disabled:opacity-60">{loading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#481827] border-t-transparent" /> : <><span>{t("checkout.placeOrder")}</span>{dir === "rtl" ? <ArrowLeft className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4 rotate-180" />}</>}</button>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
