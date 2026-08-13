"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, PackageSearch, RotateCcw, ShieldAlert, XCircle, ChevronRight } from "lucide-react";
import { useStoreI18n } from "@/providers/StoreI18nContext";

const acceptedCases = [
  "Wrong size, color, or wrong item.",
  "Product defect reported early.",
  "Unworn condition with tags & box.",
];

const arabicAcceptedCases = [
  "مقاس أو لون غير مناسب أو منتج مختلف.",
  "وجود عيب في المنتج والإبلاغ عنه مبكرًا.",
  "أن يكون المنتج غير مستخدم ومعه التاج والعلبة.",
];

const declinedCases = [
  "Shoes worn outdoors, stained, or damaged.",
  "Requests after 14 days from delivery.",
  "Improper care or intentional force.",
];

const arabicDeclinedCases = [
  "ارتداء الحذاء خارج المنزل أو اتساخه أو تلفه.",
  "تقديم الطلب بعد مرور 14 يومًا من الاستلام.",
  "العناية غير الصحيحة أو استخدام القوة المتعمدة.",
];

const processSteps = [
  "Send order # & photos to support.",
  "Eligibility confirmed in hours.",
  "Doorstep exchange arranged.",
];

const arabicProcessSteps = [
  "إرسال رقم الطلب والصور إلى الدعم.",
  "تأكيد أهلية الطلب خلال ساعات.",
  "تنسيق الاستبدال عند باب المنزل.",
];

