"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, EyeOff, FileText, CheckCircle2 } from "lucide-react";
import { useSiteSettings } from "@/providers/SiteSettingsProvider";

export default function PrivacyPage() {
  const settings = useSiteSettings();

  return (
    <div className="min-h-screen bg-[#FFF9EB] text-[#942E3A] font-outfit py-6 sm:py-10 px-3 sm:px-6 lg:px-8" dir="ltr">
      <div className="max-w-[900px] mx-auto space-y-6 sm:space-y-10">
        
        {/* Navigation & Header */}
        <div className="space-y-3 sm:space-y-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#942E3A] hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>

          <div className="space-y-1">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#942E3A]">
              Trust & Transparency
            </span>
            <h1 className="text-2xl sm:text-4xl font-black font-playfair tracking-tight text-[#942E3A]">
              Privacy Policy
            </h1>
            <p className="text-[11px] sm:text-xs text-stone-500 font-light">Last Updated: August 2026</p>
          </div>
        </div>

        {/* Quick Highlights Grid - 2 columns on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
          <div className="bg-white border border-[#942E3A]/25 rounded-2xl p-3 sm:p-5 text-center space-y-1 sm:space-y-2 shadow-xs">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-[#FFF9EB] text-[#942E3A] flex items-center justify-center mx-auto">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
            <h3 className="text-[10px] sm:text-xs font-bold text-[#942E3A] uppercase tracking-wider">100% Encrypted</h3>
            <p className="text-[10px] sm:text-xs font-semibold text-[#6B1F2A]">Secure Data</p>
          </div>

          <div className="bg-white border border-[#942E3A]/25 rounded-2xl p-3 sm:p-5 text-center space-y-1 sm:space-y-2 shadow-xs">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-[#FFF9EB] text-[#942E3A] flex items-center justify-center mx-auto">
              <Lock className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
            <h3 className="text-[10px] sm:text-xs font-bold text-[#942E3A] uppercase tracking-wider">No Selling</h3>
            <p className="text-[10px] sm:text-xs font-semibold text-[#6B1F2A]">Private & Confidential</p>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-white border border-[#942E3A]/25 rounded-2xl p-3 sm:p-5 text-center space-y-1 sm:space-y-2 shadow-xs">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-[#FFF9EB] text-[#942E3A] flex items-center justify-center mx-auto">
              <EyeOff className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
            <h3 className="text-[10px] sm:text-xs font-bold text-[#942E3A] uppercase tracking-wider">Essential Cookies</h3>
            <p className="text-[10px] sm:text-xs font-semibold text-[#6B1F2A]">Bag & Order Memory</p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="bg-white border border-[#942E3A]/30 rounded-3xl p-4 sm:p-8 space-y-5 sm:space-y-8 shadow-xs">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 border-b border-[#942E3A]/15 pb-2">
              <FileText className="w-4 h-4 text-[#942E3A]" />
              <h2 className="text-sm sm:text-lg font-bold font-playfair text-[#942E3A]">1. Information We Collect</h2>
            </div>
            <p className="text-xs sm:text-sm text-[#6B1F2A] font-light leading-relaxed">
              When placing an order at DeRoma, we collect essential fulfillment information: your name, contact phone number, governorate, and shipping address. This data is exclusively used to process your order and coordinate door-to-door courier delivery.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 border-b border-[#942E3A]/15 pb-2">
              <Lock className="w-4 h-4 text-[#942E3A]" />
              <h2 className="text-sm sm:text-lg font-bold font-playfair text-[#942E3A]">2. How We Protect Your Data</h2>
            </div>
            <p className="text-xs sm:text-sm text-[#6B1F2A] font-light leading-relaxed">
              All personal customer data is stored securely in encrypted databases. DeRoma never sells, trades, or rents customer personal information to third-party advertisers or external telemarketing firms.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 border-b border-[#942E3A]/15 pb-2">
              <EyeOff className="w-4 h-4 text-[#942E3A]" />
              <h2 className="text-sm sm:text-lg font-bold font-playfair text-[#942E3A]">3. Cookies & Session Storage</h2>
            </div>
            <p className="text-xs sm:text-sm text-[#6B1F2A] font-light leading-relaxed">
              We utilize minimal session storage and cookies strictly to maintain your active Shopping Bag items and saved delivery preferences.
            </p>
          </div>

          <div className="bg-[#FFF9EB]/60 rounded-2xl p-4 space-y-2 border border-[#942E3A]/20">
            <h3 className="text-xs sm:text-sm font-bold text-[#942E3A]">Questions or Data Deletion Requests?</h3>
            <p className="text-xs text-[#6B1F2A] font-light leading-relaxed">
              If you have any questions or wish to request data removal, please contact our support team at{" "}
              <a href={`mailto:${settings.email}`} className="font-bold text-[#942E3A] underline">
                {settings.email}
              </a>.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

