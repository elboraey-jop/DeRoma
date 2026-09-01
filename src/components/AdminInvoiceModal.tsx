"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Download,
  FileText,
  Image as ImageIcon,
  Loader2,
  Share2,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Languages,
} from "lucide-react";
import { toast } from "sonner";
import AdminInvoiceDocument, {
  InvoiceOrderData,
} from "@/components/AdminInvoiceDocument";
import {
  exportInvoiceAsPdf,
  exportInvoiceAsPng,
  getBase64ImageFromUrl,
  shareInvoice,
} from "@/lib/invoiceGenerator";
import { useAdminI18n } from "@/providers/AdminI18nContext";

interface AdminInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: InvoiceOrderData;
}

export default function AdminInvoiceModal({
  isOpen,
  onClose,
  order,
}: AdminInvoiceModalProps) {
  const { lang: adminLang } = useAdminI18n();
  const invoiceCaptureRef = useRef<HTMLDivElement | null>(null);
  const previewWrapperRef = useRef<HTMLDivElement | null>(null);

  const [invoiceLang, setInvoiceLang] = useState<"ar" | "en">("ar");
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [base64Images, setBase64Images] = useState<Record<string, string>>({});
  const [canShare, setCanShare] = useState(false);
  const [previewScale, setPreviewScale] = useState<number>(1);
  const [manualZoom, setManualZoom] = useState<number | null>(null);

  // Sync initial language with current admin language
  useEffect(() => {
    if (isOpen) {
      setInvoiceLang(adminLang === "en" ? "en" : "ar");
    }
  }, [isOpen, adminLang]);

  // Check if Web Share API with files is supported
  useEffect(() => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      setCanShare(typeof navigator.share === "function");
    }
  }, []);

  // Preload and convert item images to base64 to avoid CORS issues during canvas capture
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const preload = async () => {
      const imagesMap: Record<string, string> = {};
      const promises = order.items.map(async (item) => {
        const imageUrl = item.product?.images?.[0];
        if (imageUrl) {
          try {
            const b64 = await getBase64ImageFromUrl(imageUrl);
            imagesMap[item.id] = b64;
          } catch (e) {
            imagesMap[item.id] = imageUrl;
          }
        }
      });

      await Promise.all(promises);
      if (isMounted) {
        setBase64Images(imagesMap);
      }
    };

    preload();
    return () => {
      isMounted = false;
    };
  }, [isOpen, order]);

  // Handle responsive preview scaling
  useEffect(() => {
    if (!isOpen) return;

    const updateScale = () => {
      if (manualZoom !== null) return;
      if (!previewWrapperRef.current) return;
      const containerWidth = previewWrapperRef.current.clientWidth - 32;
      const docWidth = 760;
      const scale = Math.min(1, containerWidth / docWidth);
      setPreviewScale(Math.max(0.35, scale));
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [isOpen, manualZoom]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentScale = manualZoom ?? previewScale;

  const handleExportPng = async () => {
    if (!invoiceCaptureRef.current) return;
    setIsExportingImage(true);
    try {
      await exportInvoiceAsPng(
        invoiceCaptureRef.current,
        `Invoice-${order.orderNumber}-${invoiceLang}.png`
      );
      toast.success(
        invoiceLang === "ar"
          ? "تم حفظ صورة الفاتورة بنجاح!"
          : "Invoice image saved successfully!"
      );
    } catch (e) {
      console.error(e);
      toast.error(
        invoiceLang === "ar"
          ? "حدث خطأ أثناء حفظ الصورة."
          : "Error saving invoice image."
      );
    } finally {
      setIsExportingImage(false);
    }
  };

  const handleExportPdf = async () => {
    if (!invoiceCaptureRef.current) return;
    setIsExportingPdf(true);
    try {
      await exportInvoiceAsPdf(
        invoiceCaptureRef.current,
        `Invoice-${order.orderNumber}-${invoiceLang}.pdf`
      );
      toast.success(
        invoiceLang === "ar"
          ? "تم تحميل ملف PDF بنجاح!"
          : "Invoice PDF downloaded successfully!"
      );
    } catch (e) {
      console.error(e);
      toast.error(
        invoiceLang === "ar"
          ? "حدث خطأ أثناء إنشاء ملف PDF."
          : "Error generating PDF file."
      );
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleShare = async () => {
    if (!invoiceCaptureRef.current) return;
    setIsSharing(true);
    try {
      const shared = await shareInvoice(
        invoiceCaptureRef.current,
        `${order.orderNumber}-${invoiceLang}`
      );
      if (shared) {
        toast.success(
          invoiceLang === "ar"
            ? "تمت مشاركة الفاتورة بنجاح!"
            : "Invoice shared successfully!"
        );
      }
    } catch (e) {
      console.error(e);
      toast.error(
        invoiceLang === "ar" ? "تعذرت المشاركة." : "Failed to share invoice."
      );
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/65 p-2 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative flex flex-col max-h-[96vh] w-full max-w-4xl rounded-3xl bg-[#f7f1e8] shadow-2xl border border-[#7C69BA]/30 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-[#7C69BA]/15 bg-white px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F8F5FF] text-[#7C69BA] border border-[#7C69BA]/30 shadow-2xs">
              <FileText className="h-5 w-5 text-[#7C69BA]" />
            </div>
            <div>
              <h2 className="font-playfair text-base sm:text-lg font-bold text-[#2D264B]">
                {invoiceLang === "ar"
                  ? `فاتورة الطلب #${order.orderNumber}`
                  : `Order Invoice #${order.orderNumber}`}
              </h2>
              <p className="text-[10px] sm:text-xs text-[#8277A8]">
                {invoiceLang === "ar"
                  ? "تصدير ومعاينة الفاتورة بصيغة صورة أو PDF بجودة فائقة"
                  : "Export and preview invoice as high-resolution Image or PDF"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-full p-2 text-[#8277A8] hover:bg-[#F8F5FF] hover:text-[#58488E] transition"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* CONTROLS TOOLBAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#7C69BA]/15 bg-[#FFFDF9] px-4 py-3 sm:px-6">
          {/* Left: Language Toggle & Zoom Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Language Segmented Control */}
            <div className="flex items-center rounded-xl bg-[#F8F5FF] p-1 border border-[#7C69BA]/25 shadow-2xs">
              <button
                type="button"
                onClick={() => setInvoiceLang("ar")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  invoiceLang === "ar"
                    ? "bg-[#7C69BA] text-white shadow-xs"
                    : "text-[#58488E] hover:bg-white/60"
                }`}
              >
                <span>🇸🇦 عربي</span>
              </button>
              <button
                type="button"
                onClick={() => setInvoiceLang("en")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  invoiceLang === "en"
                    ? "bg-[#7C69BA] text-white shadow-xs"
                    : "text-[#58488E] hover:bg-white/60"
                }`}
              >
                <span>🇬🇧 English</span>
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 text-xs text-[#2D264B]">
              <button
                type="button"
                onClick={() =>
                  setManualZoom((prev) =>
                    Math.min(1.2, (prev ?? previewScale) + 0.1)
                  )
                }
                className="rounded-lg border border-[#7C69BA]/20 bg-white p-1.5 hover:bg-[#F8F5FF] text-[#58488E] transition shadow-2xs"
                title={invoiceLang === "ar" ? "تكبير" : "Zoom in"}
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setManualZoom((prev) =>
                    Math.max(0.35, (prev ?? previewScale) - 0.1)
                  )
                }
                className="rounded-lg border border-[#7C69BA]/20 bg-white p-1.5 hover:bg-[#F8F5FF] text-[#58488E] transition shadow-2xs"
                title={invoiceLang === "ar" ? "تصغير" : "Zoom out"}
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              {manualZoom !== null && (
                <button
                  type="button"
                  onClick={() => setManualZoom(null)}
                  className="flex items-center gap-1 rounded-lg border border-[#7C69BA]/20 bg-white px-2 py-1 text-[10px] font-bold text-[#58488E] hover:bg-[#F8F5FF] transition shadow-2xs"
                  title={invoiceLang === "ar" ? "ملاءمة الشاشة" : "Fit to screen"}
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>{invoiceLang === "ar" ? "ملاءمة" : "Fit"}</span>
                </button>
              )}
              <span className="text-[10px] font-mono font-bold text-[#7C69BA] px-1">
                {Math.round(currentScale * 100)}%
              </span>
            </div>
          </div>

          {/* Right: Export Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Save as Image Button (High Contrast Solid Purple) */}
            <button
              type="button"
              onClick={handleExportPng}
              disabled={isExportingImage || isExportingPdf}
              className="inline-flex items-center gap-2 rounded-xl bg-[#7C69BA] border border-[#6D5AA8] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#6C59A7] active:scale-95 disabled:opacity-50"
            >
              {isExportingImage ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <ImageIcon className="h-4 w-4 text-white" />
              )}
              <span>
                {invoiceLang === "ar" ? "حفظ كصورة (PNG)" : "Save as Image (PNG)"}
              </span>
            </button>

            {/* Save as PDF Button (High Contrast White with Purple Border) */}
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingImage || isExportingPdf}
              className="inline-flex items-center gap-2 rounded-xl bg-white border-2 border-[#7C69BA] px-4 py-2 text-xs font-bold text-[#7C69BA] shadow-xs transition hover:bg-[#F8F5FF] active:scale-95 disabled:opacity-50"
            >
              {isExportingPdf ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#7C69BA]" />
              ) : (
                <Download className="h-4 w-4 text-[#7C69BA]" />
              )}
              <span>
                {invoiceLang === "ar" ? "تحميل PDF" : "Download PDF"}
              </span>
            </button>

            {/* Share Button (Mobile/Supported devices) */}
            {canShare && (
              <button
                type="button"
                onClick={handleShare}
                disabled={isSharing || isExportingImage || isExportingPdf}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                title={invoiceLang === "ar" ? "مشاركة الفاتورة" : "Share invoice"}
              >
                {isSharing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Share2 className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {invoiceLang === "ar" ? "مشاركة" : "Share"}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* MODAL BODY (PREVIEW AREA) */}
        <div
          ref={previewWrapperRef}
          className="flex-1 overflow-auto bg-[#EBE5DA] p-4 sm:p-6 flex justify-center items-start"
          style={{ minHeight: "440px" }}
        >
          {/* Scaled Preview Wrapper */}
          <div
            style={{
              width: "760px",
              transform: `scale(${currentScale})`,
              transformOrigin: "top center",
              marginBottom: `-${(1 - currentScale) * 1000}px`,
              transition: "transform 0.15s ease-out",
            }}
            className="shrink-0"
          >
            <AdminInvoiceDocument
              order={order}
              lang={invoiceLang}
              documentRef={invoiceCaptureRef}
              itemImagesBase64={base64Images}
            />
          </div>
        </div>

        {/* MODAL FOOTER INFO */}
        <div className="flex items-center justify-between border-t border-[#7C69BA]/15 bg-white px-4 py-2.5 text-[11px] text-[#8277A8]">
          <span>
            {invoiceLang === "ar"
              ? "✨ يتم تصدير الصورة والـ PDF بدقة ريتينا 2.5x فائقة الوضوح."
              : "✨ Image & PDF are exported in ultra-crisp 2.5x Retina resolution."}
          </span>
          <span className="font-mono text-[10px] text-[#7C69BA] font-bold">
            DeRoma Store
          </span>
        </div>
      </div>
    </div>
  );
}
