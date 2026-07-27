import Link from "next/link";
import { ArrowLeft, Clock, CreditCard, MapPin, PackageCheck, ShieldCheck, Truck } from "lucide-react";

const shippingSteps = [
  {
    title: "Order Confirmation",
    text: "After checkout, our team confirms the order details, size, color, address, and preferred delivery window.",
    icon: PackageCheck,
  },
  {
    title: "Careful Packing",
    text: "Every pair is checked, packed securely, and prepared for a neat doorstep handoff.",
    icon: ShieldCheck,
  },
  {
    title: "Doorstep Delivery",
    text: "Orders are delivered through our courier partners with updates available from the Track Order page.",
    icon: Truck,
  },
];

const terms = [
  "Product colors may vary slightly between screen displays and real lighting.",
  "Order availability depends on current stock, size, and selected colorway.",
  "Cash on delivery orders may require phone confirmation before dispatch.",
  "Customers are responsible for entering accurate contact and shipping details.",
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FFF9EB] px-4 py-12 text-[#942E3A] sm:px-6 lg:px-8" dir="ltr">
      <div className="mx-auto max-w-[980px] space-y-10">
        <Link href="/" className="inline-flex items-center gap-1 text-xs font-bold text-[#942E3A] transition-colors hover:text-[#6B1F2A]">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>

        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#942E3A]">Shipping & Service Terms</span>
            <h1 className="font-playfair text-4xl font-black tracking-tight text-[#942E3A] sm:text-5xl">
              Clear delivery for every DeRoma order
            </h1>
            <p className="max-w-2xl text-sm font-light leading-relaxed text-[#6B1F2A] sm:text-base">
              A quick guide to how orders are confirmed, shipped, paid for, and supported across Egypt.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[#942E3A]/25 bg-white p-5 shadow-xs">
              <Clock className="mb-3 h-5 w-5 text-[#D8B46A]" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#942E3A]/70">Delivery Window</p>
              <p className="mt-1 text-xl font-black text-[#942E3A]">2-5 Days</p>
            </div>
            <div className="rounded-2xl border border-[#942E3A]/25 bg-white p-5 shadow-xs">
              <CreditCard className="mb-3 h-5 w-5 text-[#D8B46A]" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#942E3A]/70">Payment</p>
              <p className="mt-1 text-xl font-black text-[#942E3A]">COD</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {shippingSteps.map((step) => (
            <div key={step.title} className="rounded-2xl border border-[#942E3A]/25 bg-white p-6 shadow-xs">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF9EB] text-[#942E3A]">
                <step.icon className="h-5 w-5" />
              </div>
              <h2 className="font-playfair text-lg font-bold text-[#942E3A]">{step.title}</h2>
              <p className="mt-2 text-xs font-light leading-relaxed text-[#6B1F2A]">{step.text}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-[#942E3A]/30 bg-[#942E3A] p-6 text-[#FFF9EB] shadow-lg sm:p-8">
            <MapPin className="mb-4 h-6 w-6 text-[#D8B46A]" />
            <h2 className="font-playfair text-2xl font-extrabold">Shipping Notes</h2>
            <p className="mt-3 text-sm font-light leading-relaxed text-[#FFF9EB]/85">
              Delivery timing can change based on governorate, courier capacity, holidays, and confirmation speed. Cairo and Mansoura orders are usually prioritized when stock is available locally.
            </p>
            <Link
              href="/track"
              className="mt-6 inline-flex items-center rounded-full bg-[#FFF9EB] px-5 py-2.5 text-xs font-bold text-[#942E3A] transition-colors hover:bg-white"
            >
              Track an Order
            </Link>
          </div>

          <div className="rounded-3xl border border-[#942E3A]/30 bg-white p-6 shadow-xs sm:p-8">
            <h2 className="font-playfair text-2xl font-extrabold text-[#942E3A]">Terms of Service</h2>
            <p className="mt-2 text-xs text-stone-500">Last Updated: July 2026</p>
            <ul className="mt-6 space-y-3 text-sm font-light leading-relaxed text-[#6B1F2A]">
              {terms.map((term) => (
                <li key={term} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D8B46A]" />
                  <span>{term}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
