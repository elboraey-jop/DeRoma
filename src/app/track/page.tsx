import { COLOR_TRANSLATIONS } from "@/components/ProductCard";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock,
  MapPin,
  Phone,
  Receipt,
  Search,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ q?: string; order?: string }>;
}

const GOV_AR_TO_EN: Record<string, string> = {
  "القاهرة": "Cairo",
  "الجيزة": "Giza",
  "الإسكندرية": "Alexandria",
  "القليوبية": "Qalyubia",
  "الشرقية": "Sharqia",
  "الدقهلية": "Dakahlia",
  "المنوفية": "Monufia",
  "الغربية": "Gharbia",
  "كفر الشيخ": "Kafr El Sheikh",
  "دمياط": "Damietta",
  "بورسعيد": "Port Said",
  "الإسماعيلية": "Ismailia",
  "السويس": "Suez",
  "الفيوم": "Fayoum",
  "بني سويف": "Beni Suef",
  "المنيا": "Minya",
  "أسيوط": "Asyut",
  "سوهاج": "Sohag",
  "قنا": "Qena",
  "الأقصر": "Luxor",
  "أسوان": "Aswan",
  "البحر الأحمر": "Red Sea",
  "الوادي الجديد": "New Valley",
  "مطروح": "Matrouh",
  "شمال سيناء": "North Sinai",
  "جنوب سيناء": "South Sinai",
};

function getGovernorateName(value: string) {
  let repaired = value;

  // Older orders may contain Arabic that was decoded as Latin-1 more than once.
  // Repair those values at render time while new orders use normal UTF-8.
  for (let attempt = 0; attempt < 2 && /[ÃÂØÙ]/.test(repaired); attempt += 1) {
    const decoded = Buffer.from(repaired, "latin1").toString("utf8");
    if (decoded === repaired || decoded.includes("�")) break;
    repaired = decoded;
  }

  return GOV_AR_TO_EN[repaired] || repaired;
}

type LocalizedText = { en: string; ar: string };

function Localized({ en, ar }: LocalizedText) {
  return (
    <>
      <span className="inline ltr:inline rtl:hidden">{en}</span>
      <span className="hidden rtl:inline ltr:hidden">{ar}</span>
    </>
  );
}

const statusLabels: Record<string, LocalizedText> = {
  pending: { en: "Order Confirmed", ar: "تم تأكيد الطلب" },
  shipped: { en: "With Courier", ar: "مع مندوب الشحن" },
  delivered: { en: "Delivered", ar: "تم التوصيل" },
  cancelled: { en: "Cancelled", ar: "تم إلغاء الطلب" },
};

const statusStyles: Record<string, string> = {
  pending: "border-[#D8B46A]/45 bg-[#FFF9EB] text-[#942E3A]",
  shipped: "border-blue-200 bg-blue-50 text-blue-800",
  delivered: "border-emerald-200 bg-emerald-50 text-emerald-800",
  cancelled: "border-red-200 bg-red-50 text-red-800",
};

const timelineSteps = [
  {
    key: "pending",
    title: { en: "Registered", ar: "تم تسجيل الطلب" },
    text: { en: "Your order details were received and are being reviewed.", ar: "تم استلام بيانات طلبك وجارٍ مراجعتها." },
    icon: Receipt,
  },
  {
    key: "shipped",
    title: { en: "With Courier", ar: "مع مندوب الشحن" },
    text: { en: "The package is packed and moving toward your address.", ar: "تم تجهيز الطلب وهو في طريقه إلى عنوانك." },
    icon: Truck,
  },
  {
    key: "delivered",
    title: { en: "Delivered", ar: "تم التوصيل" },
    text: { en: "Your DeRoma pair has reached the doorstep.", ar: "وصل طلب DeRoma إلى باب منزلك." },
    icon: CheckCircle2,
  },
];

function getStepState(status: string, stepKey: string) {
  if (status === "cancelled") {
    return "cancelled";
  }

  const currentIndex = timelineSteps.findIndex((step) => step.key === status);
  const stepIndex = timelineSteps.findIndex((step) => step.key === stepKey);

  if (stepIndex <= Math.max(currentIndex, 0)) {
    return "complete";
  }

  return "upcoming";
}

