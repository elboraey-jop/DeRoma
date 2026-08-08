"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Tag,
  Megaphone,
  Plus,
  Search,
  Copy,
  Check,
  Trash2,
  Sparkles,
  TrendingUp,
  Percent,
  Truck,
  Calendar,
  Layers,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  X,
  Shuffle,
  AlertCircle,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useToast } from "@/providers/ToastProvider";
import {
  createPromotionAction,
  togglePromotionAction,
  deletePromotionAction,
  createAnnouncementAction,
  toggleAnnouncementAction,
  deleteAnnouncementAction,
} from "@/app/admin/promotions/actions";

export interface SerializedPromotion {
  id: string;
  code: string | null;
  name: string;
  type: string; // percentage, fixed, free_shipping
  value: number;
  scope: string; // order, category, product, color, material
  targetValue: string | null;
  minimumOrderValue: number | null;
  usageLimit: number | null;
  usedCount: number;
  startsAt: string | null;
  endsAt: string | null;
  active: boolean;
  createdAt: string;
}

export interface SerializedAnnouncementBar {
  id: string;
  text: string;
  backgroundColor: string;
  textColor: string;
  moving: boolean;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
}

const COLOR_PRESETS = [
  { name: "DeRoma Signature", bg: "#942E3A", text: "#FFF9EB" },
  { name: "Golden Luxury", bg: "#D8B46A", text: "#2C1018" },
  { name: "Midnight Elegance", bg: "#2C1018", text: "#FFF9EB" },
  { name: "Emerald Premium", bg: "#064E3B", text: "#ECFDF5" },
  { name: "Crimson Spark", bg: "#BE123C", text: "#FFFFFF" },
  { name: "Warm Olive", bg: "#3F6212", text: "#FEF08A" },
];

const STATUS_OPTIONS = [
  { id: "all", label: "All Statuses" },
  { id: "active", label: "Active Only" },
  { id: "paused", label: "Paused Only" },
  { id: "expired", label: "Expired Only" },
];

const TYPE_OPTIONS = [
  { id: "all", label: "All Types" },
  { id: "percentage", label: "Percentage (%)" },
  { id: "fixed", label: "Fixed Amount (EGP)" },
  { id: "free_shipping", label: "Free Shipping (🚚)" },
];

const SCOPE_OPTIONS = [
  { id: "all", label: "All Scopes" },
  { id: "order", label: "Entire Order" },
  { id: "category", label: "Category" },
  { id: "product", label: "Product" },
  { id: "color", label: "Color" },
  { id: "material", label: "Material" },
];

const FORM_TYPE_OPTIONS = [
  { id: "percentage", label: "Percentage (%)" },
  { id: "fixed", label: "Fixed Amount (EGP)" },
  { id: "free_shipping", label: "Free Shipping Rule (🚚)" },
];

const FORM_SCOPE_OPTIONS = [
  { id: "order", label: "Entire Order" },
  { id: "category", label: "Specific Category" },
];

const TARGET_CATEGORY_OPTIONS = [
  { id: "shoes", label: "Shoes" },
  { id: "perfumes", label: "Perfumes" },
  { id: "bags", label: "Bags" },
  { id: "accessories", label: "Accessories" },
];

