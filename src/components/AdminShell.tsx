"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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

interface NavItem {
  label: string;
  href: string;
  icon: any;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

const navigationGroups: NavGroup[] = [
  {
    groupName: "DASHBOARD & METRICS",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { label: "Daily Log", href: "/admin/daily-log", icon: CalendarDays },
      { label: "Team", href: "/admin/team", icon: Users },
    ],
  },
  {
    groupName: "OPERATIONS & CATALOG",
    items: [
      { label: "Orders", href: "/admin/orders", icon: ClipboardList },
      { label: "Products", href: "/admin/products", icon: ShoppingBag },
      { label: "Inventory", href: "/admin/inventory", icon: Package },
      { label: "Suppliers", href: "/admin/suppliers", icon: Boxes },
    ],
  },
  {
    groupName: "CUSTOMER EXPERIENCE",
    items: [
      { label: "Customers", href: "/admin/customers", icon: Users },
      { label: "Reviews", href: "/admin/reviews", icon: MessageSquareQuote },
      { label: "Promotions", href: "/admin/promotions", icon: Percent },
      { label: "Shipping", href: "/admin/shipping", icon: Truck },
    ],
  },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-[#f7f1e8]">
      <div className="fixed inset-y-0 left-0 z-50 hidden lg:block">
        <AdminSidebar pathname={pathname} />
      </div>
      {isSidebarOpen && (
        <>
          <button
            className="fixed inset-0 z-40 bg-[#2c1018]/55 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close admin menu"
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <AdminSidebar pathname={pathname} onClose={() => setIsSidebarOpen(false)} />
          </div>
        </>
      )}
      <div className="min-w-0 flex-1 lg:pl-[250px]">
        {/* Mobile Sidebar Toggle Button */}
        <div className="flex items-center p-3 sm:px-6 lg:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-[#942E3A]/15 bg-white px-3 py-2 text-xs font-bold text-[#942E3A] shadow-xs"
            aria-label="Open admin menu"
          >
            <Menu className="h-4 w-4 text-[#D8B46A]" />
            <span>Menu</span>
          </button>
        </div>
        <main className="mx-auto min-w-0 max-w-[1500px] p-3 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function AdminSidebar({
  pathname,
  onClose,
}: {
  pathname: string;
  onClose?: () => void;
}) {
  const asideRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const aside = asideRef.current;
    const nav = navRef.current;
    if (!aside || !nav) return;

    const handleWheel = (e: WheelEvent) => {
      // Prevent wheel scrolling from propagating to the main content page on the right
      e.preventDefault();

      if (nav.scrollHeight > nav.clientHeight) {
        nav.scrollTop += e.deltaY;
      }
    };

    aside.addEventListener("wheel", handleWheel, { passive: false });
    return () => aside.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <aside
      ref={asideRef}
      className="flex h-full min-h-0 w-[250px] shrink-0 flex-col bg-[#942E3A] text-[#FFF9EB] overscroll-contain"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
        <Link
          href="/admin"
          onClick={onClose}
          className="font-playfair text-2xl font-black tracking-tight"
        >
          DeRoma{" "}
          <span className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
            Admin
          </span>
        </Link>
        {onClose ? (
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-[#D8B46A] hover:bg-white/10 lg:hidden"
            aria-label="Close admin menu"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <nav
        ref={navRef}
        className="hide-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-3 py-4"
      >
        {navigationGroups.map((group) => (
          <div key={group.groupName} className="space-y-1">
            <div className="px-3 pb-1 text-[9px] font-extrabold uppercase tracking-[0.22em] text-[#D8B46A]/80">
              {group.groupName}
            </div>
            {group.items.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-colors",
                    isActive
                      ? "bg-[#FFF9EB] text-[#942E3A] font-bold shadow-xs"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isActive ? "text-[#942E3A]" : "text-[#D8B46A]"
                    )}
                  />
                  <span>{item.label}</span>
                  {isActive && <ChevronRight className="ml-auto h-3.5 w-3.5" />}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white"
        >
          <ChevronRight className="h-4 w-4 rotate-180 text-[#D8B46A]" />
          View storefront
        </Link>
        <form action={logoutAdminAction} className="mt-1">
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white"
          >
            <Settings className="h-4 w-4 text-[#D8B46A]" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
