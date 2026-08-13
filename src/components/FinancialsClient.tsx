"use client";

import { useState, useTransition } from "react";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  TrendingUp,
  Wallet,
  Building2,
  CreditCard,
  PlusCircle,
  Trash2,
  CalendarDays,
  ShoppingBag,
  Package,
  ArrowUpRight,
  ShieldCheck,
  Receipt,
  PiggyBank,
  CheckCircle2,
  X,
  Tag,
  ArrowRightLeft,
  PieChart,
  BarChart3,
  Search,
  SlidersHorizontal,
  AlertTriangle,
  Sparkles,
  Calculator,
  Activity,
} from "lucide-react";
import {
  createExpenseAction,
  deleteExpenseAction,
  createSettlementAction,
  createTransferAction,
} from "@/app/admin/financials/actions";
import AdminDailyLogDatePicker, { DatePreset } from "@/components/AdminDailyLogDatePicker";
import Link from "next/link";
import { useAdminI18n } from "@/providers/AdminI18nContext";

interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: string;
  paymentAccount: string;
  date: string;
  notes: string | null;
}

interface TransferItem {
  id: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
  fee?: number;
  notes: string | null;
  date: string;
}


interface SettlementItem {
  id: string;
  settlementNumber: string;
  startDate: string;
  endDate: string;
  totalSales: number;
  totalCOGS: number;
  totalExpenses: number;
  netProfit: number;
  cashTransferred: number;
  instapayTransferred: number;
  walletTransferred: number;
  notes: string | null;
  status: string;
  createdAt: string;
}

interface OrderProfitItem {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  paymentMethod: string;
  totalPrice: number;
  itemsCost: number;
  discountAmount: number;
  shippingCost: number;
  orderProfit: number;
  profitMargin: number;
  createdAt: string;
}

interface FinancialsClientProps {
  timeRange: {
    preset: DatePreset;
    startDate: string;
    endDate: string;
  };
  summary: {
    totalSales: number;
    totalCOGS: number;
    totalDiscounts: number;
    totalShipping: number;
    totalExpenses: number;
    grossProfit: number;
    grossMarginPct: number;
    netProfit: number;
    profitMargin: number;
    deliveredOrdersCount: number;
    allOrdersCount: number;
    avgOrderValue: number;
    avgProfitPerOrder: number;
  };
  inventoryStats: {
    totalItemsInStock: number;
    stockWholesaleValue: number;
    stockRetailValue: number;
    projectedProfit: number;
    lowStockItemsCount: number;
    lowStockReplenishmentCost: number;
  };
  paymentAccounts: {
    cashOnHand: number;
    instapayVisa: number;
    wallet: number;
    totalLiquidity: number;
    cashSales: number;
    instapaySales: number;
    walletSales: number;
  };
  expensesByCategory: Record<string, number>;
  expenses: ExpenseItem[];
  transfers: TransferItem[];
  settlements: SettlementItem[];
  ordersProfit: OrderProfitItem[];
}

const CATEGORY_LABELS: Record<string, string> = {
  marketing: "Marketing & Ads",
  shipping_ops: "Logistics & Shipping",
  packaging: "Bags & Packaging",
  utilities: "Utilities & Services",
  salaries: "Salaries & Commissions",
  other: "Other Expenses",
};

const CATEGORY_LABELS_AR: Record<string, string> = {
  marketing: "تسويق وإعلانات",
  shipping_ops: "شحن وتوصيل",
  packaging: "أكياس وتغليف",
  utilities: "خدمات ومرافق",
  salaries: "مرتبات وعمولات",
  other: "مصاريف أخرى",
};

const ACCOUNT_LABELS: Record<string, string> = {
  cash: "Cash on Hand",
  instapay_visa: "InstaPay / Visa",
  wallet: "E-Wallets",
};

const ACCOUNT_LABELS_AR: Record<string, string> = {
  cash: "خزينة النقود (كاش)",
  instapay_visa: "إنستا باي / فيزا",
  wallet: "المحافظ الإلكترونية",
};

