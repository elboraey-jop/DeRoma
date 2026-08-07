"use client";

import React from "react";

// Shimmer gradient overlay or pulse class
const pulseClass = "animate-pulse bg-stone-200/80 dark:bg-stone-800/40 rounded-lg";
const brandPulseClass = "animate-pulse bg-[#942E3A]/10 rounded-lg";
const goldPulseClass = "animate-pulse bg-[#D8B46A]/20 rounded-lg";

export function CardSkeleton() {
  return (
    <div className="flex h-[330px] w-full flex-col overflow-hidden rounded-[1.35rem] bg-white border border-[#D8B46A]/10 shadow-[0_12px_30px_rgba(148,46,58,0.04)] sm:h-[380px] sm:max-w-[230px] sm:rounded-[1.65rem]">
      {/* Top Image Area */}
      <div className="relative h-[71%] sm:h-[72%] w-full bg-[#FFF9EB] flex items-center justify-center overflow-hidden">
        <div className={`h-[80%] w-[80%] ${pulseClass}`} />
        <div className="absolute left-2 top-2 h-4 w-10 bg-stone-200 rounded-full animate-pulse" />
      </div>

      {/* Details Area */}
      <div className="relative z-10 -mt-7 flex flex-1 flex-col rounded-t-[1.15rem] bg-[#942E3A] px-2.5 pb-2 pt-3 sm:-mt-9 sm:rounded-t-[1.35rem] sm:px-3 sm:pb-2.5 sm:pt-4">
        {/* Rating and Title */}
        <div className="mb-2 flex items-center justify-between">
          <div className="h-3 w-8 bg-amber-500/25 rounded-md animate-pulse" />
          <div className="h-3.5 w-24 bg-white/20 rounded-md animate-pulse" />
        </div>

        {/* Price */}
        <div className="mb-2 flex justify-center">
          <div className="h-5 w-16 bg-white/30 rounded-md animate-pulse" />
        </div>

        {/* Sizes */}
        <div className="mt-1 mb-2 flex items-center justify-center gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 w-7 bg-white/10 rounded-full animate-pulse" />
          ))}
        </div>

        {/* Actions Row */}
        <div className="mt-auto border-t border-white/20 pt-2">
          <div className="flex items-center gap-1.5">
            <div className="h-7 w-7 sm:h-8 sm:w-8 bg-[#D8B46A]/40 rounded-full animate-pulse" />
            <div className="h-7 w-7 sm:h-8 sm:w-8 bg-white/10 rounded-full animate-pulse" />
            <div className="h-7 flex-1 sm:h-8 bg-white/20 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-6 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="space-y-6 w-full">
      {/* Brands Card Skeleton */}
      <div className="rounded-3xl border border-[#D8B46A]/20 bg-[#F2E7D5]/10 p-5 shadow-xs">
        <div className="h-4 w-20 bg-[#942E3A]/20 rounded mb-4 animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-full bg-[#942E3A]/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>

      {/* Categories Card Skeleton */}
      <div className="rounded-3xl border border-[#D8B46A]/20 bg-[#F2E7D5]/10 p-5 shadow-xs">
        <div className="h-4 w-24 bg-[#942E3A]/20 rounded mb-4 animate-pulse" />
        <div className="space-y-2.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-3 w-16 bg-[#942E3A]/10 rounded animate-pulse" />
              <div className="h-3 w-6 bg-[#942E3A]/5 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Sizes Card Skeleton */}
      <div className="rounded-3xl border border-[#D8B46A]/20 bg-[#F2E7D5]/10 p-5 shadow-xs">
        <div className="h-4 w-16 bg-[#942E3A]/20 rounded mb-4 animate-pulse" />
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-8 bg-[#942E3A]/5 rounded-full animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ShopSkeleton() {
  return (
    <div className="mx-auto max-w-[94vw] lg:max-w-[1320px] px-2 sm:px-4 lg:px-6 pb-6 pt-1 sm:py-6 bg-[#FFF9EB] text-[#942E3A]" dir="ltr">
      {/* Search Bar Skeleton */}
      <div className="mb-6 flex flex-row items-center gap-2 sm:gap-3">
        <div className="h-10 flex-1 bg-white border border-[#D8B46A]/20 rounded-full animate-pulse" />
        <div className="h-10 w-24 bg-white border border-[#D8B46A]/20 rounded-full animate-pulse hidden sm:block" />
        <div className="h-10 w-28 bg-white border border-[#D8B46A]/20 rounded-full animate-pulse" />
      </div>

      <div className="flex gap-x-8">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <SidebarSkeleton />
        </aside>

        {/* Grid */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-4 w-32 bg-[#942E3A]/10 rounded animate-pulse" />
            <div className="h-4 w-20 bg-[#942E3A]/10 rounded animate-pulse" />
          </div>
          <GridSkeleton count={8} />
        </div>
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-[94vw] lg:max-w-[1320px] px-2 sm:px-4 lg:px-6 py-6" dir="ltr">
      {/* Breadcrumbs */}
      <div className="h-4 w-48 bg-[#942E3A]/10 rounded mb-6 animate-pulse" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-12">
        {/* Left: Gallery Skeleton */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-square w-full rounded-3xl bg-white border border-[#D8B46A]/10 shadow-[0_12px_30px_rgba(148,46,58,0.04)] overflow-hidden flex items-center justify-center">
            <div className="h-[70%] w-[70%] bg-stone-200/60 rounded-xl animate-pulse" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square rounded-2xl bg-white border border-[#D8B46A]/10 animate-pulse" />
            ))}
          </div>
        </div>

        {/* Right: Product Details Skeleton */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          <div>
            <div className="h-4 w-24 bg-[#942E3A]/20 rounded mb-2 animate-pulse" />
            <div className="h-8 w-3/4 bg-[#942E3A]/30 rounded mb-3 animate-pulse" />
            <div className="flex items-center gap-2 mb-4">
              <div className="h-4 w-16 bg-amber-500/20 rounded animate-pulse" />
              <div className="h-3 w-28 bg-[#942E3A]/10 rounded animate-pulse" />
            </div>
            <div className="h-7 w-32 bg-[#942E3A]/40 rounded animate-pulse" />
          </div>

          <div className="border-t border-[#D8B46A]/20 pt-6">
            <div className="h-4 w-28 bg-[#942E3A]/20 rounded mb-3 animate-pulse" />
            <div className="flex flex-wrap gap-2.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 w-12 bg-white border border-[#D8B46A]/20 rounded-full animate-pulse" />
              ))}
            </div>
          </div>

          <div className="border-t border-[#D8B46A]/20 pt-6 space-y-3">
            <div className="h-12 w-full bg-[#942E3A] rounded-full animate-pulse" />
            <div className="flex gap-3">
              <div className="h-12 flex-1 bg-[#D8B46A] rounded-full animate-pulse" />
              <div className="h-12 w-12 bg-white border border-[#D8B46A]/30 rounded-full animate-pulse" />
            </div>
          </div>

          <div className="border-t border-[#D8B46A]/20 pt-6 space-y-2">
            <div className="h-3.5 w-full bg-[#942E3A]/10 rounded animate-pulse" />
            <div className="h-3.5 w-5/6 bg-[#942E3A]/10 rounded animate-pulse" />
            <div className="h-3.5 w-4/5 bg-[#942E3A]/10 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Similar products header skeleton */}
      <div className="mt-16 border-t border-[#D8B46A]/20 pt-10">
        <div className="h-6 w-48 bg-[#942E3A]/20 rounded mb-8 animate-pulse" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function WishlistSkeleton() {
  return (
    <div className="mx-auto max-w-[94vw] lg:max-w-[1320px] px-2 sm:px-4 lg:px-6 py-12" dir="ltr">
      <div className="h-8 w-48 bg-[#942E3A]/20 rounded mx-auto mb-8 animate-pulse" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function CheckoutSkeleton() {
  return (
    <div className="mx-auto max-w-[94vw] lg:max-w-[1200px] px-2 sm:px-4 py-8" dir="ltr">
      <div className="h-8 w-36 bg-[#942E3A]/20 rounded mb-8 animate-pulse" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-[#D8B46A]/10 space-y-4">
            <div className="h-5 w-32 bg-[#942E3A]/20 rounded animate-pulse" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-[#942E3A]/5 rounded-xl animate-pulse" />
              <div className="h-10 bg-[#942E3A]/5 rounded-xl animate-pulse" />
            </div>
            <div className="h-10 bg-[#942E3A]/5 rounded-xl animate-pulse" />
          </div>
          <div className="p-6 rounded-3xl bg-white border border-[#D8B46A]/10 space-y-4">
            <div className="h-5 w-36 bg-[#942E3A]/20 rounded animate-pulse" />
            <div className="h-12 bg-[#942E3A]/5 rounded-xl animate-pulse" />
            <div className="h-12 bg-[#942E3A]/5 rounded-xl animate-pulse" />
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className="p-6 rounded-3xl bg-[#942E3A] text-white space-y-4">
            <div className="h-5 w-28 bg-white/20 rounded animate-pulse" />
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-12 w-12 bg-white/10 rounded-xl animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/3 bg-white/20 rounded animate-pulse" />
                    <div className="h-3 w-1/3 bg-white/20 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-white/20 pt-4 space-y-2">
              <div className="flex justify-between">
                <div className="h-3.5 w-16 bg-white/20 rounded animate-pulse" />
                <div className="h-3.5 w-12 bg-white/20 rounded animate-pulse" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-20 bg-white/30 rounded animate-pulse" />
                <div className="h-4 w-16 bg-white/30 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-[#FFF9EB] px-3 py-6 sm:px-6 lg:px-8" dir="ltr">
      <div className="mx-auto max-w-[1320px] space-y-8 animate-pulse">
        <div className="aspect-[1209/1300] w-full rounded-3xl bg-[#942E3A]/10 sm:aspect-[2120/742]" />
        <div className="mx-auto h-4 w-32 rounded bg-[#942E3A]/15" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  );
}

export function ContentPageSkeleton() {
  return (
    <div className="min-h-[70vh] bg-[#FFF9EB] px-4 py-10 sm:px-6 sm:py-16" dir="ltr">
      <div className="mx-auto max-w-4xl animate-pulse space-y-8">
        <div className="mx-auto h-10 w-64 rounded bg-[#942E3A]/20" />
        <div className="mx-auto h-4 w-48 rounded bg-[#D8B46A]/30" />
        <div className="rounded-3xl border border-[#D8B46A]/15 bg-white p-6 sm:p-10">
          <div className="space-y-4">
            {["w-full", "w-11/12", "w-10/12", "w-full", "w-9/12", "w-11/12", "w-8/12"].map((width, i) => (
              <div key={i} className={`h-4 rounded bg-[#942E3A]/10 ${width}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthSkeleton() {
  return (
    <div className="min-h-[70vh] bg-[#FFF9EB] px-4 py-12 sm:py-20" dir="ltr">
      <div className="mx-auto max-w-md animate-pulse rounded-3xl border border-[#D8B46A]/15 bg-white p-6 sm:p-8">
        <div className="mx-auto mb-8 h-9 w-40 rounded bg-[#942E3A]/20" />
        <div className="space-y-5">
          <div className="h-12 rounded-xl bg-[#942E3A]/10" />
          <div className="h-12 rounded-xl bg-[#942E3A]/10" />
          <div className="h-12 rounded-full bg-[#942E3A]/20" />
        </div>
      </div>
    </div>
  );
}

export function TrackSkeleton() {
  return (
    <div className="min-h-[70vh] bg-[#FFF9EB] px-4 py-10 sm:px-6 sm:py-16" dir="ltr">
      <div className="mx-auto max-w-6xl animate-pulse space-y-6">
        <div className="mx-auto h-10 w-56 rounded bg-[#942E3A]/20" />
        <div className="mx-auto h-12 max-w-xl rounded-full bg-white" />
        <div className="grid gap-5 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-40 rounded-3xl border border-[#D8B46A]/15 bg-white" />)}
        </div>
        <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <div className="h-64 rounded-3xl bg-white" />
          <div className="h-64 rounded-3xl bg-white" />
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#FFF9EB] py-12 px-4 sm:px-6 lg:px-8" dir="ltr">
      <div className="max-w-[1000px] mx-auto space-y-10 animate-pulse">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="h-4 w-28 rounded bg-[#942E3A]/20" />
          <div className="h-8 w-24 rounded-full bg-[#942E3A]/15" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <div className="h-3 w-28 rounded bg-[#942E3A]/20" />
          <div className="h-9 w-64 rounded bg-[#942E3A]/30" />
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 rounded-3xl border border-[#942E3A]/20 bg-[#FFF9EB]/20 p-6 space-y-5">
            <div className="h-5 w-32 rounded bg-[#942E3A]/20 pb-3 border-b border-[#942E3A]/10" />
            <div className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <div className="h-2.5 w-16 rounded bg-stone-300" />
                <div className="h-4 w-3/4 rounded bg-[#942E3A]/15" />
              </div>
              <div className="space-y-1.5">
                <div className="h-2.5 w-20 rounded bg-stone-300" />
                <div className="h-4 w-full rounded bg-[#942E3A]/15" />
              </div>
              <div className="space-y-1.5">
                <div className="h-2.5 w-24 rounded bg-stone-300" />
                <div className="h-4 w-2/3 rounded bg-[#942E3A]/15" />
              </div>
              <div className="space-y-1.5">
                <div className="h-2.5 w-28 rounded bg-stone-300" />
                <div className="h-4 w-5/6 rounded bg-[#942E3A]/15" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-3xl border border-[#942E3A]/20 bg-[#FFF9EB]/20 p-6 space-y-5">
            <div className="h-5 w-36 rounded bg-[#942E3A]/20 pb-3 border-b border-[#942E3A]/10" />
            <div className="space-y-4 pt-1">
              {[1, 2].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-white border border-[#942E3A]/15 p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-24 rounded bg-[#942E3A]/20" />
                    <div className="h-4 w-20 rounded-full bg-[#942E3A]/10" />
                  </div>
                  <div className="h-3 w-1/2 rounded bg-[#942E3A]/10" />
                  <div className="h-4 w-1/3 rounded bg-[#942E3A]/15 pt-2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SuccessSkeleton() {
  return (
    <div className="min-h-[70vh] bg-[#FFF9EB] px-4 py-16" dir="ltr">
      <div className="mx-auto max-w-xl animate-pulse rounded-3xl bg-white p-8 text-center sm:p-12">
        <div className="mx-auto h-16 w-16 rounded-full bg-[#D8B46A]/30" />
        <div className="mx-auto mt-6 h-8 w-64 rounded bg-[#942E3A]/20" />
        <div className="mx-auto mt-4 h-4 w-80 max-w-full rounded bg-[#942E3A]/10" />
        <div className="mx-auto mt-8 h-12 w-48 rounded-full bg-[#942E3A]/20" />
      </div>
    </div>
  );
}
