"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  Bell,
  Boxes,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Database,
  DollarSign,
  Globe,
  LayoutDashboard,
  Menu,
  MessageSquare,
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
import AdminNotificationsModal from "@/components/AdminNotificationsModal";
import {
  getAdminNotificationsAction,
  NotificationSummary,
} from "@/app/admin/notifications-actions";
import { AdminI18nProvider, useAdminI18n } from "@/providers/AdminI18nContext";
import AdminLangToggle from "@/components/AdminLangToggle";

interface NavItem {
  key: string;
  href: string;
  icon: any;
}

interface NavGroup {
  groupKey: string;
  items: NavItem[];
}

const navigationGroups: NavGroup[] = [
  {
    groupKey: "navigation.dashboardMetrics",
    items: [
      { key: "navigation.dashboard", href: "/admin", icon: LayoutDashboard },
      { key: "navigation.analytics", href: "/admin/analytics", icon: BarChart3 },
      { key: "navigation.financials", href: "/admin/financials", icon: DollarSign },
      { key: "navigation.dailyLog", href: "/admin/daily-log", icon: CalendarDays },
      { key: "navigation.team", href: "/admin/team", icon: Users },
    ],
  },
  {
    groupKey: "navigation.operationsCatalog",
    items: [
      { key: "navigation.orders", href: "/admin/orders", icon: ClipboardList },
      { key: "navigation.products", href: "/admin/products", icon: ShoppingBag },
      { key: "navigation.inventory", href: "/admin/inventory", icon: Package },
      { key: "navigation.suppliers", href: "/admin/suppliers", icon: Boxes },
      { key: "navigation.backup", href: "/admin/backup", icon: Database },
    ],
  },
  {
    groupKey: "navigation.customerExperience",
    items: [
      { key: "navigation.website", href: "/admin/website", icon: Globe },
      { key: "navigation.messages", href: "/admin/messages", icon: MessageSquare },
      { key: "navigation.customers", href: "/admin/customers", icon: Users },
      { key: "navigation.reviews", href: "/admin/reviews", icon: MessageSquareQuote },
      { key: "navigation.promotions", href: "/admin/promotions", icon: Percent },
      { key: "navigation.shipping", href: "/admin/shipping", icon: Truck },
    ],
  },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminI18nProvider>
      <AdminShellContent>{children}</AdminShellContent>
    </AdminI18nProvider>
  );
}

function AdminShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { lang, t, formatNumber } = useAdminI18n();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifSummary, setNotifSummary] = useState<NotificationSummary | null>(null);

  useEffect(() => {
    const handleAdminSubmit = (event: SubmitEvent) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || form.dataset.submitting === "true") return;

      form.dataset.submitting = "true";
      form.setAttribute("aria-busy", "true");
      const submitButtons = Array.from(
        form.querySelectorAll<HTMLButtonElement | HTMLInputElement>(
          'button[type="submit"], input[type="submit"]',
        ),
      );

      submitButtons.forEach((button) => {
        button.disabled = true;
        button.classList.add("admin-submit-pending");
        button.setAttribute("aria-disabled", "true");
      });

      // Some inline server-action forms do not expose a shared pending state.
      // Keep a short client-side guard to stop rapid duplicate clicks without
      // leaving the button stuck when the action does not navigate.
      window.setTimeout(() => {
        form.dataset.submitting = "false";
        form.removeAttribute("aria-busy");
        submitButtons.forEach((button) => {
          button.disabled = false;
          button.classList.remove("admin-submit-pending");
          button.removeAttribute("aria-disabled");
        });
      }, 2500);
    };

    document.addEventListener("submit", handleAdminSubmit, true);
    return () => document.removeEventListener("submit", handleAdminSubmit, true);
  }, []);

  // Fetch notifications summary
  const fetchSummary = async () => {
    try {
      const res = await getAdminNotificationsAction();
      setNotifSummary(res);
    } catch (e) {
      console.error("Failed to load notification summary:", e);
    }
  };

  useEffect(() => {
    if (pathname !== "/admin/login") {
      fetchSummary();
    }
  }, [pathname]);

  if (pathname === "/admin/login") return <>{children}</>;

  const totalUnread = notifSummary?.totalCount || 0;
  const isRtl = lang === "ar";

  return (
    <div data-admin-shell className="flex min-h-screen bg-[#f7f1e8]">
      {/* Desktop Sidebar */}
      <div className="z-40 hidden h-screen w-64 shrink-0 lg:sticky lg:top-0 lg:block">
        <AdminSidebar
          pathname={pathname}
          notifSummary={notifSummary}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isSidebarOpen && (
        <>
          <button
            className="fixed inset-0 z-40 bg-[#8B7CC7]/45 backdrop-blur-[2px] lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close admin menu"
          />
          <div className={cn("fixed inset-y-0 z-50 lg:hidden", isRtl ? "right-0" : "left-0")}>
            <AdminSidebar
              pathname={pathname}
              onClose={() => setIsSidebarOpen(false)}
              notifSummary={notifSummary}
              onOpenNotifications={() => setIsNotificationsOpen(true)}
            />
          </div>
        </>
      )}

      <div className="min-w-0 flex-1 overflow-x-hidden">
        {/* Mobile Header / Top Bar (Fixed on Mobile) */}
        <div className="fixed top-0 left-0 right-0 z-30 flex h-14 items-center justify-between border-b border-[#942E3A]/10 bg-[#f7f1e8]/95 px-3 backdrop-blur-md shadow-2xs sm:px-6 lg:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-[#942E3A]/15 bg-white px-3 py-2 text-xs font-bold text-[#942E3A] shadow-xs"
            aria-label="Open admin menu"
          >
            <Menu className="h-4 w-4 text-[#D8B46A]" />
            <span>{t("common.menu")}</span>
          </button>

          {/* Mobile Top Bar Notification Icon */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative flex items-center justify-center rounded-xl border border-[#942E3A]/15 bg-white p-2 text-[#942E3A] shadow-xs hover:bg-[#FFF9EB] transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 text-[#942E3A]" />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D8B46A] px-1 text-[9px] font-black text-[#942E3A] shadow-2xs">
                {totalUnread > 99 ? "99+" : formatNumber(totalUnread)}
              </span>
            )}
          </button>
        </div>

        <main className="mx-auto w-full min-w-0 max-w-full overflow-x-hidden p-3 pt-16 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Centered Notifications Modal */}
      <AdminNotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        initialData={notifSummary}
        onUpdateSummary={setNotifSummary}
      />
    </div>
  );
}