export default function FinancialsClient({
  timeRange,
  summary,
  inventoryStats,
  paymentAccounts,
  expensesByCategory,
  expenses,
  transfers,
  settlements,
  ordersProfit,
}: FinancialsClientProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "pnl" | "cashflow" | "expenses" | "settlements" | "orders" | "forecasting"
  >("overview");

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);

  const [expenseSearch, setExpenseSearch] = useState("");
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState("all");

  const [orderSearch, setOrderSearch] = useState("");
  const [orderMarginFilter, setOrderMarginFilter] = useState("all");

  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [settlementNotes, setSettlementNotes] = useState("");

  const handleAddExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        await createExpenseAction(formData);
        setIsAddExpenseOpen(false);
        form.reset();
      } catch (err: any) {
        setErrorMsg(err.message || (isRtl ? "تعذر حفظ المصروف." : "Failed to save expense."));
      }
    });
  };

  const handleCreateTransfer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        await createTransferAction(formData);
        setIsTransferOpen(false);
        form.reset();
      } catch (err: any) {
        setErrorMsg(err.message || (isRtl ? "تعذر تنفيذ التحويل." : "Failed to process transfer."));
      }
    });
  };

  const handleDeleteExpense = (id: string) => {
    if (!confirm(isRtl ? "هل أنت متأكد من حذف هذا المصروف؟" : "Are you sure you want to delete this expense entry?")) return;
    startTransition(async () => {
      try {
        await deleteExpenseAction(id);
      } catch (err: any) {
        alert(err.message || (isRtl ? "تعذر حذف المصروف." : "Failed to delete expense."));
      }
    });
  };

  const handleCreateSettlement = () => {
    setErrorMsg(null);
    startTransition(async () => {
      try {
        await createSettlementAction({
          startDate: timeRange.startDate,
          endDate: timeRange.endDate,
          totalSales: summary.totalSales,
          totalCOGS: summary.totalCOGS,
          totalExpenses: summary.totalExpenses,
          netProfit: summary.netProfit,
          cashTransferred: paymentAccounts.cashOnHand,
          instapayTransferred: paymentAccounts.instapayVisa,
          walletTransferred: paymentAccounts.wallet,
          notes: settlementNotes,
        });
        setIsSettlementModalOpen(false);
        setSettlementNotes("");
      } catch (err: any) {
        setErrorMsg(err.message || (isRtl ? "تعذر تنفيذ التسوية." : "Failed to process settlement."));
      }
    });
  };

  const { lang, t, formatPrice, formatNumber } = useAdminI18n();
  const isRtl = lang === "ar";

  // Filtered Expenses
  const filteredExpenses = expenses.filter((exp) => {
    const matchesCategory = expenseCategoryFilter === "all" || exp.category === expenseCategoryFilter;
    const matchesSearch =
      exp.title.toLowerCase().includes(expenseSearch.toLowerCase()) ||
      (exp.notes && exp.notes.toLowerCase().includes(expenseSearch.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Filtered Orders Profitability
  const filteredOrders = ordersProfit.filter((ord) => {
    const matchesSearch =
      ord.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(orderSearch.toLowerCase());

    let matchesMargin = true;
    if (orderMarginFilter === "high") matchesMargin = ord.profitMargin >= 30;
    if (orderMarginFilter === "medium") matchesMargin = ord.profitMargin >= 15 && ord.profitMargin < 30;
    if (orderMarginFilter === "low") matchesMargin = ord.profitMargin < 15;

    return matchesSearch && matchesMargin;
  });

  return (
    <div dir={isRtl ? "rtl" : "ltr"} data-financials-dashboard className="space-y-5 text-start">
      {/* Top Title & Global Date Picker Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#D8B46A]/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-[#942E3A]">
              {isRtl ? "إدارة الخزينة والماليات" : "Treasury & Financial Intelligence"}
            </span>
          </div>
          <h1 className="mt-1 font-playfair text-2xl sm:text-3xl font-black text-[#942E3A]">
            {t("financials.title")}
          </h1>
          <p className="mt-0.5 text-xs text-[#6B1F2A]/70">
            {t("financials.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AdminDailyLogDatePicker
            currentPreset={timeRange.preset}
            currentStartDate={timeRange.startDate}
            currentEndDate={timeRange.endDate}
          />
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-[#942E3A]/15 pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition shrink-0 ${
            activeTab === "overview"
              ? "bg-[#942E3A] text-[#FFF9EB] shadow-xs"
              : "bg-white text-[#6B1F2A]/80 hover:bg-[#FFF9EB]"
          }`}
        >
          <PiggyBank className="h-4 w-4 text-[#D8B46A]" />
          <span>{isRtl ? "ملخص الخزائن والأرصدة" : "Overview & Safes"}</span>
        </button>

        <button
          onClick={() => setActiveTab("pnl")}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition shrink-0 ${
            activeTab === "pnl"
              ? "bg-[#942E3A] text-[#FFF9EB] shadow-xs"
              : "bg-white text-[#6B1F2A]/80 hover:bg-[#FFF9EB]"
          }`}
        >
          <BarChart3 className="h-4 w-4 text-[#D8B46A]" />
          <span>{isRtl ? "قائمة الأرباح والخسائر" : "Profit & Loss (P&L)"}</span>
        </button>

        <button
          onClick={() => setActiveTab("cashflow")}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition shrink-0 ${
            activeTab === "cashflow"
              ? "bg-[#942E3A] text-[#FFF9EB] shadow-xs"
              : "bg-white text-[#6B1F2A]/80 hover:bg-[#FFF9EB]"
          }`}
        >
          <Activity className="h-4 w-4 text-[#D8B46A]" />
          <span>{isRtl ? "التدفق النقدي" : "Cash Flow"}</span>
        </button>

        <button
          onClick={() => setActiveTab("expenses")}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition shrink-0 ${
            activeTab === "expenses"
              ? "bg-[#942E3A] text-[#FFF9EB] shadow-xs"
              : "bg-white text-[#6B1F2A]/80 hover:bg-[#FFF9EB]"
          }`}
        >
          <Receipt className="h-4 w-4 text-[#D8B46A]" />
          <span>{isRtl ? "المصروفات" : "Expenses"}</span>
          {expenses.length > 0 && (
            <span className="rounded-full bg-[#D8B46A] px-1.5 py-0.2 text-[9px] font-black text-[#942E3A]">
              {expenses.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("settlements")}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition shrink-0 ${
            activeTab === "settlements"
              ? "bg-[#942E3A] text-[#FFF9EB] shadow-xs"
              : "bg-white text-[#6B1F2A]/80 hover:bg-[#FFF9EB]"
          }`}
        >
          <ShieldCheck className="h-4 w-4 text-[#D8B46A]" />
          <span>{isRtl ? "التسوية الأسبوعية" : "Weekly Settlement"}</span>
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition shrink-0 ${
            activeTab === "orders"
              ? "bg-[#942E3A] text-[#FFF9EB] shadow-xs"
              : "bg-white text-[#6B1F2A]/80 hover:bg-[#FFF9EB]"
          }`}
        >
          <ShoppingBag className="h-4 w-4 text-[#D8B46A]" />
          <span>{isRtl ? "ربحية الطلبات" : "Order Profitability"}</span>
        </button>

        <button
          onClick={() => setActiveTab("forecasting")}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition shrink-0 ${
            activeTab === "forecasting"
              ? "bg-[#942E3A] text-[#FFF9EB] shadow-xs"
              : "bg-white text-[#6B1F2A]/80 hover:bg-[#FFF9EB]"
          }`}
        >
          <Calculator className="h-4 w-4 text-[#D8B46A]" />
          <span>{isRtl ? "التوقعات وإعادة التخزين" : "Projections & Restock"}</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & SAFES */}
      {activeTab === "overview" && (
        <div className="space-y-5">
          {/* Top 3 Primary Safes Header & Quick Transfer Action */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="font-playfair text-base font-extrabold text-[#942E3A]">
                🏛️ Treasury System (The 3 Safes)
              </h2>
              <button
                onClick={() => setIsTransferOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-[#942E3A]/20 bg-white px-3 py-1.5 text-xs font-bold text-[#942E3A] hover:bg-[#FFF9EB] transition shadow-xs"
              >
                <ArrowRightLeft className="h-3.5 w-3.5 text-[#D8B46A]" />
                <span>{isRtl ? "تحويل بين الحسابات" : "Transfer Between Accounts"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Safe 1: Sales Safe */}
              <div className="rounded-2xl border border-[#942E3A]/15 bg-white p-4 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 left-0 h-1 w-full bg-[#942E3A]" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/60">
                    {isRtl ? "خزينة المبيعات (إيرادات المبيعات)" : "Sales Treasury (Sales Revenue)"}
                  </span>
                  <div className="rounded-lg bg-[#FFF9EB] p-2 text-[#942E3A]">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-2 font-playfair text-2xl font-black text-[#942E3A]">
                  {formatCurrency(summary.totalSales)}
                </p>
                <p className="mt-1 text-[10px] text-[#6B1F2A]/65">
                  {isRtl ? `إجمالي مبيعات ${summary.deliveredOrdersCount} طلبات مكتملة` : `Total sales volume from ${summary.deliveredOrdersCount} completed orders`}
                </p>
              </div>

              {/* Safe 2: Net Profit Safe */}
              <div className="rounded-2xl border border-[#D8B46A]/40 bg-[#FFFDF5] p-4 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 left-0 h-1 w-full bg-[#D8B46A]" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/60">
                    {isRtl ? "خزينة صافي الربح (صافي الربح)" : "Net Profit Treasury (Net Profit)"}
                  </span>
                  <div className="rounded-lg bg-[#D8B46A]/20 p-2 text-[#942E3A]">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-2 font-playfair text-2xl font-black text-[#942E3A]">
                  {formatCurrency(summary.netProfit)}
                </p>
                <div className="mt-1 flex items-center justify-between text-[10px] text-[#6B1F2A]/70">
                  <span>{isRtl ? "هامش الربح: " : "Profit Margin: "}<strong className="text-[#942E3A]">{summary.profitMargin}%</strong></span>
                  <span>{isRtl ? "بعد الخصومات والمصروفات" : "After discounts & expenses"}</span>
                </div>
              </div>

              {/* Safe 3: Total Liquidity Safe */}
              <div className="rounded-2xl border border-[#942E3A]/20 bg-[#942E3A] p-4 text-[#FFF9EB] shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                    {isRtl ? "خزينة السيولة الإجمالية (إجمالي رأس المال)" : "Total Liquidity Treasury (Total Capital)"}
                  </span>
                  <div className="rounded-lg bg-white/10 p-2 text-[#D8B46A]">
                    <Wallet className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-2 font-playfair text-2xl font-black text-[#D8B46A]">
                  {formatCurrency(paymentAccounts.totalLiquidity)}
                </p>

                {/* Sub-accounts breakdown inside Total Safe */}
                <div className="mt-3 grid grid-cols-3 gap-1.5 border-t border-white/15 pt-2.5 text-center text-[10px]">
                  <div className="rounded-lg bg-white/10 p-1.5">
                    <span className="block opacity-75 text-[9px]">{isRtl ? "النقدية المتاحة" : "Cash on Hand"}</span>
                    <strong className="text-[#FFF9EB] font-bold">{formatCurrency(paymentAccounts.cashOnHand)}</strong>
                  </div>
                  <div className="rounded-lg bg-white/10 p-1.5">
                    <span className="block opacity-75 text-[9px]">InstaPay / Visa</span>
                    <strong className="text-[#FFF9EB] font-bold">{formatCurrency(paymentAccounts.instapayVisa)}</strong>
                  </div>
                  <div className="rounded-lg bg-white/10 p-1.5">
                    <span className="block opacity-75 text-[9px]">{isRtl ? "المحافظ الإلكترونية" : "E-Wallets"}</span>
                    <strong className="text-[#FFF9EB] font-bold">{formatCurrency(paymentAccounts.wallet)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Health Indicators Grid */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-xl border border-[#942E3A]/10 bg-white p-3 shadow-xs">
              <span className="text-[10px] font-bold text-[#6B1F2A]/60 block">{isRtl ? "متوسط قيمة الطلب (AOV)" : "Avg Order Value (AOV)"}</span>
              <p className="mt-1 font-playfair text-base sm:text-xl font-black text-[#942E3A]">
                {formatCurrency(summary.avgOrderValue)}
              </p>
            </div>

            <div className="rounded-xl border border-[#942E3A]/10 bg-white p-3 shadow-xs">
              <span className="text-[10px] font-bold text-[#6B1F2A]/60 block">{isRtl ? "متوسط ربح الطلب" : "Avg Profit Per Order"}</span>
              <p className="mt-1 font-playfair text-base sm:text-xl font-black text-[#942E3A]">
                {formatCurrency(summary.avgProfitPerOrder)}
              </p>
            </div>

            <div className="rounded-xl border border-[#942E3A]/10 bg-white p-3 shadow-xs">
              <span className="text-[10px] font-bold text-[#6B1F2A]/60 block">{isRtl ? "هامش إجمالي الربح %" : "Gross Profit Margin %"}</span>
              <p className="mt-1 font-playfair text-base sm:text-xl font-black text-[#942E3A]">
                {summary.grossMarginPct}%
              </p>
            </div>

            <div className="rounded-xl border border-[#942E3A]/10 bg-white p-3 shadow-xs">
              <span className="text-[10px] font-bold text-[#6B1F2A]/60 block">{isRtl ? "نسبة تكلفة المنتجات %" : "COGS Ratio %"}</span>
              <p className="mt-1 font-playfair text-base sm:text-xl font-black text-[#942E3A]">
                {summary.totalSales > 0 ? Math.round((summary.totalCOGS / summary.totalSales) * 100) : 0}%
              </p>
            </div>
          </div>

          {/* Current Inventory Valuation Card */}
          <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#942E3A]/10 pb-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-[#D8B46A]" />
                <h3 className="font-playfair text-base font-bold text-[#942E3A]">
                  📦 Current Inventory Valuation & Projected Profits
                </h3>
              </div>
              <span className="rounded-full bg-[#FFF9EB] px-3 py-1 text-[11px] font-bold text-[#942E3A] border border-[#D8B46A]/30">
                {inventoryStats.totalItemsInStock} items in stock
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-xl border border-[#942E3A]/10 bg-[#FFF9EB]/50 p-3">
                <span className="text-[10px] font-bold text-[#6B1F2A]/60 block">Total Stock Units</span>
                <p className="mt-1 font-playfair text-lg font-black text-[#942E3A]">
                  {inventoryStats.totalItemsInStock} <span className="text-xs font-normal">units</span>
                </p>
              </div>

              <div className="rounded-xl border border-[#942E3A]/10 bg-[#FFF9EB]/50 p-3">
                <span className="text-[10px] font-bold text-[#6B1F2A]/60 block">Stock Wholesale Cost (COGS)</span>
                <p className="mt-1 font-playfair text-lg font-black text-[#942E3A]">
                  {formatCurrency(inventoryStats.stockWholesaleValue)}
                </p>
              </div>

              <div className="rounded-xl border border-[#942E3A]/10 bg-[#FFF9EB]/50 p-3">
                <span className="text-[10px] font-bold text-[#6B1F2A]/60 block">Projected Sales Value (Retail)</span>
                <p className="mt-1 font-playfair text-lg font-black text-[#942E3A]">
                  {formatCurrency(inventoryStats.stockRetailValue)}
                </p>
              </div>

              <div className="rounded-xl border border-[#D8B46A]/40 bg-[#FFFDF5] p-3">
                <span className="text-[10px] font-bold text-[#6B1F2A]/60 block">Projected Profit on Sale</span>
                <p className="mt-1 font-playfair text-lg font-black text-[#942E3A]">
                  {formatCurrency(inventoryStats.projectedProfit)}
                </p>
              </div>
            </div>
          </div>

          {/* Transfers History Log */}
          {transfers.length > 0 && (
            <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-xs">
              <h3 className="font-playfair text-sm font-bold text-[#942E3A] mb-3">
                🔄 Recent Account Transfers Log
              </h3>
              <div className="space-y-2 text-xs">
                {transfers.slice(0, 5).map((tr) => (
                  <div key={tr.id} className="flex items-center justify-between rounded-xl bg-[#FFF9EB]/60 p-2.5">
                    <div>
                      <span className="font-bold text-[#942E3A]">
                        {ACCOUNT_LABELS[tr.fromAccount]} → {ACCOUNT_LABELS[tr.toAccount]}
                      </span>
                      {tr.notes && <span className="block text-[10px] text-[#6B1F2A]/60">{tr.notes}</span>}
                    </div>
                    <div className="text-right">
                      <strong className="text-[#942E3A] font-black">{formatCurrency(tr.amount)}</strong>
                      <span className="block text-[9px] text-[#6B1F2A]/50">
                        {new Date(tr.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PROFIT & LOSS STATEMENT (P&L) */}
      {activeTab === "pnl" && (
        <div className="space-y-4">
          <div>
            <h2 className="font-playfair text-lg font-bold text-[#942E3A]">📊 Income Statement (Profit & Loss)</h2>
            <p className="text-xs text-[#6B1F2A]/70">Official financial breakdown of store revenues, costs, operating expenses, and net profit.</p>
          </div>

          <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 sm:p-6 shadow-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#942E3A]/15 text-[10px] uppercase text-[#6B1F2A]/60">
                  <th className="pb-3">Financial Line Item</th>
                  <th className="pb-3 text-right">Amount (EGP)</th>
                  <th className="pb-3 text-right">% of Gross Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#942E3A]/10">
                {/* Gross Revenue */}
                <tr className="bg-[#FFF9EB]/30">
                  <td className="py-3 font-bold text-[#942E3A]">1. Gross Sales Revenue</td>
                  <td className="py-3 text-right font-bold text-[#942E3A]">{formatCurrency(summary.totalSales)}</td>
                  <td className="py-3 text-right font-bold text-[#942E3A]">100%</td>
                </tr>

                {/* Promotional Discounts */}
                <tr>
                  <td className="py-2.5 pl-4 text-[#6B1F2A]">Less: Promotional Discounts</td>
                  <td className="py-2.5 text-right text-red-600">({formatCurrency(summary.totalDiscounts)})</td>
                  <td className="py-2.5 text-right text-[#6B1F2A]/70">
                    {summary.totalSales > 0 ? ((summary.totalDiscounts / summary.totalSales) * 100).toFixed(1) : 0}%
                  </td>
                </tr>

                {/* Net Sales */}
                <tr className="font-semibold text-[#942E3A]">
                  <td className="py-2.5">2. Net Sales Revenue</td>
                  <td className="py-2.5 text-right">{formatCurrency(summary.totalSales - summary.totalDiscounts)}</td>
                  <td className="py-2.5 text-right">
                    {summary.totalSales > 0 ? (((summary.totalSales - summary.totalDiscounts) / summary.totalSales) * 100).toFixed(1) : 0}%
                  </td>
                </tr>

                {/* Cost of Goods Sold */}
                <tr>
                  <td className="py-2.5 pl-4 text-[#6B1F2A]">Less: Cash Product Cost (COGS)</td>
                  <td className="py-2.5 text-right text-red-600">({formatCurrency(summary.totalCOGS)})</td>
                  <td className="py-2.5 text-right text-[#6B1F2A]/70">
                    {summary.totalSales > 0 ? ((summary.totalCOGS / summary.totalSales) * 100).toFixed(1) : 0}%
                  </td>
                </tr>

                {/* Gross Profit */}
                <tr className="bg-[#FFF9EB] font-bold text-[#942E3A]">
                  <td className="py-3">3. Gross Operating Profit</td>
                  <td className="py-3 text-right font-black">{formatCurrency(summary.grossProfit)}</td>
                  <td className="py-3 text-right font-black">{summary.grossMarginPct}%</td>
                </tr>

                {/* Operating Expenses Section */}
                <tr className="bg-[#f7f1e8]/40">
                  <td colSpan={3} className="py-2 font-bold text-[11px] text-[#942E3A] uppercase tracking-wider">
                    4. Operating Expenses Breakdown
                  </td>
                </tr>

                {Object.entries(expensesByCategory).map(([catKey, catAmt]) => (
                  <tr key={catKey}>
                    <td className="py-2 pl-6 text-[#6B1F2A]/80">{CATEGORY_LABELS[catKey] || catKey}</td>
                    <td className="py-2 text-right text-red-600">({formatCurrency(catAmt)})</td>
                    <td className="py-2 text-right text-[#6B1F2A]/60">
                      {summary.totalSales > 0 ? ((catAmt / summary.totalSales) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))}

                <tr className="font-semibold text-[#6B1F2A]">
                  <td className="py-2.5 pl-4">Total Operating Expenses</td>
                  <td className="py-2.5 text-right text-red-700">({formatCurrency(summary.totalExpenses)})</td>
                  <td className="py-2.5 text-right">
                    {summary.totalSales > 0 ? ((summary.totalExpenses / summary.totalSales) * 100).toFixed(1) : 0}%
                  </td>
                </tr>

                {/* Net Income */}
                <tr className="bg-[#942E3A] text-[#FFF9EB] font-black text-sm">
                  <td className="py-3.5 pl-3 rounded-l-xl">5. Net Operating Income (Net Profit)</td>
                  <td className="py-3.5 text-right font-extrabold">{formatCurrency(summary.netProfit)}</td>
                  <td className="py-3.5 text-right pr-3 rounded-r-xl">{summary.profitMargin}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CASH FLOW */}
      {activeTab === "cashflow" && (
        <div className="space-y-4">
          <div>
            <h2 className="font-playfair text-lg font-bold text-[#942E3A]">📈 Cash Flow & Liquidity Streams</h2>
            <p className="text-xs text-[#6B1F2A]/70">Analysis of cash inflows from sales vs outflow from expenses.</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-xs">
              <span className="text-[10px] font-bold text-[#6B1F2A]/60 block uppercase">Cash Inflow (Sales)</span>
              <p className="mt-1 font-playfair text-2xl font-black text-[#942E3A]">{formatCurrency(summary.totalSales)}</p>
              <p className="mt-1 text-[10px] text-[#6B1F2A]/60">From completed client orders</p>
            </div>

            <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-xs">
              <span className="text-[10px] font-bold text-[#6B1F2A]/60 block uppercase">Cash Outflow (COGS + Expenses)</span>
              <p className="mt-1 font-playfair text-2xl font-black text-red-600">
                {formatCurrency(summary.totalCOGS + summary.totalExpenses)}
              </p>
              <p className="mt-1 text-[10px] text-[#6B1F2A]/60">Product cost + operational expenses</p>
            </div>

            <div className="rounded-2xl border border-[#D8B46A]/40 bg-[#FFFDF5] p-4 shadow-xs">
              <span className="text-[10px] font-bold text-[#6B1F2A]/60 block uppercase">Net Cash Position</span>
              <p className="mt-1 font-playfair text-2xl font-black text-[#942E3A]">{formatCurrency(summary.netProfit)}</p>
              <p className="mt-1 text-[10px] text-[#6B1F2A]/60">Net cash retained in store treasury</p>
            </div>
          </div>

          {/* Payment Methods Share */}
          <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-xs">
            <h3 className="font-playfair text-sm font-bold text-[#942E3A] mb-3">💳 Payment Channels Share</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 text-xs">
              <div className="rounded-xl border border-[#942E3A]/10 bg-[#FFF9EB]/40 p-3">
                <span className="font-bold text-[#942E3A] block">Cash on Delivery (COD)</span>
                <strong className="font-playfair text-lg font-black text-[#942E3A] block mt-1">
                  {formatCurrency(paymentAccounts.cashSales)}
                </strong>
                <span className="text-[10px] text-[#6B1F2A]/60">
                  {summary.totalSales > 0 ? ((paymentAccounts.cashSales / summary.totalSales) * 100).toFixed(1) : 0}% of total sales
                </span>
              </div>

              <div className="rounded-xl border border-[#942E3A]/10 bg-[#FFF9EB]/40 p-3">
                <span className="font-bold text-[#942E3A] block">InstaPay / Visa</span>
                <strong className="font-playfair text-lg font-black text-[#942E3A] block mt-1">
                  {formatCurrency(paymentAccounts.instapaySales)}
                </strong>
                <span className="text-[10px] text-[#6B1F2A]/60">
                  {summary.totalSales > 0 ? ((paymentAccounts.instapaySales / summary.totalSales) * 100).toFixed(1) : 0}% of total sales
                </span>
              </div>

              <div className="rounded-xl border border-[#942E3A]/10 bg-[#FFF9EB]/40 p-3">
                <span className="font-bold text-[#942E3A] block">E-Wallets (Vodafone Cash)</span>
                <strong className="font-playfair text-lg font-black text-[#942E3A] block mt-1">
                  {formatCurrency(paymentAccounts.walletSales)}
                </strong>
                <span className="text-[10px] text-[#6B1F2A]/60">
                  {summary.totalSales > 0 ? ((paymentAccounts.walletSales / summary.totalSales) * 100).toFixed(1) : 0}% of total sales
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EXPENSES */}
      {activeTab === "expenses" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-playfair text-lg font-bold text-[#942E3A]">💸 Expenses Management</h2>
              <p className="text-xs text-[#6B1F2A]/70">Record and monitor all store operating costs.</p>
            </div>
            <button
              onClick={() => setIsAddExpenseOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#942E3A] px-3.5 py-2 text-xs font-bold text-[#FFF9EB] hover:bg-[#7A242F] transition shadow-xs self-start"
            >
              <PlusCircle className="h-4 w-4 text-[#D8B46A]" />
              <span>+ Add New Expense</span>
            </button>
          </div>

          {/* Expenses Category Cards Summary */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {Object.entries(CATEGORY_LABELS).map(([catKey, catLabel]) => {
              const spent = expensesByCategory[catKey] || 0;
              return (
                <div key={catKey} className="rounded-xl border border-[#942E3A]/10 bg-white p-2.5 shadow-xs">
                  <span className="text-[9px] font-bold text-[#6B1F2A]/60 block truncate">{catLabel}</span>
                  <strong className="font-playfair text-sm font-black text-[#942E3A] block mt-0.5">
                    {formatCurrency(spent)}
                  </strong>
                </div>
              );
            })}
          </div>

          {/* Search & Category Filter Toolbar */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-white p-3 rounded-2xl border border-[#942E3A]/10">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6B1F2A]/40" />
              <input
                type="text"
                placeholder="Search expenses by title..."
                value={expenseSearch}
                onChange={(e) => setExpenseSearch(e.target.value)}
                className="w-full rounded-xl border border-[#942E3A]/20 pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#942E3A]"
              />
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-[#D8B46A]" />
              <select
                value={expenseCategoryFilter}
                onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                className="rounded-xl border border-[#942E3A]/20 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#942E3A]"
              >
                <option value="all">All Categories</option>
                {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-xs">
            {filteredExpenses.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#6B1F2A]/60">
                No matching expenses found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#942E3A]/10 text-[10px] uppercase text-[#6B1F2A]/60">
                    <tr>
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Title</th>
                      <th className="pb-2">Category</th>
                      <th className="pb-2">Payment Account</th>
                      <th className="pb-2 text-right">Amount</th>
                      <th className="pb-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#942E3A]/10">
                    {filteredExpenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-[#FFF9EB]/50 transition">
                        <td className="py-2.5 text-[#6B1F2A]/70">
                          {new Date(expense.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="py-2.5 font-bold text-[#942E3A]">
                          {expense.title}
                          {expense.notes && <span className="block text-[10px] font-normal text-[#6B1F2A]/60">{expense.notes}</span>}
                        </td>
                        <td className="py-2.5">
                          <span className="rounded-md bg-[#FFF9EB] px-2 py-0.5 text-[10px] font-bold text-[#942E3A] border border-[#D8B46A]/30">
                            {CATEGORY_LABELS[expense.category] || expense.category}
                          </span>
                        </td>
                        <td className="py-2.5 text-[#6B1F2A]">
                          {ACCOUNT_LABELS[expense.paymentAccount] || expense.paymentAccount}
                        </td>
                        <td className="py-2.5 text-right font-black text-[#942E3A]">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="py-2.5 text-center">
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 transition"
                            title="Delete Expense"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: SETTLEMENTS */}
      {activeTab === "settlements" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-playfair text-lg font-bold text-[#942E3A]">📜 Weekly & Periodic Settlement</h2>
              <p className="text-xs text-[#6B1F2A]/70">Close period accounts and log treasury transfers.</p>
            </div>
            <button
              onClick={() => setIsSettlementModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#942E3A] px-3.5 py-2 text-xs font-bold text-[#FFF9EB] hover:bg-[#7A242F] transition shadow-xs"
            >
              <CheckCircle2 className="h-4 w-4 text-[#D8B46A]" />
              <span>Complete Settlement</span>
            </button>
          </div>

          <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-xs">
            {settlements.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#6B1F2A]/60">
                No previous settlements recorded.
              </div>
            ) : (
              <div className="space-y-3">
                {settlements.map((st) => (
                  <div key={st.id} className="rounded-xl border border-[#942E3A]/10 bg-[#FFF9EB]/40 p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#942E3A]">{st.settlementNumber}</span>
                      <span className="rounded-full bg-[#942E3A] px-2.5 py-0.5 text-[9px] font-bold text-[#FFF9EB]">
                        {st.status === "completed" ? "Completed & Locked" : st.status}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 text-[11px]">
                      <div>Sales: <strong>{formatCurrency(st.totalSales)}</strong></div>
                      <div>Expenses: <strong>{formatCurrency(st.totalExpenses)}</strong></div>
                      <div>Net Profit: <strong className="text-[#942E3A]">{formatCurrency(st.netProfit)}</strong></div>
                      <div>Date: <strong>{new Date(st.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</strong></div>
                    </div>
                    {st.notes && <p className="mt-1 text-[10px] text-[#6B1F2A]/70">Notes: {st.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: ORDERS PROFIT */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          <div>
            <h2 className="font-playfair text-lg font-bold text-[#942E3A]">🛍️ Order Profitability Breakdown</h2>
            <p className="text-xs text-[#6B1F2A]/70">Compare sales price against wholesale cash item costs per order.</p>
          </div>

          {/* Filter toolbar */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-white p-3 rounded-2xl border border-[#942E3A]/10">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6B1F2A]/40" />
              <input
                type="text"
                placeholder="Search orders by number or customer name..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full rounded-xl border border-[#942E3A]/20 pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#942E3A]"
              />
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-[#D8B46A]" />
              <select
                value={orderMarginFilter}
                onChange={(e) => setOrderMarginFilter(e.target.value)}
                className="rounded-xl border border-[#942E3A]/20 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#942E3A]"
              >
                <option value="all">All Profit Margins</option>
                <option value="high">High Profit (≥ 30%)</option>
                <option value="medium">Medium Profit (15% - 29%)</option>
                <option value="low">Low Profit (&lt; 15%)</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#942E3A]/10 text-[10px] uppercase text-[#6B1F2A]/60">
                <tr>
                  <th className="pb-2">Order #</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Total Sales</th>
                  <th className="pb-2">Product Cost</th>
                  <th className="pb-2">Discount</th>
                  <th className="pb-2">Order Profit</th>
                  <th className="pb-2 text-center">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#942E3A]/10">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FFF9EB]/50 transition">
                    <td className="py-2.5 font-bold text-[#942E3A]">
                      <Link href={`/admin/orders/${order.id}`} className="hover:underline flex items-center gap-1">
                        <span>{order.orderNumber}</span>
                        <ArrowUpRight className="h-3 w-3 text-[#D8B46A]" />
                      </Link>
                    </td>
                    <td className="py-2.5 text-[#6B1F2A]">{order.customerName}</td>
                    <td className="py-2.5">
                      <span className="rounded-md bg-[#FFF9EB] px-2 py-0.5 text-[10px] font-bold text-[#942E3A]">
                        {order.status}
                      </span>
                    </td>
                    <td className="py-2.5 font-bold text-[#942E3A]">{formatCurrency(order.totalPrice)}</td>
                    <td className="py-2.5 text-[#6B1F2A]">{formatCurrency(order.itemsCost)}</td>
                    <td className="py-2.5 text-red-600">{formatCurrency(order.discountAmount)}</td>
                    <td className="py-2.5 font-black text-[#942E3A]">{formatCurrency(order.orderProfit)}</td>
                    <td className="py-2.5 text-center">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                          order.profitMargin >= 30
                            ? "bg-green-100 text-green-800"
                            : order.profitMargin >= 15
                            ? "bg-[#D8B46A]/20 text-[#942E3A]"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.profitMargin}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: PROJECTIONS & FORECASTING */}
      {activeTab === "forecasting" && (
        <div className="space-y-4">
          <div>
            <h2 className="font-playfair text-lg font-bold text-[#942E3A]">🔮 Financial Projections & Stock Replenishment</h2>
            <p className="text-xs text-[#6B1F2A]/70">Forecast restock costs and future sales run-rate.</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Low Stock Restock Estimator */}
            <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-[#D8B46A]" />
                <h3 className="font-playfair text-base font-bold text-[#942E3A]">
                  {isRtl ? "تقدير إعادة تخزين المنتجات منخفضة المخزون" : "Low Stock Restock Estimator"}
                </h3>
              </div>
              <p className="text-xs text-[#6B1F2A]/70">
                {isRtl ? "النقدية التقديرية المطلوبة لإعادة تخزين المنتجات التي وصلت إلى حد المخزون المنخفض أو أقل." : "Estimated cash required to replenish items currently at or below their low stock limit."}
              </p>

              <div className="rounded-xl bg-[#FFF9EB] p-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>{isRtl ? "عدد المنتجات منخفضة المخزون:" : "Low Stock Items Count:"}</span>
                  <strong>{inventoryStats.lowStockItemsCount} {isRtl ? "منتج" : "items"}</strong>
                </div>
                <div className="flex justify-between border-t border-[#D8B46A]/30 pt-2 text-[#942E3A] font-bold">
                  <span>{isRtl ? "تكلفة إعادة التخزين التقديرية:" : "Estimated Replenishment Cost:"}</span>
                  <strong className="text-base">{formatCurrency(inventoryStats.lowStockReplenishmentCost)}</strong>
                </div>
              </div>

              <Link
                href="/admin/inventory"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#942E3A] hover:underline"
              >
                <span>{isRtl ? "عرض إدارة المخزون" : "View Inventory Management"}</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Sales Velocity Run-Rate */}
            <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#D8B46A]" />
                <h3 className="font-playfair text-base font-bold text-[#942E3A]">
                  {isRtl ? "توقعات معدل المبيعات" : "Sales Run-Rate Projections"}
                </h3>
              </div>
              <p className="text-xs text-[#6B1F2A]/70">
                {isRtl ? "الإيرادات الشهرية المتوقعة بناءً على متوسط معدل الطلبات النشطة." : "Projected monthly revenue based on active average order velocity."}
              </p>

              <div className="rounded-xl bg-[#FFF9EB] p-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>{isRtl ? "مبيعات الفترة الحالية:" : "Current Period Sales:"}</span>
                  <strong>{formatCurrency(summary.totalSales)}</strong>
                </div>
                <div className="flex justify-between border-t border-[#D8B46A]/30 pt-2 text-[#942E3A] font-bold">
                  <span>{isRtl ? "معدل التشغيل الشهري المتوقع:" : "Projected Monthly Run-Rate:"}</span>
                  <strong className="text-base">{formatCurrency(summary.totalSales * 1.25)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD EXPENSE MODAL */}
      {isAddExpenseOpen && (
        <div dir={isRtl ? "rtl" : "ltr"} className="fixed inset-0 z-50 flex items-center justify-center bg-[#2c1018]/60 backdrop-blur-xs p-4 text-start">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#942E3A]/10 pb-3">
              <h3 className="font-playfair text-base font-bold text-[#942E3A]">Add New Expense</h3>
              <button onClick={() => setIsAddExpenseOpen(false)} className="text-[#6B1F2A]/60 hover:text-[#942E3A]">
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && <div className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-700">{errorMsg}</div>}

            <form onSubmit={handleAddExpense} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#6B1F2A] mb-1">Expense Title *</label>
                <input
                  name="title"
                  required
                  placeholder="e.g., Facebook Ad Campaign"
                  className="w-full rounded-xl border border-[#942E3A]/20 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#942E3A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#6B1F2A] mb-1">Amount (EGP) *</label>
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="w-full rounded-xl border border-[#942E3A]/20 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#942E3A]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#6B1F2A] mb-1">Date</label>
                  <input
                    name="date"
                    type="date"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    className="w-full rounded-xl border border-[#942E3A]/20 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#942E3A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#6B1F2A] mb-1">Category</label>
                <select
                  name="category"
                  className="w-full rounded-xl border border-[#942E3A]/20 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#942E3A]"
                >
                  <option value="marketing">Marketing & Ads</option>
                  <option value="shipping_ops">Logistics & Shipping</option>
                  <option value="packaging">Bags & Packaging</option>
                  <option value="utilities">Utilities & Services</option>
                  <option value="salaries">Salaries & Commissions</option>
                  <option value="other">Other Expenses</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#6B1F2A] mb-1">Deduct from Payment Account</label>
                <select
                  name="paymentAccount"
                  className="w-full rounded-xl border border-[#942E3A]/20 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#942E3A]"
                >
                  <option value="cash">Cash on Hand / Vault</option>
                  <option value="instapay_visa">InstaPay / Visa</option>
                  <option value="wallet">E-Wallets</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#6B1F2A] mb-1">Additional Notes</label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Detailed notes..."
                  className="w-full rounded-xl border border-[#942E3A]/20 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#942E3A]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl bg-[#942E3A] px-4 py-2 text-xs font-bold text-[#FFF9EB] hover:bg-[#7A242F]"
                >
                  {isPending ? "Saving..." : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACCOUNT TRANSFER MODAL */}
      {isTransferOpen && (
        <div dir={isRtl ? "rtl" : "ltr"} className="fixed inset-0 z-50 flex items-center justify-center bg-[#2c1018]/60 backdrop-blur-xs p-4 text-start">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#942E3A]/10 pb-3">
              <h3 className="font-playfair text-base font-bold text-[#942E3A]">Transfer Between Accounts</h3>
              <button onClick={() => setIsTransferOpen(false)} className="text-[#6B1F2A]/60 hover:text-[#942E3A]">
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && <div className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-700">{errorMsg}</div>}

            <form onSubmit={handleCreateTransfer} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#6B1F2A] mb-1">From Account</label>
                  <select
                    name="fromAccount"
                    defaultValue="cash"
                    className="w-full rounded-xl border border-[#942E3A]/20 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#942E3A]"
                  >
                    <option value="cash">Cash on Hand</option>
                    <option value="instapay_visa">InstaPay / Visa</option>
                    <option value="wallet">E-Wallets</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#6B1F2A] mb-1">To Account</label>
                  <select
                    name="toAccount"
                    defaultValue="instapay_visa"
                    className="w-full rounded-xl border border-[#942E3A]/20 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#942E3A]"
                  >
                    <option value="cash">Cash on Hand</option>
                    <option value="instapay_visa">InstaPay / Visa</option>
                    <option value="wallet">E-Wallets</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#6B1F2A] mb-1">Transfer Amount (EGP) *</label>
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="w-full rounded-xl border border-[#942E3A]/20 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#942E3A]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#6B1F2A] mb-1">Transfer Fee / Tax (EGP)</label>
                  <input
                    name="fee"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full rounded-xl border border-[#942E3A]/20 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#942E3A]"
                  />
                </div>
              </div>


              <div>
                <label className="block font-bold text-[#6B1F2A] mb-1">Notes / Reason</label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="e.g., Deposited cash to bank account..."
                  className="w-full rounded-xl border border-[#942E3A]/20 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#942E3A]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTransferOpen(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl bg-[#942E3A] px-4 py-2 text-xs font-bold text-[#FFF9EB] hover:bg-[#7A242F]"
                >
                  {isPending ? "Processing..." : "Execute Transfer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SETTLEMENT CONFIRMATION MODAL */}
      {isSettlementModalOpen && (
        <div dir={isRtl ? "rtl" : "ltr"} className="fixed inset-0 z-50 flex items-center justify-center bg-[#2c1018]/60 backdrop-blur-xs p-4 text-start">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#942E3A]/10 pb-3">
              <h3 className="font-playfair text-base font-bold text-[#942E3A]">Confirm Period Settlement</h3>
              <button onClick={() => setIsSettlementModalOpen(false)} className="text-[#6B1F2A]/60 hover:text-[#942E3A]">
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && <div className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-700">{errorMsg}</div>}

            <div className="mt-4 space-y-2 text-xs">
              <div className="rounded-xl bg-[#FFF9EB] p-3 space-y-1">
                <div className="flex justify-between"><span>Total Sales:</span><strong>{formatCurrency(summary.totalSales)}</strong></div>
                <div className="flex justify-between"><span>Product Cost (COGS):</span><strong>{formatCurrency(summary.totalCOGS)}</strong></div>
                <div className="flex justify-between"><span>Total Expenses:</span><strong>{formatCurrency(summary.totalExpenses)}</strong></div>
                <div className="flex justify-between border-t border-[#D8B46A]/30 pt-1 text-[#942E3A] font-bold">
                  <span>Net Profit to Close:</span>
                  <strong>{formatCurrency(summary.netProfit)}</strong>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#6B1F2A] mb-1">Settlement Notes</label>
                <textarea
                  value={settlementNotes}
                  onChange={(e) => setSettlementNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g., Reviewed cash balances and closed weekly accounts successfully"
                  className="w-full rounded-xl border border-[#942E3A]/20 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#942E3A]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSettlementModalOpen(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSettlement}
                  disabled={isPending}
                  className="rounded-xl bg-[#942E3A] px-4 py-2 text-xs font-bold text-[#FFF9EB] hover:bg-[#7A242F]"
                >
                  {isPending ? "Settling..." : "Confirm & Settle Accounts"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
