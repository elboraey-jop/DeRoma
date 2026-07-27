import Link from "next/link";
import { ArrowLeft, CheckCircle2, PackageSearch, RotateCcw, ShieldAlert, XCircle } from "lucide-react";

const acceptedCases = [
  "Wrong size, wrong color, or wrong item delivered.",
  "Manufacturing issue reported before outdoor wear.",
  "Unused item returned in its original packaging and clean condition.",
];

const declinedCases = [
  "Shoes used outdoors, damaged, stained, or missing original packaging.",
  "Requests submitted after the review window has passed.",
  "Normal fit preference after confirmed doorstep try-on approval.",
];

const processSteps = [
  "Send your order number and clear product photos to support.",
  "Our team reviews the request and confirms eligibility.",
  "A courier pickup or replacement delivery is arranged when approved.",
];

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FFF9EB] px-4 py-12 text-[#942E3A] sm:px-6 lg:px-8" dir="ltr">
      <div className="mx-auto max-w-[980px] space-y-10">
        <Link href="/" className="inline-flex items-center gap-1 text-xs font-bold text-[#942E3A] transition-colors hover:text-[#6B1F2A]">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>

        <section className="space-y-4 text-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#942E3A]">Returns & Exchanges</span>
          <h1 className="font-playfair text-4xl font-black tracking-tight text-[#942E3A] sm:text-5xl">
            Simple help when the pair is not right
          </h1>
          <p className="mx-auto max-w-2xl text-sm font-light leading-relaxed text-[#6B1F2A] sm:text-base">
            We want every order to arrive clean, correct, and comfortable. Here is how returns and exchanges are handled.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#942E3A]/25 bg-white p-6 text-center shadow-xs">
            <RotateCcw className="mx-auto mb-3 h-6 w-6 text-[#D8B46A]" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#942E3A]/70">Review Window</p>
            <p className="mt-1 text-2xl font-black text-[#942E3A]">24 Hours</p>
          </div>
          <div className="rounded-2xl border border-[#942E3A]/25 bg-white p-6 text-center shadow-xs">
            <PackageSearch className="mx-auto mb-3 h-6 w-6 text-[#D8B46A]" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#942E3A]/70">Condition</p>
            <p className="mt-1 text-2xl font-black text-[#942E3A]">Unused</p>
          </div>
          <div className="rounded-2xl border border-[#942E3A]/25 bg-white p-6 text-center shadow-xs">
            <ShieldAlert className="mx-auto mb-3 h-6 w-6 text-[#D8B46A]" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#942E3A]/70">Support</p>
            <p className="mt-1 text-2xl font-black text-[#942E3A]">Fast Review</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-[#942E3A]/30 bg-white p-6 shadow-xs sm:p-8">
            <div className="mb-5 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <h2 className="font-playfair text-2xl font-extrabold text-[#942E3A]">Accepted Requests</h2>
            </div>
            <ul className="space-y-3 text-sm font-light leading-relaxed text-[#6B1F2A]">
              {acceptedCases.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-[#942E3A]/30 bg-white p-6 shadow-xs sm:p-8">
            <div className="mb-5 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-[#942E3A]" />
              <h2 className="font-playfair text-2xl font-extrabold text-[#942E3A]">Not Eligible</h2>
            </div>
            <ul className="space-y-3 text-sm font-light leading-relaxed text-[#6B1F2A]">
              {declinedCases.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#D8B46A]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#942E3A] p-6 text-[#FFF9EB] shadow-lg sm:p-8">
          <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
            <div>
              <h2 className="font-playfair text-2xl font-extrabold">How to request a return</h2>
              <p className="mt-3 text-sm font-light leading-relaxed text-[#FFF9EB]/85">
                Keep the package safe until the support team reviews your request. Approved exchanges depend on current stock availability.
              </p>
              <Link
                href="/track"
                className="mt-6 inline-flex items-center rounded-full bg-[#FFF9EB] px-5 py-2.5 text-xs font-bold text-[#942E3A] transition-colors hover:bg-white"
              >
                Check Order Status
              </Link>
            </div>
            <ol className="space-y-3">
              {processSteps.map((step, index) => (
                <li key={step} className="flex gap-3 rounded-2xl border border-[#D8B46A]/20 bg-white/8 p-4 text-sm font-light leading-relaxed">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#D8B46A] text-xs font-black text-[#942E3A]">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
}
