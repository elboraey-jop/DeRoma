import Link from "next/link";
import { Clock, Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const goldAccent = "#D8B46A";

  return (
    <footer className="border-t border-[#D8B46A]/35 bg-[#942E3A] px-3 py-4 pb-6 text-[#FFF9EB] sm:px-4 sm:py-8 sm:pb-8 lg:px-6">
      <ScrollReveal direction="up" duration={0.8}>
        <div className="mx-auto w-full max-w-[1320px] space-y-4 sm:space-y-7" dir="ltr">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-10">
            <div className="flex flex-col gap-3 lg:w-[34%]">
              <div className="flex items-center justify-between gap-3">
                <Link href="/" className="flex items-center gap-2">
                  <span className="font-playfair text-2xl font-extrabold tracking-tight text-[#FFF9EB] sm:text-3xl">
                    DeRoma
                  </span>
                </Link>

                <div className="flex shrink-0 items-center gap-2">
                  <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D8B46A]/35 bg-white/5 text-[#D8B46A] shadow-2xs transition-all hover:border-[#D8B46A] hover:bg-[#FFF9EB] hover:text-[#942E3A]" aria-label="Instagram">
                    <Instagram className="h-3.5 w-3.5" />
                  </a>
                  <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D8B46A]/35 bg-white/5 text-[#D8B46A] shadow-2xs transition-all hover:border-[#D8B46A] hover:bg-[#FFF9EB] hover:text-[#942E3A]" aria-label="Facebook">
                    <Facebook className="h-3.5 w-3.5" />
                  </a>
                  <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D8B46A]/35 bg-white/5 text-[#D8B46A] shadow-2xs transition-all hover:border-[#D8B46A] hover:bg-[#FFF9EB] hover:text-[#942E3A]" aria-label="TikTok">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                    </svg>
                  </a>
                </div>
              </div>

              <p className="max-w-md text-[11px] leading-relaxed text-[#FFF9EB] sm:text-xs">
                Handcrafted boutique women&apos;s shoes with cushioned comfort, elegant sport silhouettes, and daily-ready support.
              </p>
            </div>

            <div className="grid min-w-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-2">
              <div className="min-w-0 space-y-2">
                <h4 className="font-playfair text-[10px] font-bold uppercase tracking-wider sm:text-xs" style={{ color: goldAccent }}>
                  CUSTOMER HELP
                </h4>
                <ul className="flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] font-medium leading-snug text-[#FFF9EB]/80 sm:block sm:space-y-2 sm:text-xs">
                  <li><Link href="/track" className="transition-colors hover:text-white">Track Order</Link></li>
                  <li><Link href="/about" className="transition-colors hover:text-white">About Us</Link></li>
                  <li><Link href="/terms" className="transition-colors hover:text-white">Shipping</Link></li>
                  <li><Link href="/privacy" className="transition-colors hover:text-white">Privacy</Link></li>
                  <li><Link href="/refund-policy" className="transition-colors hover:text-white">Returns</Link></li>
                </ul>
              </div>

              <div className="min-w-0 space-y-2">
                <h4 className="font-playfair text-[10px] font-bold uppercase tracking-wider sm:text-xs" style={{ color: goldAccent }}>
                  CONTACT
                </h4>
                <ul className="grid grid-cols-2 gap-1.5 text-[9px] leading-none text-[#FFF9EB]/90 sm:flex sm:flex-col sm:gap-2 sm:text-xs">
                  <li className="flex min-w-0 items-center gap-1 rounded-full border border-[#D8B46A]/15 bg-white/8 px-1.5 py-1 sm:px-2 sm:py-1.5">
                    <Phone className="h-2.5 w-2.5 shrink-0 text-[#D8B46A] sm:h-3 sm:w-3" />
                    <span className="truncate">+20 100 000 0000</span>
                  </li>
                  <li className="flex min-w-0 items-center gap-1 rounded-full border border-[#D8B46A]/15 bg-white/8 px-1.5 py-1 sm:px-2 sm:py-1.5">
                    <Mail className="h-2.5 w-2.5 shrink-0 text-[#D8B46A] sm:h-3 sm:w-3" />
                    <span className="truncate">support@deromastore.com</span>
                  </li>
                  <li className="flex min-w-0 items-center gap-1 rounded-full border border-[#D8B46A]/15 bg-white/8 px-1.5 py-1 sm:px-2 sm:py-1.5">
                    <MapPin className="h-2.5 w-2.5 shrink-0 text-[#D8B46A] sm:h-3 sm:w-3" />
                    <span className="truncate">Cairo / Mansoura</span>
                  </li>
                  <li className="flex min-w-0 items-center gap-1 rounded-full border border-[#D8B46A]/15 bg-white/8 px-1.5 py-1 sm:px-2 sm:py-1.5">
                    <Clock className="h-2.5 w-2.5 shrink-0 text-[#D8B46A] sm:h-3 sm:w-3" />
                    <span className="truncate">9 AM - 10 PM</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-2 border-t border-[#D8B46A]/18 pt-4 text-center text-[10px] text-[#FFF9EB]/80 sm:flex-row sm:text-xs">
            <p>&copy; {currentYear} DeRoma Store. All rights reserved.</p>
            <div className="flex items-center gap-3 font-medium text-[#FFF9EB]/80">
              <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
              <span>&bull;</span>
              <Link href="/terms" className="hover:text-white">Terms of Service</Link>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </footer>
  );
}
