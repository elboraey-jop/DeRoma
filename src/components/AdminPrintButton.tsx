"use client";

import { Printer } from "lucide-react";

export default function AdminPrintButton() {
  return <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-[#942E3A]/15 bg-white px-3 py-2.5 text-xs font-bold text-[#942E3A]"><Printer className="h-4 w-4 text-[#D8B46A]" /> Print / Save PDF</button>;
}
