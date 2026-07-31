"use client";

interface Announcement {
  text: string;
  backgroundColor: string;
  textColor: string;
  moving: boolean;
}

interface AnnouncementBarProps {
  announcement: Announcement;
}

export default function AnnouncementBar({ announcement }: AnnouncementBarProps) {
  return (
    <div
      className="w-full pointer-events-auto relative z-[60] overflow-hidden px-3 py-2.5 text-center text-[13px] font-bold tracking-wide shadow-xs"
      style={{ backgroundColor: announcement.backgroundColor, color: announcement.textColor }}
    >
      <div className={announcement.moving ? "whitespace-nowrap animate-[marquee_18s_linear_infinite]" : ""}>
        {announcement.text}
      </div>
    </div>
  );
}
