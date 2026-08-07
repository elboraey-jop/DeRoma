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
    if (!confirm("Are you sure you want to delete this message?")) return;
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
    <div className="space-y-4 sm:space-y-6" dir="ltr">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#D8B46A]">
              Customer Experience · Inquiries
            </span>
          </div>
          <h1 className="mt-1 font-playfair text-2xl sm:text-3xl font-black text-[#942E3A]">
            Contact Messages
          </h1>
          <p className="mt-1 text-xs text-[#6B1F2A]/70">
            Track and respond to customer messages submitted via the storefront contact page.
          </p>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-white/80 p-1 rounded-xl border border-[#942E3A]/10 shadow-2xs">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === "all"
                ? "bg-[#942E3A] text-white shadow-2xs"
                : "text-[#942E3A] hover:bg-[#942E3A]/8"
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilterStatus("unread")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === "unread"
                ? "bg-[#942E3A] text-white shadow-2xs"
                : "text-[#942E3A] hover:bg-[#942E3A]/8"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilterStatus("read")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === "read"
                ? "bg-[#942E3A] text-white shadow-2xs"
                : "text-[#942E3A] hover:bg-[#942E3A]/8"
            }`}
          >
            Followed Up ({readCount})
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#6B1F2A]/60">Total Messages</span>
            <MessageSquare className="h-4 w-4 text-[#D8B46A]" />
          </div>
          <p className="mt-1 text-xl sm:text-2xl font-black text-[#942E3A]">{totalCount}</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800">Unread</span>
            <Mail className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-1 text-xl sm:text-2xl font-black text-amber-900">{unreadCount}</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800">Followed Up</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-1 text-xl sm:text-2xl font-black text-emerald-900">{readCount}</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#942E3A]/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by customer name, phone number, or message text..."
          className="w-full rounded-xl border border-[#942E3A]/15 bg-white py-2.5 pl-10 pr-4 text-xs font-semibold text-[#942E3A] placeholder-[#942E3A]/40 outline-none transition focus:border-[#D8B46A] focus:ring-1 focus:ring-[#D8B46A]"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#942E3A]/60 hover:text-[#942E3A]"
          >
            Clear
          </button>
        )}
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#942E3A]/20 bg-white p-8 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-[#942E3A]/30" />
          <h3 className="mt-2 text-sm font-bold text-[#942E3A]">No messages found</h3>
          <p className="mt-1 text-xs text-[#6B1F2A]/60">
            {query ? "No messages match your search query." : "No customer messages have been received yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMessages.map((msg) => {
            const isUnread = msg.status === "unread";
            const waUrl = getWhatsAppLink(msg.phone);
            const isCopied = copiedId === msg.id;

            return (
              <div
                key={msg.id}
                className={`group relative rounded-2xl border transition-all ${
                  isUnread
                    ? "border-amber-300 bg-[#fffdf8] shadow-xs"
                    : "border-[#942E3A]/10 bg-white hover:border-[#942E3A]/25"
                } p-3.5 sm:p-5`}
              >
                {/* Responsive Card Layout */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  {/* Customer Info & Message Body */}
                  <div className="min-w-0 flex-1 space-y-2">
                    {/* Header: Customer Name, Status Badge, Date */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1.5 text-sm font-extrabold text-[#942E3A]">
                        <User className="h-4 w-4 text-[#D8B46A]" />
                        {msg.name}
                      </span>

                      {isUnread ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          New Unread
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          <Check className="h-3 w-3" />
                          Followed Up
                        </span>
                      )}

                      <span className="ml-auto text-[10px] font-medium text-stone-400">
                        {new Date(msg.createdAt).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>

                    {/* Phone Actions (Copy & WhatsApp next to phone) */}
                    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#942E3A]/10 bg-[#FFF9EB]/60 p-2 sm:p-2.5">
                      <span className="text-xs font-bold text-[#942E3A] tracking-wide">
                        {msg.phone}
                      </span>

                      {/* Copy Phone Button */}
                      <button
                        onClick={() => handleCopyPhone(msg.id, msg.phone)}
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                          isCopied
                            ? "bg-emerald-600 text-white"
                            : "bg-white text-[#942E3A] border border-[#942E3A]/15 hover:bg-[#942E3A] hover:text-white"
                        }`}
                        title="Copy phone number"
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3 w-3" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 text-[#D8B46A]" />
                            <span>Copy Number</span>
                          </>
                        )}
                      </button>

                      {/* WhatsApp Direct Chat Button */}
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-emerald-700 transition-all"
                        title="Open WhatsApp chat"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>WhatsApp Chat</span>
                      </a>
                    </div>

                    {/* Message Content */}
                    <div className="rounded-xl bg-[#fcf9f5] border border-[#942E3A]/8 p-3 text-xs leading-relaxed text-[#6B1F2A]">
                      <p className="font-semibold text-[11px] text-[#942E3A]/60 mb-1">
                        Message:
                      </p>
                      <p className="whitespace-pre-wrap font-medium">{msg.message}</p>
                    </div>
                  </div>

                  {/* Actions (Toggle Read / Delete) */}
                  <div className="flex items-center gap-2 self-start shrink-0 pt-1 sm:pt-0">
                    <button
                      onClick={() => handleToggleStatus(msg.id, msg.status)}
                      disabled={loadingId === msg.id}
                      className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                        isUnread
                          ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                          : "border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100"
                      }`}
                    >
                      {isUnread ? (
                        <>
                          <Eye className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Mark as Read</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3.5 w-3.5 text-stone-500" />
                          <span>Mark as Unread</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(msg.id)}
                      disabled={loadingId === msg.id}
                      className="rounded-xl border border-red-200 bg-red-50/50 p-2 text-red-600 hover:bg-red-100 transition-colors"
                      title="Delete Message"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
