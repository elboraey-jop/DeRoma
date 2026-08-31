"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Check,
  MessageSquare,
  MessageCircle,
  Mail,
  Search,
  Trash2,
  User,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  deleteMessageAction,
  updateMessageStatusAction,
} from "@/app/admin/messages/actions";
import { useAdminI18n } from "@/providers/AdminI18nContext";

export type ContactMessageItem = {
  id: string;
  name: string;
  phone: string;
  message: string;
  status: string;
  notes: string | null;
  createdAt: string;
};

export default function AdminMessagesClient({
  messages,
}: {
  messages: ContactMessageItem[];
}) {
  const { lang, t, formatNumber } = useAdminI18n();
  const isRtl = lang === "ar";
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "read">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Format phone number for WhatsApp link
  const getWhatsAppLink = (phone: string) => {
    let clean = phone.replace(/[^0-9]/g, "");
    if (clean.startsWith("0")) {
      clean = "20" + clean.substring(1);
    } else if (clean.length === 10 && !clean.startsWith("20")) {
      clean = "20" + clean;
    }
    return `https://wa.me/${clean}`;
  };

  // Copy phone number to clipboard
  const handleCopyPhone = (id: string, phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Toggle Read / Unread status
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "unread" ? "read" : "unread";
    setLoadingId(id);
    await updateMessageStatusAction(id, newStatus);
    setLoadingId(null);
  };

  // Delete message
  const handleDelete = async (id: string) => {
    if (!confirm(isRtl ? "هل أنت متأكد من حذف هذه الرسالة؟" : "Are you sure you want to delete this message?")) return;
    setLoadingId(id);
    await deleteMessageAction(id);
    setLoadingId(null);
  };

  // Filter messages
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      const matchesStatus =
        filterStatus === "all" || msg.status === filterStatus;
      const q = query.toLowerCase().trim();
      const matchesQuery =
        !q ||
        msg.name.toLowerCase().includes(q) ||
        msg.phone.includes(q) ||
        msg.message.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [messages, filterStatus, query]);

  const totalCount = messages.length;
  const unreadCount = messages.filter((m) => m.status === "unread").length;
  const readCount = messages.filter((m) => m.status === "read").length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0 text-right">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">
            {isRtl ? "خدمة العملاء والاتصال" : "Customer care"}
          </p>
          <h1 className="mt-1 font-playfair text-2xl sm:text-3xl font-black text-[#942E3A]">
            {t("messages.title")}
          </h1>
          <p className="mt-1 text-xs text-[#6B1F2A]/65">
            {t("messages.subtitle")}
          </p>
        </div>
      </div>

      {/* Stats KPI */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-4">
        <button
          type="button"
          onClick={() => setFilterStatus("all")}
          className={`flex min-w-0 items-center justify-between rounded-2xl border p-3 ${isRtl ? "text-right" : "text-left"} transition shadow-2xs ${
            filterStatus === "all"
              ? "border-[#942E3A] bg-[#942E3A] text-white"
              : "border-[#942E3A]/10 bg-white text-[#942E3A] hover:bg-[#FFF9EB]"
          }`}
        >
          <div>
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider opacity-75">
              {t("common.all")}
            </p>
            <p className="mt-0.5 font-playfair text-xl sm:text-2xl font-black">
              {formatNumber(totalCount)}
            </p>
          </div>
          <Mail className="h-5 w-5 opacity-80" />
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus("unread")}
          className={`flex min-w-0 items-center justify-between rounded-2xl border p-3 ${isRtl ? "text-right" : "text-left"} transition shadow-2xs ${
            filterStatus === "unread"
              ? "border-[#942E3A] bg-[#942E3A] text-white"
              : "border-[#D8B46A]/40 bg-[#fff7df] text-[#942E3A] hover:bg-[#fff0c7]"
          }`}
        >
          <div>
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider opacity-75">
              {t("messages.statusUnread")}
            </p>
            <p className="mt-0.5 font-playfair text-xl sm:text-2xl font-black">
              {formatNumber(unreadCount)}
            </p>
          </div>
          <MessageCircle className="h-5 w-5 opacity-80 text-amber-600" />
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus("read")}
          className={`flex min-w-0 items-center justify-between rounded-2xl border p-3 ${isRtl ? "text-right" : "text-left"} transition shadow-2xs ${
            filterStatus === "read"
              ? "border-[#942E3A] bg-[#942E3A] text-white"
              : "border-[#942E3A]/10 bg-white text-[#942E3A] hover:bg-[#FFF9EB]"
          }`}
        >
          <div>
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider opacity-75">
              {t("messages.statusRead")}
            </p>
            <p className="mt-0.5 font-playfair text-xl sm:text-2xl font-black">
              {formatNumber(readCount)}
            </p>
          </div>
          <CheckCircle2 className="h-5 w-5 opacity-80 text-emerald-600" />
        </button>
      </div>

      {/* Messages List & Filter Header */}
      <div className="overflow-hidden rounded-3xl border border-[#942E3A]/10 bg-white p-4 shadow-xs sm:p-6">
        <div className="flex flex-col gap-3 border-b border-[#942E3A]/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-[#D8B46A]" />
            <h2 className="font-playfair text-lg font-bold text-[#942E3A]">
              {isRtl ? "الرسائل الواردة" : "Incoming Messages"} ({formatNumber(filteredMessages.length)})
            </h2>
          </div>

          <label className="relative block w-full sm:w-64">
            <Search className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-[#D8B46A] ${isRtl ? "right-3" : "left-3"}`} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isRtl ? "ابحث باسم المرسل أو الهاتف أو المحتوى..." : "Search name, phone, message..."}
              className={`w-full rounded-xl border border-[#942E3A]/10 bg-[#FFF9EB]/60 py-2 text-xs outline-none focus:border-[#942E3A] ${isRtl ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left"}`}
            />
          </label>
        </div>

        <div className="mt-4 space-y-3">
          {filteredMessages.map((msg) => {
            const isUnread = msg.status === "unread";
            return (
              <div
                key={msg.id}
                className={`min-w-0 rounded-2xl border p-3.5 transition-all shadow-2xs sm:p-4 ${
                  isUnread
                    ? "border-[#D8B46A]/50 bg-[#fff9eb]/60"
                    : "border-[#942E3A]/10 bg-white"
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-[#942E3A]" />
                      <h3 className="font-bold text-sm text-[#942E3A]">{msg.name}</h3>
                      {isUnread && (
                        <span className="rounded-full bg-[#942E3A] px-2 py-0.5 text-[9px] font-black text-[#FFF9EB]">
                          {t("messages.statusUnread")}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B1F2A]/70 pt-0.5">
                      <div className="flex items-center gap-1 font-semibold text-[#942E3A]" dir="ltr">
                        <span className="whitespace-nowrap">{msg.phone}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyPhone(msg.id, msg.phone)}
                          className="rounded p-1 hover:bg-[#942E3A]/10 text-[#942E3A]"
                          title={t("common.copy")}
                        >
                          {copiedId === msg.id ? (
                            <Check className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Copy className="h-3 w-3 text-[#D8B46A]" />
                          )}
                        </button>
                      </div>

                      <a
                        href={getWhatsAppLink(msg.phone)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-emerald-700 transition"
                      >
                        <MessageCircle className="h-3 w-3" /> {isRtl ? "واتساب" : "WhatsApp"}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      disabled={loadingId === msg.id}
                      onClick={() => handleToggleStatus(msg.id, msg.status)}
                      className="inline-flex items-center gap-1 rounded-xl border border-[#942E3A]/15 bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#942E3A] hover:bg-[#FFF9EB] transition"
                    >
                      {isUnread ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      <span>{isUnread ? t("messages.statusRead") : t("messages.statusUnread")}</span>
                    </button>

                    <button
                      type="button"
                      disabled={loadingId === msg.id}
                      onClick={() => handleDelete(msg.id)}
                      className="rounded-xl border border-red-200 bg-red-50 p-1.5 text-red-600 hover:bg-red-600 hover:text-white transition"
                      title={t("common.delete")}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div dir="auto" className="mt-3 break-words whitespace-pre-wrap rounded-xl border border-[#942E3A]/10 bg-white p-3 text-start text-xs leading-relaxed text-[#481827]">
                  {msg.message}
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-stone-400">
                  <span>
                    {new Date(msg.createdAt).toLocaleString(isRtl ? "ar-EG-u-nu-latn" : "en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredMessages.length === 0 && (
            <div className="py-12 text-center text-xs text-[#6B1F2A]/60">
              <Mail className="mx-auto h-8 w-8 text-[#D8B46A] mb-2" />
              <p className="font-bold">{t("common.noResults")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