export default function RefundPolicyPage() {
  const { t, dir, lang } = useStoreI18n();
  const isArabic = lang === "ar";
  const activeAcceptedCases = isArabic ? arabicAcceptedCases : acceptedCases;
  const activeDeclinedCases = isArabic ? arabicDeclinedCases : declinedCases;
  const activeProcessSteps = isArabic ? arabicProcessSteps : processSteps;
  const copy = isArabic
    ? {
        eyebrow: "الضمان والمرتجعات",
        title: "سياسة الاسترجاع والاستبدال",
        subtitle: "استبدال سهل خلال 14 يومًا لراحة بالك.",
        returnWindow: "مدة الإرجاع",
        returnDays: "14 يومًا",
        condition: "حالة المنتج",
        unworn: "غير مستخدم",
        inspection: "الفحص",
        doorstep: "عند باب المنزل",
        eligible: "مؤهل للاستبدال",
        notEligible: "غير مؤهل للاستبدال",
        stepsTitle: "3 خطوات بسيطة للاستبدال",
        stepsText: "يتم تنسيق الاستبدال عند باب المنزل بعد التحقق من الطلب.",
        contact: "تواصل مع الدعم",
      }
    : {
        eyebrow: "Guarantee & Returns",
        title: "Refund & Exchange Policy",
        subtitle: "14-day hassle-free exchanges for total peace of mind.",
        returnWindow: "Return Window",
        returnDays: "14 Days",
        condition: "Condition",
        unworn: "Unworn",
        inspection: "Inspection",
        doorstep: "Doorstep",
        eligible: "Eligible",
        notEligible: "Not Eligible",
        stepsTitle: "3 Simple Steps to Exchange",
        stepsText: "Doorstep courier exchange arranged upon verification.",
        contact: "Contact Support",
      };

  return (
    <div className="min-h-screen bg-[#FFF9EB] text-[#942E3A] font-outfit py-4 sm:py-10 px-2.5 sm:px-6 lg:px-8" dir={dir}>
      <div className="max-w-[900px] mx-auto space-y-4 sm:space-y-10">
        
        {/* Navigation & Header */}
        <div className="space-y-2 sm:space-y-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#942E3A] hover:opacity-80 transition-opacity">
            {dir === "rtl" ? <ArrowLeft className="w-3.5 h-3.5 rotate-180" /> : <ArrowLeft className="w-3.5 h-3.5" />}
            <span>{t("nav.home")}</span>
          </Link>

          <div className="space-y-0.5 sm:space-y-1">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#942E3A]">
              {copy.eyebrow}
            </span>
            <h1 className="text-xl sm:text-4xl font-black font-playfair tracking-tight text-[#942E3A]">
              {copy.title}
            </h1>
            <p className="text-[10px] sm:text-xs text-stone-500 font-light">{copy.subtitle}</p>
          </div>
        </div>

        {/* Quick Highlights Grid - 3 columns side-by-side on mobile! */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-4">
          <div className="bg-white border border-[#942E3A]/25 rounded-xl sm:rounded-2xl p-2 sm:p-5 text-center space-y-0.5 shadow-xs">
            <RotateCcw className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#D8B46A] mx-auto" />
            <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-[#942E3A]/70">{copy.returnWindow}</span>
            <p className="text-xs sm:text-2xl font-black text-[#942E3A]">{copy.returnDays}</p>
          </div>

          <div className="bg-white border border-[#942E3A]/25 rounded-xl sm:rounded-2xl p-2 sm:p-5 text-center space-y-0.5 shadow-xs">
            <PackageSearch className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#D8B46A] mx-auto" />
            <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-[#942E3A]/70">{copy.condition}</span>
            <p className="text-xs sm:text-2xl font-black text-[#942E3A]">{copy.unworn}</p>
          </div>

          <div className="bg-white border border-[#942E3A]/25 rounded-xl sm:rounded-2xl p-2 sm:p-5 text-center space-y-0.5 shadow-xs">
            <ShieldAlert className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#D8B46A] mx-auto" />
            <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-[#942E3A]/70">{copy.inspection}</span>
            <p className="text-xs sm:text-2xl font-black text-[#942E3A]">{copy.doorstep}</p>
          </div>
        </div>

        {/* Accepted vs Declined Grid - 2 columns side-by-side on mobile! */}
        <div className="grid grid-cols-2 gap-2 sm:gap-6">
          <div className="bg-white border border-[#942E3A]/30 rounded-2xl p-3 sm:p-6 space-y-2 shadow-xs">
            <div className="flex items-center gap-1.5 border-b border-[#942E3A]/15 pb-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-emerald-600 shrink-0" />
              <h2 className="text-xs sm:text-lg font-bold font-playfair text-[#942E3A] truncate">{copy.eligible}</h2>
            </div>
            <ul className="space-y-1.5 text-[10px] sm:text-xs text-[#6B1F2A] font-light leading-relaxed">
              {activeAcceptedCases.map((item, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="mt-1 w-1.5 h-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-[#942E3A]/30 rounded-2xl p-3 sm:p-6 space-y-2 shadow-xs">
            <div className="flex items-center gap-1.5 border-b border-[#942E3A]/15 pb-1.5">
              <XCircle className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-rose-600 shrink-0" />
              <h2 className="text-xs sm:text-lg font-bold font-playfair text-[#942E3A] truncate">{copy.notEligible}</h2>
            </div>
            <ul className="space-y-1.5 text-[10px] sm:text-xs text-[#6B1F2A] font-light leading-relaxed">
              {activeDeclinedCases.map((item, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="mt-1 w-1.5 h-1.5 shrink-0 rounded-full bg-[#D8B46A]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Process Steps */}
        <div className="bg-[#942E3A] rounded-2xl sm:rounded-3xl p-3.5 sm:p-8 text-[#FFF9EB] space-y-3 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-2xl font-extrabold font-playfair">{copy.stepsTitle}</h2>
              <p className="text-[10px] sm:text-xs font-light text-[#FFF9EB]/80 mt-0.5">{copy.stepsText}</p>
            </div>
            <Link
              href="/about?tab=contact"
              className="inline-flex items-center gap-1 rounded-full bg-[#FFF9EB] px-3.5 py-1.5 sm:px-5 sm:py-2.5 text-[10px] sm:text-xs font-bold text-[#942E3A] hover:bg-white transition-colors shrink-0 w-fit"
            >
              <span>{copy.contact}</span>
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-1.5 sm:gap-3 pt-1">
            {activeProcessSteps.map((step, idx) => (
              <div key={idx} className="bg-white/10 border border-[#D8B46A]/20 rounded-xl p-2 sm:p-3 text-[9px] sm:text-xs font-light leading-snug flex flex-col sm:flex-row gap-1 sm:gap-2 items-start sm:items-center">
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#D8B46A] text-[#942E3A] font-black text-[9px] sm:text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
