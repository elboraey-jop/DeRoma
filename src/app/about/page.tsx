"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Heart, Award } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FFF9EB] text-[#942E3A] font-outfit py-12 px-4 sm:px-6 lg:px-8" dir="ltr">
      <div className="max-w-[1000px] mx-auto space-y-16">
        
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#942E3A]">Our Heritage</span>
          <h1 className="text-4xl sm:text-5xl font-black font-playfair tracking-tight text-[#942E3A]">
            Crafting Elegance in Motion
          </h1>
          <p className="text-sm sm:text-base text-[#6B1F2A] max-w-2xl mx-auto font-light leading-relaxed">
            At DeRoma, we believe that style should never demand the sacrifice of comfort. Every sneaker is a statement of handcrafted sophistication designed for the modern woman.
          </p>
        </section>

        {/* Story Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#FFF9EB]/20 border border-[#942E3A]/30 rounded-3xl p-6 sm:p-10">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-playfair text-[#942E3A]">The DeRoma Story</h2>
            <p className="text-xs sm:text-sm text-[#6B1F2A] font-light leading-relaxed">
              Founded on the belief that athletic footwear can be as elegant as it is functional, DeRoma has redefined women's sports sneakers. By bringing together artisanal craftsmanship and athletic research, we offer silhouettes that shift smoothly from early workouts to active street steps.
            </p>
            <p className="text-xs sm:text-sm text-[#6B1F2A] font-light leading-relaxed">
              Our sneakers feature meticulously selected premium imported leathers, dynamic arch supports, and ultra-lightweight cushioned soles to ensure maximum wearability.
            </p>
          </div>
          <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden border border-[#942E3A]/40 shadow-md">
            <Image
              src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80"
              alt="Handcrafted sneakers design"
              fill
              className="object-cover"
            />
          </div>
        </section>

        {/* Core Values */}
        <section className="space-y-8">
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#942E3A]">Our Promise</span>
            <h2 className="text-2xl font-extrabold font-playfair text-[#942E3A]">Crafted With Care</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#942E3A]/30 rounded-2xl p-6 text-center space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-full bg-[#FFF9EB] text-[#942E3A] flex items-center justify-center mx-auto">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#942E3A]">Premium Materials</h3>
              <p className="text-xs text-[#6B1F2A] font-light leading-relaxed">
                We source only the finest imported leathers and breathable mesh to ensure durability and breathability.
              </p>
            </div>

            <div className="bg-white border border-[#942E3A]/30 rounded-2xl p-6 text-center space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-full bg-[#FFF9EB] text-[#942E3A] flex items-center justify-center mx-auto">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#942E3A]">Ergonomic Comfort</h3>
              <p className="text-xs text-[#6B1F2A] font-light leading-relaxed">
                Features include specialized arch supports and memory foam footbeds to alleviate step fatigue.
              </p>
            </div>

            <div className="bg-white border border-[#942E3A]/30 rounded-2xl p-6 text-center space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-full bg-[#FFF9EB] text-[#942E3A] flex items-center justify-center mx-auto">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#942E3A]">Bespoke Contours</h3>
              <p className="text-xs text-[#6B1F2A] font-light leading-relaxed">
                Designed exclusively for the unique shape and alignment of the female foot structure.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center bg-[#942E3A] rounded-3xl p-8 sm:p-12 text-[#FFF9EB] space-y-4 shadow-lg border border-white/10">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-playfair">Step Into the Future of Comfort</h2>
          <p className="text-xs sm:text-sm max-w-xl mx-auto font-light leading-relaxed text-stone-100">
            Explore our curated line of premium sports and performance sneakers and find your perfect pair today.
          </p>
          <div className="pt-4">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-[#FFF9EB] text-[#942E3A] hover:bg-[#FFF9EB] px-6 py-3 text-xs font-bold transition-all shadow-md"
            >
              <span>Explore Collection</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
