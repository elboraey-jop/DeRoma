"use client";

import { useEffect, useState, useRef } from "react";
import {
  Database,
  Download,
  FileCode,
  FileJson,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Server,
  HelpCircle,
  Clock,
  ShieldCheck,
  Search,
  ArrowDownToLine,
  ArrowUpFromLine,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { useAdminI18n } from "@/providers/AdminI18nContext";
import { DatabaseStats } from "@/lib/backup/db-export";
import { RestorePreview, RestoreResult } from "@/lib/backup/db-restore";

const CATEGORY_MAP: Record<string, { labelAr: string; labelEn: string; color: string }> = {
  core: { labelAr: "الإعدادات والمستخدمين", labelEn: "Core & Users", color: "bg-blue-50 text-blue-700 border-blue-200" },
  catalog: { labelAr: "الكتالوج والمنتجات", labelEn: "Catalog & Products", color: "bg-purple-50 text-purple-700 border-purple-200" },
  orders: { labelAr: "الطلبات والعملاء", labelEn: "Orders & Customers", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  inventory: { labelAr: "المخزون والموردين", labelEn: "Inventory & Suppliers", color: "bg-amber-50 text-amber-700 border-amber-200" },
  financials: { labelAr: "الماليات والحسابات", labelEn: "Financials & Accounting", color: "bg-rose-50 text-rose-700 border-rose-200" },
  content: { labelAr: "المحتوى والرسائل", labelEn: "Content & Messages", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
};

export default function AdminBackupPage() {
  const { lang, t, formatNumber } = useAdminI18n();
  const isRtl = lang === "ar";

  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  // Selective Export state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "catalog",
    "orders",
    "inventory",
    "financials",
  ]);

  // Table search
  const [searchQuery, setSearchQuery] = useState("");

  // Restore State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<RestorePreview | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [restoreResult, setRestoreResult] = useState<RestoreResult | null>(null);
  const [showConfirmRestore, setShowConfirmRestore] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Fetch Database Stats
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/admin/backup/stats");
      if (!res.ok) throw new Error("Failed to load database stats");
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load database statistics");
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Trigger Download helper
  const handleDownload = async (format: "json" | "sql", categories?: string[]) => {
    setIsExporting(format);
    try {
      let url = `/api/admin/backup/export?format=${format}`;
      if (categories && categories.length > 0) {
        url += `&categories=${encodeURIComponent(categories.join(","))}`;
      }

      toast.info(isRtl ? "جاري تحضير ملف النسخ الاحتياطي..." : "Preparing backup file...");
      
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Export failed");
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `deroma-backup-${format === "sql" ? "full.sql" : "full.json"}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      }

      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success(
        isRtl
          ? `تم تنزيل ملف الباك اب بنجاح (${filename})`
          : `Backup downloaded successfully (${filename})`
      );
    } catch (err: any) {
      toast.error(err?.message || "Failed to download backup");
    } finally {
      setIsExporting(null);
    }
  };

  // Toggle Category selection
  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // File Select for Restore
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      toast.error(isRtl ? "يرجى اختيار ملف JSON صالح" : "Please select a valid .json file");
      return;
    }

    setSelectedFile(file);
    setPreviewData(null);
    setRestoreResult(null);
    setShowConfirmRestore(false);

    // Auto-preview file
    await inspectBackupFile(file);
  };

  // Inspect / Preview uploaded backup
  const inspectBackupFile = async (file: File) => {
    setPreviewLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("action", "preview");

      const res = await fetch("/api/admin/backup/restore", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        throw new Error(data.error || "Invalid backup file structure");
      }

      setPreviewData(data);
      toast.success(
        isRtl
          ? `تم فحص الملف: يحتوي على ${formatNumber(data.totalBackupRecords)} سجل عبر ${formatNumber(data.tablesSummary.filter((t: any) => t.recordsInBackup > 0).length)} جدول`
          : `File verified: Contains ${data.totalBackupRecords} records across active tables.`
      );
    } catch (err: any) {
      toast.error(err?.message || "Failed to inspect backup file");
      setPreviewData(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Execute Restore
  const handleExecuteRestore = async () => {
    if (!selectedFile) return;
    setRestoring(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("action", "restore");

      const res = await fetch("/api/admin/backup/restore", {
        method: "POST",
        body: formData,
      });

      const result: RestoreResult = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to restore backup");
      }

      setRestoreResult(result);
      setShowConfirmRestore(false);
      toast.success(isRtl ? "تمت استعادة وتحديث البيانات بنجاح!" : "Restore completed successfully!");
      
      // Refresh live stats
      fetchStats();
    } catch (err: any) {
      toast.error(err?.message || "Failed to execute restore");
    } finally {
      setRestoring(false);
    }
  };

  // Filter tables
  const filteredTables = stats?.tableStats.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.tableName.toLowerCase().includes(q) ||
      t.labelAr.toLowerCase().includes(q) ||
      t.labelEn.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
  }) || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#942E3A] text-[#D8B46A] shadow-sm">
              <Database className="h-5 w-5" />
            </div>
            <h1 className="font-playfair text-2xl font-black text-[#942E3A] sm:text-3xl">
              {t("backup.title")}
            </h1>
          </div>
          <p className="mt-1 text-xs text-[#942E3A]/70 sm:text-sm">
            {t("backup.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center gap-1.5 rounded-xl border border-[#942E3A]/20 bg-white px-3 py-2 text-xs font-bold text-[#942E3A] shadow-xs hover:bg-[#FFF9EB] transition-colors"
          >
            <HelpCircle className="h-4 w-4 text-[#D8B46A]" />
            <span>{isRtl ? "دليل الطوارئ" : "Emergency Guide"}</span>
            {showGuide ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          <button
            onClick={fetchStats}
            disabled={loadingStats}
            className="flex items-center gap-1.5 rounded-xl border border-[#942E3A]/20 bg-white px-3 py-2 text-xs font-bold text-[#942E3A] shadow-xs hover:bg-[#FFF9EB] transition-colors disabled:opacity-50"
            title="Refresh statistics"
          >
            <RefreshCw className={`h-4 w-4 text-[#D8B46A] ${loadingStats ? "animate-spin" : ""}`} />
            <span>{isRtl ? "تحديث" : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Emergency Guide Accordion */}
      {showGuide && (
        <div className="rounded-2xl border border-[#8B7CC7]/30 bg-[#FFF9EB] p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#942E3A]">
            <ShieldCheck className="h-5 w-5 text-[#8B7CC7]" />
            <span>{t("backup.emergencyGuideTitle")}</span>
          </div>
          <div className="grid gap-2 text-xs text-[#942E3A]/80 sm:grid-cols-3">
            <div className="rounded-xl border border-[#942E3A]/10 bg-white p-3">
              <p className="font-bold text-[#942E3A] mb-1">{isRtl ? "الخطوة 1: الحفظ الدوري" : "Step 1: Save Backups"}</p>
              <p>{t("backup.emergencyStep1")}</p>
            </div>
            <div className="rounded-xl border border-[#942E3A]/10 bg-white p-3">
              <p className="font-bold text-[#942E3A] mb-1">{isRtl ? "الخطوة 2: استرجاع SQL فوري" : "Step 2: Instant SQL Restore"}</p>
              <p>{t("backup.emergencyStep2")}</p>
            </div>
            <div className="rounded-xl border border-[#942E3A]/10 bg-white p-3">
              <p className="font-bold text-[#942E3A] mb-1">{isRtl ? "الخطوة 3: استرجاع JSON ذكي" : "Step 3: Smart JSON Restore"}</p>
              <p>{t("backup.emergencyStep3")}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick 1-Click Action Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Full JSON Backup */}
        <div className="relative overflow-hidden rounded-2xl border border-[#942E3A]/15 bg-white p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B7CC7]/15 text-[#8B7CC7]">
                <FileJson className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-extrabold text-purple-800">
                JSON Snapshot
              </span>
            </div>
            <h3 className="font-playfair text-lg font-bold text-[#942E3A]">
              {t("backup.fullBackupCardTitle")}
            </h3>
            <p className="text-xs text-[#942E3A]/70">
              {t("backup.fullBackupCardDesc")}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#942E3A]/10">
            <button
              onClick={() => handleDownload("json")}
              disabled={isExporting !== null}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#942E3A] px-4 py-2.5 text-xs font-bold text-[#FFF9EB] shadow-xs hover:bg-[#7D242E] transition-colors disabled:opacity-50"
            >
              {isExporting === "json" ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowDownToLine className="h-4 w-4 text-[#D8B46A]" />
              )}
              <span>{t("backup.downloadJson")}</span>
            </button>
          </div>
        </div>

        {/* Full SQL Dump */}
        <div className="relative overflow-hidden rounded-2xl border border-[#942E3A]/15 bg-white p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <FileCode className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800">
                PostgreSQL SQL
              </span>
            </div>
            <h3 className="font-playfair text-lg font-bold text-[#942E3A]">
              {isRtl ? "نسخة SQL Dump المباشرة" : "Direct SQL Dump"}
            </h3>
            <p className="text-xs text-[#942E3A]/70">
              {isRtl
                ? "ملف SQL جاهز للتشغيل مباشرة في Supabase SQL Editor أو أي سيرفر بديل"
                : "Standard PostgreSQL script ready to run directly in Supabase SQL editor"}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#942E3A]/10">
            <button
              onClick={() => handleDownload("sql")}
              disabled={isExporting !== null}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#942E3A]/20 bg-[#FFF9EB] px-4 py-2.5 text-xs font-bold text-[#942E3A] shadow-xs hover:bg-[#F2E5D0] transition-colors disabled:opacity-50"
            >
              {isExporting === "sql" ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4 text-[#942E3A]" />
              )}
              <span>{t("backup.downloadSql")}</span>
            </button>
          </div>
        </div>

        {/* Health Metrics & Status */}
        <div className="rounded-2xl border border-[#942E3A]/15 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Server className="h-5 w-5" />
              </div>
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                <CheckCircle2 className="h-3 w-3" />
                {t("backup.statusHealthy")}
              </span>
            </div>

            <div>
              <p className="text-[11px] font-bold text-[#942E3A]/60">{t("backup.totalRecordsLabel")}</p>
              <p className="text-2xl font-black text-[#942E3A]">
                {loadingStats ? "..." : formatNumber(stats?.totalRecords || 0)}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-[#942E3A]/80 pt-2 border-t border-[#942E3A]/10">
              <span>{t("backup.totalTablesLabel")}:</span>
              <span className="font-bold">{stats?.totalTables || 25}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#942E3A]/80">
              <span>{isRtl ? "محرك البيانات:" : "Engine:"}</span>
              <span className="font-bold">PostgreSQL / Supabase</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selective Export & Restore Split Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Selective Export */}
        <div className="rounded-2xl border border-[#942E3A]/15 bg-white p-5 shadow-xs space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="h-4.5 w-4.5 text-[#D8B46A]" />
              <h2 className="text-base font-bold text-[#942E3A]">
                {t("backup.selectiveExportTitle")}
              </h2>
            </div>
            <p className="mt-1 text-xs text-[#942E3A]/70">
              {t("backup.selectiveExportDesc")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Object.entries(CATEGORY_MAP).map(([catKey, catInfo]) => {
              const isSelected = selectedCategories.includes(catKey);
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => toggleCategory(catKey)}
                  className={`flex flex-col items-start gap-1 rounded-xl border p-2.5 text-start transition-all ${
                    isSelected
                      ? "border-[#942E3A] bg-[#942E3A]/5 shadow-2xs font-bold text-[#942E3A]"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-[11px] font-bold">
                      {isRtl ? catInfo.labelAr : catInfo.labelEn}
                    </span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="h-3.5 w-3.5 rounded text-[#942E3A]"
                    />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => handleDownload("json", selectedCategories)}
              disabled={isExporting !== null || selectedCategories.length === 0}
              className="flex items-center gap-2 rounded-xl bg-[#942E3A] px-4 py-2 text-xs font-bold text-[#FFF9EB] shadow-xs hover:bg-[#7D242E] transition-colors disabled:opacity-50"
            >
              <ArrowDownToLine className="h-3.5 w-3.5 text-[#D8B46A]" />
              <span>{t("backup.exportSelected")}</span>
            </button>
          </div>
        </div>

        {/* Inspect & Restore Tool */}
        <div className="rounded-2xl border border-[#942E3A]/15 bg-white p-5 shadow-xs space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <ArrowUpFromLine className="h-4.5 w-4.5 text-[#8B7CC7]" />
              <h2 className="text-base font-bold text-[#942E3A]">
                {t("backup.restoreTitle")}
              </h2>
            </div>
            <p className="mt-1 text-xs text-[#942E3A]/70">
              {t("backup.restoreDesc")}
            </p>
          </div>

          {/* Upload Dropzone */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#942E3A]/20 bg-[#FFF9EB]/50 p-5 text-center hover:bg-[#FFF9EB] transition-colors"
          >
            <Upload className="h-7 w-7 text-[#942E3A]/60 mb-2" />
            <p className="text-xs font-bold text-[#942E3A]">
              {selectedFile ? selectedFile.name : t("backup.uploadPrompt")}
            </p>
            {selectedFile && (
              <p className="text-[10px] text-[#942E3A]/60 mt-1">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            )}
          </div>

          {/* Preview Results */}
          {previewLoading && (
            <div className="flex items-center justify-center gap-2 py-4 text-xs font-bold text-[#942E3A]">
              <RefreshCw className="h-4 w-4 animate-spin text-[#D8B46A]" />
              <span>{isRtl ? "جاري فحص محتويات ملف الباك اب..." : "Inspecting backup contents..."}</span>
            </div>
          )}

          {previewData && (
            <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-xs">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                <span className="font-bold text-emerald-900">
                  {isRtl ? "تقرير فحص ملف الباك اب" : "Backup Inspection Report"}
                </span>
                <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-[10px] font-black text-emerald-900">
                  {formatNumber(previewData.totalBackupRecords)} {isRtl ? "سجل" : "records"}
                </span>
              </div>

              {previewData.metadata && (
                <div className="text-[11px] text-emerald-800 space-y-1">
                  <p>
                    <span className="font-semibold">{isRtl ? "تاريخ التصدير: " : "Export Date: "}</span>
                    {new Date(previewData.metadata.exportedAt).toLocaleString(isRtl ? "ar-EG" : "en-US")}
                  </p>
                  <p>
                    <span className="font-semibold">{isRtl ? "التطبيق: " : "App: "}</span>
                    {previewData.metadata.appName} (v{previewData.metadata.version})
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between">
                {!showConfirmRestore ? (
                  <button
                    onClick={() => setShowConfirmRestore(true)}
                    className="rounded-xl bg-[#942E3A] px-3.5 py-1.5 text-xs font-bold text-[#FFF9EB] hover:bg-[#7D242E] transition-colors"
                  >
                    {t("backup.restoreNow")}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExecuteRestore}
                      disabled={restoring}
                      className="flex items-center gap-1.5 rounded-xl bg-rose-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-rose-800 disabled:opacity-50"
                    >
                      {restoring ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                      <span>{restoring ? t("backup.restoring") : isRtl ? "تأكيد التطبيق الآن" : "Confirm Restore"}</span>
                    </button>
                    <button
                      onClick={() => setShowConfirmRestore(false)}
                      disabled={restoring}
                      className="rounded-xl border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
                    >
                      {t("common.cancel")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {restoreResult && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-100/70 p-3 text-xs text-emerald-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                <span>{t("backup.restoreSuccess")}</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                {restoreResult.message}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Live Table Record Counts Grid */}
      <div className="rounded-2xl border border-[#942E3A]/15 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-[#942E3A]">
              {t("backup.dbStatusTitle")}
            </h2>
            <p className="text-xs text-[#942E3A]/70">
              {isRtl
                ? "عرض تفصيلي لجميع جداول قاعدة البيانات وعدد السجلات الحالية في Supabase"
                : "Detailed view of all database tables and current live record counts in Supabase"}
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className={`absolute top-2.5 h-4 w-4 text-[#942E3A]/40 ${isRtl ? "right-3" : "left-3"}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRtl ? "بحث في الجداول..." : "Search tables..."}
              className={`w-full rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB]/30 py-2 text-xs text-[#942E3A] focus:border-[#942E3A] focus:outline-none ${
                isRtl ? "pr-9 pl-3" : "pl-9 pr-3"
              }`}
            />
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto rounded-xl border border-[#942E3A]/10">
          <table className="w-full text-start text-xs">
            <thead className="border-b border-[#942E3A]/10 bg-[#FFF9EB]/60 text-[#942E3A] font-bold">
              <tr>
                <th className={`py-3 px-4 ${isRtl ? "text-right" : "text-left"}`}>
                  {t("backup.tableHeaderName")}
                </th>
                <th className={`py-3 px-4 ${isRtl ? "text-right" : "text-left"}`}>
                  {isRtl ? "اسم الجدول في SQL" : "SQL Table Name"}
                </th>
                <th className={`py-3 px-4 ${isRtl ? "text-right" : "text-left"}`}>
                  {t("backup.tableHeaderCategory")}
                </th>
                <th className={`py-3 px-4 ${isRtl ? "text-left" : "text-right"}`}>
                  {t("backup.tableHeaderCount")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#942E3A]/5">
              {filteredTables.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-xs text-[#942E3A]/60">
                    {t("common.noResults")}
                  </td>
                </tr>
              ) : (
                filteredTables.map((table) => {
                  const cat = CATEGORY_MAP[table.category] || {
                    labelAr: table.category,
                    labelEn: table.category,
                    color: "bg-gray-100 text-gray-700 border-gray-200",
                  };
                  return (
                    <tr key={table.key} className="hover:bg-[#FFF9EB]/20 transition-colors">
                      <td className="py-2.5 px-4 font-bold text-[#942E3A]">
                        {isRtl ? table.labelAr : table.labelEn}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-gray-500">
                        {table.tableName}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold ${cat.color}`}>
                          {isRtl ? cat.labelAr : cat.labelEn}
                        </span>
                      </td>
                      <td className={`py-2.5 px-4 font-black text-[#942E3A] ${isRtl ? "text-left" : "text-right"}`}>
                        <span className="inline-flex min-w-8 justify-center rounded-lg bg-[#942E3A]/5 px-2 py-0.5">
                          {formatNumber(table.count)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
