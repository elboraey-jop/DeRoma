"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";

interface Announcement {
  text: string;
  backgroundColor: string;
  textColor: string;
  moving: boolean;
}

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    if (isAdmin) return;
    fetch("/api/announcement")
      .then((response) => response.ok ? response.json() : null)
      .then(setAnnouncement)
      .catch(() => null);
  }, [isAdmin]);

  if (isAdmin) {
    return <div className="min-h-screen bg-[#f7f1e8] text-[#942E3A]">{children}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9EB] text-[#942E3A]">
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none flex flex-col" dir="ltr">
        {announcement && <AnnouncementBar announcement={announcement} />}
        <Navbar hasAnnouncement={!!announcement} />
      </div>
      <main
        className={cn(
          "flex-1 transition-all duration-300",
          announcement ? "pt-[92px] sm:pt-[100px]" : "pt-[60px] sm:pt-[68px]"
        )}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
