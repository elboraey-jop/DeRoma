"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  X,
  ClipboardList,
  AlertTriangle,
  Package,
  MessageSquare,
  Star,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Layers,
  Check,
} from "lucide-react";
import {
  getAdminNotificationsAction,
  NotificationCategory,
  NotificationSummary,
} from "@/app/admin/notifications-actions";
import { useAdminI18n } from "@/providers/AdminI18nContext";

export default function AdminNotificationsModal({
  isOpen,
  onClose,
  initialData,
  onUpdateSummary,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialData?: NotificationSummary | null;
  onUpdateSummary?: (summary: NotificationSummary) => void;
}) {
  const router = useRouter();
  const { lang, t, formatNumber } = useAdminI18n();
  const isRtl = lang === "ar";

  const [rawData, setRawData] = useState<NotificationSummary | null>(initialData || null);
  const [activeTab, setActiveTab] = useState<NotificationCategory>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dismissed_admin_notifications");
      if (saved) {
        setDismissedIds(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load dismissed notifications", e);
    }
  }, []);

  const saveDismissedIds = (ids: string[]) => {
    setDismissedIds(ids);
    try {
      localStorage.setItem("dismissed_admin_notifications", JSON.stringify(ids));
    } catch (e) {
      console.error("Failed to save dismissed notifications", e);
    }
  };

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const summary = await getAdminNotificationsAction();
      setRawData(summary);
      if (onUpdateSummary) onUpdateSummary(summary);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const data = useMemo(() => {
    if (!rawData) return null;
    const activeItems = rawData.items.filter((item) => !dismissedIds.includes(item.id));
    return {
      totalCount: activeItems.length,
      ordersCount: activeItems.filter((i) => i.category === "orders").length,
      stockCount: activeItems.filter((i) => i.category === "stock").length,
      messagesCount: activeItems.filter((i) => i.category === "messages").length,
      reviewsCount: activeItems.filter((i) => i.category === "reviews").length,
      items: activeItems,
    };
  }, [rawData, dismissedIds]);

  const filteredItems = useMemo(() => {
    if (!data) return [];
    if (activeTab === "all") return data.items;
    return data.items.filter((item) => item.category === activeTab);
  }, [data, activeTab]);

  if (!isOpen) return null;

  const handleDismissSingle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = [...dismissedIds, id];
    saveDismissedIds(updated);
  };

  const handleDismissAll = () => {
    if (!data || data.items.length === 0) return;
    const currentItemIds = data.items.map((item) => item.id);
    const updated = Array.from(new Set([...dismissedIds, ...currentItemIds]));
    saveDismissedIds(updated);
  };

  const handleItemClick = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-[#8B7CC7]/45 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        onWheel={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden rounded-3xl border border-[#942E3A]/20 bg-[#fffdf8] text-[#942E3A] shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#942E3A]/10 bg-white px-5 py-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#942E3A]/10 text-[#942E3A]">
              <Bell className="h-5 w-5 text-[#942E3A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-playfair text-lg sm:text-xl font-bold text-[#942E3A]">
                  {t("common.notifications")}
                </h2>
                {data && data.totalCount > 0 ? (
                  <span className="rounded-full bg-[#942E3A] px-2 py-0.5 text-[10px] font-extrabold text-[#FFF9EB]">
                    {formatNumber(data.totalCount)} {isRtl ? "نشطة" : "active"}
                  </span>
                ) : null}
              </div>
              <p className="text-[11px] text-[#6B1F2A]/65">
                {isRtl
                  ? "تنبيهات فورية ومباشرة للطلبات، المخزون، والرسائل والتقييمات"
                  : "Real-time alerts for orders, inventory, messages & reviews."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {data && data.totalCount > 0 && (
              <button
                onClick={handleDismissAll}
                className="hidden sm:inline-flex items-center gap-1 rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB] px-2.5 py-1.5 text-[11px] font-bold text-[#942E3A] hover:bg-[#942E3A] hover:text-white transition-all"
                title={t("common.markAllAsRead")}
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-[#D8B46A]" />
                <span>{t("common.markAllAsRead")}</span>
              </button>
            )}

            <button
              onClick={fetchNotifications}
              disabled={isLoading}
              className="rounded-xl p-2 text-[#942E3A]/60 hover:bg-[#942E3A]/8 transition-colors"
              title={isRtl ? "تحديث الإشعارات" : "Refresh Notifications"}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-[#D8B46A]" : ""}`} />
            </button>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-[#942E3A]/60 hover:bg-[#942E3A]/8 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Category Tabs Filter */}
        <div className="admin-tabs-shell mx-4 flex items-center gap-2 overflow-x-auto whitespace-nowrap px-1 py-1 hide-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab("all")}
            data-active={activeTab === "all"}
            className="admin-tab flex shrink-0 whitespace-nowrap items-center gap-1.5 px-3.5 py-2 text-xs font-bold"
          >
            <Layers className="h-3.5 w-3.5 shrink-0" />
            <span>
              {t("common.all")} {data ? `(${formatNumber(data.totalCount)})` : ""}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            data-active={activeTab === "orders"}
            className="admin-tab flex shrink-0 whitespace-nowrap items-center gap-1.5 px-3.5 py-2 text-xs font-bold"
          >
            <ClipboardList className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span>
              {t("navigation.orders")} {data ? `(${formatNumber(data.ordersCount)})` : ""}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("stock")}
            data-active={activeTab === "stock"}
            className="admin-tab flex shrink-0 whitespace-nowrap items-center gap-1.5 px-3.5 py-2 text-xs font-bold"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
            <span>
              {t("navigation.inventory")} {data ? `(${formatNumber(data.stockCount)})` : ""}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("messages")}
            data-active={activeTab === "messages"}
            className="admin-tab flex shrink-0 whitespace-nowrap items-center gap-1.5 px-3.5 py-2 text-xs font-bold"
          >
            <MessageSquare className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <span>
              {t("navigation.messages")} {data ? `(${formatNumber(data.messagesCount)})` : ""}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("reviews")}
            data-active={activeTab === "reviews"}
            className="admin-tab flex shrink-0 whitespace-nowrap items-center gap-1.5 px-3.5 py-2 text-xs font-bold"
          >
            <Star className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>
              {t("navigation.reviews")} {data ? `(${formatNumber(data.reviewsCount)})` : ""}
            </span>
          </button>
        </div>

        {/* Notifications Scrollable List */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-2.5">
          {isLoading && (!data || data.items.length === 0) ? (
            <div className="space-y-2.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className="flex items-start gap-3 rounded-2xl border border-[#942E3A]/10 bg-white p-3.5 animate-pulse"
                >
                  <div className="h-9 w-9 shrink-0 rounded-xl bg-[#942E3A]/10" />
                  <div className="min-w-0 flex-1 space-y-2 py-0.5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="h-3.5 w-1/3 rounded-md bg-[#942E3A]/15" />
                      <div className="h-3 w-12 rounded-md bg-stone-200" />
                    </div>
                    <div className="h-3 w-3/4 rounded-md bg-[#942E3A]/10" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500/70" />
              <h3 className="text-sm font-bold text-[#942E3A]">
                {t("common.noNotifications")}
              </h3>
            </div>
          ) : (
            filteredItems.map((item) => {
              let icon = <Bell className="h-4 w-4 text-[#942E3A]" />;
              let badgeColor = "bg-stone-100 text-stone-700";

              if (item.category === "orders") {
                icon = <ClipboardList className="h-4 w-4 text-amber-600" />;
                badgeColor = "bg-amber-100 border-amber-200 text-amber-800";
              } else if (item.category === "stock") {
                if (item.severity === "high") {
                  icon = <AlertTriangle className="h-4 w-4 text-red-600" />;
                  badgeColor = "bg-red-100 border-red-200 text-red-800";
                } else {
                  icon = <Package className="h-4 w-4 text-orange-600" />;
                  badgeColor = "bg-orange-100 border-orange-200 text-orange-800";
                }
              } else if (item.category === "messages") {
                icon = <MessageSquare className="h-4 w-4 text-blue-600" />;
                badgeColor = "bg-blue-100 border-blue-200 text-blue-800";
              } else if (item.category === "reviews") {
                icon = <Star className="h-4 w-4 text-amber-500 fill-amber-500" />;
                badgeColor = "bg-amber-50 border-amber-200 text-amber-900";
              }

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item.href)}
                  className="group flex items-start gap-3 rounded-2xl border border-[#942E3A]/10 bg-white p-3.5 transition-all hover:border-[#942E3A]/30 hover:bg-[#FFF9EB]/40 hover:shadow-xs cursor-pointer"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${badgeColor}`}>
                    {icon}
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-[#942E3A] truncate group-hover:text-[#6B1F2A]">
                        {item.title}
                      </h4>
                      <span className="text-[10px] font-medium text-stone-400 shrink-0">
                        {new Date(item.time).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#6B1F2A]/80 leading-snug line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 self-center">
                    <button
                      onClick={(e) => handleDismissSingle(item.id, e)}
                      className="rounded-xl border border-stone-200 bg-stone-50 p-1.5 text-stone-400 opacity-70 hover:opacity-100 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all"
                      title={isRtl ? "تحديد كمقروء" : "Mark as read"}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    {isRtl ? (
                      <ChevronLeft className="h-4 w-4 text-[#942E3A]/30 transition-transform group-hover:-translate-x-0.5 group-hover:text-[#942E3A]" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-[#942E3A]/30 transition-transform group-hover:translate-x-0.5 group-hover:text-[#942E3A]" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-[#942E3A]/10 bg-white px-5 py-3 text-center shrink-0">
          <p className="text-[11px] text-stone-400 font-medium">
            {isRtl ? "الضغط على أي إشعار ينقلك لصفحته المباشرة" : "Clicking any notification opens its page."}
          </p>

          {data && data.totalCount > 0 && (
            <button
              onClick={handleDismissAll}
              className="inline-flex items-center gap-1 rounded-lg border border-[#942E3A]/15 bg-[#FFF9EB] px-2.5 py-1 text-[11px] font-bold text-[#942E3A] hover:bg-[#942E3A] hover:text-white transition-all"
            >
              <CheckCircle2 className="h-3 w-3 text-[#D8B46A]" />
              <span>{t("common.markAllAsRead")}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
