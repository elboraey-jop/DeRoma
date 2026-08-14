"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  CreditCard,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Truck,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { GOVERNORATES, CENTERS_BY_GOVERNORATE } from "@/lib/locations";
import { useStoreI18n } from "@/providers/StoreI18nContext";

const GOVERNORATE_FEES: Record<string, number> = {
  Cairo: 50,
  Giza: 50,
  Alexandria: 60,
  Qalyubia: 70,
  Sharqia: 70,
  Dakahlia: 70,
  Monufia: 70,
  Gharbia: 70,
  "Kafr El Sheikh": 70,
  Damietta: 70,
  "Port Said": 70,
  Ismailia: 70,
  Suez: 70,
  Fayoum: 90,
  "Beni Suef": 90,
  Minya: 90,
  Asyut: 90,
  Sohag: 90,
  Qena: 90,
  Luxor: 90,
  Aswan: 90,
  "Red Sea": 120,
  "New Valley": 120,
  Matrouh: 120,
  "North Sinai": 120,
  "South Sinai": 120,
};

const shippingSteps = [
  { title: "Confirmation", text: "Verified by phone.", icon: PackageCheck },
  { title: "Careful Packing", text: "Inspected & sealed.", icon: ShieldCheck },
  { title: "Doorstep Inspection", text: "COD door inspection.", icon: Truck },
];

const arabicShippingSteps = [
  { title: "تأكيد الطلب", text: "يتم التأكيد عبر الهاتف.", icon: PackageCheck },
  { title: "تغليف دقيق", text: "فحص وإغلاق المنتج.", icon: ShieldCheck },
  { title: "فحص عند الوصول", text: "فحص الطلب عند الاستلام.", icon: Truck },
];

const terms = [
  "Product colors may vary slightly depending on screen calibration & lighting.",
  "Stock availability is updated live; items reserved upon checkout submission.",
  "Cash on Delivery orders are verified via phone before dispatch.",
  "Customers must provide valid Egyptian contact & shipping details.",
];

const arabicTerms = [
  "قد تختلف ألوان المنتجات بشكل بسيط حسب إعدادات الشاشة والإضاءة.",
  "يتم تحديث توافر المنتجات باستمرار، ويتم حجز المنتج عند إرسال الطلب.",
  "يتم تأكيد طلبات الدفع عند الاستلام عبر الهاتف قبل الشحن.",
  "يجب تقديم بيانات تواصل وعنوان شحن صحيحين داخل مصر.",
];

type SearchResult = {
  label: string;
  governorate: string;
  fee: number;
  isCity: boolean;
};

