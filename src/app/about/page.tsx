"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Heart,
  Award,
  Send,
  Phone,
  Mail,
  MapPin,
  Clock,
  Instagram,
  Facebook,
  CheckCircle2,
  HelpCircle,
  Headphones,
  MessageCircle,
  ExternalLink,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useSiteSettings } from "@/providers/SiteSettingsProvider";
import { submitContactMessageAction } from "@/app/actions";
import { useStoreI18n } from "@/providers/StoreI18nContext";

export default function AboutAndContactPage() {
  const settings = useSiteSettings();
  const { t, dir } = useStoreI18n();
  const isArabic = dir === "rtl";
  const [activeTab, setActiveTab] = useState<"about" | "contact">("about");

  const copy = isArabic
    ? {
        curatedElegance: "أناقة مختارة بعناية",
        curatedIntro: "في DeRoma، نؤمن أن الأناقة لا يجب أن تأتي على حساب الراحة. نختار كل حذاء بعناية ليجمع بين الذوق الراقي والراحة اليومية للمرأة العصرية.",
        aboutTitle: "اختيارات أنيقة بعناية",
        aboutParagraph1: "نختار منتجاتنا من موردين موثوقين بعناية، ونركز على الجودة والراحة والتصميم العملي.",
        aboutParagraph2: "هدفنا أن نقدم تجربة تسوق سهلة وتشكيلة تناسب إطلالتك اليومية.",
        promise: "وعدنا لكِ",
        selectedWithCare: "اختيارات بعناية",
        premiumMaterials: "خامات مميزة",
        premiumMaterialsDesc: "نختار خامات مستوردة مريحة وجيدة التهوية للاستخدام اليومي.",
        ergonomicComfort: "راحة عملية",
        ergonomicComfortDesc: "تصميمات مريحة تساعدك على الحركة بسهولة طوال اليوم.",
        comfortSelection: "تشكيلة تركز على الراحة",
        comfortSelectionDesc: "اختيارات متنوعة تناسب أشكال وأذواق السيدات المختلفة.",
        futureComfort: "خطوتك نحو راحة أكبر",
        futureComfortDesc: "اكتشفي تشكيلتنا المختارة من الأحذية الرياضية المميزة واختاري زوجك المفضل اليوم.",
        exploreCollection: "استكشفي التشكيلة",
        phoneSupport: "الدعم عبر الهاتف",
        whatsappDirect: "واتساب مباشر",
        emailInquiry: "استفسارات البريد الإلكتروني",
        onlineHours: "مواعيد المتجر أونلاين",
        directMessage: "رسالة مباشرة",
        sendMessageTitle: "أرسلي لنا رسالة",
        sendMessageDesc: "اكتبي بياناتك وسيرد عليك فريقنا في أقرب وقت.",
        messageSent: "تم إرسال الرسالة بنجاح!",
        messageSentDesc: "شكرًا لتواصلك مع DeRoma. استلمنا استفسارك وسنرد عليك عبر واتساب أو الهاتف.",
        sendAnother: "إرسال رسالة أخرى",
        yourName: "الاسم *",
        phoneNumber: "رقم الهاتف *",
        yourMessage: "رسالتك *",
        messagePlaceholder: "كيف يمكننا مساعدتك اليوم؟",
        sending: "جاري إرسال الرسالة...",
        send: "إرسال الرسالة",
        storeHub: "مقر متجر DeRoma أونلاين",
        dispatchCenter: "مركز تجهيز وشحن الطلبات في Samanoud",
        socialChannels: "قنوات التواصل الرسمية",
        socialDesc: "تابعي آخر التحديثات والمنتجات الجديدة معنا.",
        helpCenter: "مركز المساعدة",
        faqTitle: "الأسئلة الشائعة",
      }
    : {
        curatedElegance: "Curated Elegance in Motion",
        curatedIntro: "At DeRoma, we believe that style should never demand the sacrifice of comfort. Every sneaker is selected for refined style and everyday comfort for the modern woman.",
        aboutTitle: settings.aboutTitle,
        aboutParagraph1: settings.aboutParagraph1,
        aboutParagraph2: settings.aboutParagraph2,
        promise: "Our Promise",
        selectedWithCare: "Selected With Care",
        premiumMaterials: "Premium Materials",
        premiumMaterialsDesc: "We source only the finest imported leathers and breathable mesh.",
        ergonomicComfort: "Ergonomic Comfort",
        ergonomicComfortDesc: "Features specialized arch supports and memory foam footbeds.",
        comfortSelection: "Comfort-Focused Selection",
        comfortSelectionDesc: "Selected to complement a range of women's foot shapes.",
        futureComfort: "Step Into the Future of Comfort",
        futureComfortDesc: "Explore our curated line of premium sports and performance sneakers and find your perfect pair today.",
        exploreCollection: "Explore Collection",
        phoneSupport: "Phone Support",
        whatsappDirect: "WhatsApp Direct",
        emailInquiry: "Email Inquiry",
        onlineHours: "Online Store Hours",
        directMessage: "Direct Message",
        sendMessageTitle: "Send Us a Message",
        sendMessageDesc: "Fill in your details and our team will get back to you promptly.",
        messageSent: "Message Sent Successfully!",
        messageSentDesc: "Thank you for contacting DeRoma. We have received your inquiry and will reply via WhatsApp or Phone.",
        sendAnother: "Send Another Message",
        yourName: "Your Name *",
        phoneNumber: "Phone Number *",
        yourMessage: "Your Message *",
        messagePlaceholder: "How can we assist you today?",
        sending: "Sending Message...",
        send: "Send Message",
        storeHub: "DeRoma Online Store Hub",
        dispatchCenter: "Samanoud Dispatch & Fulfilment Center",
        socialChannels: "Official Social Channels",
        socialDesc: "Connect with us for instant updates & new drops!",
        helpCenter: "Help Center",
        faqTitle: "Frequently Asked Questions",
      };

  const whatsappUrl = settings.whatsapp
    ? settings.whatsapp.startsWith("http")
      ? settings.whatsapp
      : `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}`
    : "https://wa.me/201023456789";

  const telUrl = settings.phone
    ? `tel:${settings.phone.replace(/[^0-9+]/g, "")}`
    : "tel:+201023456789";

  const mailUrl = settings.email
    ? `mailto:${settings.email}`
    : "mailto:support@deroma.store";

  // Read URL query param if tab=about or tab=contact is passed
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "about") {
        setActiveTab("about");
      } else if (tabParam === "contact") {
        setActiveTab("contact");
      }
    }
  }, []);

  // Contact Form State
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  // FAQ Open State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactMessage.trim() || !contactPhone.trim()) return;

    setIsSending(true);
    setFormError("");

    try {
      const res = await submitContactMessageAction({
        name: contactName,
        phone: contactPhone,
        message: contactMessage,
      });

      setIsSending(false);
      if (res.success) {
        setSentSuccess(true);
        setContactMessage("");
      } else {
        setFormError(res.error || (isArabic ? "تعذر إرسال الرسالة." : "Could not send message."));
      }
    } catch (err) {
      setIsSending(false);
      setFormError(isArabic ? "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى." : "An unexpected error occurred. Please try again.");
    }
  };

  const faqs = isArabic ? [
    {
      question: "كم يستغرق الشحن داخل مصر؟",
      answer: "نوفر شحنًا سريعًا لجميع المحافظات المصرية. تصل الطلبات إلى القاهرة والجيزة خلال 24–48 ساعة، بينما تستغرق باقي المحافظات من 2–4 أيام عمل.",
    },
    {
      question: "هل يمكنني فحص أو تجربة الحذاء قبل الدفع؟",
      answer: "نعم، جميع طلبات الدفع عند الاستلام تتيح فحص المنتج عند باب المنزل قبل الدفع.",
    },
    {
      question: "ما سياسة الاسترجاع والاستبدال في DeRoma؟",
      answer: "نوفر سياسة استرجاع واستبدال سهلة خلال 14 يومًا، بشرط أن يكون المنتج بحالته الأصلية وغير مستخدم ومعه التاج والتغليف الأصلي.",
    },
    {
      question: "هل مقاسات أحذية DeRoma أوروبية؟",
      answer: "نعم، جميع المقاسات تعتمد نظام المقاسات الأوروبي للسيدات من EU 36 إلى 41. إذا كنتِ بين مقاسين، ننصح باختيار مقاسك المعتاد.",
    },
  ] : [
    {
      question: "How long does shipping take across Egypt?",
      answer: "We offer express shipping across all Egyptian governorates! Deliveries to Cairo and Giza take 24–48 hours, while other governorates take 2–4 business days.",
    },
    {
      question: "Can I inspect or try on the shoes before paying?",
      answer: "Yes! All Cash on Delivery (COD) orders support package inspection at your doorstep prior to payment for 100% peace of mind.",
    },
    {
      question: "What is DeRoma's return and exchange policy?",
      answer: "We offer a 14-day hassle-free return and exchange policy. Items must be in original unworn condition with tags and original packaging.",
    },
    {
      question: "Are DeRoma sneakers true to European sizing?",
      answer: "Yes, all our shoe sizes adhere strictly to standard European women's sizing (EU 36 to 41). If you are between sizes, we recommend selecting your regular size.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFF9EB] text-[#942E3A] font-outfit py-4 sm:py-10 px-2.5 sm:px-6 lg:px-8" dir={dir}>
      <div className="max-w-[1050px] mx-auto space-y-4 sm:space-y-10">
        
        {/* Main Title & Tabs Switcher */}
        <section className="text-center space-y-2 sm:space-y-6">
          <div className="space-y-0.5 sm:space-y-1">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.25em] text-[#942E3A]">
              DeRoma
            </span>
            <h1 className="text-xl sm:text-5xl font-black font-playfair tracking-tight text-[#942E3A]">
              {t("nav.about")}
            </h1>
          </div>

          {/* Styled Pill Tabs Switcher */}
          <div className="inline-flex items-center gap-1 bg-[#FFF9EB]/80 p-1 rounded-full border border-[#942E3A]/30 shadow-xs">
            <button
              onClick={() => setActiveTab("about")}
              className={`flex items-center gap-1.5 px-3.5 sm:px-6 py-1.5 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-bold transition-all ${
                activeTab === "about"
                  ? "bg-[#942E3A] text-white shadow-md"
                  : "bg-transparent text-[#942E3A] hover:text-[#942E3A]/80"
              }`}
            >
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{t("nav.about")}</span>
            </button>

            <button
              onClick={() => setActiveTab("contact")}
              className={`flex items-center gap-1.5 px-3.5 sm:px-6 py-1.5 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-bold transition-all ${
                activeTab === "contact"
                  ? "bg-[#942E3A] text-white shadow-md"
                  : "bg-transparent text-[#942E3A] hover:text-[#942E3A]/80"
              }`}
            >
              <Headphones className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{t("footer.contactUs")}</span>
            </button>
          </div>
        </section>

        {/* Tab Content Display */}
        <AnimatePresence mode="wait">
          {activeTab === "about" ? (
            <motion.div
              key="about-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-5 sm:space-y-16"
            >
              {/* Hero Heritage Banner */}
              <section className="text-center space-y-1.5 sm:space-y-4 max-w-2xl mx-auto">
                <h2 className="text-lg sm:text-3xl font-extrabold font-playfair text-[#942E3A]">
                  {copy.curatedElegance}
                </h2>
                <p className="text-[11px] sm:text-sm text-[#6B1F2A] font-light leading-relaxed">
                  {copy.curatedIntro}
                </p>
              </section>

              {/* Story Section */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 items-center bg-[#FFF9EB]/20 border border-[#942E3A]/30 rounded-2xl sm:rounded-3xl p-3.5 sm:p-10 shadow-xs">
                <div className="space-y-2 sm:space-y-4">
                  <h3 className="text-lg sm:text-3xl font-extrabold font-playfair text-[#942E3A]">{copy.aboutTitle}</h3>
                  <p className="text-[11px] sm:text-sm text-[#6B1F2A] font-light leading-relaxed">
                    {copy.aboutParagraph1}
                  </p>
                  {copy.aboutParagraph2 && (
                    <p className="text-[11px] sm:text-sm text-[#6B1F2A] font-light leading-relaxed">
                      {copy.aboutParagraph2}
                    </p>
                  )}
                </div>
                <div className="relative h-36 sm:h-80 rounded-xl sm:rounded-2xl overflow-hidden border border-[#942E3A]/30 shadow-sm">
                  <Image
                    src={settings.aboutImage || "/products/deroma-new-balance-9060-pastel-pink.png"}
                    alt={copy.aboutTitle}
                    fill
                    className="object-cover"
                  />
                </div>
              </section>

              {/* Core Values - 3 Columns Side-by-Side even on mobile! */}
              <section className="space-y-3 sm:space-y-8">
                <div className="text-center space-y-0.5">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.25em] text-[#942E3A]">{copy.promise}</span>
                  <h3 className="text-lg sm:text-2xl font-extrabold font-playfair text-[#942E3A]">{copy.selectedWithCare}</h3>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-6">
                  <div className="bg-white border border-[#942E3A]/30 rounded-xl sm:rounded-2xl p-2.5 sm:p-6 text-center space-y-1 sm:space-y-3 shadow-xs">
                    <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-[#FFF9EB] text-[#942E3A] flex items-center justify-center mx-auto">
                      <ShieldCheck className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                    </div>
                    <h4 className="text-[10px] sm:text-base font-bold text-[#942E3A]">{copy.premiumMaterials}</h4>
                    <p className="text-[9px] sm:text-xs text-[#6B1F2A] font-light leading-relaxed hidden sm:block">
                      {copy.premiumMaterialsDesc}
                    </p>
                  </div>

                  <div className="bg-white border border-[#942E3A]/30 rounded-xl sm:rounded-2xl p-2.5 sm:p-6 text-center space-y-1 sm:space-y-3 shadow-xs">
                    <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-[#FFF9EB] text-[#942E3A] flex items-center justify-center mx-auto">
                      <Heart className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                    </div>
                    <h4 className="text-[10px] sm:text-base font-bold text-[#942E3A]">{copy.ergonomicComfort}</h4>
                    <p className="text-[9px] sm:text-xs text-[#6B1F2A] font-light leading-relaxed hidden sm:block">
                      {copy.ergonomicComfortDesc}
                    </p>
                  </div>

                  <div className="bg-white border border-[#942E3A]/30 rounded-xl sm:rounded-2xl p-2.5 sm:p-6 text-center space-y-1 sm:space-y-3 shadow-xs">
                    <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-[#FFF9EB] text-[#942E3A] flex items-center justify-center mx-auto">
                      <Award className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                    </div>
                    <h4 className="text-[10px] sm:text-base font-bold text-[#942E3A]">{copy.comfortSelection}</h4>
                    <p className="text-[9px] sm:text-xs text-[#6B1F2A] font-light leading-relaxed hidden sm:block">
                      {copy.comfortSelectionDesc}
                    </p>
                  </div>
                </div>
              </section>

              {/* Call to Action Banner */}
              <section className="text-center bg-[#942E3A] rounded-2xl sm:rounded-3xl p-4 sm:p-12 text-[#FFF9EB] space-y-2 sm:space-y-4 shadow-lg border border-white/10">
                <h3 className="text-lg sm:text-3xl font-extrabold font-playfair">{copy.futureComfort}</h3>
                <p className="text-[11px] sm:text-sm max-w-xl mx-auto font-light leading-relaxed text-stone-100">
                  {copy.futureComfortDesc}
                </p>
                <div className="pt-1">
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF9EB] text-[#942E3A] hover:bg-white px-4 sm:px-6 py-2 sm:py-3 text-[11px] sm:text-xs font-bold transition-all shadow-md"
                  >
                    <span>{copy.exploreCollection}</span>
                    <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Link>
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="contact-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 sm:space-y-12"
            >
              {/* Quick Info Cards Row - 2 columns side by side on mobile */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                <a
                  href={telUrl}
                  className="bg-white border border-[#942E3A]/30 rounded-xl sm:rounded-2xl p-2.5 sm:p-5 text-center space-y-0.5 sm:space-y-2 shadow-xs hover:border-[#942E3A] transition-all group"
                >
                  <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-[#FFF9EB] text-[#942E3A] flex items-center justify-center mx-auto group-hover:bg-[#942E3A] group-hover:text-white transition-colors">
                    <Phone className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                  </div>
                  <h4 className="text-[9px] sm:text-xs font-bold text-[#942E3A] uppercase tracking-wider">{copy.phoneSupport}</h4>
                  <p className="text-[9px] sm:text-xs font-semibold text-[#6B1F2A] truncate">{settings.phone}</p>
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border border-[#942E3A]/30 rounded-xl sm:rounded-2xl p-2.5 sm:p-5 text-center space-y-0.5 sm:space-y-2 shadow-xs hover:border-emerald-600 transition-all group"
                >
                  <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <MessageCircle className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                  </div>
                  <h4 className="text-[9px] sm:text-xs font-bold text-[#942E3A] uppercase tracking-wider">{copy.whatsappDirect}</h4>
                  <p className="text-[9px] sm:text-xs font-semibold text-emerald-700 flex items-center justify-center gap-0.5 truncate">
                    <span>WhatsApp</span>
                    <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                  </p>
                </a>

                <a
                  href={mailUrl}
                  className="bg-white border border-[#942E3A]/30 rounded-xl sm:rounded-2xl p-2.5 sm:p-5 text-center space-y-0.5 sm:space-y-2 shadow-xs hover:border-[#942E3A] transition-all group"
                >
                  <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-[#FFF9EB] text-[#942E3A] flex items-center justify-center mx-auto group-hover:bg-[#942E3A] group-hover:text-white transition-colors">
                    <Mail className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                  </div>
                  <h4 className="text-[9px] sm:text-xs font-bold text-[#942E3A] uppercase tracking-wider">{copy.emailInquiry}</h4>
                  <p className="text-[9px] sm:text-xs font-semibold text-[#6B1F2A] truncate">{settings.email}</p>
                </a>

                <div className="bg-white border border-[#942E3A]/30 rounded-xl sm:rounded-2xl p-2.5 sm:p-5 text-center space-y-0.5 sm:space-y-2 shadow-xs">
                  <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-[#FFF9EB] text-[#942E3A] flex items-center justify-center mx-auto">
                    <Clock className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                  </div>
                  <h4 className="text-[9px] sm:text-xs font-bold text-[#942E3A] uppercase tracking-wider">{copy.onlineHours}</h4>
                  <p className="text-[9px] sm:text-xs font-semibold text-[#6B1F2A] truncate">{settings.hours}</p>
                </div>
              </div>

              {/* Main Contact Grid: Contact Form & Store/Social Details */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8">
                
                {/* Left (7 cols): Contact Form */}
                <div className="lg:col-span-7 bg-white border border-[#942E3A]/30 rounded-2xl sm:rounded-3xl p-3.5 sm:p-8 shadow-xs space-y-3 sm:space-y-6">
                  <div className="space-y-0.5">
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#942E3A]">{copy.directMessage}</span>
                    <h3 className="text-lg sm:text-2xl font-bold font-playfair text-[#942E3A]">{copy.sendMessageTitle}</h3>
                    <p className="text-[10px] sm:text-xs text-stone-500">{copy.sendMessageDesc}</p>
                  </div>

                  {sentSuccess ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 sm:p-6 text-center space-y-2 sm:space-y-3">
                      <CheckCircle2 className="w-7 h-7 sm:w-10 sm:h-10 text-emerald-600 mx-auto" />
                      <h4 className="text-xs sm:text-base font-bold text-emerald-900">{copy.messageSent}</h4>
                      <p className="text-[11px] text-emerald-700 max-w-sm mx-auto">
                        {copy.messageSentDesc}
                      </p>
                      <button
                        onClick={() => setSentSuccess(false)}
                        className="px-4 py-1.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 transition-colors"
                      >
                        {copy.sendAnother}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSendMessage} className="space-y-2.5 sm:space-y-4 text-xs">
                      {formError && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
                          {formError}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2 sm:gap-4">
                        <div className="space-y-0.5">
                          <label className="font-bold text-[#942E3A] text-[10px] sm:text-xs">{copy.yourName}</label>
                          <input
                            type="text"
                            required
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder="e.g. Farida Ahmed"
                            className="w-full px-2.5 py-1.5 sm:px-3.5 sm:py-2.5 rounded-lg sm:rounded-xl border border-[#942E3A]/30 bg-[#FFF9EB]/40 text-[#942E3A] text-[11px] sm:text-xs focus:outline-none focus:ring-1 focus:ring-[#942E3A]"
                          />
                        </div>

                        <div className="space-y-0.5">
                          <label className="font-bold text-[#942E3A] text-[10px] sm:text-xs">{copy.phoneNumber}</label>
                          <input
                            type="text"
                            required
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            placeholder="01012345678"
                            className="w-full px-2.5 py-1.5 sm:px-3.5 sm:py-2.5 rounded-lg sm:rounded-xl border border-[#942E3A]/30 bg-[#FFF9EB]/40 text-[#942E3A] text-[11px] sm:text-xs focus:outline-none focus:ring-1 focus:ring-[#942E3A]"
                          />
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <label className="font-bold text-[#942E3A] text-[10px] sm:text-xs">{copy.yourMessage}</label>
                        <textarea
                          rows={2.5}
                          required
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          placeholder={copy.messagePlaceholder}
                          className="w-full px-2.5 py-1.5 sm:px-3.5 sm:py-2.5 rounded-lg sm:rounded-xl border border-[#942E3A]/30 bg-[#FFF9EB]/40 text-[#942E3A] text-[11px] sm:text-xs focus:outline-none focus:ring-1 focus:ring-[#942E3A]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSending}
                        className="w-full flex items-center justify-center gap-1.5 py-2 sm:py-3 rounded-full bg-[#942E3A] text-white text-[11px] sm:text-xs font-bold shadow-md hover:bg-[#7a2430] transition-all disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>{isSending ? copy.sending : copy.send}</span>
                      </button>
                    </form>
                  )}
                </div>

                {/* Right (5 cols): Store Location & Social Channels */}
                <div className="lg:col-span-5 space-y-3 sm:space-y-6">
                  
                  {/* Online Store Hub Location Card */}
                  <div className="bg-white border border-[#942E3A]/30 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-xs space-y-1.5 sm:space-y-4">
                    <h4 className="text-xs sm:text-base font-bold font-playfair text-[#942E3A] flex items-center gap-1.5 border-b border-[#942E3A]/15 pb-1.5 sm:pb-3">
                      <MapPin className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#942E3A]" />
                      <span>{copy.storeHub}</span>
                    </h4>
                    
                    <div className="space-y-0.5 sm:space-y-1 text-xs text-[#6B1F2A]">
                      <p className="font-bold text-[11px] sm:text-sm text-[#942E3A]">{copy.dispatchCenter}</p>
                      <p className="font-light leading-relaxed text-[10px] sm:text-xs">{settings.address}</p>
                    </div>
                  </div>

                  {/* Social Accounts Grid */}
                  <div className="bg-white border border-[#942E3A]/30 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-xs space-y-2 sm:space-y-4">
                    <h4 className="text-xs sm:text-base font-bold font-playfair text-[#942E3A] border-b border-[#942E3A]/15 pb-1.5 sm:pb-3">
                      {copy.socialChannels}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-stone-500">{copy.socialDesc}</p>

                    <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-0.5">
                      {settings.instagram && (
                        <a
                          href={settings.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 p-2 sm:p-3 rounded-xl border border-[#942E3A]/20 bg-[#FFF9EB]/40 hover:border-[#942E3A] text-[10px] sm:text-xs font-bold text-[#942E3A] transition-all"
                        >
                          <Instagram className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-pink-600 shrink-0" />
                          <span>Instagram</span>
                        </a>
                      )}

                      {settings.facebook && (
                        <a
                          href={settings.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2.5 sm:p-3 rounded-xl border border-[#942E3A]/20 bg-[#FFF9EB]/40 hover:border-[#942E3A] text-[10px] sm:text-xs font-bold text-[#942E3A] transition-all"
                        >
                          <Facebook className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-blue-600 shrink-0" />
                          <span>Facebook</span>
                        </a>
                      )}

                      {settings.whatsapp && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 p-2 sm:p-3 rounded-xl border border-[#942E3A]/20 bg-[#FFF9EB]/40 hover:border-emerald-600 text-[10px] sm:text-xs font-bold text-[#942E3A] transition-all"
                        >
                          <MessageCircle className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-emerald-600 shrink-0" />
                          <span>WhatsApp</span>
                        </a>
                      )}

                      {settings.tiktok && (
                        <a
                          href={settings.tiktok}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 p-2 sm:p-3 rounded-xl border border-[#942E3A]/20 bg-[#FFF9EB]/40 hover:border-[#942E3A] text-[10px] sm:text-xs font-bold text-[#942E3A] transition-all"
                        >
                          <svg className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-stone-900 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                          </svg>
                          <span>TikTok</span>
                        </a>
                      )}
                    </div>
                  </div>

                </div>

              </div>


              {/* FAQ Accordion */}
              <section className="bg-white border border-[#942E3A]/30 rounded-2xl sm:rounded-3xl p-3.5 sm:p-8 shadow-xs space-y-3 sm:space-y-6">
                <div className="space-y-0.5">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#942E3A]">{copy.helpCenter}</span>
                  <h3 className="text-base sm:text-xl font-bold font-playfair text-[#942E3A] flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#942E3A]" />
                    <span>{copy.faqTitle}</span>
                  </h3>
                </div>

                <div className="space-y-1.5 sm:space-y-3">
                  {faqs.map((faq, index) => {
                    const isOpen = openFaqIndex === index;
                    return (
                      <div
                        key={index}
                        className="border border-[#942E3A]/20 rounded-xl sm:rounded-2xl overflow-hidden transition-colors"
                      >
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                          className="w-full p-2.5 sm:p-4 text-left flex items-center justify-between text-[10px] sm:text-xs font-bold text-[#942E3A] bg-[#FFF9EB]/30 hover:bg-[#FFF9EB] transition-colors"
                        >
                          <span>{faq.question}</span>
                          <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#942E3A] shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden bg-white px-2.5 sm:px-4 pb-2.5 sm:pb-4 pt-0.5"
                            >
                              <p className="text-[10px] sm:text-xs text-[#6B1F2A] font-light leading-relaxed border-t border-[#942E3A]/10 pt-2 sm:pt-3">
                                {faq.answer}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </section>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
