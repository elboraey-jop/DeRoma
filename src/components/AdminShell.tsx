"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  BarChart3,
  Boxes,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  DollarSign,
  LayoutDashboard,
  Menu,
  MessageSquareQuote,
  Package,
  Percent,
  Settings,
  ShoppingBag,
  Truck,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAdminAction } from "@/app/admin/actions";

const navigation = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: ShoppingBag },
  { label: "Reviews", href: "/admin/reviews", icon: MessageSquareQuote },
  { label: "Orders", href: "/admin/orders", icon: ClipboardList },
  { label: "Shipping", href: "/admin/shipping", icon: Truck },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Suppliers", href: "/admin/suppliers", icon: Boxes },
  { label: "Team", href: "/admin/team", icon: Users },
  { label: "Daily Log", href: "/admin/daily-log", icon: CalendarDays },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Inventory", href: "/admin/inventory", icon: Package },
  { label: "Promotions", href: "/admin/promotions", icon: Percent },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (pathname === "/admin/login") return <>{children}</>;

  const sidebar = (
    <aside className="flex h-full w-[250px] shrink-0 flex-col bg-[#942E3A] text-[#FFF9EB]">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
        <Link href="/admin" onClick={() => setIsSidebarOpen(false)} className="font-playfair text-2xl font-black tracking-tight">
          DeRoma <span className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#D8B46A]">Admin</span>
        </Link>
        <button onClick={() => setIsSidebarOpen(false)} className="rounded-full p-1.5 text-[#D8B46A] hover:bg-white/10 lg:hidden" aria-label="Close admin menu">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="px-5 py-5">
        <div className="rounded-2xl border border-[#D8B46A]/25 bg-white/8 px-3 py-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">Workspace</p>
          <p className="mt-1 text-xs font-semibold text-white/90">Store management</p>
        </div>
      </div>

      <nav className="hide-scrollbar flex-1 space-y-1 overflow-y-auto px-3 pb-5">
        {navigation.map((item) => {
          const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors",
                isActive ? "bg-[#FFF9EB] text-[#942E3A]" : "text-white/75 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive ? "text-[#942E3A]" : "text-[#D8B46A]")} />
              <span>{item.label}</span>
              {isActive && <ChevronRight className="ml-auto h-3.5 w-3.5" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <Link href="/" className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white">
          <ChevronRight className="h-4 w-4 rotate-180 text-[#D8B46A]" />
          View storefront
        </Link>
        <form action={logoutAdminAction} className="mt-1">
          <button type="submit" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white">
          <Settings className="h-4 w-4 text-[#D8B46A]" />
          Sign out
          </button>
        </form>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-[#f7f1e8]">
      <div className="fixed inset-y-0 left-0 z-50 hidden lg:block">{sidebar}</div>
      {isSidebarOpen && (
        <>
          <button className="fixed inset-0 z-40 bg-[#2c1018]/55 lg:hidden" onClick={() => setIsSidebarOpen(false)} aria-label="Close admin menu" />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">{sidebar}</div>
        </>
      )}
      <div className="min-w-0 flex-1 lg:pl-[250px]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#942E3A]/10 bg-[#f7f1e8]/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="rounded-xl border border-[#942E3A]/15 bg-white p-2 text-[#942E3A] lg:hidden" aria-label="Open admin menu">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">DeRoma back office</p>
              <p className="font-playfair text-lg font-bold text-[#942E3A]">Admin workspace</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#942E3A] text-xs font-bold text-[#FFF9EB]">A</div>
            <div className="text-right">
              <p className="text-xs font-bold text-[#942E3A]">Administrator</p>
              <p className="text-[10px] text-[#6B1F2A]/60">Store owner</p>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
