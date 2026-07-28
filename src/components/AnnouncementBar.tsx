"use client";

import { useEffect, useState } from "react";

interface Announcement { text: string; backgroundColor: string; textColor: string; moving: boolean; }

export default function AnnouncementBar() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  useEffect(() => { fetch("/api/announcement").then((response) => response.ok ? response.json() : null).then(setAnnouncement).catch(() => null); }, []);
  if (!announcement) return null;
  return <div className="relative z-[60] overflow-hidden px-3 py-2 text-center text-[10px] font-bold tracking-wide" style={{ backgroundColor: announcement.backgroundColor, color: announcement.textColor }}><div className={announcement.moving ? "whitespace-nowrap animate-[marquee_18s_linear_infinite]" : ""}>{announcement.text}</div></div>;
}