export default async function TrackOrderPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = (params.q || params.order || "").trim();

  const order = query
    ? await prisma.order.findFirst({
        where: {
          OR: [
            { id: { equals: query } },
            { orderNumber: { equals: query, mode: "insensitive" } },
            { customerPhone: { equals: query } },
          ],
        },
        include: {
          items: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    : null;

  const hasError = Boolean(query && !order);

  return (
    <div className="min-h-screen bg-[#FFF9EB] px-3 py-5 text-[#942E3A] sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto max-w-[1120px] space-y-4 sm:space-y-8">
        <Link href="/" className="inline-flex items-center gap-1 text-xs font-bold text-[#942E3A] transition-colors hover:text-[#6B1F2A]">
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
          <Localized en="Back to Home" ar="العودة للرئيسية" />
        </Link>

        <section className="grid gap-4 lg:grid-cols-[1fr_420px] lg:items-stretch lg:gap-6">
          <div className="rounded-3xl border border-[#942E3A]/20 bg-[#942E3A] p-5 text-[#FFF9EB] shadow-lg sm:p-10">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]"><Localized en="Order Tracking" ar="تتبع الطلب" /></span>
            <h1 className="mt-2 font-playfair text-3xl font-black tracking-tight sm:mt-4 sm:text-5xl">
              <Localized en="Track Your Order" ar="تتبع طلبك" />
            </h1>
            <p className="mt-2 max-w-2xl text-xs font-light leading-relaxed text-[#FFF9EB]/85 sm:mt-4 sm:text-base">
              <Localized en="Follow your DeRoma order from confirmation to doorstep delivery using your order reference or phone number." ar="تابع طلب DeRoma من التأكيد وحتى التوصيل إلى باب المنزل باستخدام رقم الطلب أو رقم الهاتف." />
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-7 sm:gap-3">
              <div className="rounded-2xl border border-[#D8B46A]/25 bg-white/8 p-2.5 sm:p-4">
                <Clock className="mb-1 h-3.5 w-3.5 text-[#D8B46A] sm:mb-2 sm:h-4 sm:w-4" />
                <p className="text-[8px] font-bold uppercase tracking-wide text-[#FFF9EB]/70 sm:text-[10px] sm:tracking-wider"><Localized en="Support Hours" ar="مواعيد الدعم" /></p>
                <p className="mt-1 text-[10px] font-bold sm:text-sm">9 AM - 10 PM</p>
              </div>
              <div className="rounded-2xl border border-[#D8B46A]/25 bg-white/8 p-2.5 sm:p-4">
                <Truck className="mb-1 h-3.5 w-3.5 text-[#D8B46A] sm:mb-2 sm:h-4 sm:w-4" />
                <p className="text-[8px] font-bold uppercase tracking-wide text-[#FFF9EB]/70 sm:text-[10px] sm:tracking-wider"><Localized en="Delivery" ar="التوصيل" /></p>
                <p className="mt-1 text-[10px] font-bold sm:text-sm"><Localized en="2-5 Days" ar="2-5 أيام" /></p>
              </div>
              <div className="rounded-2xl border border-[#D8B46A]/25 bg-white/8 p-2.5 sm:p-4">
                <MapPin className="mb-1 h-3.5 w-3.5 text-[#D8B46A] sm:mb-2 sm:h-4 sm:w-4" />
                <p className="text-[8px] font-bold uppercase tracking-wide text-[#FFF9EB]/70 sm:text-[10px] sm:tracking-wider"><Localized en="Coverage" ar="التغطية" /></p>
                <p className="mt-1 text-[10px] font-bold sm:text-sm">Egypt</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#942E3A]/25 bg-white p-4 shadow-xs sm:p-7">
            <div className="mb-5">
              <h2 className="font-playfair text-xl font-extrabold text-[#942E3A] sm:text-2xl"><Localized en="Find your package" ar="ابحث عن طلبك" /></h2>
              <p className="mt-1 text-xs leading-relaxed text-[#6B1F2A]/75">
                <Localized en="Use an order number like DR-1001 or the primary phone number used at checkout." ar="استخدم رقم طلب مثل DR-1001 أو رقم الهاتف الأساسي المستخدم عند إتمام الطلب." />
              </p>
            </div>
            <form action="/track" method="GET" className="space-y-2 sm:space-y-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D8B46A] rtl:left-auto rtl:right-4" />
                <input
                  type="text"
                  name="q"
                  defaultValue={query}
                  required
                  placeholder="رقم الطلب أو رقم الهاتف"
                  className="m-0 w-full rounded-2xl border border-[#942E3A]/20 bg-[#FFF9EB]/70 py-3 pl-11 pr-4 text-sm font-semibold text-[#942E3A] placeholder:text-[#942E3A]/45 outline-none transition-all focus:border-[#942E3A] focus:bg-white focus:ring-4 focus:ring-[#942E3A]/10 rtl:pl-4 rtl:pr-11 sm:py-4"
                />
              </div>
              <button
                type="submit"
                className="flex w-full items-center justify-center rounded-2xl bg-[#942E3A] px-6 py-3 text-sm font-bold text-[#FFF9EB] shadow-sm transition-all hover:bg-[#802832] active:scale-[0.99] sm:py-4"
              >
                <Localized en="Track Order" ar="تتبع الطلب" />
              </button>
            </form>
            <div className="mt-3 rounded-2xl border border-[#D8B46A]/25 bg-[#FFF9EB] p-3 text-xs leading-relaxed text-[#6B1F2A] sm:mt-5 sm:p-4">
              <Localized en="Tip: If you placed the order while signed in, you can also open it from your profile orders." ar="نصيحة: إذا أجريت الطلب أثناء تسجيل الدخول، يمكنك فتحه أيضًا من طلبات حسابك." />
            </div>
          </div>
        </section>

        {hasError && (
          <section className="flex items-start gap-3 rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="leading-relaxed"><Localized en="No order matched that reference or phone number. Please check the details and try again." ar="لم يتم العثور على طلب مطابق لرقم الطلب أو الهاتف. يرجى مراجعة البيانات والمحاولة مرة أخرى." /></p>
          </section>
        )}

        {!query && (
          <section className="grid grid-cols-3 gap-2 md:gap-4">
            {timelineSteps.map((step, index) => (
              <div key={step.key} className="rounded-2xl border border-[#942E3A]/25 bg-white p-3 shadow-xs sm:p-6">
                <div className="mb-2 flex items-center justify-between sm:mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF9EB] text-[#942E3A] sm:h-10 sm:w-10">
                    <step.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <span className="text-xs font-black text-[#D8B46A]">0{index + 1}</span>
                </div>
                <h2 className="font-playfair text-xs font-bold text-[#942E3A] sm:text-lg"><Localized {...step.title} /></h2>
                <p className="mt-1 text-[9px] font-light leading-snug text-[#6B1F2A] sm:mt-2 sm:text-xs sm:leading-relaxed"><Localized {...step.text} /></p>
              </div>
            ))}
          </section>
        )}

        {order && (
          <section className="space-y-4 sm:space-y-6">
            <div className="rounded-3xl border border-[#942E3A]/25 bg-white p-4 shadow-xs sm:p-8">
              <div className="flex items-center justify-between gap-3 border-b border-[#942E3A]/10 pb-4 sm:flex-row sm:gap-5 sm:pb-6">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#D8B46A] sm:text-[10px] sm:tracking-[0.25em]"><Localized en="Order Reference" ar="رقم الطلب" /></p>
                  <h2 className="mt-1 font-playfair text-2xl font-black text-[#942E3A] sm:mt-2 sm:text-3xl">{order.orderNumber}</h2>
                </div>
                <span className={`inline-flex w-fit shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-black sm:px-4 sm:py-2 sm:text-xs ${statusStyles[order.status] || statusStyles.pending}`}>
                  <Localized {...(statusLabels[order.status] || statusLabels.pending)} />
                </span>
              </div>

              {order.status === "cancelled" ? (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <p className="text-sm leading-relaxed">
                    <Localized en="This order was cancelled. Contact support if you need help placing a new order or checking availability." ar="تم إلغاء هذا الطلب. تواصل مع الدعم إذا كنت بحاجة إلى إنشاء طلب جديد أو الاستفسار عن التوافر." />
                  </p>
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-6 sm:gap-4">
                  {timelineSteps.map((step) => {
                    const state = getStepState(order.status, step.key);
                    const isComplete = state === "complete";
                    return (
                      <div
                        key={step.key}
                        className={`rounded-2xl border p-2.5 sm:p-5 ${
                          isComplete
                            ? "border-[#D8B46A]/50 bg-[#FFF9EB]"
                            : "border-[#942E3A]/15 bg-white"
                        }`}
                      >
                        <div className="mb-2 flex flex-col items-center gap-1.5 text-center sm:mb-4 sm:flex-row sm:gap-3 sm:text-left">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10 ${
                              isComplete ? "bg-[#942E3A] text-[#FFF9EB]" : "bg-stone-100 text-stone-400"
                            }`}
                          >
                            {isComplete ? <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" /> : <Circle className="h-4 w-4 sm:h-5 sm:w-5" />}
                          </div>
                          <h3 className="font-playfair text-[10px] font-bold leading-tight text-[#942E3A] sm:text-lg"><Localized {...step.title} /></h3>
                        </div>
                        <p className="text-[9px] font-light leading-snug text-[#6B1F2A] sm:text-xs sm:leading-relaxed"><Localized {...step.text} /></p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-4">
                <div className="rounded-3xl border border-[#942E3A]/25 bg-white p-6 shadow-xs">
                  <h3 className="mb-5 flex items-center gap-2 font-playfair text-xl font-extrabold text-[#942E3A]">
                    <MapPin className="h-5 w-5 text-[#D8B46A]" />
                    <Localized en="Shipping Details" ar="بيانات الشحن" />
                  </h3>
                  <div className="space-y-3 text-sm text-[#6B1F2A]">
                    <p><strong className="font-bold text-[#942E3A]"><Localized en="Name:" ar="الاسم:" /></strong> {order.customerName}</p>
                    <p><strong className="font-bold text-[#942E3A]"><Localized en="Governorate:" ar="المحافظة:" /></strong> {getGovernorateName(order.governorate)}</p>
                    <p><strong className="font-bold text-[#942E3A]"><Localized en="City / Area:" ar="المدينة / المنطقة:" /></strong> {order.city}</p>
                    <p><strong className="font-bold text-[#942E3A]"><Localized en="Address:" ar="العنوان:" /></strong> {order.address}</p>
                  </div>
                </div>

                <div className="rounded-3xl border border-[#942E3A]/25 bg-[#942E3A] p-6 text-[#FFF9EB] shadow-lg">
                  <h3 className="mb-3 flex items-center gap-2 font-playfair text-xl font-extrabold">
                    <Phone className="h-5 w-5 text-[#D8B46A]" />
                    <Localized en="Need Support or Cancellation?" ar="هل تحتاج إلى دعم أو إلغاء؟" />
                  </h3>
                  <p className="text-sm font-light leading-relaxed text-[#FFF9EB]/85">
                    <Localized en="If you wish to cancel or modify your order, please contact our support team directly on WhatsApp with your order reference." ar="إذا كنت ترغب في إلغاء أو تعديل طلبك، تواصل مع فريق الدعم مباشرة عبر واتساب مع ذكر رقم الطلب." />
                  </p>
                  <a
                    href={`https://wa.me/201023456789?text=${encodeURIComponent(`Hello DeRoma support, I would like to inquire about/cancel order: ${order.orderNumber}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[#D8B46A] px-5 py-2.5 text-xs font-bold text-[#942E3A] shadow-sm transition hover:bg-[#c4a159]"
                  >
                    <Phone className="h-4 w-4" />
                    <Localized en="Contact via WhatsApp" ar="تواصل عبر واتساب" />
                  </a>
                </div>

              </div>

              <div className="rounded-3xl border border-[#942E3A]/25 bg-white p-6 shadow-xs">
                <h3 className="mb-5 flex items-center gap-2 font-playfair text-xl font-extrabold text-[#942E3A]">
                  <ShoppingBag className="h-5 w-5 text-[#D8B46A]" />
                  <Localized en="Package Contents" ar="محتويات الطلب" />
                </h3>
                <div className="divide-y divide-[#942E3A]/10">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-4 py-4 first:pt-0">
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-[#942E3A]">{item.productName}</h4>
                        <p className="mt-1 text-xs leading-relaxed text-[#6B1F2A]/75">
                          <Localized en="Color:" ar="اللون:" /> {COLOR_TRANSLATIONS[item.color] || item.color} | <Localized en="Size:" ar="المقاس:" /> {item.size} | <Localized en="Qty:" ar="الكمية:" /> {item.quantity}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-black text-[#942E3A]">
                        {formatCurrency(Number(item.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-[#D8B46A]/25 bg-[#FFF9EB] p-5">
                  <div className="space-y-3 text-sm text-[#6B1F2A]">
                    <p className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-[#D8B46A]" />
                        <Localized en="Order Date" ar="تاريخ الطلب" />
                      </span>
                      <span className="font-bold text-[#942E3A]">
                        {new Date(order.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}
                      </span>
                    </p>
                    <p className="flex items-center justify-between gap-4">
                      <span><Localized en="Shipping Cost" ar="تكلفة الشحن" /></span>
                      <span className="font-bold text-[#942E3A]">{formatCurrency(Number(order.shippingCost))}</span>
                    </p>
                    <p className="flex items-center justify-between gap-4 border-t border-[#942E3A]/10 pt-3 text-base">
                      <span className="font-bold text-[#942E3A]"><Localized en="Total" ar="الإجمالي" /></span>
                      <span className="font-black text-[#942E3A]">{formatCurrency(Number(order.totalPrice))}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
