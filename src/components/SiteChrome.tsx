"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import { SiteSettingsProvider } from "@/providers/SiteSettingsProvider";

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
  const chromeRef = useRef<HTMLDivElement>(null);
  const [chromeHeight, setChromeHeight] = useState(68);

  useEffect(() => {
    if (isAdmin) return;
    fetch("/api/announcement")
      .then((response) => response.ok ? response.json() : null)
      .then(setAnnouncement)
      .catch(() => null);
  }, [isAdmin]);

  useLayoutEffect(() => {
    const chrome = chromeRef.current;
    if (!chrome) return;

    const updateChromeHeight = () => setChromeHeight(Math.ceil(chrome.getBoundingClientRect().height));
    updateChromeHeight();

    const observer = new ResizeObserver(updateChromeHeight);
    observer.observe(chrome);
    return () => observer.disconnect();
  }, []);

  if (isAdmin) {
    return <div className="min-h-screen bg-[#f7f1e8] text-[#942E3A]">{children}</div>;
  }

  return (
    <SiteSettingsProvider>
      <div className="min-h-screen flex flex-col bg-[#FFF9EB] text-[#942E3A]">
        <div ref={chromeRef} className="fixed top-0 left-0 right-0 z-50 pointer-events-none flex flex-col" dir="ltr">
          {announcement && <AnnouncementBar announcement={announcement} />}
          <Navbar hasAnnouncement={!!announcement} />
        </div>
        <main className="flex-1" style={{ paddingTop: `${chromeHeight}px` }}>
          {children}
        </main>
        <Footer />
      </div>
    </SiteSettingsProvider>
  );
}

