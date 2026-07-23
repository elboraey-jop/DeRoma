import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Search, Package, MapPin, Calendar, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { COLOR_TRANSLATIONS } from "@/components/ProductCard";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
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

export default async function TrackOrderPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  let order = null;
  let errorMsg = "";

  if (query) {
    // Look up by order number (exact) or customer phone
    order = await prisma.order.findFirst({
      where: {
        OR: [
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
    });

    if (!order) {
      errorMsg = "No orders found matching the entered reference or phone number. Please double check and try again.";
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Processing";
      case "shipped":
        return "With Courier";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return "Processing";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-105 bg-amber-50 text-amber-800 border-amber-200";
      case "shipped":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "delivered":
        return "bg-emerald-50 text-emerald-800 border-emerald-250";
      case "cancelled":
        return "bg-red-50 text-red-800 border-red-200";
      default:
        return "bg-stone-50 text-stone-800 border-stone-200";
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 text-left" dir="ltr">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-indigo-955 font-playfair">Track Your Order</h1>
        <p className="text-xs text-stone-500 mt-1">Enter your order reference number (e.g. DR-1001) or the primary phone number used to place the order.</p>
      </div>

      {/* Search Input Card */}
      <div className="bg-white border border-purple-100/60 p-6 rounded-[2rem] shadow-sm mb-8">
        <form action="/track" method="GET" className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 font-sans">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              required
              placeholder="Enter order reference or phone number..."
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-3.5 pl-10 pr-4 text-sm text-indigo-950 placeholder-stone-400 outline-none focus:border-indigo-950 focus:bg-white transition-all"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-indigo-950 px-8 py-3.5 text-sm font-bold text-white hover:bg-indigo-900 transition-colors shadow-sm active:scale-[0.98]"
          >
            Track Order
          </button>
        </form>
      </div>

      {/* Results Display */}
      {query && (
        <div className="space-y-6">
          {errorMsg ? (
            <div className="rounded-[2rem] bg-purple-50/20 border border-purple-100 p-5 text-sm text-stone-700 flex items-start gap-x-3">
              <AlertCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <p className="font-sans leading-relaxed">{errorMsg}</p>
            </div>
          ) : (
            order && (
              <div className="space-y-6">
                
                {/* Header Status Details */}
                <div className="bg-white border border-purple-100/60 p-6 rounded-[2rem] shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-purple-50">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider font-sans">Order Reference</span>
                      <h2 className="text-lg font-black text-indigo-950 font-sans">{order.orderNumber}</h2>
                    </div>
                    
                    <span className={`rounded-full border px-4 py-1.5 text-xs font-bold ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  {/* Status Steps Visualization */}
                  <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-bold text-stone-500">
                    <div className="space-y-2 flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-sans">1</div>
                      <span>Registered</span>
                    </div>
                    <div className="space-y-2 flex flex-col items-center border-l border-purple-50/50">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center font-sans ${
                        order.status === "shipped" || order.status === "delivered" 
                          ? "bg-emerald-500 text-white" 
                          : "bg-stone-100 text-stone-400"
                      }`}>2</div>
                      <span>With Courier</span>
                    </div>
                    <div className="space-y-2 flex flex-col items-center border-l border-purple-50/50">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center font-sans ${
                        order.status === "delivered" 
                          ? "bg-emerald-500 text-white" 
                          : "bg-stone-100 text-stone-400"
                      }`}>3</div>
                      <span>Delivered</span>
                    </div>
                  </div>
                </div>

                {/* Shipping & Cost info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Delivery details card */}
                  <div className="bg-white border border-purple-100/60 p-6 rounded-[2rem] shadow-sm space-y-3">
                    <h3 className="text-xs font-bold text-stone-450 uppercase tracking-wider flex items-center gap-x-2 font-playfair">
                      <MapPin className="h-4 w-4 text-purple-400" />
                      <span>Shipping Address</span>
                    </h3>
                    <div className="text-xs text-stone-600 space-y-2 font-sans">
                      <p><strong>Name:</strong> {order.customerName}</p>
                      <p><strong>Governorate:</strong> {GOV_AR_TO_EN[order.governorate] || order.governorate}</p>
                      <p><strong>City / Area:</strong> {order.city}</p>
                      <p><strong>Address:</strong> {order.address}</p>
                    </div>
                  </div>

                  {/* Summary cost details card */}
                  <div className="bg-white border border-purple-100/60 p-6 rounded-[2rem] shadow-sm space-y-3">
                    <h3 className="text-xs font-bold text-stone-450 uppercase tracking-wider flex items-center gap-x-2 font-playfair">
                      <Clock className="h-4 w-4 text-purple-400" />
                      <span>Order Summary</span>
                    </h3>
                    <div className="text-xs text-stone-600 space-y-2 font-sans">
                      <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString("en-US", { dateStyle: "long" })}</p>
                      <p><strong>Shipping Cost:</strong> {formatCurrency(Number(order.shippingCost))}</p>
                      <p className="text-sm font-bold text-indigo-950 border-t border-purple-50 pt-2 mt-2">
                        <strong>Total Amount:</strong> {formatCurrency(Number(order.totalPrice))}
                      </p>
                    </div>
                  </div>

                </div>

                {/* Items List */}
                <div className="bg-white border border-purple-100/60 p-6 rounded-[2rem] shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-stone-450 uppercase tracking-wider flex items-center gap-x-2 font-playfair">
                    <Package className="h-4 w-4 text-purple-400" />
                    <span>Package Contents</span>
                  </h3>
                  <div className="divide-y divide-purple-50">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between py-3 text-xs text-stone-700 items-baseline">
                        <div className="space-y-1">
                          <h4 className="font-bold text-indigo-950">{item.productName}</h4>
                          <p className="text-[10px] text-stone-550 font-sans">
                            Color: {COLOR_TRANSLATIONS[item.color] || item.color} | Size: {item.size} | {item.quantity} {item.quantity === 1 ? 'pair' : 'pairs'}
                          </p>
                        </div>
                        <span className="font-bold text-indigo-955 font-sans">{formatCurrency(Number(item.price) * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
