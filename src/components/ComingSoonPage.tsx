import Link from "next/link";
import { ArrowLeft, type LucideIcon } from "lucide-react";

interface ComingSoonPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export default function ComingSoonPage({ title, description, icon: Icon }: ComingSoonPageProps) {
  return (
    <main className="min-h-screen bg-[#FFF9EB] px-4 pb-12 pt-28 text-[#942E3A] sm:px-6 sm:pt-36 lg:px-8" dir="ltr">
      <div className="mx-auto flex max-w-[900px] flex-col items-center text-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D8B46A]">
          DeRoma Collection
        </span>
        <div className="mt-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#942E3A] text-[#D8B46A] shadow-lg sm:h-24 sm:w-24">
          <Icon className="h-9 w-9 sm:h-11 sm:w-11" strokeWidth={1.5} />
        </div>
        <h1 className="mt-7 font-playfair text-4xl font-black tracking-tight sm:text-6xl">{title}</h1>
        <div className="mt-5 max-w-xl rounded-3xl border border-[#D8B46A]/45 bg-white p-7 shadow-sm sm:p-10">
          <p className="text-xl font-bold text-[#942E3A] sm:text-2xl">Coming Soon</p>
          <p className="mt-3 text-sm font-light leading-relaxed text-[#6B1F2A] sm:text-base">{description}</p>
        </div>
        <Link
          href="/shop"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#942E3A] px-6 py-3 text-xs font-bold text-[#FFF9EB] shadow-md transition-colors hover:bg-[#802832]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Explore Shoes</span>
        </Link>
      </div>
    </main>
  );
}
