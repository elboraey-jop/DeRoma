"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { updateProductStatusAction } from "@/app/admin/products/actions";

const options = [
  { value: "active", label: "Active" },
  { value: "archived", label: "Archive" },
] as const;

function labelForStatus(status: string) {
  return status === "archived" ? "Archive" : status === "draft" ? "Draft" : "Active";
}

export default function AdminProductStatusSelect({
  productId,
  status,
  compact = false,
}: {
  productId: string;
  status: string;
  compact?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!isOpen) return;
    const updatePosition = () => {
      const button = buttonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const menuWidth = 168;
      const menuHeight = 126;
      const opensUp = rect.bottom + menuHeight > window.innerHeight - 12;
      setMenuStyle({
        left: Math.max(12, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 12)),
        top: opensUp ? Math.max(12, rect.top - menuHeight - 8) : rect.bottom + 8,
        width: menuWidth,
      });
    };
    updatePosition();
    const closeOnOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!buttonRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const chooseStatus = (nextStatus: string) => {
    const statusInput = formRef.current?.elements.namedItem("status");
    if (statusInput instanceof HTMLInputElement) statusInput.value = nextStatus;
    setIsOpen(false);
    if (nextStatus !== status) formRef.current?.requestSubmit();
  };

  return (
    <form ref={formRef} action={updateProductStatusAction} className="relative">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="status" value={status} />
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Update product status, currently ${labelForStatus(status)}`}
        className={`group inline-flex items-center justify-between rounded-full border border-[#D8B46A]/70 bg-[#FFF9EB] font-bold text-[#942E3A] shadow-[0_3px_10px_rgba(148,46,58,0.08)] outline-none transition-all hover:-translate-y-0.5 hover:border-[#942E3A] focus:ring-2 focus:ring-[#D8B46A]/50 ${compact ? "min-w-[72px] gap-1 px-2 py-1 text-[9px]" : "min-w-[92px] gap-1.5 px-2.5 py-1.5 text-[10px]"}`}
      >
        <span>{labelForStatus(status)}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-[#D8B46A] transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div
          ref={menuRef}
          role="listbox"
          aria-label="Available product statuses"
          style={menuStyle}
          className="fixed z-[100] overflow-hidden rounded-2xl border border-[#D8B46A]/45 bg-[#FFF9EB] p-2 shadow-[0_16px_40px_rgba(67,25,31,0.2)] ring-1 ring-[#942E3A]/5"
        >
          <div className="border-b border-[#942E3A]/10 px-3 pb-2 pt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#D8B46A]">
            Product visibility
          </div>
          <div className="mt-1 space-y-0.5">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === status}
                onClick={() => chooseStatus(option.value)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-bold transition-colors ${option.value === status ? "bg-[#942E3A] text-[#FFF9EB]" : "text-[#942E3A] hover:bg-[#F2DFC0]"}`}
              >
                <span>{option.label}</span>
                {option.value === status && <Check className="h-3.5 w-3.5 text-[#D8B46A]" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
