"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (message: string, title?: string, duration?: number) => void;
    error: (message: string, title?: string, duration?: number) => void;
    info: (message: string, title?: string, duration?: number) => void;
    warning: (message: string, title?: string, duration?: number) => void;
  };
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info", title?: string, duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastMessage = { id, type, message, title, duration };

      setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // max 5 active toasts

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toastHelpers = {
    success: (message: string, title?: string, duration?: number) =>
      addToast(message, "success", title, duration),
    error: (message: string, title?: string, duration?: number) =>
      addToast(message, "error", title, duration),
    info: (message: string, title?: string, duration?: number) =>
      addToast(message, "info", title, duration),
    warning: (message: string, title?: string, duration?: number) =>
      addToast(message, "warning", title, duration),
  };

  return (
    <ToastContext.Provider value={{ toast: toastHelpers, showToast: addToast, removeToast }}>
      {children}

      {/* Top Right Toast Container via Portal */}
      {mounted &&
        createPortal(
          <div
            dir="ltr"
            aria-live="polite"
            aria-atomic="true"
            className="fixed top-4 right-4 z-[999999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0"
          >
            {toasts.map((t) => (
              <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: ToastMessage; onClose: () => void }) {
  const isSuccess = toast.type === "success";
  const isError = toast.type === "error";
  const isWarning = toast.type === "warning";

  const getContainerStyle = () => {
    if (isSuccess)
      return "bg-[#064E3B]/95 text-[#ECFDF5] border border-[#059669]/40 shadow-[0_12px_32px_rgba(5,150,105,0.25)]";
    if (isError)
      return "bg-[#4C0519]/95 text-[#FFF1F2] border border-[#F43F5E]/40 shadow-[0_12px_32px_rgba(244,63,94,0.25)]";
    if (isWarning)
      return "bg-[#451A03]/95 text-[#FEF3C7] border border-[#F59E0B]/40 shadow-[0_12px_32px_rgba(245,158,11,0.25)]";
    return "bg-[#54151D]/95 text-[#FFF9EB] border border-[#D8B46A]/50 shadow-[0_12px_32px_rgba(107,31,42,0.35)]";
  };

  const getIcon = () => {
    if (isSuccess) return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />;
    if (isError) return <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />;
    if (isWarning) return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />;
    return <Info className="w-5 h-5 text-[#D8B46A] shrink-0 mt-0.5" />;
  };

  const getProgressBarColor = () => {
    if (isSuccess) return "bg-emerald-400";
    if (isError) return "bg-rose-400";
    if (isWarning) return "bg-amber-400";
    return "bg-[#D8B46A]";
  };

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden rounded-2xl p-4 transition-all duration-300 transform translate-x-0 opacity-100 backdrop-blur-md ${getContainerStyle()}`}
    >
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1 min-w-0 pr-2">
          {toast.title && (
            <h4 className="text-xs font-bold font-playfair uppercase tracking-wider mb-0.5 opacity-90">
              {toast.title}
            </h4>
          )}
          <p className="text-xs font-medium leading-relaxed break-words">{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-white/60 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          aria-label="Close notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Auto-dismiss Progress Bar */}
      {toast.duration && toast.duration > 0 && (
        <div
          className={`absolute bottom-0 left-0 h-0.5 ${getProgressBarColor()}`}
          style={{
            animation: `toastProgress ${toast.duration}ms linear forwards`,
          }}
        />
      )}
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
