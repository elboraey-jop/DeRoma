"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <div className="min-h-screen bg-[#f7f1e8] text-[#942E3A]">{children}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9EB] text-[#942E3A]">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1 pt-[72px] sm:pt-[80px]">{children}</main>
      <Footer />
    </div>
  );
}
