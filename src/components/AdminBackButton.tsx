"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface AdminBackButtonProps {
  fallbackHref?: string;
  className?: string;
  iconClassName?: string;
  ariaLabel?: string;
  children?: React.ReactNode;
}

export default function AdminBackButton({
  fallbackHref = "/admin",
  className = "rounded-xl border border-[#942E3A]/15 bg-white p-2 text-[#942E3A] transition hover:border-[#D8B46A] shadow-2xs shrink-0 print:hidden",
  iconClassName = "h-4 w-4",
  ariaLabel = "Back",
  children,
}: AdminBackButtonProps) {
  const router = useRouter();

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (
      typeof window !== "undefined" &&
      window.history.length > 1 &&
      document.referrer &&
      document.referrer.includes(window.location.host)
    ) {
      router.back();
    } else if (fallbackHref) {
      router.push(fallbackHref);
    } else {
      router.back();
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={className}
      aria-label={ariaLabel}
    >
      {children || <ArrowLeft className={iconClassName} />}
    </button>
  );
}
