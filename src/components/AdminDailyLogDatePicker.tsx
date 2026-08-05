"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  CalendarDays,
  ArrowRight,
} from "lucide-react";

export type DatePreset =
  | "today"
  | "this_week"
  | "last_week"
  | "this_month"
  | "last_month"
  | "this_year"
  | "last_year"
  | "custom";

interface DatePickerProps {
  currentPreset: DatePreset;
  currentStartDate: string; // YYYY-MM-DD
  currentEndDate: string; // YYYY-MM-DD
}

const PRESET_OPTIONS: { id: DatePreset; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "this_week", label: "This week" },
  { id: "last_week", label: "Last week" },
  { id: "this_month", label: "This month" },
  { id: "last_month", label: "Last month" },
  { id: "this_year", label: "This year" },
  { id: "last_year", label: "Last year" },
  { id: "custom", label: "Custom range..." },
];

function formatDateForInput(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminDailyLogDatePicker({
  currentPreset,
  currentStartDate,
  currentEndDate,
}: DatePickerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal internal state
  const [activeInput, setActiveInput] = useState<"start" | "end">("start");
  const [tempStartDate, setTempStartDate] = useState(currentStartDate);
  const [tempEndDate, setTempEndDate] = useState(currentEndDate);

  // Calendar navigation state inside modal
  const initialYearMonth = useMemo(() => {
    const refDate = currentStartDate ? new Date(`${currentStartDate}T12:00:00`) : new Date();
    return { year: refDate.getFullYear(), month: refDate.getMonth() };
  }, [currentStartDate]);

  const [viewYear, setViewYear] = useState(initialYearMonth.year);
  const [viewMonth, setViewMonth] = useState(initialYearMonth.month); // 0-indexed

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Update temp state when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setTempStartDate(currentStartDate);
      setTempEndDate(currentEndDate);
      const d = currentStartDate ? new Date(`${currentStartDate}T12:00:00`) : new Date();
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
      setActiveInput("start");
    }
  }, [isModalOpen, currentStartDate, currentEndDate]);

  const handleSelectPreset = (presetId: DatePreset) => {
    setIsDropdownOpen(false);
    if (presetId === "custom") {
      setIsModalOpen(true);
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("preset", presetId);
    params.delete("startDate");
    params.delete("endDate");
    params.delete("date");
    router.push(`/admin/daily-log?${params.toString()}`);
  };

  const handleApplyCustomRange = () => {
    let start = tempStartDate;
    let end = tempEndDate;

    if (!start && !end) return;
    if (!start) start = end;
    if (!end) end = start;

    if (start > end) {
      const swap = start;
      start = end;
      end = swap;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("preset", "custom");
    params.set("startDate", start);
    params.set("endDate", end);
    params.delete("date");

    setIsModalOpen(false);
    router.push(`/admin/daily-log?${params.toString()}`);
  };

  // Label text for trigger button
  const currentLabel = useMemo(() => {
    const found = PRESET_OPTIONS.find((opt) => opt.id === currentPreset);
    if (currentPreset === "custom") {
      if (currentStartDate === currentEndDate) {
        return formatDisplayDate(currentStartDate);
      }
      return `${formatDisplayDate(currentStartDate)} – ${formatDisplayDate(currentEndDate)}`;
    }
    return found ? `${found.label}` : "Select range";
  }, [currentPreset, currentStartDate, currentEndDate]);

  // Calendar day grid calculations
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);

    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun
    const totalDaysInMonth = lastDayOfMonth.getDate();

    // Days from previous month to fill the first row
    const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();
    const prevDays: Array<{ dateStr: string; dayNum: number; isCurrentMonth: boolean }> = [];
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const pDay = prevMonthLastDay - i;
      const prevDate = new Date(viewYear, viewMonth - 1, pDay);
      prevDays.push({
        dateStr: formatDateForInput(prevDate),
        dayNum: pDay,
        isCurrentMonth: false,
      });
    }

    // Days in current month
    const currDays: Array<{ dateStr: string; dayNum: number; isCurrentMonth: boolean }> = [];
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const currDate = new Date(viewYear, viewMonth, d);
      currDays.push({
        dateStr: formatDateForInput(currDate),
        dayNum: d,
        isCurrentMonth: true,
      });
    }

    // Days from next month to complete grid (42 cells = 6 rows)
    const nextDaysNeeded = 42 - (prevDays.length + currDays.length);
    const nextDays: Array<{ dateStr: string; dayNum: number; isCurrentMonth: boolean }> = [];
    for (let nd = 1; nd <= nextDaysNeeded; nd++) {
      const nextDate = new Date(viewYear, viewMonth + 1, nd);
      nextDays.push({
        dateStr: formatDateForInput(nextDate),
        dayNum: nd,
        isCurrentMonth: false,
      });
    }

    return [...prevDays, ...currDays, ...nextDays];
  }, [viewYear, viewMonth]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleDayClick = (dateStr: string) => {
    if (activeInput === "start") {
      setTempStartDate(dateStr);
      if (tempEndDate && dateStr > tempEndDate) {
        setTempEndDate(dateStr);
      }
      setActiveInput("end");
    } else {
      if (tempStartDate && dateStr < tempStartDate) {
        setTempStartDate(dateStr);
        setTempEndDate(tempStartDate);
      } else {
        setTempEndDate(dateStr);
      }
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const todayStr = formatDateForInput(new Date());

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsDropdownOpen((prev) => !prev)}
        className="group flex items-center gap-2.5 rounded-2xl border border-[#942E3A]/20 bg-white px-4 py-2.5 text-xs font-semibold text-[#942E3A] shadow-sm transition hover:border-[#942E3A]/40 hover:bg-[#FFF9EB] focus:outline-none focus:ring-2 focus:ring-[#D8B46A]/30"
      >
        <Calendar className="h-4 w-4 text-[#D8B46A] transition-transform group-hover:scale-110" />
        <span className="font-bold text-[#942E3A]">{currentLabel}</span>
        <ChevronDown
          className={`h-4 w-4 text-[#D8B46A] transition-transform duration-200 ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Preset Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 overflow-hidden rounded-2xl border border-[#D8B46A]/35 bg-[#FFF9EB] p-2 shadow-[0_16px_36px_rgba(67,25,31,0.18)] animate-in fade-in zoom-in-95">
          <div className="px-3 py-2 border-b border-[#942E3A]/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#D8B46A]">
              Filter Date Range
            </p>
          </div>
          <div className="mt-1 space-y-0.5">
            {PRESET_OPTIONS.map((option) => {
              const isSelected = currentPreset === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelectPreset(option.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition ${
                    isSelected
                      ? "bg-[#942E3A] text-[#FFF9EB] font-bold"
                      : "text-[#6B1F2A] hover:bg-[#F2DFC0]/60 hover:text-[#942E3A]"
                  }`}
                >
                  <span className="text-xs font-semibold">{option.label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-[#D8B46A]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom Date Range Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#2c1018]/65 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Card */}
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-[#D8B46A]/30 bg-[#FFF9EB] p-5 shadow-[0_25px_60px_rgba(44,16,24,0.35)] sm:p-7">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#942E3A]/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#942E3A] text-[#FFF9EB]">
                  <CalendarDays className="h-5 w-5 text-[#D8B46A]" />
                </div>
                <div>
                  <h3 className="font-playfair text-lg font-bold text-[#942E3A]">
                    Select Date Range
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1.5 text-[#942E3A]/60 hover:bg-[#942E3A]/10 hover:text-[#942E3A] transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Inputs Section */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              {/* Start Date Input */}
              <button
                type="button"
                onClick={() => setActiveInput("start")}
                className={`flex flex-col items-start rounded-2xl border p-3 text-left transition ${
                  activeInput === "start"
                    ? "border-[#942E3A] bg-white ring-2 ring-[#D8B46A]/40 shadow-sm"
                    : "border-[#942E3A]/15 bg-white/70 hover:bg-white"
                }`}
              >
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#D8B46A]">
                  Start Date
                </span>
                <span className="mt-1 text-xs font-bold text-[#942E3A]">
                  {tempStartDate ? formatDisplayDate(tempStartDate) : "Pick start date"}
                </span>
              </button>

              {/* End Date Input */}
              <button
                type="button"
                onClick={() => setActiveInput("end")}
                className={`flex flex-col items-start rounded-2xl border p-3 text-left transition ${
                  activeInput === "end"
                    ? "border-[#942E3A] bg-white ring-2 ring-[#D8B46A]/40 shadow-sm"
                    : "border-[#942E3A]/15 bg-white/70 hover:bg-white"
                }`}
              >
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#D8B46A]">
                  End Date
                </span>
                <span className="mt-1 text-xs font-bold text-[#942E3A]">
                  {tempEndDate ? formatDisplayDate(tempEndDate) : "Pick end date"}
                </span>
              </button>
            </div>

            {/* Custom Designed Calendar Picker */}
            <div className="mt-5 rounded-2xl border border-[#942E3A]/12 bg-white p-3 shadow-inner">
              {/* Month Navigation */}
              <div className="flex items-center justify-between border-b border-[#942E3A]/10 pb-3 px-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="rounded-lg p-1 text-[#942E3A] hover:bg-[#F2DFC0]/60 transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="font-playfair text-sm font-bold text-[#942E3A]">
                  {monthNames[viewMonth]} {viewYear}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="rounded-lg p-1 text-[#942E3A] hover:bg-[#F2DFC0]/60 transition"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Days of week header */}
              <div className="mt-3 grid grid-cols-7 text-center text-[10px] font-bold uppercase tracking-wider text-[#D8B46A]">
                <span>Su</span>
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
              </div>

              {/* Day Grid */}
              <div className="mt-2 grid grid-cols-7 gap-1 text-center">
                {calendarDays.map((cell, idx) => {
                  const isStart = cell.dateStr === tempStartDate;
                  const isEnd = cell.dateStr === tempEndDate;
                  const isInRange =
                    tempStartDate &&
                    tempEndDate &&
                    cell.dateStr >= tempStartDate &&
                    cell.dateStr <= tempEndDate;
                  const isToday = cell.dateStr === todayStr;

                  let cellStyle = "text-[#6B1F2A] hover:bg-[#F2DFC0]/60";
                  if (!cell.isCurrentMonth) {
                    cellStyle = "text-[#6B1F2A]/30 hover:bg-[#F2DFC0]/30";
                  }

                  if (isStart || isEnd) {
                    cellStyle = "bg-[#942E3A] text-[#FFF9EB] font-bold shadow-sm scale-105 z-10 rounded-xl";
                  } else if (isInRange) {
                    cellStyle = "bg-[#fff7df] text-[#942E3A] font-semibold rounded-lg";
                  }

                  return (
                    <button
                      key={`${cell.dateStr}-${idx}`}
                      type="button"
                      onClick={() => handleDayClick(cell.dateStr)}
                      className={`relative flex h-8 w-full items-center justify-center text-xs transition ${cellStyle} ${
                        isToday && !isStart && !isEnd
                          ? "ring-1 ring-[#D8B46A] font-bold rounded-lg"
                          : ""
                      }`}
                    >
                      {cell.dayNum}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick helper shortcuts */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const t = formatDateForInput(new Date());
                  setTempStartDate(t);
                  setTempEndDate(t);
                }}
                className="rounded-lg bg-[#F2DFC0]/50 px-2.5 py-1 text-[10px] font-bold text-[#942E3A] hover:bg-[#F2DFC0]"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  const start7 = new Date();
                  start7.setDate(now.getDate() - 6);
                  setTempStartDate(formatDateForInput(start7));
                  setTempEndDate(formatDateForInput(now));
                }}
                className="rounded-lg bg-[#F2DFC0]/50 px-2.5 py-1 text-[10px] font-bold text-[#942E3A] hover:bg-[#F2DFC0]"
              >
                Last 7 Days
              </button>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  const start30 = new Date();
                  start30.setDate(now.getDate() - 29);
                  setTempStartDate(formatDateForInput(start30));
                  setTempEndDate(formatDateForInput(now));
                }}
                className="rounded-lg bg-[#F2DFC0]/50 px-2.5 py-1 text-[10px] font-bold text-[#942E3A] hover:bg-[#F2DFC0]"
              >
                Last 30 Days
              </button>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#942E3A]/10 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl px-4 py-2.5 text-xs font-semibold text-[#6B1F2A]/70 hover:bg-[#942E3A]/5 hover:text-[#942E3A] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCustomRange}
                className="flex items-center gap-2 rounded-xl bg-[#942E3A] px-5 py-2.5 text-xs font-bold text-[#FFF9EB] shadow-md transition hover:bg-[#802832] active:scale-95"
              >
                <span>Apply Range</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#D8B46A]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