export default function TermsPage() {
  const { t, formatPrice, dir, lang } = useStoreI18n();
  const [shippingSearch, setShippingSearch] = useState("");
  const isArabic = lang === "ar";
  const activeShippingSteps = isArabic ? arabicShippingSteps : shippingSteps;
  const activeTerms = isArabic ? arabicTerms : terms;
  const copy = isArabic
    ? {
        title: "سياسة الشروط والشحن",
        subtitle: "دليل سريع لتجهيز الطلب، وتكلفة التوصيل، وشروط الخدمة داخل مصر.",
        deliveryWindow: "مدة التوصيل",
        deliveryDays: "يوم 2 - 4",
        paymentMethod: "طريقة الدفع",
        cashOnDelivery: "الدفع عند الاستلام",
        checkShipping: "اعرف تكلفة الشحن لمنطقتك",
        searchArea: "ابحث عن مدينة أو محافظة",
        placeholder: "ابحث عن مدينتك أو محافظتك (Cairo, Tanta, Mansoura, Alex)...",
        city: "مدينة",
        governorate: "محافظة",
        noResults: "لم يتم العثور على محافظة أو مدينة مطابقة لـ",
        popular: "الوجهات الشائعة:",
        shippingNotes: "ملاحظات الشحن",
        shippingText: "تستغرق التوصيلات إلى القاهرة الكبرى من 24 إلى 48 ساعة. يتوفر الشحن السريع لجميع المحافظات مع إمكانية فحص الطلب عند الوصول.",
        trackOrder: "تتبع الطلب الحالي",
        termsTitle: "شروط الخدمة",
      }
    : {
        title: "Terms & Shipping Policy",
        subtitle: "Quick guide to order dispatch, delivery fees, and service terms across Egypt.",
        deliveryWindow: "Delivery Window",
        deliveryDays: "2 - 4 Days",
        paymentMethod: "Payment Method",
        cashOnDelivery: "Cash on Delivery",
        checkShipping: "Check Shipping Fee to Your Area",
        searchArea: "Search city or gov",
        placeholder: "Search your city or governorate (Cairo, Tanta, Mansoura, Alex)...",
        city: "City",
        governorate: "Governorate",
        noResults: "No governorate or city found matching",
        popular: "Popular Destinations:",
        shippingNotes: "Shipping Notes",
        shippingText: "Deliveries to Greater Cairo take 24–48 hours. Express shipping applies across all governorates with door inspection permitted upon arrival.",
        trackOrder: "Track Active Order",
        termsTitle: "Terms of Service",
      };

  const popularGovs = ["Cairo", "Giza", "Alexandria", "Gharbia", "Dakahlia", "Sharqia"];

  const searchResults = useMemo<SearchResult[]>(() => {
    const query = shippingSearch.trim().toLowerCase();
    if (!query) return [];

    const results: SearchResult[] = [];

    // Search governorates
    GOVERNORATES.forEach((gov) => {
      if (gov.toLowerCase().includes(query)) {
        results.push({
          label: gov,
          governorate: gov,
          fee: GOVERNORATE_FEES[gov] ?? 70,
          isCity: false,
        });
      }
    });

    // Search cities / centers
    Object.entries(CENTERS_BY_GOVERNORATE).forEach(([gov, cities]) => {
      cities.forEach((city) => {
        if (city.toLowerCase().includes(query) && !results.some((r) => r.label.toLowerCase() === city.toLowerCase())) {
          results.push({
            label: city,
            governorate: gov,
            fee: GOVERNORATE_FEES[gov] ?? 70,
            isCity: true,
          });
        }
      });
    });

    return results.slice(0, 6);
  }, [shippingSearch]);

  return (
    <div className="min-h-screen bg-[#FFF9EB] text-[#942E3A] font-outfit py-3 sm:py-10 px-2.5 sm:px-6 lg:px-8" dir={dir}>
      <div className="max-w-[900px] mx-auto space-y-3 sm:space-y-8">
        
        {/* Navigation & Header */}
        <div className="space-y-1.5 sm:space-y-4">
          <Link href="/" className="inline-flex items-center gap-1 text-xs font-bold text-[#942E3A] hover:opacity-80 transition-opacity">
            {dir === "rtl" ? <ArrowLeft className="w-3.5 h-3.5 rotate-180" /> : <ArrowLeft className="w-3.5 h-3.5" />}
            <span>{t("nav.home")}</span>
          </Link>

          <div className="space-y-0.5">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#942E3A]">
              DeRoma
            </span>
            <h1 className="text-xl sm:text-4xl font-black font-playfair tracking-tight text-[#942E3A]">
              {copy.title}
            </h1>
            <p className="text-[10px] sm:text-xs text-stone-500 font-light">{copy.subtitle}</p>
          </div>
        </div>

        {/* Quick Stats Grid - 2 columns side-by-side */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <div className="bg-white border border-[#942E3A]/25 rounded-xl sm:rounded-2xl p-2 sm:p-5 text-center space-y-0.5 shadow-xs">
            <Clock className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#D8B46A] mx-auto" />
            <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-[#942E3A]/70">{copy.deliveryWindow}</span>
            <p className="text-xs sm:text-2xl font-black text-[#942E3A]">{copy.deliveryDays}</p>
          </div>

          <div className="bg-white border border-[#942E3A]/25 rounded-xl sm:rounded-2xl p-2 sm:p-5 text-center space-y-0.5 shadow-xs">
            <CreditCard className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#D8B46A] mx-auto" />
            <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-[#942E3A]/70">{copy.paymentMethod}</span>
            <p className="text-xs sm:text-2xl font-black text-[#942E3A]">{copy.cashOnDelivery}</p>
          </div>
        </div>

        {/* Interactive Shipping Rate Search Calculator */}
        <section className="bg-white border border-[#942E3A]/30 rounded-xl sm:rounded-3xl p-3 sm:p-6 shadow-xs space-y-2.5 sm:space-y-4">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#942E3A] shrink-0" />
              <h2 className="text-xs sm:text-lg font-bold font-playfair text-[#942E3A]">
                {copy.checkShipping}
              </h2>
            </div>
            <span className="text-[9px] sm:text-[10px] text-stone-400">{copy.searchArea}</span>
          </div>

          {/* Search Bar Input */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 rtl:left-auto rtl:right-3 top-1/2 w-3.5 h-3.5 -translate-y-1/2 text-[#942E3A]" />
            <input
              type="text"
              value={shippingSearch}
              onChange={(e) => setShippingSearch(e.target.value)}
              placeholder={copy.placeholder}
              className="w-full pl-8 pr-8 rtl:pl-8 rtl:pr-8 py-2 sm:py-2.5 rounded-xl border border-[#942E3A]/30 bg-[#FFF9EB]/40 text-[11px] sm:text-xs text-[#942E3A] outline-none focus:border-[#942E3A] focus:ring-1 focus:ring-[#942E3A]"
            />
            {shippingSearch && (
              <button
                onClick={() => setShippingSearch("")}
                className="absolute right-2.5 rtl:right-auto rtl:left-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#942E3A]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Results / Popular Tags */}
          {shippingSearch.trim() ? (
            <div className="space-y-1.5 pt-0.5">
              {searchResults.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                  {searchResults.map((res, i) => (
                    <div
                      key={`${res.label}-${i}`}
                      className="flex items-center justify-between p-2 sm:p-3 rounded-lg sm:rounded-xl border border-[#942E3A]/20 bg-[#FFF9EB]/30 hover:border-[#942E3A] transition-colors"
                    >
                      <div>
                        <p className="text-[11px] sm:text-xs font-bold text-[#942E3A]">{res.label}</p>
                        <p className="text-[9px] text-stone-500">
                          {res.isCity ? `${copy.city} · ${res.governorate}` : copy.governorate}
                        </p>
                      </div>
                      <div className="text-right rtl:text-left">
                        <span className="block text-xs sm:text-sm font-black text-[#942E3A]">{formatPrice(res.fee)}</span>
                        <span className="text-[8px] sm:text-[9px] text-emerald-600 font-semibold">
                          {res.governorate === "Cairo" || res.governorate === "Giza" ? "24–48 hrs" : "2–4 days"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-[11px] text-stone-400 py-2">
                  {copy.noResults} &quot;{shippingSearch}&quot;.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1 pt-0.5">
              <p className="text-[9px] font-semibold text-stone-400 uppercase tracking-wider">{copy.popular}</p>
              <div className="flex flex-wrap gap-1 sm:gap-1.5">
                {popularGovs.map((gov) => (
                  <button
                    key={gov}
                    onClick={() => setShippingSearch(gov)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#942E3A]/20 bg-[#FFF9EB]/40 hover:bg-[#942E3A] hover:text-white text-[10px] sm:text-[11px] font-bold text-[#942E3A] transition-all"
                  >
                    <span>{gov}</span>
                    <span className="text-[9px] opacity-80">({formatPrice(GOVERNORATE_FEES[gov])})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Shipping Steps Horizontal - 3 Columns Side-by-Side on mobile! */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-4">
          {activeShippingSteps.map((step, idx) => (
            <div key={step.title} className="bg-white border border-[#942E3A]/25 rounded-xl sm:rounded-2xl p-2 sm:p-4 space-y-0.5 sm:space-y-1 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-[#FFF9EB] text-[#942E3A] flex items-center justify-center font-bold text-[9px] sm:text-xs">
                  <step.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <span className="text-[8px] sm:text-[10px] font-bold text-[#D8B46A]">0{idx + 1}</span>
              </div>
              <h3 className="text-[10px] sm:text-sm font-bold font-playfair text-[#942E3A] truncate">{step.title}</h3>
              <p className="text-[9px] sm:text-xs text-[#6B1F2A] font-light leading-snug line-clamp-2">{step.text}</p>
            </div>
          ))}
        </div>

        {/* Detailed Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-8">
          
          <div className="md:col-span-5 bg-[#942E3A] rounded-xl sm:rounded-3xl p-3 sm:p-8 text-[#FFF9EB] space-y-2.5 sm:space-y-4 shadow-md flex flex-col justify-between">
            <div className="space-y-1 sm:space-y-3">
              <MapPin className="w-4 h-4 sm:w-6 sm:h-6 text-[#D8B46A]" />
              <h2 className="text-sm sm:text-xl font-extrabold font-playfair">{copy.shippingNotes}</h2>
              <p className="text-[10px] sm:text-xs font-light leading-relaxed text-[#FFF9EB]/85">
                {copy.shippingText}
              </p>
            </div>

            <Link
              href="/track"
              className="inline-flex items-center justify-center gap-1 rounded-full bg-[#FFF9EB] px-3.5 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold text-[#942E3A] hover:bg-white transition-colors w-fit"
            >
              <span>{copy.trackOrder}</span>
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </Link>
          </div>

          <div className="md:col-span-7 bg-white border border-[#942E3A]/30 rounded-xl sm:rounded-3xl p-3 sm:p-8 space-y-1.5 sm:space-y-4 shadow-xs">
            <h2 className="text-sm sm:text-xl font-extrabold font-playfair text-[#942E3A]">{copy.termsTitle}</h2>
            <ul className="space-y-1 sm:space-y-2.5 text-[10px] sm:text-xs text-[#6B1F2A] font-light leading-relaxed">
              {activeTerms.map((term, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="mt-1 w-1.5 h-1.5 shrink-0 rounded-full bg-[#D8B46A]" />
                  <span>{term}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
