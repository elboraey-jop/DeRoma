"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, EyeOff } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FFF9EB] text-[#005F6B] font-outfit py-12 px-4 sm:px-6 lg:px-8" dir="ltr">
      <div className="max-w-[800px] mx-auto space-y-10">
        
        {/* Navigation */}
        <div>
          <Link href="/" className="inline-flex items-center gap-1 text-xs font-bold text-[#F88379] hover:text-[#005F6B] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Header */}
        <section className="space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#F88379]">Trust & Security</span>
          <h1 className="text-3xl sm:text-4xl font-black font-playfair tracking-tight text-[#005F6B]">
            Privacy Policy
          </h1>
          <p className="text-xs text-stone-500 font-light">Last Updated: July 2026</p>
        </section>

        {/* Content Box */}
        <section className="bg-white border border-[#F88379]/30 rounded-3xl p-6 sm:p-10 space-y-8 shadow-xs">
          
          {/* Section 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#F88379]" />
              <h2 className="text-lg font-bold text-[#005F6B] font-playfair">1. Information We Collect</h2>
            </div>
            <p className="text-xs sm:text-sm text-[#003E45] font-light leading-relaxed">
              We collect necessary details when you place an order, including your name, phone number, shipping address, and delivery preferences. This information is solely used to process your order and coordinate the doorstep try-on delivery service.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#F88379]" />
              <h2 className="text-lg font-bold text-[#005F6B] font-playfair">2. Data Protection</h2>
            </div>
            <p className="text-xs sm:text-sm text-[#003E45] font-light leading-relaxed">
              Your personal data is encrypted and saved securely. We do not sell, distribute, or share customer information with external marketing companies. All data access is strictly limited to delivery coordinators and support staff.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-[#F88379]" />
              <h2 className="text-lg font-bold text-[#005F6B] font-playfair">3. Cookies & Tracking</h2>
            </div>
            <p className="text-xs sm:text-sm text-[#003E45] font-light leading-relaxed">
              We use minimal browser cookies to remember the items inside your Shopping Bag and your active filters. This ensures a seamless and fast browsing experience as you navigate our premium sneaker collections.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-3 pt-4 border-t border-[#F88379]/20">
            <h2 className="text-base font-bold text-[#005F6B]">Contact Our Privacy Team</h2>
            <p className="text-xs sm:text-sm text-[#003E45] font-light leading-relaxed">
              If you have any questions about how we handle your personal data, or if you would like to request data deletion, please contact us at <span className="font-bold text-[#F88379]">privacy@deromashoes.com</span>.
            </p>
          </div>

        </section>

      </div>
    </div>
  );
}