// Reusable Custom Styled Select Dropdown
function CustomSelect({
  value,
  onChange,
  options,
  name,
  placeholder,
  className,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { id: string; label: string }[];
  name?: string;
  placeholder?: string;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selectedOption = options.find(
    (opt) => opt.id.toLowerCase() === value.toLowerCase()
  );
  const displayLabel = selectedOption?.label || placeholder || value;

  return (
    <div ref={ref} className="relative shrink-0 text-left">
      {name && <input type="hidden" name={name} value={value} />}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "group flex h-10 min-w-[130px] items-center justify-between gap-2 rounded-xl border border-[#942E3A]/15 bg-white px-3 py-2 text-xs font-bold text-[#942E3A] shadow-sm transition hover:border-[#D8B46A] hover:bg-[#FFF9EB]",
          isOpen && "border-[#D8B46A] bg-[#FFF9EB] ring-2 ring-[#D8B46A]/20",
          className
        )}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-[#D8B46A] transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 max-h-60 min-w-[160px] w-full overflow-y-auto rounded-2xl border border-[#D8B46A]/45 bg-[#FFF9EB] p-1.5 shadow-[0_16px_36px_rgba(67,25,31,0.18)] animate-in fade-in zoom-in-95">
          <div className="space-y-0.5">
            {options.map((opt) => {
              const isSelected = value.toLowerCase() === opt.id.toLowerCase();
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition",
                    isSelected
                      ? "bg-[#942E3A] text-[#FFF9EB] font-bold"
                      : "text-[#6B1F2A] hover:bg-[#F2DFC0]/60 hover:text-[#942E3A]"
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-[#D8B46A] shrink-0 ml-1.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Custom Time Select Dropdown for Hours & Minutes inside CustomDateTimePicker
function CustomTimeSelect({
  value,
  onChange,
  options,
}: {
  value: number;
  onChange: (val: number) => void;
  options: number[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && selectedRef.current) {
      selectedRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div ref={ref} className="relative flex-1 text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex h-7 w-full items-center justify-between gap-1 rounded-lg border border-[#942E3A]/20 bg-white px-2 text-[11px] font-bold text-[#942E3A] shadow-xs transition hover:border-[#D8B46A]",
          isOpen && "border-[#D8B46A] bg-[#FFF9EB]"
        )}
      >
        <span>{String(value).padStart(2, "0")}</span>
        <ChevronDown className={cn("h-3 w-3 text-[#D8B46A] transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onWheel={(e) => e.stopPropagation()}
          className="absolute bottom-[calc(100%+4px)] left-0 z-[100000] max-h-44 w-full overflow-y-auto overscroll-contain rounded-xl border border-[#D8B46A]/50 bg-[#FFF9EB] p-1 shadow-xl animate-in fade-in zoom-in-95 [&::-webkit-scrollbar]:hidden"
        >
          <div className="space-y-0.5">
            {options.map((opt) => {
              const isSelected = opt === value;
              return (
                <button
                  key={opt}
                  ref={isSelected ? selectedRef : undefined}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-[11px] transition",
                    isSelected
                      ? "bg-[#942E3A] text-[#FFF9EB] font-bold"
                      : "text-[#6B1F2A] hover:bg-[#F2DFC0]/60 hover:text-[#942E3A]"
                  )}
                >
                  <span>{String(opt).padStart(2, "0")}</span>
                  {isSelected && <Check className="h-3 w-3 text-[#D8B46A]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Custom DeRoma Date-Time Picker
function CustomDateTimePicker({
  name,
  value = "",
  onChange,
  placeholder = "Select date & time",
  className,
  align = "left",
  placement = "top",
}: {
  name: string;
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  className?: string;
  align?: "left" | "right";
  placement?: "top" | "bottom";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  });

  const [viewDate, setViewDate] = useState<Date>(() => selectedDate || new Date());
  const [hours, setHours] = useState<number>(() =>
    selectedDate ? selectedDate.getHours() % 12 || 12 : 12
  );
  const [minutes, setMinutes] = useState<number>(() =>
    selectedDate ? selectedDate.getMinutes() : 0
  );
  const [ampm, setAmPm] = useState<"AM" | "PM">((): "AM" | "PM" =>
    selectedDate && selectedDate.getHours() >= 12 ? "PM" : "AM"
  );

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setSelectedDate(d);
        setViewDate(d);
        const h = d.getHours();
        setHours(h % 12 || 12);
        setMinutes(d.getMinutes());
        setAmPm(h >= 12 ? "PM" : "AM");
      }
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  const formattedInputValue = useMemo(() => {
    if (!selectedDate) return "";
    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const dd = String(selectedDate.getDate()).padStart(2, "0");
    let h24 = hours % 12;
    if (ampm === "PM") h24 += 12;
    const hh = String(h24).padStart(2, "0");
    const min = String(minutes).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  }, [selectedDate, hours, minutes, ampm]);

  const displayString = useMemo(() => {
    if (!selectedDate) return "";
    let h24 = hours % 12;
    if (ampm === "PM") h24 += 12;
    const d = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      h24,
      minutes
    );
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }, [selectedDate, hours, minutes, ampm]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonthDays = Array.from(
    { length: firstDayOfMonth },
    (_, i) => daysInPrevMonth - firstDayOfMonth + i + 1
  );

  const currentDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const totalCells = prevMonthDays.length + currentDays.length;
  const nextMonthDaysCount = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  const nextMonthDays = Array.from({ length: nextMonthDaysCount }, (_, i) => i + 1);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const handleSelectDay = (day: number) => {
    const newD = new Date(year, month, day);
    setSelectedDate(newD);
    if (onChange) {
      let h24 = hours % 12;
      if (ampm === "PM") h24 += 12;
      const yyyy = newD.getFullYear();
      const mm = String(newD.getMonth() + 1).padStart(2, "0");
      const dd = String(newD.getDate()).padStart(2, "0");
      const hh = String(h24).padStart(2, "0");
      const min = String(minutes).padStart(2, "0");
      onChange(`${yyyy}-${mm}-${dd}T${hh}:${min}`);
    }
  };

  const handleClear = () => {
    setSelectedDate(null);
    if (onChange) onChange("");
    setIsOpen(false);
  };

  const handleSetToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setViewDate(today);
    setHours(today.getHours() % 12 || 12);
    setMinutes(today.getMinutes());
    setAmPm(today.getHours() >= 12 ? "PM" : "AM");
  };

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return (
    <div ref={containerRef} className="relative text-left">
      <input type="hidden" name={name} value={formattedInputValue} />

      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "group flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-[#942E3A]/15 bg-white px-3 py-2 text-xs text-[#942E3A] shadow-sm transition hover:border-[#D8B46A] hover:bg-[#FFF9EB]",
          isOpen && "border-[#D8B46A] bg-[#FFF9EB] ring-2 ring-[#D8B46A]/20",
          className
        )}
      >
        <div className="flex items-center gap-2 truncate">
          <Calendar className="h-4 w-4 shrink-0 text-[#D8B46A]" />
          <span
            className={cn(
              "truncate font-semibold",
              !selectedDate && "text-[#6B1F2A]/40 font-normal"
            )}
          >
            {displayString || placeholder}
          </span>
        </div>
        {selectedDate ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="rounded-full p-0.5 text-stone-400 hover:bg-[#942E3A]/10 hover:text-[#942E3A]"
          >
            <X className="h-3.5 w-3.5" />
          </span>
        ) : (
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-[#D8B46A] transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        )}
      </button>

      {isOpen && (
        <div
          onWheel={(e) => e.stopPropagation()}
          className={cn(
            "absolute z-50 w-[260px] overflow-hidden overscroll-contain rounded-2xl border border-[#D8B46A]/50 bg-[#FFF9EB] p-3 shadow-[0_20px_50px_rgba(67,25,31,0.3)] animate-in fade-in zoom-in-95",
            placement === "top" ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          <div className="flex items-center justify-between border-b border-[#942E3A]/10 pb-2">
            <h4 className="font-playfair text-xs font-black text-[#942E3A]">
              {monthNames[month]} {year}
            </h4>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="rounded-md px-1.5 py-0.5 font-bold text-[#942E3A] hover:bg-[#942E3A]/10 transition text-xs"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="rounded-md px-1.5 py-0.5 font-bold text-[#942E3A] hover:bg-[#942E3A]/10 transition text-xs"
              >
                ›
              </button>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-7 text-center text-[9px] font-bold uppercase tracking-wider text-[#D8B46A]">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          <div className="mt-1 grid grid-cols-7 gap-0.5 text-center text-[10px]">
            {prevMonthDays.map((d) => (
              <span key={`prev-${d}`} className="p-1 text-stone-300 font-light">
                {d}
              </span>
            ))}

            {currentDays.map((d) => {
              const isSelected =
                selectedDate &&
                selectedDate.getDate() === d &&
                selectedDate.getMonth() === month &&
                selectedDate.getFullYear() === year;

              const isToday =
                new Date().getDate() === d &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

              return (
                <button
                  key={`curr-${d}`}
                  type="button"
                  onClick={() => handleSelectDay(d)}
                  className={cn(
                    "h-6 w-6 mx-auto flex items-center justify-center rounded-lg text-[10px] font-semibold transition",
                    isSelected
                      ? "bg-[#942E3A] text-[#FFF9EB] font-bold ring-1 ring-[#D8B46A] shadow-xs"
                      : isToday
                      ? "border border-[#942E3A] text-[#942E3A] font-bold"
                      : "text-[#6B1F2A] hover:bg-[#D8B46A]/20 hover:text-[#942E3A]"
                  )}
                >
                  {d}
                </button>
              );
            })}

            {nextMonthDays.map((d) => (
              <span key={`next-${d}`} className="p-1 text-stone-300 font-light">
                {d}
              </span>
            ))}
          </div>

          <div className="mt-3 border-t border-[#942E3A]/10 pt-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#6B1F2A]/80 mb-1">
              <span>Time</span>
              <span className="font-mono text-[#942E3A]">
                {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")} {ampm}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <CustomTimeSelect
                value={hours}
                onChange={setHours}
                options={Array.from({ length: 12 }, (_, i) => i + 1)}
              />

              <span className="font-bold text-[#942E3A] text-xs">:</span>

              <CustomTimeSelect
                value={minutes}
                onChange={setMinutes}
                options={Array.from({ length: 60 }, (_, i) => i)}
              />

              <div className="flex items-center rounded-lg border border-[#942E3A]/20 bg-white p-0.5">
                <button
                  type="button"
                  onClick={() => setAmPm("AM")}
                  className={cn(
                    "rounded-md px-1.5 py-0.5 text-[9px] font-bold transition",
                    ampm === "AM" ? "bg-[#942E3A] text-[#FFF9EB]" : "text-[#6B1F2A]/60"
                  )}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => setAmPm("PM")}
                  className={cn(
                    "rounded-md px-1.5 py-0.5 text-[9px] font-bold transition",
                    ampm === "PM" ? "bg-[#942E3A] text-[#FFF9EB]" : "text-[#6B1F2A]/60"
                  )}
                >
                  PM
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-[#942E3A]/10 pt-2 text-[11px]">
            <button
              type="button"
              onClick={handleClear}
              className="font-bold text-stone-400 hover:text-stone-600"
            >
              Clear
            </button>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSetToday}
                className="rounded-lg border border-[#942E3A]/20 px-2.5 py-0.5 font-bold text-[#942E3A] hover:bg-[#D8B46A]/20 text-[10px]"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!selectedDate) setSelectedDate(new Date());
                  setIsOpen(false);
                }}
                className="rounded-lg bg-[#942E3A] px-3 py-0.5 font-bold text-[#FFF9EB] shadow-xs hover:bg-[#802832] text-[10px]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Custom Color Picker Dropdown with Palette Swatches and Hex Input
const PALETTE_SWATCHES = [
  { name: "DeRoma Burgundy", hex: "#942E3A" },
  { name: "Gold", hex: "#D8B46A" },
  { name: "Warm Cream", hex: "#FFF9EB" },
  { name: "Dark Chocolate", hex: "#2C1018" },
  { name: "Emerald Green", hex: "#064E3B" },
  { name: "Mint", hex: "#ECFDF5" },
  { name: "Crimson Rose", hex: "#BE123C" },
  { name: "Pure White", hex: "#FFFFFF" },
  { name: "Midnight Black", hex: "#18181B" },
  { name: "Royal Blue", hex: "#1E3A8A" },
  { name: "Deep Violet", hex: "#581C87" },
  { name: "Amber Orange", hex: "#D97706" },
];

function CustomColorPicker({
  name,
  value,
  onChange,
  label,
}: {
  name: string;
  value: string;
  onChange: (val: string) => void;
  label: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHexInput(value);
  }, [value]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleApplyHex = (val: string) => {
    let clean = val.trim();
    if (!clean.startsWith("#")) {
      clean = `#${clean}`;
    }
    if (/^#[0-9A-Fa-f]{6}$/.test(clean) || /^#[0-9A-Fa-f]{3}$/.test(clean)) {
      onChange(clean.toUpperCase());
    }
  };

  return (
    <div ref={containerRef} className="relative text-left">
      <input type="hidden" name={name} value={value} />

      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/70">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "group flex h-10 w-full items-center justify-between gap-1.5 rounded-xl sm:rounded-2xl border border-[#942E3A]/15 bg-white p-2 shadow-xs transition hover:border-[#D8B46A] hover:bg-[#FFF9EB]",
          isOpen && "border-[#D8B46A] bg-[#FFF9EB] ring-2 ring-[#D8B46A]/20"
        )}
      >
        <div className="flex items-center gap-1.5 truncate">
          <div
            className="h-5 w-5 shrink-0 rounded-lg sm:rounded-xl border border-black/15 shadow-inner transition-transform group-hover:scale-105"
            style={{ backgroundColor: value }}
          />
          <span className="font-mono text-[11px] font-bold text-[#942E3A] uppercase tracking-wider truncate">
            {value}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-[#D8B46A] transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-64 overflow-hidden rounded-3xl border border-[#D8B46A]/50 bg-[#FFF9EB] p-4 shadow-[0_20px_45px_rgba(67,25,31,0.22)] animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-[#942E3A]/10 pb-2 mb-3">
            <span className="font-playfair text-xs font-black text-[#942E3A]">
              Color Palette & Hex
            </span>
            <div className="flex items-center gap-1.5">
              <div
                className="h-4 w-4 rounded-full border border-black/10"
                style={{ backgroundColor: value }}
              />
              <span className="font-mono text-[10px] font-bold text-[#942E3A]">
                {value}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-6 gap-1.5 mb-3">
            {PALETTE_SWATCHES.map((swatch) => (
              <button
                key={swatch.hex}
                type="button"
                title={swatch.name}
                onClick={() => {
                  onChange(swatch.hex);
                  setHexInput(swatch.hex);
                }}
                className={cn(
                  "h-7 w-7 rounded-xl border border-black/15 shadow-xs transition hover:scale-110 flex items-center justify-center",
                  value.toUpperCase() === swatch.hex.toUpperCase() &&
                    "ring-2 ring-[#942E3A] scale-105"
                )}
                style={{ backgroundColor: swatch.hex }}
              >
                {value.toUpperCase() === swatch.hex.toUpperCase() && (
                  <Check
                    className={cn(
                      "h-3 w-3",
                      ["#FFF9EB", "#FFFFFF", "#ECFDF5"].includes(swatch.hex)
                        ? "text-[#942E3A]"
                        : "text-white"
                    )}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="border-t border-[#942E3A]/10 pt-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono text-[#942E3A]">#</span>
              <input
                type="text"
                value={hexInput.replace(/^#/, "")}
                onChange={(e) => {
                  const val = `#${e.target.value}`;
                  setHexInput(val);
                  handleApplyHex(val);
                }}
                placeholder="942E3A"
                maxLength={6}
                className="flex-1 rounded-xl border border-[#942E3A]/20 bg-white px-2.5 py-1.5 text-xs font-mono font-bold text-[#942E3A] uppercase outline-none focus:border-[#942E3A]"
              />
              <button
                type="button"
                onClick={() => colorInputRef.current?.click()}
                className="rounded-xl border border-[#942E3A]/20 bg-white p-1.5 text-xs font-bold text-[#942E3A] hover:bg-[#D8B46A]/20 transition"
                title="Custom Color Spectrum Picker"
              >
                🎨
              </button>
              <input
                ref={colorInputRef}
                type="color"
                value={value}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  onChange(val);
                  setHexInput(val);
                }}
                className="sr-only"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPromotionsClient({
  promotions,
  announcements,
}: {
  promotions: SerializedPromotion[];
  announcements: SerializedAnnouncementBar[];
}) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"promos" | "announcements">("promos");

  // Tab 1: Promo Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused" | "expired">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [scopeFilter, setScopeFilter] = useState<string>("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modals / Drawers State
  const [isCreatePromoOpen, setIsCreatePromoOpen] = useState(false);
  const [codeValue, setCodeValue] = useState("");
  const [formType, setFormType] = useState("percentage");
  const [formValue, setFormValue] = useState("20");
  const [formScope, setFormScope] = useState("order");
  const [formTargetCategory, setFormTargetCategory] = useState("shoes");

  const handleGenerateCode = () => {
    const prefix =
      formType === "free_shipping"
        ? "FREESHIP"
        : formType === "percentage"
        ? "SAVE"
        : "OFF";
    const num = Math.floor(10 + Math.random() * 90);
    setCodeValue(`${prefix}${num}`);
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteAnnouncementId, setDeleteAnnouncementId] = useState<string | null>(null);

  // Tab 2: Announcement Form State (for live preview)
  const activeAnnouncement = announcements.find((a) => a.active);
  const [previewText, setPreviewText] = useState(
    activeAnnouncement?.text || "Free shipping on orders over 2,500 EGP | Code: FREESHIP"
  );
  const [previewBg, setPreviewBg] = useState(activeAnnouncement?.backgroundColor || "#942E3A");
  const [previewTextColor, setPreviewTextColor] = useState(activeAnnouncement?.textColor || "#FFF9EB");
  const [previewMoving, setPreviewMoving] = useState(activeAnnouncement?.moving || false);

  // Copy code helper
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Promo code "${code}" copied!`, "COPIED");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Calculated Stats
  const activePromosCount = useMemo(
    () => promotions.filter((p) => p.active).length,
    [promotions]
  );
  const totalRedemptions = useMemo(
    () => promotions.reduce((sum, p) => sum + p.usedCount, 0),
    [promotions]
  );

  // Filtered Promotions
  const filteredPromotions = useMemo(() => {
    const now = new Date();
    return promotions.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.code && p.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.targetValue && p.targetValue.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesStatus = true;
      const isExpired = p.endsAt ? new Date(p.endsAt) < now : false;

      if (statusFilter === "active") {
        matchesStatus = p.active && !isExpired;
      } else if (statusFilter === "paused") {
        matchesStatus = !p.active;
      } else if (statusFilter === "expired") {
        matchesStatus = isExpired;
      }

      const matchesType = typeFilter === "all" || p.type === typeFilter;
      const matchesScope = scopeFilter === "all" || p.scope === scopeFilter;

      return matchesSearch && matchesStatus && matchesType && matchesScope;
    });
  }, [promotions, searchQuery, statusFilter, typeFilter, scopeFilter]);

  return (
    <div className="w-full min-w-0 max-w-full space-y-4 sm:space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 min-w-0">
        <div className="min-w-0">
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">
            Growth & Marketing
          </p>
          <h1 className="mt-0.5 sm:mt-1 font-playfair text-2xl sm:text-3xl font-black text-[#942E3A] truncate">
            Promotions & Announcements
          </h1>
          <p className="mt-1 hidden sm:block text-xs text-[#6B1F2A]/65">
            Manage coupon codes, targeted discounts, free shipping rules, and storefront top bar banners.
          </p>
        </div>

        {/* Primary Action Button */}
        {activeTab === "promos" ? (
          <button
            type="button"
            onClick={() => setIsCreatePromoOpen(true)}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#942E3A] px-3 py-2 text-[11px] font-bold text-[#FFF9EB] shadow-xs transition hover:bg-[#802832] shrink-0 sm:px-5 sm:py-3 sm:text-xs sm:rounded-2xl"
          >
            <Plus className="h-3.5 w-3.5 text-[#D8B46A] sm:h-4 sm:w-4" />
            <span>Create Promo</span>
          </button>
        ) : null}
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4 min-w-0">
        <div className="rounded-xl border border-[#942E3A]/10 bg-white p-3 shadow-xs sm:rounded-2xl sm:p-4 min-w-0">
          <div className="flex items-center justify-between min-w-0">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/55 truncate">
              Total Rules
            </p>
            <Tag className="h-4 w-4 text-[#D8B46A] shrink-0 ml-1" />
          </div>
          <p className="mt-1 font-playfair text-xl sm:text-2xl font-black text-[#942E3A] truncate">
            {promotions.length}
          </p>
        </div>

        <div className="rounded-xl border border-[#942E3A]/10 bg-white p-3 shadow-xs sm:rounded-2xl sm:p-4 min-w-0">
          <div className="flex items-center justify-between min-w-0">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/55 truncate">
              Active Codes
            </p>
            <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 ml-1" />
          </div>
          <p className="mt-1 font-playfair text-xl sm:text-2xl font-black text-emerald-700 truncate">
            {activePromosCount}
          </p>
        </div>

        <div className="rounded-xl border border-[#942E3A]/10 bg-white p-3 shadow-xs sm:rounded-2xl sm:p-4 min-w-0">
          <div className="flex items-center justify-between min-w-0">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/55 truncate">
              Total Redemptions
            </p>
            <TrendingUp className="h-4 w-4 text-[#942E3A] shrink-0 ml-1" />
          </div>
          <p className="mt-1 font-playfair text-xl sm:text-2xl font-black text-[#942E3A] truncate">
            {totalRedemptions.toLocaleString("en-US")}
          </p>
        </div>

        <div className="rounded-xl border border-[#D8B46A]/40 bg-[#fff7df] p-3 shadow-xs sm:rounded-2xl sm:p-4 min-w-0">
          <div className="flex items-center justify-between min-w-0">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/55 truncate">
              Top Bar Status
            </p>
            <Megaphone className="h-4 w-4 text-[#942E3A] shrink-0 ml-1" />
          </div>
          <div className="mt-1 flex items-center gap-1.5 min-w-0">
            <span
              className={cn(
                "h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full shrink-0",
                activeAnnouncement ? "bg-emerald-500 animate-pulse" : "bg-stone-400"
              )}
            />
            <span className="font-playfair text-xs sm:text-sm font-black text-[#942E3A] truncate">
              {activeAnnouncement ? "Active Banner" : "Disabled"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="flex items-center justify-between border-b border-[#942E3A]/15 pb-3 min-w-0">
        <div className="grid grid-cols-2 w-full sm:w-auto sm:flex sm:items-center gap-1.5 sm:gap-2 rounded-2xl border border-[#942E3A]/15 bg-[#FFF9EB] p-1.5 shadow-inner min-w-0">
          <button
            type="button"
            onClick={() => setActiveTab("promos")}
            className={cn(
              "flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-2.5 py-2 text-xs font-bold transition-all truncate min-w-0",
              activeTab === "promos"
                ? "bg-[#942E3A] text-[#FFF9EB] shadow-md"
                : "text-[#942E3A]/70 hover:bg-[#942E3A]/10 hover:text-[#942E3A]"
            )}
          >
            <Tag className="h-3.5 w-3.5 text-[#D8B46A] shrink-0" />
            <span className="truncate">Coupons</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-black shrink-0",
                activeTab === "promos"
                  ? "bg-[#FFF9EB] text-[#942E3A]"
                  : "bg-[#942E3A]/15 text-[#942E3A]"
              )}
            >
              {promotions.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("announcements")}
            className={cn(
              "flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-2.5 py-2 text-xs font-bold transition-all truncate min-w-0",
              activeTab === "announcements"
                ? "bg-[#942E3A] text-[#FFF9EB] shadow-md"
                : "text-[#942E3A]/70 hover:bg-[#942E3A]/10 hover:text-[#942E3A]"
            )}
          >
            <Megaphone className="h-3.5 w-3.5 text-[#D8B46A] shrink-0" />
            <span className="truncate">Announcement Bar</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-black shrink-0",
                activeTab === "announcements"
                  ? "bg-[#FFF9EB] text-[#942E3A]"
                  : "bg-[#942E3A]/15 text-[#942E3A]"
              )}
            >
              {announcements.length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PROMO CODES & DISCOUNTS */}
      {/* ========================================================================= */}
      {activeTab === "promos" && (
        <div className="space-y-5 animate-in fade-in duration-200 min-w-0 w-full max-w-full">
          {/* Controls Bar: Search & Custom Filter Dropdowns */}
          <div className="flex flex-col gap-3 rounded-3xl border border-[#942E3A]/10 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between min-w-0">
            {/* Search Input */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B1F2A]/40" />
              <input
                type="text"
                placeholder="Search by code, promotion name, or target..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-[#942E3A]/15 bg-[#FFF9EB]/40 pl-10 pr-4 py-2.5 text-xs text-[#942E3A] placeholder-[#6B1F2A]/40 outline-none transition focus:border-[#942E3A] focus:bg-white focus:ring-2 focus:ring-[#942E3A]/10"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#6B1F2A]/50 hover:bg-[#942E3A]/10"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Custom Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <CustomSelect
                value={statusFilter}
                onChange={(val) => setStatusFilter(val as any)}
                options={STATUS_OPTIONS}
              />

              <CustomSelect
                value={typeFilter}
                onChange={setTypeFilter}
                options={TYPE_OPTIONS}
              />

              <CustomSelect
                value={scopeFilter}
                onChange={setScopeFilter}
                options={SCOPE_OPTIONS}
              />
            </div>
          </div>

          {/* Promo Rules Ledger Grid / List */}
          {filteredPromotions.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
              {filteredPromotions.map((promo) => {
                const now = new Date();
                const isExpired = promo.endsAt ? new Date(promo.endsAt) < now : false;

                return (
                  <div
                    key={promo.id}
                    className={cn(
                      "group relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-white p-5 shadow-sm transition-all hover:shadow-md min-w-0 max-w-full",
                      promo.active && !isExpired
                        ? "border-[#942E3A]/15 hover:border-[#942E3A]/40"
                        : "border-stone-200 bg-stone-50/50 opacity-80"
                    )}
                  >
                    <div>
                      {/* Card Header: Code Badge & Status */}
                      <div className="flex items-start justify-between gap-2 min-w-0">
                        <div className="min-w-0">
                          {promo.code ? (
                            <button
                              type="button"
                              onClick={() => handleCopyCode(promo.code!)}
                              title="Click to copy code"
                              className="group/code inline-flex items-center gap-1.5 rounded-xl border border-[#D8B46A]/40 bg-[#FFF9EB] px-3 py-1 text-xs font-black tracking-wide text-[#942E3A] transition hover:bg-[#942E3A] hover:text-[#FFF9EB] truncate"
                            >
                              <span className="truncate">{promo.code}</span>
                              {copiedCode === promo.code ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <Copy className="h-3.5 w-3.5 opacity-60 group-hover/code:opacity-100 shrink-0" />
                              )}
                            </button>
                          ) : (
                            <span className="inline-block rounded-xl border border-stone-200 bg-stone-100 px-3 py-1 text-xs font-bold text-stone-500 truncate">
                              Automatic Discount
                            </span>
                          )}
                        </div>

                        {/* Status Toggle Form */}
                        <form action={togglePromotionAction} className="shrink-0">
                          <input type="hidden" name="id" value={promo.id} />
                          <input type="hidden" name="active" value={String(promo.active)} />
                          <button
                            type="submit"
                            className={cn(
                              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold transition",
                              isExpired
                                ? "bg-rose-100 text-rose-700"
                                : promo.active
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                : "bg-stone-200 text-stone-600 hover:bg-stone-300"
                            )}
                          >
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full shrink-0",
                                isExpired
                                  ? "bg-rose-500"
                                  : promo.active
                                  ? "bg-emerald-500"
                                  : "bg-stone-400"
                              )}
                            />
                            {isExpired ? "Expired" : promo.active ? "Active" : "Paused"}
                          </button>
                        </form>
                      </div>

                      {/* Promo Title & Main Value */}
                      <div className="mt-4 min-w-0">
                        <h3 className="font-playfair text-lg font-black text-[#942E3A] truncate">
                          {promo.name}
                        </h3>
                        <div className="mt-1 flex items-center gap-2 min-w-0">
                          <span className="font-playfair text-2xl font-black text-[#942E3A] truncate">
                            {promo.type === "percentage"
                              ? `${promo.value}% OFF`
                              : promo.type === "fixed"
                              ? `${formatCurrency(promo.value)} OFF`
                              : "Free Shipping 🚚"}
                          </span>
                        </div>
                      </div>

                      {/* Target & Scope Details */}
                      <div className="mt-3 space-y-1.5 text-xs text-[#6B1F2A]/75 border-t border-[#942E3A]/10 pt-3 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Layers className="h-3.5 w-3.5 text-[#D8B46A] shrink-0" />
                          <span className="capitalize truncate">
                            Applies to: <strong>{promo.scope}</strong>
                            {promo.targetValue ? ` (${promo.targetValue})` : ""}
                          </span>
                        </div>

                        {promo.minimumOrderValue ? (
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Tag className="h-3.5 w-3.5 text-[#D8B46A] shrink-0" />
                            <span className="truncate">
                              Min order: <strong>{formatCurrency(promo.minimumOrderValue)}</strong>
                            </span>
                          </div>
                        ) : null}
                      </div>

                      {/* Usage Limit Progress */}
                      {promo.usageLimit ? (
                        <div className="mt-3 space-y-1 min-w-0">
                          <div className="flex items-center justify-between text-[10px] font-bold text-[#6B1F2A]/65 min-w-0">
                            <span>Usage Limit</span>
                            <span>
                              {promo.usedCount} / {promo.usageLimit} uses
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#FFF9EB] border border-[#D8B46A]/20">
                            <div
                              className="h-full bg-[#942E3A] transition-all"
                              style={{
                                width: `${Math.min(
                                  100,
                                  (promo.usedCount / promo.usageLimit) * 100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="mt-2 text-[10px] text-[#6B1F2A]/55 truncate">
                          Total Redemptions: <strong>{promo.usedCount}</strong> (Unlimited uses)
                        </p>
                      )}
                    </div>

                    {/* Footer: Date Schedule & Actions */}
                    <div className="mt-4 flex items-center justify-between border-t border-[#942E3A]/10 pt-3 text-[10px] text-[#6B1F2A]/60 min-w-0">
                      <div className="flex items-center gap-1 min-w-0">
                        <Calendar className="h-3 w-3 text-[#D8B46A] shrink-0" />
                        <span className="truncate">
                          {promo.endsAt
                            ? `Ends ${new Date(promo.endsAt).toLocaleDateString("en-US")}`
                            : "No expiration"}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(promo.id)}
                        className="rounded-lg p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition shrink-0"
                        title="Delete promotion"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-[#942E3A]/10 bg-white p-12 text-center shadow-sm min-w-0">
              <Tag className="mx-auto h-10 w-10 text-[#D8B46A]/60" />
              <h3 className="mt-3 font-playfair text-lg font-bold text-[#942E3A]">
                No Promotions Found
              </h3>
              <p className="mt-1 text-xs text-[#6B1F2A]/60">
                {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                  ? "Try clearing filters to see all coupon codes."
                  : "Start creating promo codes to drive customer sales."}
              </p>
              <button
                type="button"
                onClick={() => setIsCreatePromoOpen(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[#942E3A] px-4 py-2.5 text-xs font-bold text-[#FFF9EB] shadow-md transition hover:bg-[#802832]"
              >
                <Plus className="h-4 w-4 text-[#D8B46A]" />
                Create First Promo Code
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: STOREFRONT ANNOUNCEMENT BAR */}
      {/* ========================================================================= */}
      {activeTab === "announcements" && (
        <div className="w-full min-w-0 max-w-full space-y-4 sm:space-y-6 animate-in fade-in duration-200">
          {/* Top Live Preview Card */}
          <div className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-[#D8B46A]/35 bg-[#fff7df] p-3.5 shadow-xs sm:rounded-3xl sm:p-5">
            <div className="flex items-center justify-between mb-2 sm:mb-3 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <Eye className="h-4 w-4 text-[#942E3A] shrink-0" />
                <h3 className="font-playfair text-sm sm:text-base font-bold text-[#942E3A] truncate">
                  Live Storefront Preview
                </h3>
              </div>
              <span className="hidden sm:block text-[10px] font-bold text-[#6B1F2A]/60 shrink-0">
                Interactive real-time preview
              </span>
            </div>

            {/* Dynamic Storefront Banner Bar */}
            <div
              className="relative w-full min-w-0 max-w-full overflow-hidden rounded-xl px-3 py-2.5 text-center text-xs font-semibold shadow-xs transition-all duration-300 sm:px-4 sm:py-3"
              style={{ backgroundColor: previewBg, color: previewTextColor }}
            >
              {previewMoving ? (
                <div className="whitespace-nowrap animate-marquee">
                  <span>{previewText}</span>
                </div>
              ) : (
                <span className="block truncate sm:whitespace-normal">{previewText}</span>
              )}
            </div>
          </div>

          <div className="grid w-full min-w-0 max-w-full gap-4 lg:grid-cols-12 sm:gap-6">
            {/* Left: Create / Edit Form (7 cols) */}
            <div className="w-full min-w-0 max-w-full lg:col-span-7 rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-xs sm:rounded-3xl sm:p-6">
              <div className="flex items-center gap-2 border-b border-[#942E3A]/10 pb-3 sm:pb-4 min-w-0">
                <Megaphone className="h-4 w-4 sm:h-5 sm:w-5 text-[#D8B46A] shrink-0" />
                <div className="min-w-0">
                  <h2 className="font-playfair text-lg sm:text-xl font-bold text-[#942E3A] truncate">
                    Publish Announcement
                  </h2>
                  <p className="text-[11px] text-[#6B1F2A]/65 sm:text-xs truncate">
                    Only one banner is active on the storefront at a time.
                  </p>
                </div>
              </div>

              <form action={createAnnouncementAction} className="mt-4 space-y-4 sm:mt-5 w-full min-w-0 max-w-full">
                {/* Announcement Message */}
                <div className="min-w-0">
                  <label className="mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/70">
                    Banner Text Message *
                  </label>
                  <textarea
                    name="text"
                    required
                    rows={2}
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    placeholder="e.g. Free delivery on orders over 2500 EGP | Code: FREESHIP"
                    className="w-full min-w-0 max-w-full rounded-xl sm:rounded-2xl border border-[#942E3A]/15 bg-[#FFF9EB]/40 p-2.5 text-xs text-[#942E3A] outline-none transition focus:border-[#942E3A] focus:bg-white focus:ring-2 focus:ring-[#942E3A]/10"
                  />
                </div>

                {/* Preset Themes Selector */}
                <div className="min-w-0">
                  <label className="mb-1.5 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/70">
                    Aesthetic Theme Presets
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-2 min-w-0">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setPreviewBg(preset.bg);
                          setPreviewTextColor(preset.text);
                        }}
                        className="flex items-center gap-1.5 rounded-xl border border-[#942E3A]/10 p-1.5 text-left text-[10px] sm:p-2 sm:text-[11px] transition hover:border-[#D8B46A] hover:shadow-xs min-w-0"
                      >
                        <div
                          className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/10 sm:h-4 sm:w-4"
                          style={{ backgroundColor: preset.bg }}
                        />
                        <span className="truncate font-semibold text-[#942E3A]">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Color Pickers */}
                <div className="grid grid-cols-2 gap-1.5 sm:gap-3 pt-1 min-w-0">
                  <CustomColorPicker
                    name="backgroundColor"
                    label="Background Color"
                    value={previewBg}
                    onChange={setPreviewBg}
                  />
                  <CustomColorPicker
                    name="textColor"
                    label="Text Color"
                    value={previewTextColor}
                    onChange={setPreviewTextColor}
                  />
                </div>

                {/* Moving Ticker Checkbox */}
                <div className="rounded-xl sm:rounded-2xl border border-[#942E3A]/10 bg-[#FFF9EB]/50 p-3 min-w-0">
                  <label className="flex items-start gap-2.5 cursor-pointer min-w-0">
                    <input
                      type="checkbox"
                      name="moving"
                      checked={previewMoving}
                      onChange={(e) => setPreviewMoving(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-[#942E3A] shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#942E3A] block truncate">
                        Enable Moving Marquee Ticker
                      </span>
                      <p className="text-[10px] text-[#6B1F2A]/60 leading-tight">
                        Makes the banner message continuously slide across the top bar.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Date Schedule (Custom DeRoma Date-Time Pickers) */}
                <div className="grid grid-cols-2 gap-1.5 sm:gap-3 min-w-0">
                  <div className="min-w-0">
                    <label className="mb-1 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/70 truncate">
                      Starts At (Optional)
                    </label>
                    <CustomDateTimePicker
                      name="startsAt"
                      placeholder="Start date & time"
                      align="left"
                    />
                  </div>
                  <div className="min-w-0">
                    <label className="mb-1 block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/70 truncate">
                      Ends At (Optional)
                    </label>
                    <CustomDateTimePicker
                      name="endsAt"
                      placeholder="End date & time"
                      align="right"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl sm:rounded-2xl bg-[#942E3A] py-3 text-xs font-bold text-[#FFF9EB] shadow-md transition hover:bg-[#802832] active:scale-95"
                >
                  Publish Announcement Banner
                </button>
              </form>
            </div>

            {/* Right: Announcement History Log (5 cols) */}
            <div className="w-full min-w-0 max-w-full lg:col-span-5 rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-xs sm:rounded-3xl sm:p-6">
              <h3 className="font-playfair text-base sm:text-lg font-bold text-[#942E3A] border-b border-[#942E3A]/10 pb-2.5 sm:pb-3 truncate">
                Banner History & Drafts
              </h3>

              <div className="mt-3 space-y-2.5 sm:mt-4 sm:space-y-3 max-h-[520px] overflow-y-auto pr-1 min-w-0">
                {announcements.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "rounded-xl sm:rounded-2xl border p-3 transition min-w-0 max-w-full overflow-hidden",
                      item.active
                        ? "border-emerald-300 bg-emerald-50/40 ring-1 ring-emerald-300"
                        : "border-stone-200 bg-white hover:bg-stone-50"
                    )}
                  >
                    <div
                      className="w-full min-w-0 max-w-full rounded-lg px-2.5 py-1.5 text-xs font-semibold shadow-xs truncate"
                      style={{
                        backgroundColor: item.backgroundColor,
                        color: item.textColor,
                      }}
                    >
                      {item.text}
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[10px] min-w-0">
                      <span className="text-stone-500 truncate">
                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>

                      <div className="flex items-center gap-1.5 shrink-0 ml-1">
                        {/* Toggle Active Switch */}
                        <form action={toggleAnnouncementAction}>
                          <input type="hidden" name="id" value={item.id} />
                          <input type="hidden" name="active" value={String(item.active)} />
                          <button
                            type="submit"
                            className={cn(
                              "rounded-full px-2 py-0.5 font-bold transition text-[9px] sm:text-[10px]",
                              item.active
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                            )}
                          >
                            {item.active ? "Active" : "Re-activate"}
                          </button>
                        </form>

                        <button
                          type="button"
                          onClick={() => setDeleteAnnouncementId(item.id)}
                          className="text-stone-400 hover:text-rose-600 transition p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {announcements.length === 0 && (
                  <p className="py-8 text-center text-xs text-stone-400">
                    No announcement history yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE NEW PROMO CODE */}
      {/* ========================================================================= */}
      {isCreatePromoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2c1018]/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-[#D8B46A]/40 bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#942E3A]/10 pb-4">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-[#D8B46A]" />
                <h2 className="font-playfair text-xl font-bold text-[#942E3A]">
                  Create New Promo Rule
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatePromoOpen(false)}
                className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              action={async (formData) => {
                await createPromotionAction(formData);
                setIsCreatePromoOpen(false);
              }}
              className="mt-5 space-y-4 max-h-[75vh] overflow-y-auto pr-1"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/70">
                    Promo Name *
                  </label>
                  <input
                    required
                    name="name"
                    placeholder="e.g. Summer Flash Sale"
                    className="w-full rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB]/40 p-2.5 text-xs text-[#942E3A] outline-none focus:border-[#942E3A]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/70">
                      Coupon Code
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      className="text-[9px] font-bold text-[#942E3A] hover:underline flex items-center gap-1"
                    >
                      <Shuffle className="h-3 w-3 text-[#D8B46A]" />
                      <span>Generate Code</span>
                    </button>
                  </div>
                  <input
                    name="code"
                    value={codeValue}
                    onChange={(e) => setCodeValue(e.target.value.toUpperCase())}
                    placeholder="e.g. SUMMER20"
                    className="w-full rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB]/40 p-2.5 text-xs font-mono uppercase text-[#942E3A] outline-none focus:border-[#942E3A]"
                  />
                </div>
              </div>

              {/* Dynamic Discount Type & Value Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div className={cn(formType === "free_shipping" && "col-span-2")}>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/70">
                    Discount Type *
                  </label>
                  <CustomSelect
                    name="type"
                    value={formType}
                    onChange={setFormType}
                    options={FORM_TYPE_OPTIONS}
                    className="w-full h-10"
                  />
                </div>

                {formType !== "free_shipping" ? (
                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/70">
                      {formType === "percentage" ? "Percentage Value (%) *" : "Fixed Amount (EGP) *"}
                    </label>
                    <input
                      name="value"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formValue}
                      onChange={(e) => setFormValue(e.target.value)}
                      placeholder={formType === "percentage" ? "e.g. 20" : "e.g. 150"}
                      className="w-full rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB]/40 p-2.5 text-xs text-[#942E3A] outline-none focus:border-[#942E3A]"
                    />
                  </div>
                ) : (
                  <input type="hidden" name="value" value="0" />
                )}
              </div>

              {/* Dynamic Scope & Target Category */}
              <div className="grid grid-cols-2 gap-3">
                <div className={cn(formScope === "order" && "col-span-2")}>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/70">
                    Applies To (Scope)
                  </label>
                  <CustomSelect
                    name="scope"
                    value={formScope}
                    onChange={setFormScope}
                    options={FORM_SCOPE_OPTIONS}
                    className="w-full h-10"
                  />
                </div>

                {formScope === "category" ? (
                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/70">
                      Select Target Category *
                    </label>
                    <CustomSelect
                      name="targetValue"
                      value={formTargetCategory}
                      onChange={setFormTargetCategory}
                      options={TARGET_CATEGORY_OPTIONS}
                      className="w-full h-10"
                    />
                  </div>
                ) : (
                  <input type="hidden" name="targetValue" value="" />
                )}
              </div>

              {/* Dynamic Live Rule Preview Badge */}
              <div className="rounded-2xl border border-[#D8B46A]/40 bg-[#fff7df] p-3 text-xs font-semibold text-[#942E3A] flex items-center gap-2 shadow-xs">
                <Sparkles className="h-4 w-4 text-[#D8B46A] shrink-0" />
                <span>
                  Rule Preview:{" "}
                  <strong>
                    {formType === "percentage"
                      ? `${formValue || "0"}% OFF`
                      : formType === "fixed"
                      ? `${formValue || "0"} EGP OFF`
                      : "Free Shipping 🚚"}
                  </strong>{" "}
                  on{" "}
                  <strong>
                    {formScope === "order"
                      ? "Entire Order"
                      : `Category (${
                          TARGET_CATEGORY_OPTIONS.find((c) => c.id === formTargetCategory)?.label ||
                          formTargetCategory
                        })`}
                  </strong>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/70">
                    Minimum Order Value (EGP)
                  </label>
                  <input
                    name="minimumOrderValue"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Optional (e.g. 1000)"
                    className="w-full rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB]/40 p-2.5 text-xs text-[#942E3A] outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/70">
                    Usage Limit (Max Uses)
                  </label>
                  <input
                    name="usageLimit"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Unlimited"
                    className="w-full rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB]/40 p-2.5 text-xs text-[#942E3A] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/70">
                    Starts At
                  </label>
                  <CustomDateTimePicker
                    name="startsAt"
                    placeholder="Start date & time"
                    align="left"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/70">
                    Ends At
                  </label>
                  <CustomDateTimePicker
                    name="endsAt"
                    placeholder="End date & time"
                    align="right"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#942E3A]/10 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreatePromoOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#942E3A] px-5 py-2.5 text-xs font-bold text-[#FFF9EB] shadow-md hover:bg-[#802832]"
                >
                  Publish Promo Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIRMATION MODAL: DELETE PROMOTION */}
      {/* ========================================================================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2c1018]/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white p-6 shadow-xl animate-in zoom-in-95 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-rose-500" />
            <h3 className="mt-3 font-playfair text-lg font-bold text-[#942E3A]">
              Delete Promotion Rule?
            </h3>
            <p className="mt-1 text-xs text-stone-500">
              Are you sure you want to permanently delete this promo rule? Customers will no longer be able to redeem it.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50"
              >
                Cancel
              </button>
              <form action={deletePromotionAction}>
                <input type="hidden" name="id" value={deleteConfirmId} />
                <button
                  type="submit"
                  onClick={() => setDeleteConfirmId(null)}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700"
                >
                  Confirm Delete
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIRMATION MODAL: DELETE ANNOUNCEMENT */}
      {/* ========================================================================= */}
      {deleteAnnouncementId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2c1018]/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white p-6 shadow-xl animate-in zoom-in-95 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-rose-500" />
            <h3 className="mt-3 font-playfair text-lg font-bold text-[#942E3A]">
              Delete Banner History?
            </h3>
            <p className="mt-1 text-xs text-stone-500">
              This will remove this announcement from your banner history logs.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteAnnouncementId(null)}
                className="rounded-xl border border-[#D8B46A]/20 px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50"
              >
                Cancel
              </button>
              <form action={deleteAnnouncementAction}>
                <input type="hidden" name="id" value={deleteAnnouncementId} />
                <button
                  type="submit"
                  onClick={() => setDeleteAnnouncementId(null)}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700"
                >
                  Confirm Delete
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