function AdminSidebar({
  pathname,
  onClose,
  notifSummary,
  onOpenNotifications,
}: {
  pathname: string;
  onClose?: () => void;
  notifSummary: NotificationSummary | null;
  onOpenNotifications: () => void;
}) {
  const { lang, t, formatNumber } = useAdminI18n();
  const navRef = useRef<HTMLElement>(null);
  const isRtl = lang === "ar";

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      nav.scrollTop += e.deltaY;
    };

    // Keep wheel scrolling scoped to the navigation list instead of the page.
    nav.addEventListener("wheel", handleWheel, { passive: false });
    return () => nav.removeEventListener("wheel", handleWheel);
  }, []);

  const totalUnread = notifSummary?.totalCount || 0;

  return (
    <aside
      className="flex h-full min-h-0 w-64 shrink-0 flex-col bg-[#942E3A] text-[#FFF9EB] overscroll-contain"
    >
      {/* Sidebar Header with Brand & Notification Bell */}
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

        <div className="flex items-center gap-1">
          {/* Notification Bell Icon */}
          <button
            onClick={() => {
              if (onClose) onClose();
              onOpenNotifications();
            }}
            className="relative rounded-full p-2 text-[#D8B46A] hover:bg-white/10 transition-colors"
            title={t("common.notifications")}
            aria-label="Open notifications"
          >
            <Bell className="h-4.5 w-4.5" />
            {totalUnread > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D8B46A] px-1 text-[9px] font-black text-[#942E3A] ring-2 ring-[#942E3A]">
                {totalUnread > 99 ? "99+" : formatNumber(totalUnread)}
              </span>
            )}
          </button>

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
      </div>

      <nav
        ref={navRef}
        className="hide-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-3 py-4"
      >
        {navigationGroups.map((group) => (
          <div key={group.groupKey} className="space-y-1">
            <div className="px-3 pb-1 text-[9px] font-extrabold uppercase tracking-[0.22em] text-[#D8B46A]/80">
              {t(group.groupKey)}
            </div>
            {group.items.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              const label = t(item.key);
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
                  <span>{label}</span>
                  {isActive && (
                    isRtl ? (
                      <ChevronLeft className="mr-auto h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="ml-auto h-3.5 w-3.5" />
                    )
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4 space-y-2">
        {/* Language Switcher Toggle Button - Placed directly above Sign Out */}
        <AdminLangToggle />

        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white"
        >
          {isRtl ? (
            <ChevronRight className="h-4 w-4 text-[#D8B46A]" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-[#D8B46A]" />
          )}
          <span>{t("common.viewStorefront")}</span>
        </Link>

        <form action={logoutAdminAction} className="mt-1">
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white"
          >
            <Settings className="h-4 w-4 text-[#D8B46A]" />
            <span>{t("common.signOut")}</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
