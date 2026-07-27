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

const statusLabels: Record<string, string> = {
  pending: "Order Confirmed",
  shipped: "With Courier",
  delivered: "Delivered",
  cancelled: "Cancelled",
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
    title: "Registered",
    text: "Your order details were received and are being reviewed.",
    icon: Receipt,
  },
  {
    key: "shipped",
    title: "With Courier",
    text: "The package is packed and moving toward your address.",
    icon: Truck,
  },
  {
    key: "delivered",
    title: "Delivered",
    text: "Your DeRoma pair has reached the doorstep.",
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

  const errorMsg =
    query && !order
      ? "No order matched that reference or phone number. Please check the details and try again."
      : "";

  return (
    <div className="min-h-screen bg-[#FFF9EB] px-4 py-12 text-[#942E3A] sm:px-6 lg:px-8" dir="ltr">
      <div className="mx-auto max-w-[1120px] space-y-8">
        <Link href="/" className="inline-flex items-center gap-1 text-xs font-bold text-[#942E3A] transition-colors hover:text-[#6B1F2A]">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>

        <section className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-stretch">
          <div className="rounded-3xl border border-[#942E3A]/20 bg-[#942E3A] p-7 text-[#FFF9EB] shadow-lg sm:p-10">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">Order Tracking</span>
            <h1 className="mt-4 font-playfair text-4xl font-black tracking-tight sm:text-5xl">
              Track Your Order
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-[#FFF9EB]/85 sm:text-base">
              Follow your DeRoma order from confirmation to doorstep delivery using your order reference or phone number.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#D8B46A]/25 bg-white/8 p-4">
                <Clock className="mb-2 h-4 w-4 text-[#D8B46A]" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#FFF9EB]/70">Support Hours</p>
                <p className="mt-1 text-sm font-bold">9 AM - 10 PM</p>
              </div>
              <div className="rounded-2xl border border-[#D8B46A]/25 bg-white/8 p-4">
                <Truck className="mb-2 h-4 w-4 text-[#D8B46A]" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#FFF9EB]/70">Delivery</p>
                <p className="mt-1 text-sm font-bold">2-5 Days</p>
              </div>
              <div className="rounded-2xl border border-[#D8B46A]/25 bg-white/8 p-4">
                <MapPin className="mb-2 h-4 w-4 text-[#D8B46A]" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#FFF9EB]/70">Coverage</p>
                <p className="mt-1 text-sm font-bold">Egypt</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#942E3A]/25 bg-white p-6 shadow-xs sm:p-7">
            <div className="mb-5">
              <h2 className="font-playfair text-2xl font-extrabold text-[#942E3A]">Find your package</h2>
              <p className="mt-1 text-xs leading-relaxed text-[#6B1F2A]/75">
                Use an order number like DR-1001 or the primary phone number used at checkout.
              </p>
            </div>
            <form action="/track" method="GET" className="space-y-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D8B46A]" />
                <input
                  type="text"
                  name="q"
                  defaultValue={query}
                  required
                  placeholder="Order reference or phone number"
                  className="m-0 w-full rounded-2xl border border-[#942E3A]/20 bg-[#FFF9EB]/70 py-4 pl-11 pr-4 text-sm font-semibold text-[#942E3A] placeholder:text-[#942E3A]/45 outline-none transition-all focus:border-[#942E3A] focus:bg-white focus:ring-4 focus:ring-[#942E3A]/10"
                />
              </div>
              <button
                type="submit"
                className="flex w-full items-center justify-center rounded-2xl bg-[#942E3A] px-6 py-4 text-sm font-bold text-[#FFF9EB] shadow-sm transition-all hover:bg-[#802832] active:scale-[0.99]"
              >
                Track Order
              </button>
            </form>
            <div className="mt-5 rounded-2xl border border-[#D8B46A]/25 bg-[#FFF9EB] p-4 text-xs leading-relaxed text-[#6B1F2A]">
              <span className="font-bold text-[#942E3A]">Tip:</span> If you placed the order while signed in, you can also open it from your profile orders.
            </div>
          </div>
        </section>

        {errorMsg && (
          <section className="flex items-start gap-3 rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="leading-relaxed">{errorMsg}</p>
          </section>
        )}

        {!query && (
          <section className="grid gap-4 md:grid-cols-3">
            {timelineSteps.map((step, index) => (
              <div key={step.key} className="rounded-2xl border border-[#942E3A]/25 bg-white p-6 shadow-xs">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF9EB] text-[#942E3A]">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-black text-[#D8B46A]">0{index + 1}</span>
                </div>
                <h2 className="font-playfair text-lg font-bold text-[#942E3A]">{step.title}</h2>
                <p className="mt-2 text-xs font-light leading-relaxed text-[#6B1F2A]">{step.text}</p>
              </div>
            ))}
          </section>
        )}

        {order && (
          <section className="space-y-6">
            <div className="rounded-3xl border border-[#942E3A]/25 bg-white p-6 shadow-xs sm:p-8">
              <div className="flex flex-col gap-5 border-b border-[#942E3A]/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">Order Reference</p>
                  <h2 className="mt-2 font-playfair text-3xl font-black text-[#942E3A]">{order.orderNumber}</h2>
                </div>
                <span className={`inline-flex w-fit rounded-full border px-4 py-2 text-xs font-black ${statusStyles[order.status] || statusStyles.pending}`}>
                  {statusLabels[order.status] || statusLabels.pending}
                </span>
              </div>

              {order.status === "cancelled" ? (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <p className="text-sm leading-relaxed">
                    This order was cancelled. Contact support if you need help placing a new order or checking availability.
                  </p>
                </div>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {timelineSteps.map((step) => {
                    const state = getStepState(order.status, step.key);
                    const isComplete = state === "complete";
                    return (
                      <div
                        key={step.key}
                        className={`rounded-2xl border p-5 ${
                          isComplete
                            ? "border-[#D8B46A]/50 bg-[#FFF9EB]"
                            : "border-[#942E3A]/15 bg-white"
                        }`}
                      >
                        <div className="mb-4 flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full ${
                              isComplete ? "bg-[#942E3A] text-[#FFF9EB]" : "bg-stone-100 text-stone-400"
                            }`}
                          >
                            {isComplete ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                          </div>
                          <h3 className="font-playfair text-lg font-bold text-[#942E3A]">{step.title}</h3>
                        </div>
                        <p className="text-xs font-light leading-relaxed text-[#6B1F2A]">{step.text}</p>
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
                    Shipping Details
                  </h3>
                  <div className="space-y-3 text-sm text-[#6B1F2A]">
                    <p><span className="font-bold text-[#942E3A]">Name:</span> {order.customerName}</p>
                    <p><span className="font-bold text-[#942E3A]">Governorate:</span> {GOV_AR_TO_EN[order.governorate] || order.governorate}</p>
                    <p><span className="font-bold text-[#942E3A]">City / Area:</span> {order.city}</p>
                    <p><span className="font-bold text-[#942E3A]">Address:</span> {order.address}</p>
                  </div>
                </div>

                <div className="rounded-3xl border border-[#942E3A]/25 bg-[#942E3A] p-6 text-[#FFF9EB] shadow-lg">
                  <h3 className="mb-5 flex items-center gap-2 font-playfair text-xl font-extrabold">
                    <Phone className="h-5 w-5 text-[#D8B46A]" />
                    Need Support?
                  </h3>
                  <p className="text-sm font-light leading-relaxed text-[#FFF9EB]/85">
                    Keep your order reference ready when contacting support so the team can help faster.
                  </p>
                  <p className="mt-4 text-sm font-bold text-[#D8B46A]">support@deromastore.com</p>
                </div>
              </div>

              <div className="rounded-3xl border border-[#942E3A]/25 bg-white p-6 shadow-xs">
                <h3 className="mb-5 flex items-center gap-2 font-playfair text-xl font-extrabold text-[#942E3A]">
                  <ShoppingBag className="h-5 w-5 text-[#D8B46A]" />
                  Package Contents
                </h3>
                <div className="divide-y divide-[#942E3A]/10">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-4 py-4 first:pt-0">
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-[#942E3A]">{item.productName}</h4>
                        <p className="mt-1 text-xs leading-relaxed text-[#6B1F2A]/75">
                          Color: {COLOR_TRANSLATIONS[item.color] || item.color} | Size: {item.size} | Qty: {item.quantity}
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
                        Order Date
                      </span>
                      <span className="font-bold text-[#942E3A]">
                        {new Date(order.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}
                      </span>
                    </p>
                    <p className="flex items-center justify-between gap-4">
                      <span>Shipping Cost</span>
                      <span className="font-bold text-[#942E3A]">{formatCurrency(Number(order.shippingCost))}</span>
                    </p>
                    <p className="flex items-center justify-between gap-4 border-t border-[#942E3A]/10 pt-3 text-base">
                      <span className="font-bold text-[#942E3A]">Total</span>
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
