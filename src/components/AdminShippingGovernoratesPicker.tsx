"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { GOVERNORATES } from "@/lib/locations";

export default function AdminShippingGovernoratesPicker({
  exclude = [],
  onChange,
}: {
  exclude?: string[];
  onChange?: (values: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const pickerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  const available = GOVERNORATES.filter((item) => !exclude.includes(item));
  const filtered = available.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase()),
  );
  const toggle = (item: string) =>
    setSelected((current) => {
      const next = current.includes(item)
        ? current.filter((value) => value !== item)
        : [...current, item];
      onChange?.(next);
      return next;
    });
  return (
    <div ref={pickerRef} className="relative">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide">
        Governorates
      </span>
      <input type="hidden" name="governorates" value={selected.join(",")} />
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`admin-input flex w-full items-center justify-between gap-3 text-left ${selected.length ? "text-[#481827]" : "text-[#a99ca0]"}`}
      >
        <span className="truncate">
          {selected.length ? selected.join(", ") : "Select governorates"}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#942E3A] transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute inset-x-0 top-[calc(100%+0.35rem)] z-30 overflow-hidden rounded-2xl border border-[#eadfd6] bg-[#fffdfa] p-2 shadow-xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D8B46A]" />
            <input
              autoFocus
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search governorates..."
              className="h-10 w-full rounded-xl border border-[#eadfd6] bg-[#fffaf0] pl-9 pr-3 text-xs text-[#481827] outline-none focus:border-[#942E3A] focus:ring-2 focus:ring-[#942E3A]/10"
            />
          </div>
          <div
            className="hide-scrollbar mt-2 max-h-52 overscroll-contain overflow-y-auto"
            onWheel={(event) => {
              event.preventDefault();
              event.stopPropagation();
              event.currentTarget.scrollTop += event.deltaY;
            }}
          >
            {filtered.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => toggle(item)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition ${selected.includes(item) ? "bg-[#942E3A] font-bold text-white" : "text-[#481827] hover:bg-[#fff5e8] hover:text-[#942E3A]"}`}
              >
                {item}
                {selected.includes(item) && <Check className="h-3.5 w-3.5" />}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-4 text-center text-xs text-[#806e73]">
                No governorate found
              </p>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-[#eadfd6] px-1 pt-2">
            <span className="text-[10px] text-[#806e73]">
              {selected.length} selected
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg bg-[#942E3A] px-3 py-1.5 text-[10px] font-bold text-white"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
