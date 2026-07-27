"use client";

import React from "react";

export default function RootLoading() {
  return (
    <div className="mx-auto max-w-[94vw] lg:max-w-[1320px] px-4 py-8 space-y-6 mt-[20px] animate-pulse" dir="ltr">
      {/* Page Title Placeholder */}
      <div className="h-8 w-48 bg-[#942E3A]/10 rounded-md" />
      
      {/* Paragraph lines placeholder */}
      <div className="space-y-3">
        <div className="h-4 w-full bg-[#942E3A]/5 rounded-md" />
        <div className="h-4 w-5/6 bg-[#942E3A]/5 rounded-md" />
        <div className="h-4 w-4/5 bg-[#942E3A]/5 rounded-md" />
      </div>

      {/* Cards grid placeholder */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col gap-4">
            <div className="aspect-[4/3] w-full bg-[#942E3A]/5 rounded-2xl" />
            <div className="h-4 w-2/3 bg-[#942E3A]/10 rounded" />
            <div className="h-3 w-1/3 bg-[#942E3A]/5 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
