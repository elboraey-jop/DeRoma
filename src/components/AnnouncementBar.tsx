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
  if (!announcement.moving) {
    return (
      <div
        className="w-full pointer-events-auto relative z-[60] overflow-hidden px-3 py-2.5 text-center text-[13px] font-bold tracking-wide shadow-xs"
        style={{ backgroundColor: announcement.backgroundColor, color: announcement.textColor }}
      >
        {announcement.text}
      </div>
    );
  }

  return (
    <div
      className="w-full pointer-events-auto relative z-[60] overflow-hidden py-2.5 text-[13px] font-bold tracking-wide shadow-xs select-none"
      style={{ backgroundColor: announcement.backgroundColor, color: announcement.textColor }}
    >
      <div className="flex w-max animate-[marquee_20s_linear_infinite]">
        {/* Copy 1 */}
        <div className="flex shrink-0 items-center gap-16 pr-16">
          <span>{announcement.text}</span>
          <span>{announcement.text}</span>
          <span>{announcement.text}</span>
        </div>
        {/* Copy 2 */}
        <div className="flex shrink-0 items-center gap-16 pr-16">
          <span>{announcement.text}</span>
          <span>{announcement.text}</span>
          <span>{announcement.text}</span>
        </div>
      </div>
    </div>
  );
}
