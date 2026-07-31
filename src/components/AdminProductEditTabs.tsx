"use client";

import { Children, ReactNode, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const defaultTabs = [
  { label: "Details", caption: "Identity & pricing" },
  { label: "Inventory", caption: "Variants & stock" },
  { label: "Relations", caption: "Similar products" },
  { label: "Reviews", caption: "Social proof" },
  { label: "Advanced", caption: "Danger zone" },
];

export default function AdminProductEditTabs({
  children,
}: {
  children: ReactNode;
}) {
  const [activeTab, setActiveTab] = useState(0);
  const panels = Children.toArray(children);

  return (
    <div className="space-y-5">
      <div className="sticky top-3 z-20 rounded-3xl border border-[#942E3A]/10 bg-[#FFF9EB]/95 p-2 shadow-[0_12px_30px_rgba(67,25,31,0.1)] backdrop-blur sm:p-3">
        <div className="grid grid-cols-3 gap-1 sm:grid-cols-5">
          {defaultTabs.map((tab, index) => {
            const isActive = activeTab === index;
            const isComplete = activeTab > index;
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => setActiveTab(index)}
                className={`rounded-2xl px-2 py-2.5 text-left transition sm:px-3 ${isActive ? "bg-[#942E3A] text-[#FFF9EB] shadow-[0_6px_15px_rgba(148,46,58,0.16)]" : "text-[#942E3A]/65 hover:bg-white"}`}
              >
                <span className="flex items-center gap-2">
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${isActive ? "bg-[#D8B46A] text-[#942E3A]" : isComplete ? "bg-[#942E3A]/10 text-[#942E3A]" : "bg-white text-[#942E3A]/55"}`}>
                    {isComplete ? <Check className="h-3.5 w-3.5" /> : index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[10px] font-bold sm:text-xs">{tab.label}</span>
                    <span className={`hidden truncate text-[9px] sm:block ${isActive ? "text-[#FFF9EB]/60" : "text-[#6B1F2A]/45"}`}>{tab.caption}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>{panels.map((panel, index) => <div key={index} hidden={activeTab !== index}>{panel}</div>)}</div>

      <div className="flex justify-end gap-2">
        {activeTab > 0 && <button type="button" onClick={() => setActiveTab((tab) => tab - 1)} className="inline-flex items-center gap-2 rounded-xl border border-[#942E3A]/15 bg-white px-4 py-3 text-xs font-bold text-[#942E3A]"><ArrowLeft className="h-3.5 w-3.5" /> Back</button>}
        {activeTab < panels.length - 1 && <button type="button" onClick={() => setActiveTab((tab) => tab + 1)} className="inline-flex items-center gap-2 rounded-xl bg-[#942E3A] px-5 py-3 text-xs font-bold text-[#FFF9EB]">Continue <ArrowRight className="h-3.5 w-3.5 text-[#D8B46A]" /></button>}
      </div>
    </div>
  );
}
