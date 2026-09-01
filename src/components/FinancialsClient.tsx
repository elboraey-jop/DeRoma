"use client";

import { useState, useTransition, useMemo } from "react";
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
  Eye,
  Lock,
  Unlock,
  Clock,
  Edit3,
  ChevronDown,
  Check,
  Layers,
  FileText,
} from "lucide-react";
import {
  createExpenseAction,
  updateExpenseAction,
  deleteExpenseAction,
  createSettlementAction,
  createTransferAction,
} from "@/app/admin/financials/actions";
import { toast } from "@/lib/toast";
import AdminDailyLogDatePicker, { DatePreset } from "@/components/AdminDailyLogDatePicker";
import Link from "next/link";
import { useAdminI18n } from "@/providers/AdminI18nContext";

interface ExpenseItem {
  id: string;
  type?: string;
  title: string;
  amount: number;
  category: string;
  paymentAccount: string;
  date: string;
  notes: string | null;
  isPurchaseInvoice?: boolean;
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
  orderProfit: number;
  profitMargin: number;
  createdAt: string;
}

export interface WeeklyPeriodData {
  weekId: string;
  startSat: Date;
  endFri: Date;
  isCurrentWeek: boolean;
  isPastWeek: boolean;
  isLocked: boolean;
  dbSettlement?: SettlementItem;
  totalSales: number;
  totalCOGS: number;
  totalDiscounts: number;
  totalExpenses: number;
  netProfit: number;
  ordersCount: number;
  expensesCount: number;
  cashSales: number;
  instapaySales: number;
  walletSales: number;
  orders: OrderProfitItem[];
  expenses: ExpenseItem[];
}

function getSaturdayWeekRange(dateInput: Date | string) {
  const d = new Date(dateInput);
  const day = d.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const diffToSat = (day + 1) % 7;

  const startSat = new Date(d);
  startSat.setDate(d.getDate() - diffToSat);
  startSat.setHours(0, 0, 0, 0);

  const endFri = new Date(startSat);
  endFri.setDate(startSat.getDate() + 6);
  endFri.setHours(23, 59, 59, 999);

  const yyyy = startSat.getFullYear();
  const mm = String(startSat.getMonth() + 1).padStart(2, "0");
  const dd = String(startSat.getDate()).padStart(2, "0");
  const weekId = `STL-${yyyy}${mm}${dd}`;

  return { startSat, endFri, weekId };
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

type FinancialTab = "overview" | "pnl" | "cashflow" | "expenses" | "settlements" | "orders" | "forecasting";
type FinancialDateFilter = { preset: DatePreset; startDate: string; endDate: string };

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
  summary: _initialSummary,
  inventoryStats,
  paymentAccounts: _initialPaymentAccounts,
  expensesByCategory: _initialExpensesByCategory,
  expenses: allExpenses,
  transfers: allTransfers,
  settlements: allSettlements,
  ordersProfit: allOrdersProfit,
}: FinancialsClientProps) {
  const [activeTab, setActiveTab] = useState<FinancialTab>("overview");

  const [tabDateFilters, setTabDateFilters] = useState<Record<FinancialTab, FinancialDateFilter>>(() => ({
    overview: timeRange,
    pnl: timeRange,
    cashflow: timeRange,
    expenses: timeRange,
    settlements: timeRange,
    orders: timeRange,
    forecasting: timeRange,
  }));

  const activeDateFilter = tabDateFilters[activeTab];
  const isDateInFilter = (dateValue: string, filter: FinancialDateFilter) => {
    if (filter.preset === "all") return true;
    const date = dateValue.slice(0, 10);
    return date >= filter.startDate && date <= filter.endDate;
  };

  const ordersProfit = useMemo(
    () => allOrdersProfit.filter((order) => isDateInFilter(order.createdAt, activeDateFilter)),
    [allOrdersProfit, activeDateFilter],
  );
  const expenses = useMemo(
    () => allExpenses
      .filter((expense) => isDateInFilter(expense.date, activeDateFilter))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [allExpenses, activeDateFilter],
  );
  const transfers = useMemo(
    () => allTransfers.filter((transfer) => isDateInFilter(transfer.date, activeDateFilter)),
    [allTransfers, activeDateFilter],
  );
  const settlements = useMemo(
    () => allSettlements.filter((settlement) => isDateInFilter(settlement.createdAt, activeDateFilter)),
    [allSettlements, activeDateFilter],
  );

  const expensesByCategory = useMemo(() => {
    return expenses
      .filter((expense) => (expense.type || "expense") !== "income" && !expense.isPurchaseInvoice && expense.category !== "purchase_invoice")
      .reduce((acc, expense) => {
        acc[expense.category || "other"] = (acc[expense.category || "other"] || 0) + Number(expense.amount || 0);
        return acc;
      }, {} as Record<string, number>);
  }, [expenses]);

  const paymentAccounts = useMemo(() => {
    let cashSales = 0;
    let instapaySales = 0;
    let walletSales = 0;
    ordersProfit.forEach((order) => {
      const value = Number(order.totalPrice || 0);
      const method = (order.paymentMethod || "cod").toLowerCase();
      if (method.includes("instapay") || method.includes("card") || method.includes("visa")) instapaySales += value;
      else if (method.includes("wallet") || method.includes("vodafone") || method.includes("cash_app")) walletSales += value;
      else if (order.status === "delivered") cashSales += value;
    });

    const accountExpenses = expenses
      .filter((expense) => (expense.type || "expense") !== "income" && !expense.isPurchaseInvoice && expense.category !== "purchase_invoice")
      .reduce((acc, expense) => {
        const account = expense.paymentAccount || "cash";
        acc[account] = (acc[account] || 0) + Number(expense.amount || 0);
        return acc;
      }, { cash: 0, instapay_visa: 0, wallet: 0 } as Record<string, number>);
    const transferAdjustments = transfers.reduce((acc, transfer) => {
      const amount = Number(transfer.amount || 0);
      const fee = Number(transfer.fee || 0);
      if (transfer.fromAccount in acc) acc[transfer.fromAccount] -= amount + fee;
      if (transfer.toAccount in acc) acc[transfer.toAccount] += amount;
      return acc;
    }, { cash: 0, instapay_visa: 0, wallet: 0 } as Record<string, number>);

    const cashOnHand = Math.max(0, cashSales - accountExpenses.cash + transferAdjustments.cash);
    const instapayVisa = Math.max(0, instapaySales - accountExpenses.instapay_visa + transferAdjustments.instapay_visa);
    const wallet = Math.max(0, walletSales - accountExpenses.wallet + transferAdjustments.wallet);
    return { cashOnHand, instapayVisa, wallet, totalLiquidity: cashOnHand + instapayVisa + wallet, cashSales, instapaySales, walletSales };
  }, [ordersProfit, expenses, transfers]);

  const summary = useMemo(() => {
    const totalSales = ordersProfit.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);
    const totalCOGS = ordersProfit.reduce((sum, order) => sum + Number(order.itemsCost || 0), 0);
    const totalDiscounts = ordersProfit.reduce((sum, order) => sum + Number(order.discountAmount || 0), 0);
    const totalExpenses = expenses
      .filter((expense) => (expense.type || "expense") !== "income" && !expense.isPurchaseInvoice && expense.category !== "purchase_invoice")
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const transferFees = transfers.reduce((sum, transfer) => sum + Number(transfer.fee || 0), 0);
    const grossProfit = totalSales - totalCOGS;
    const netProfit = grossProfit - totalExpenses - transferFees;
    const orderCount = ordersProfit.length;
    return {
      totalSales,
      totalCOGS,
      totalDiscounts,
      totalExpenses,
      grossProfit,
      grossMarginPct: totalSales > 0 ? Math.round((grossProfit / totalSales) * 100) : 0,
      netProfit,
      profitMargin: totalSales > 0 ? Math.round((netProfit / totalSales) * 100) : 0,
      deliveredOrdersCount: ordersProfit.filter((order) => order.status === "delivered").length,
      allOrdersCount: orderCount,
      avgOrderValue: orderCount ? Math.round(totalSales / orderCount) : 0,
      avgProfitPerOrder: orderCount ? Math.round(netProfit / orderCount) : 0,
    };
  }, [ordersProfit, expenses, transfers]);

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);

  const [inspectingWeek, setInspectingWeek] = useState<WeeklyPeriodData | null>(null);
  const [settlingWeek, setSettlingWeek] = useState<WeeklyPeriodData | null>(null);
  const [activeInspectTab, setActiveInspectTab] = useState<"orders" | "expenses">("orders");

  const [cashTransferred, setCashTransferred] = useState(0);
  const [instapayTransferred, setInstapayTransferred] = useState(0);
  const [walletTransferred, setWalletTransferred] = useState(0);

  const [expenseSearch, setExpenseSearch] = useState("");
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState("all");

  const [orderSearch, setOrderSearch] = useState("");

  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [settlementNotes, setSettlementNotes] = useState("");

  const openSettlingModal = (week: WeeklyPeriodData) => {
    setSettlingWeek(week);
    setCashTransferred(week.cashSales);
    setInstapayTransferred(week.instapaySales);
    setWalletTransferred(week.walletSales);
    setSettlementNotes(week.dbSettlement?.notes || "");
    setErrorMsg(null);
  };

  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [modalTransactionType, setModalTransactionType] = useState<"expense" | "income">("expense");
  const [typeFilter, setTypeFilter] = useState<"all" | "expense" | "income">("all");

  const [isCategoryFilterDropdownOpen, setIsCategoryFilterDropdownOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState("other");
  const [isModalCategoryDropdownOpen, setIsModalCategoryDropdownOpen] = useState(false);
  const [modalPaymentAccount, setModalPaymentAccount] = useState("cash");
  const [isModalAccountDropdownOpen, setIsModalAccountDropdownOpen] = useState(false);

  // Card-specific Date Filters
  const [salesCardFilter, setSalesCardFilter] = useState<{
    preset: DatePreset;
    startDate: string;
    endDate: string;
  }>({
    preset: "all",
    startDate: "",
    endDate: "",
  });

  const [profitCardFilter, setProfitCardFilter] = useState<{
    preset: DatePreset;
    startDate: string;
    endDate: string;
  }>({
    preset: "all",
    startDate: "",
    endDate: "",
  });

  // Card 1: Sales Treasury calculations based on salesCardFilter
  const salesCardData = useMemo(() => {
    if (salesCardFilter.preset === "all" || (!salesCardFilter.startDate && !salesCardFilter.endDate)) {
      return {
        totalSales: summary.totalSales,
        deliveredOrdersCount: summary.deliveredOrdersCount,
      };
    }

    const start = salesCardFilter.startDate;
    const end = salesCardFilter.endDate;

    const filteredOrders = ordersProfit.filter((o) => {
      if (o.status !== "delivered") return false;
      const orderDate = o.createdAt.split("T")[0];
      if (start && orderDate < start) return false;
      if (end && orderDate > end) return false;
      return true;
    });

    const totalSales = filteredOrders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);
    const deliveredOrdersCount = filteredOrders.length;

    return { totalSales, deliveredOrdersCount };
  }, [salesCardFilter, ordersProfit, summary.totalSales, summary.deliveredOrdersCount]);

  // Card 2: Net Profit Treasury calculations based on profitCardFilter
  const profitCardData = useMemo(() => {
    if (profitCardFilter.preset === "all" || (!profitCardFilter.startDate && !profitCardFilter.endDate)) {
      return {
        netProfit: summary.netProfit,
        profitMargin: summary.profitMargin,
      };
    }

    const start = profitCardFilter.startDate;
    const end = profitCardFilter.endDate;

    const filteredOrders = ordersProfit.filter((o) => {
      const orderDate = o.createdAt.split("T")[0];
      if (start && orderDate < start) return false;
      if (end && orderDate > end) return false;
      return true;
    });

    const filteredSalesTotal = filteredOrders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);
    const filteredOrdersProfit = filteredOrders.reduce((sum, o) => sum + Number(o.orderProfit || 0), 0);

    const filteredExpenses = expenses.filter((e) => {
      if (e.type === "income" || e.category === "purchase_invoice" || e.isPurchaseInvoice) return false;
      const expDate = e.date.split("T")[0];
      if (start && expDate < start) return false;
      if (end && expDate > end) return false;
      return true;
    });

    const filteredExpensesTotal = filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const netProfit = filteredOrdersProfit - filteredExpensesTotal;
    const profitMargin = filteredSalesTotal > 0 ? Math.round((netProfit / filteredSalesTotal) * 100) : 0;

    return { netProfit, profitMargin };
  }, [profitCardFilter, ordersProfit, expenses, summary.netProfit, summary.profitMargin]);

  // Cash Flow tab Card Filters
  const [cashInflowFilter, setCashInflowFilter] = useState<{
    preset: DatePreset;
    startDate: string;
    endDate: string;
  }>({
    preset: "all",
    startDate: "",
    endDate: "",
  });

  const [cashOutflowFilter, setCashOutflowFilter] = useState<{
    preset: DatePreset;
    startDate: string;
    endDate: string;
  }>({
    preset: "all",
    startDate: "",
    endDate: "",
  });

  const [netCashFilter, setNetCashFilter] = useState<{
    preset: DatePreset;
    startDate: string;
    endDate: string;
  }>({
    preset: "all",
    startDate: "",
    endDate: "",
  });

  const cashInflowData = useMemo(() => {
    if (cashInflowFilter.preset === "all" || (!cashInflowFilter.startDate && !cashInflowFilter.endDate)) {
      return { totalSales: summary.totalSales };
    }
    const start = cashInflowFilter.startDate;
    const end = cashInflowFilter.endDate;

    const filteredOrders = ordersProfit.filter((o) => {
      if (o.status !== "delivered") return false;
      const orderDate = o.createdAt.split("T")[0];
      if (start && orderDate < start) return false;
      if (end && orderDate > end) return false;
      return true;
    });

    const totalSales = filteredOrders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);
    return { totalSales };
  }, [cashInflowFilter, ordersProfit, summary.totalSales]);

  const cashOutflowData = useMemo(() => {
    if (cashOutflowFilter.preset === "all" || (!cashOutflowFilter.startDate && !cashOutflowFilter.endDate)) {
      return { totalOutflow: summary.totalCOGS + summary.totalExpenses };
    }
    const start = cashOutflowFilter.startDate;
    const end = cashOutflowFilter.endDate;

    const filteredOrders = ordersProfit.filter((o) => {
      const orderDate = o.createdAt.split("T")[0];
      if (start && orderDate < start) return false;
      if (end && orderDate > end) return false;
      return true;
    });
    const totalCOGS = filteredOrders.reduce((sum, o) => sum + Number(o.itemsCost || 0), 0);

    const filteredExpenses = expenses.filter((e) => {
      if (e.type === "income" || e.category === "purchase_invoice" || e.isPurchaseInvoice) return false;
      const expDate = e.date.split("T")[0];
      if (start && expDate < start) return false;
      if (end && expDate > end) return false;
      return true;
    });
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

    return { totalOutflow: totalCOGS + totalExpenses };
  }, [cashOutflowFilter, ordersProfit, expenses, summary.totalCOGS, summary.totalExpenses]);

  const netCashData = useMemo(() => {
    if (netCashFilter.preset === "all" || (!netCashFilter.startDate && !netCashFilter.endDate)) {
      return { netCash: summary.netProfit };
    }
    const start = netCashFilter.startDate;
    const end = netCashFilter.endDate;

    const filteredOrders = ordersProfit.filter((o) => {
      const orderDate = o.createdAt.split("T")[0];
      if (start && orderDate < start) return false;
      if (end && orderDate > end) return false;
      return true;
    });
    const filteredOrdersProfit = filteredOrders.reduce((sum, o) => sum + Number(o.orderProfit || 0), 0);

    const filteredExpenses = expenses.filter((e) => {
      if (e.type === "income" || e.category === "purchase_invoice" || e.isPurchaseInvoice) return false;
      const expDate = e.date.split("T")[0];
      if (start && expDate < start) return false;
      if (end && expDate > end) return false;
      return true;
    });
    const filteredExpensesTotal = filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

    return { netCash: filteredOrdersProfit - filteredExpensesTotal };
  }, [netCashFilter, ordersProfit, expenses, summary.netProfit]);

  const openEditExpenseModal = (expense: ExpenseItem) => {
    setEditingExpense(expense);
    setModalCategory(expense.category);
    setModalPaymentAccount(expense.paymentAccount);
    setModalTransactionType((expense.type || "expense") as "expense" | "income");
    setErrorMsg(null);
  };

  const openAddExpenseModal = () => {
    setEditingExpense(null);
    setModalCategory(modalTransactionType === "income" ? "other_income" : "other");
    setModalPaymentAccount("cash");
    setErrorMsg(null);
    setIsAddExpenseOpen(true);
  };

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

  const handleUpdateExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingExpense) return;
    setErrorMsg(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        await updateExpenseAction(editingExpense.id, formData);
        setEditingExpense(null);
      } catch (err: any) {
        setErrorMsg(err.message || (isRtl ? "تعذر تعديل الحركة المالية." : "Failed to update transaction."));
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
        toast.success(isRtl ? "تم حذف المصروف بنجاح!" : "Expense deleted successfully!");
      } catch (err: any) {
        toast.error(err.message || (isRtl ? "تعذر حذف المصروف." : "Failed to delete expense."));
      }
    });
  };

  const handleCreateSettlement = () => {
    if (!settlingWeek) return;
    setErrorMsg(null);
    startTransition(async () => {
      try {
        await createSettlementAction({
          settlementNumber: settlingWeek.weekId,
          startDate: settlingWeek.startSat.toISOString(),
          endDate: settlingWeek.endFri.toISOString(),
          totalSales: settlingWeek.totalSales,
          totalCOGS: settlingWeek.totalCOGS,
          totalExpenses: settlingWeek.totalExpenses,
          netProfit: settlingWeek.netProfit,
          cashTransferred: cashTransferred,
          instapayTransferred: instapayTransferred,
          walletTransferred: walletTransferred,
          notes: settlementNotes,
        });
        setSettlingWeek(null);
        setIsSettlementModalOpen(false);
        setSettlementNotes("");
      } catch (err: any) {
        setErrorMsg(err.message || (isRtl ? "تعذر تنفيذ التسوية." : "Failed to process settlement."));
      }
    });
  };

  const { lang, t, formatPrice, formatNumber } = useAdminI18n();
  const isRtl = lang === "ar";

  // Calculate Saturday-to-Friday Weekly Periods
  const weeklyPeriods: WeeklyPeriodData[] = (() => {
    const now = new Date();
    const currentWeekInfo = getSaturdayWeekRange(now);

    let minDate = new Date(now);
    ordersProfit.forEach((o) => {
      const d = new Date(o.createdAt);
      if (d < minDate) minDate = d;
    });
    expenses.forEach((e) => {
      const d = new Date(e.date);
      if (d < minDate) minDate = d;
    });

    const minWeekInfo = getSaturdayWeekRange(minDate);
    const fourWeeksAgo = new Date(currentWeekInfo.startSat);
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 21);

    let startPoint = minWeekInfo.startSat;
    if (startPoint.getTime() > fourWeeksAgo.getTime()) {
      startPoint = fourWeeksAgo;
    }

    const weeksList: { startSat: Date; endFri: Date; weekId: string }[] = [];
    let curr = new Date(startPoint);

    while (curr.getTime() <= currentWeekInfo.startSat.getTime()) {
      const info = getSaturdayWeekRange(curr);
      weeksList.push(info);
      curr = new Date(curr);
      curr.setDate(curr.getDate() + 7);
    }

    weeksList.reverse(); // Newest first

    return weeksList.map((w) => {
      const wStart = w.startSat.getTime();
      const wEnd = w.endFri.getTime();

      const wOrders = ordersProfit.filter((o) => {
        const t = new Date(o.createdAt).getTime();
        return t >= wStart && t <= wEnd;
      });

      const wExpenses = expenses.filter((e) => {
        const t = new Date(e.date).getTime();
        return t >= wStart && t <= wEnd;
      });

      const totalSales = wOrders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);
      const totalCOGS = wOrders.reduce((sum, o) => sum + o.itemsCost, 0);
      const totalDiscounts = wOrders.reduce((sum, o) => sum + o.discountAmount, 0);
      // Purchase invoices are displayed in the weekly expense list for
      // visibility, but are treasury outflows only and must not affect the
      // weekly profit or settlement totals.
      const profitExpenses = wExpenses.filter(
        (e) =>
          (e.type || "expense") !== "income" &&
          e.category !== "purchase_invoice" &&
          !e.isPurchaseInvoice,
      );
      const totalExpenses = profitExpenses.reduce((sum, e) => sum + e.amount, 0);
    // totalSales already includes the discount deduction.
    const netProfit = totalSales - totalCOGS - totalExpenses;

      const cashSales = wOrders
        .filter((o) => o.paymentMethod === "cod" || o.paymentMethod === "cash")
        .reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);

      const instapaySales = wOrders
        .filter((o) => o.paymentMethod === "instapay" || o.paymentMethod === "card" || o.paymentMethod === "visa")
        .reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);

      const walletSales = wOrders
        .filter((o) => o.paymentMethod === "wallet" || o.paymentMethod === "vodafone_cash")
        .reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);

      const dbSettlement = settlements.find((s) => {
        if (s.settlementNumber !== w.weekId || s.status !== "completed") return false;
        const sStart = new Date(s.startDate).getTime();
        const sEnd = new Date(s.endDate).getTime();
        return Math.abs(sStart - wStart) < 86400000 && Math.abs(sEnd - wEnd) < 86400000;
      });

      const isCurrentWeek = w.weekId === currentWeekInfo.weekId;
      const isPastWeek = w.endFri.getTime() < now.getTime() && !isCurrentWeek;
      const isLocked = Boolean(dbSettlement && dbSettlement.status === "completed");

      return {
        weekId: w.weekId,
        startSat: w.startSat,
        endFri: w.endFri,
        isCurrentWeek,
        isPastWeek,
        isLocked,
        dbSettlement,
        totalSales,
        totalCOGS,
        totalDiscounts,
        totalExpenses,
        netProfit,
        ordersCount: wOrders.length,
        expensesCount: profitExpenses.length,
        cashSales,
        instapaySales,
        walletSales,
        orders: wOrders,
        expenses: wExpenses,
      };
    });
  })();

  const currentWeekPeriod = weeklyPeriods.find((w) => w.isCurrentWeek) || weeklyPeriods[0];
  const unclosedPastWeeks = weeklyPeriods.filter((w) => w.isPastWeek && !w.isLocked);
  const closedWeeks = weeklyPeriods.filter((w) => w.isLocked);

  const isEntryLocked = (expDate: string) => {
    const d = new Date(expDate).getTime();
    return closedWeeks.some((w) => {
      const start = w.startSat.getTime();
      const end = w.endFri.getTime();
      return d >= start && d <= end;
    });
  };

  const totalIncome = expenses
    .filter((e) => e.type === "income")
    .reduce((sum, e) => sum + e.amount, 0);

  const totalPurchaseInvoices = expenses
    .filter((e) => e.category === "purchase_invoice" || e.isPurchaseInvoice)
    .reduce((sum, e) => sum + e.amount, 0);

  const totalOperatingExpenses = expenses
    .filter((e) => (e.type || "expense") === "expense" && e.category !== "purchase_invoice" && !e.isPurchaseInvoice)
    .reduce((sum, e) => sum + e.amount, 0);

  // summary.totalSales is net sales after discounts.
  const netOperatingProfit = summary.totalSales - summary.totalCOGS - totalOperatingExpenses;
  const grossSalesBeforeDiscounts = summary.totalSales + summary.totalDiscounts;

  // Filtered Expenses & Income Transactions
  const filteredExpenses = expenses.filter((exp) => {
    const expType = exp.type || "expense";
    const matchesType = typeFilter === "all" || expType === typeFilter;
    const matchesCategory = expenseCategoryFilter === "all" || exp.category === expenseCategoryFilter;
    const matchesSearch =
      exp.title.toLowerCase().includes(expenseSearch.toLowerCase()) ||
      (exp.notes && exp.notes.toLowerCase().includes(expenseSearch.toLowerCase()));
    return matchesType && matchesCategory && matchesSearch;
  });

  // Order profitability for the selected date range. Allocate eligible
  // operating expenses across all orders in that range by each order's share
  // of sales. Purchase invoices and income are excluded from this allocation.
  const profitabilitySales = ordersProfit.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);
  const profitabilityExpenses = expenses
    .filter((expense) =>
      (expense.type || "expense") !== "income" &&
      !expense.isPurchaseInvoice &&
      expense.category !== "purchase_invoice",
    )
    .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const filteredOrders = ordersProfit
    .filter((ord) => {
      return (
        ord.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
        ord.customerName.toLowerCase().includes(orderSearch.toLowerCase())
      );
    })
    .map((order) => {
      const weeklyExpenseShare =
        profitabilitySales > 0 ? (order.totalPrice / profitabilitySales) * profitabilityExpenses : 0;
      const netOrderProfit = order.orderProfit - weeklyExpenseShare;

      return {
        ...order,
        weeklyExpenseShare,
        netOrderProfit,
      };
    });

  const exportDateLabel = activeDateFilter.preset === "all"
    ? (isRtl ? "كل الفترات" : "All periods")
    : `${activeDateFilter.startDate || "..."} - ${activeDateFilter.endDate || "..."}`;

  const exportFileDate = activeDateFilter.preset === "all"
    ? "all-periods"
    : `${activeDateFilter.startDate || "start"}-to-${activeDateFilter.endDate || "end"}`;

  const exportTabTitles: Record<FinancialTab, string> = {
    overview: "Overview & Safes",
    pnl: "Profit & Loss",
    cashflow: "Cash Flow",
    expenses: "Expenses & Income",
    settlements: "Weekly Settlement",
    orders: "Order Profitability",
    forecasting: "Forecasting",
  };

  const exportTransactions = filteredExpenses.map((expense) => ({
    Date: new Date(expense.date).toLocaleDateString("en-CA"),
    Type: expense.type === "income" ? "Income" : expense.isPurchaseInvoice || expense.category === "purchase_invoice" ? "Purchase invoice" : "Expense",
    Title: expense.title,
    Category: expense.category,
    "Payment account": ACCOUNT_LABELS[expense.paymentAccount] || expense.paymentAccount,
    Amount: Number(expense.amount || 0),
    Notes: expense.notes || "",
  }));

  const exportRowsByTab: Record<FinancialTab, Record<string, unknown>[]> = {
    overview: [
      { Metric: "Total sales", Value: summary.totalSales },
      { Metric: "Total liquidity", Value: paymentAccounts.totalLiquidity },
      { Metric: "Net profit", Value: summary.netProfit },
      { Metric: "Cash on hand", Value: paymentAccounts.cashOnHand },
      { Metric: "InstaPay / Visa", Value: paymentAccounts.instapayVisa },
      { Metric: "E-Wallets", Value: paymentAccounts.wallet },
      { Metric: "Stock units", Value: inventoryStats.totalItemsInStock },
      { Metric: "Stock wholesale value", Value: inventoryStats.stockWholesaleValue },
      { Metric: "Stock retail value", Value: inventoryStats.stockRetailValue },
    ],
    pnl: [
      { Line: "Gross sales revenue", Amount: grossSalesBeforeDiscounts },
      { Line: "Promotional discounts", Amount: summary.totalDiscounts },
      { Line: "Net sales revenue", Amount: summary.totalSales },
      { Line: "COGS", Amount: summary.totalCOGS },
      { Line: "Gross profit", Amount: summary.grossProfit },
      { Line: "Operating expenses", Amount: summary.totalExpenses },
      { Line: "Net operating income", Amount: summary.netProfit },
    ],
    cashflow: [
      { Metric: "Cash inflow (sales)", Amount: cashInflowData.totalSales },
      { Metric: "Cash outflow (COGS + expenses)", Amount: cashOutflowData.totalOutflow },
      { Metric: "Net cash", Amount: netCashData.netCash },
      { Metric: "Cash sales", Amount: paymentAccounts.cashSales },
      { Metric: "InstaPay / Visa sales", Amount: paymentAccounts.instapaySales },
      { Metric: "Wallet sales", Amount: paymentAccounts.walletSales },
      ...transfers.map((transfer) => ({
        Metric: `Transfer ${transfer.fromAccount} → ${transfer.toAccount}`,
        Amount: Number(transfer.amount || 0),
        Fee: Number(transfer.fee || 0),
      })),
    ],
    expenses: exportTransactions,
    settlements: weeklyPeriods.map((week) => ({
      Week: week.weekId,
      Start: week.startSat.toLocaleDateString("en-CA"),
      End: week.endFri.toLocaleDateString("en-CA"),
      Sales: week.totalSales,
      COGS: week.totalCOGS,
      Expenses: week.totalExpenses,
      "Net profit": week.netProfit,
      Status: week.isLocked ? "Completed" : "Open",
    })),
    orders: filteredOrders.map((order) => ({
      Date: new Date(order.createdAt).toLocaleDateString("en-CA"),
      Order: order.orderNumber,
      Customer: order.customerName,
      Status: order.status,
      "Payment method": order.paymentMethod,
      Sales: Number(order.totalPrice || 0),
      COGS: Number(order.itemsCost || 0),
      Discount: Number(order.discountAmount || 0),
      Profit: Number(order.orderProfit || 0),
      "Net profit / order": Number(order.netOrderProfit || 0),
    })),
    forecasting: [
      { Metric: "Stock units", Value: inventoryStats.totalItemsInStock },
      { Metric: "Wholesale stock value", Value: inventoryStats.stockWholesaleValue },
      { Metric: "Retail stock value", Value: inventoryStats.stockRetailValue },
      { Metric: "Projected profit", Value: inventoryStats.projectedProfit },
      { Metric: "Low stock items", Value: inventoryStats.lowStockItemsCount },
      { Metric: "Replenishment cost", Value: inventoryStats.lowStockReplenishmentCost },
    ],
  };

  /* Excel export removed by request.
  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "DeRoma Admin";
    workbook.lastModifiedBy = "DeRoma Admin";
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.properties.date1904 = false;

    const purple = "8B79C6";
    const darkPurple = "66568F";
    const gold = "D8B46A";
    const cream = "FFF9EB";
    const borderColor = "DCCFF5";
    const moneyFormat = '#,##0.00;[Red]-#,##0.00';

    const styleTitle = (cell: ExcelJS.Cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: purple } };
      cell.font = { name: "Aptos Display", size: 16, bold: true, color: { argb: "FFFFFF" } };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    };
    const styleHeader = (row: ExcelJS.Row) => {
      row.height = 26;
      row.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: purple } };
        cell.font = { name: "Aptos", size: 11, bold: true, color: { argb: "FFFFFF" } };
        cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        cell.border = { bottom: { style: "medium", color: { argb: gold } } };
      });
    };
    const styleBody = (row: ExcelJS.Row, rowIndex: number) => {
      row.eachCell((cell) => {
        cell.font = { name: "Aptos", size: 10, color: { argb: darkPurple } };
        cell.alignment = { vertical: "middle", wrapText: true };
        cell.border = {
          bottom: { style: "hair", color: { argb: borderColor } },
        };
        if (rowIndex % 2 === 0) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FCFAFF" } };
        if (typeof cell.value === "number") cell.numFmt = moneyFormat;
      });
    };

    const info = workbook.addWorksheet("Report Info", { views: [{ showGridLines: false }] });
    info.columns = [{ width: 28 }, { width: 42 }, { width: 18 }, { width: 18 }];
    info.mergeCells("A1:D1");
    info.getCell("A1").value = `DeRoma Admin | ${exportTabTitles[activeTab]}`;
    styleTitle(info.getCell("A1"));
    info.getRow(1).height = 34;
    info.mergeCells("A2:D2");
    info.getCell("A2").value = "Professional financial export generated from the selected tab and date range";
    info.getCell("A2").font = { italic: true, color: { argb: darkPurple } };
    info.getCell("A2").alignment = { horizontal: "center" };
    const metaRows = [
      ["Selected tab", exportTabTitles[activeTab]],
      ["Report period", exportDateLabel],
      ["Generated at", new Date().toLocaleString("en-GB")],
      ["Rows exported", exportRowsByTab[activeTab].length],
    ];
    metaRows.forEach((values, index) => {
      const row = info.addRow(values);
      row.height = 22;
      row.getCell(1).font = { bold: true, color: { argb: darkPurple } };
      row.getCell(2).font = { color: { argb: darkPurple } };
      if (index % 2 === 0) row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: cream } };
    });
    info.addRow([]);
    const summaryHeader = info.addRow(["Key result", "Value"]);
    styleHeader(summaryHeader);
    exportRowsByTab[activeTab].slice(0, 12).forEach((item) => {
      const firstKey = Object.keys(item)[0];
      const secondKey = Object.keys(item)[1];
      const row = info.addRow([firstKey, item[secondKey] ?? ""]);
      styleBody(row, row.number);
      row.getCell(1).font = { bold: true, color: { argb: darkPurple } };
    });
    info.views = [{ showGridLines: false, state: "frozen", ySplit: 7 }];
    info.autoFilter = { from: "A7", to: `B${info.rowCount}` };
    info.pageSetup = { orientation: "portrait", fitToPage: true, fitToWidth: 1, fitToHeight: 0 };
    info.headerFooter.oddFooter = "DeRoma Admin | &P of &N";

    const detailRows = exportRowsByTab[activeTab];
    const details = workbook.addWorksheet(exportTabTitles[activeTab].slice(0, 31), { views: [{ showGridLines: false }] });
    const detailColumns = detailRows.length ? Object.keys(detailRows[0]) : ["Message"];
    details.columns = detailColumns.map((key) => ({
      header: key,
      key,
      width: Math.min(34, Math.max(14, key.length + 4)),
    }));
    const detailHeader = details.getRow(1);
    styleHeader(detailHeader);
    detailRows.forEach((item) => {
      const row = details.addRow(detailColumns.map((key) => item[key] ?? ""));
      styleBody(row, row.number);
    });
    if (detailRows.length) {
      details.addTable({
        name: `DeRoma${activeTab}Table`,
        ref: `A1:${String.fromCharCode(64 + Math.min(detailColumns.length, 26))}${detailRows.length + 1}`,
        headerRow: true,
        totalsRow: false,
        style: { theme: "TableStyleMedium4", showRowStripes: true },
        columns: detailColumns.map((key) => ({ name: key })),
        rows: detailRows.map((item) => detailColumns.map((key) => item[key] ?? "")),
      });
    }
    details.views = [{ showGridLines: false, state: "frozen", ySplit: 1 }];
    details.autoFilter = { from: "A1", to: `${String.fromCharCode(64 + Math.min(detailColumns.length, 26))}${details.rowCount}` };
    details.pageSetup = { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 };
    details.headerFooter.oddHeader = `&BDeRoma Admin | ${exportTabTitles[activeTab]}`;
    details.headerFooter.oddFooter = "&P of &N";
    details.eachRow((row) => row.eachCell((cell) => { if (typeof cell.value === "number") cell.numFmt = moneyFormat; }));

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `deroma-${activeTab}-${exportFileDate}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  */

  const handleExportPdf = () => {
    const reportWindow = window.open("", "_blank", "width=1200,height=900");
    if (!reportWindow) {
      toast.warning(isRtl ? "يرجى السماح بالنوافذ المنبثقة لتصدير التقرير." : "Please allow pop-ups to export the report.");
      return;
    }

    const escapeHtml = (value: unknown) => String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;");
    const money = (value: number) => `${Number(value || 0).toLocaleString("en-US")} EGP`;
    const pdfTabTitles: Record<FinancialTab, string> = {
      overview: isRtl ? "ملخص الخزائن والأرصدة" : exportTabTitles.overview,
      pnl: isRtl ? "قائمة الأرباح والخسائر" : exportTabTitles.pnl,
      cashflow: isRtl ? "التدفق النقدي" : exportTabTitles.cashflow,
      expenses: isRtl ? "المصروفات والإيرادات" : exportTabTitles.expenses,
      settlements: isRtl ? "التسويات الأسبوعية" : exportTabTitles.settlements,
      orders: isRtl ? "ربحية الطلبات" : exportTabTitles.orders,
      forecasting: isRtl ? "التوقعات وإعادة التوريد" : exportTabTitles.forecasting,
    };
    const pdfKeyLabels: Record<string, string> = {
      Metric: "المؤشر",
      Value: "القيمة",
      Line: "البند",
      Amount: "المبلغ",
      Fee: "الرسوم",
      Date: "التاريخ",
      Type: "النوع",
      Title: "البيان",
      Category: "التصنيف",
      "Payment account": "حساب الدفع",
      Notes: "ملاحظات",
      Week: "الأسبوع",
      Start: "من",
      End: "إلى",
      Sales: "المبيعات",
      COGS: "تكلفة المنتجات",
      Expenses: "المصروفات",
      "Net profit": "صافي الربح",
      Status: "الحالة",
      Order: "رقم الطلب",
      Customer: "العميل",
      "Payment method": "طريقة الدفع",
      Discount: "الخصم",
      Profit: "الربح",
      "Net profit / order": "صافي ربح الطلب",
      From: "من حساب",
      To: "إلى حساب",
      "Rows exported": "عدد الصفوف",
    };
    const rawRows = exportRowsByTab[activeTab];
    const rows = isRtl
      ? rawRows.map((row) => Object.fromEntries(Object.entries(row).map(([key, value]) => [pdfKeyLabels[key] || key, value])))
      : rawRows;
    const tableColumns = rows.length ? Object.keys(rows[0]) : [isRtl ? "رسالة" : "Message"];
    const formatPdfCell = (value: unknown) =>
      typeof value === "number"
        ? Math.round(value).toLocaleString("en-US")
        : value;
    const tableRows = rows.length
      ? rows.map((row) => `<tr>${tableColumns.map((column) => `<td>${escapeHtml(formatPdfCell(row[column]))}</td>`).join("")}</tr>`).join("")
      : `<tr><td colspan="${tableColumns.length}">${isRtl ? "لا توجد بيانات في هذه الفترة." : "No data in this period."}</td></tr>`;
    const headers = tableColumns.map((column) => `<th>${escapeHtml(column)}</th>`).join("");
    const reportTitle = pdfTabTitles[activeTab];
    const reportPeriodLabel = isRtl ? "الفترة" : "Report period";
    const generatedLabel = isRtl ? "تاريخ الإنشاء" : "Generated";
    const detailsLabel = isRtl ? "تفاصيل" : "details";
    const totalSalesLabel = isRtl ? "إجمالي المبيعات" : "Total sales";
    const expensesLabel = isRtl ? "المصروفات التشغيلية" : "Operating expenses";
    const netProfitLabel = isRtl ? "صافي الربح" : "Net profit";
    const rowsLabel = isRtl ? "عدد الصفوف" : "Rows exported";
    reportWindow.document.write(`<!doctype html><html lang="${isRtl ? "ar" : "en"}"><head><meta charset="utf-8"><title>DeRoma ${escapeHtml(reportTitle)}</title><style>
      *{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#45366f;margin:32px;background:#fffaf0;direction:${isRtl ? "rtl" : "ltr"}}h1{color:#7565b5;margin:0 0 6px}h2{color:#7565b5;margin:28px 0 10px;font-size:18px}.brand{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #d8b46a;padding-bottom:14px}.brandmark{font-size:22px;font-weight:800;color:#7565b5}.meta{color:#66568f;margin:18px 0 24px}.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.card{border:1px solid #d8b46a;border-radius:12px;padding:12px;background:#fffdf5}.card span{display:block;color:#66568f;font-size:11px;margin-bottom:6px}.card strong{font-size:17px;color:#7565b5}table{width:100%;border-collapse:collapse;font-size:11px;background:#fffdf5}th{background:#8b79c6;color:#fffdf5;text-align:${isRtl ? "right" : "left"};padding:9px}td{border-bottom:1px solid #e5ddf4;padding:8px;color:#4b3b76}.amount{text-align:${isRtl ? "left" : "right"};font-weight:bold}.income{color:#087443}.expense{color:#a3263a}@media print{body{margin:12mm;background:#fffaf0;-webkit-print-color-adjust:exact;print-color-adjust:exact}.summary{grid-template-columns:repeat(4,1fr)}}
    </style></head><body><div class="brand"><div class="brandmark">DeRoma ADMIN</div><div>${escapeHtml(reportTitle)}</div></div><h1>${escapeHtml(reportTitle)}</h1><div class="meta">${reportPeriodLabel}: ${escapeHtml(exportDateLabel)}<br>${generatedLabel}: ${escapeHtml(new Date().toLocaleString(isRtl ? "ar-EG" : "en-GB"))}</div><div class="summary"><div class="card"><span>${totalSalesLabel}</span><strong>${money(summary.totalSales)}</strong></div><div class="card"><span>${expensesLabel}</span><strong>${money(summary.totalExpenses)}</strong></div><div class="card"><span>${netProfitLabel}</span><strong>${money(summary.netProfit)}</strong></div><div class="card"><span>${rowsLabel}</span><strong>${rows.length}</strong></div></div><h2>${escapeHtml(reportTitle)} ${detailsLabel}</h2><table><thead><tr>${headers}</tr></thead><tbody>${tableRows}</tbody></table><script>window.onload=function(){window.focus();window.print();}</script></body></html>`);
    reportWindow.document.close();
  };

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

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleExportPdf}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#8B79C6]/60 bg-white px-3 py-2 text-xs font-bold text-[#66568F] shadow-sm transition hover:bg-[#F4F0FF]"
            title={isRtl ? "تصدير تقرير PDF للفترة المحددة" : "Export PDF report for selected period"}
          >
            <FileText className="h-4 w-4" />
            <span>{isRtl ? "تصدير PDF" : "Export PDF"}</span>
          </button>
          <button
            type="button"
            className="hidden"
            title={isRtl ? "تصدير ملف Excel للفترة المحددة" : "Export Excel workbook for selected period"}
          >
            <span>{isRtl ? "تصدير Excel" : "Export Excel"}</span>
          </button>
          <AdminDailyLogDatePicker
            currentPreset={activeDateFilter.preset}
            currentStartDate={activeDateFilter.startDate}
            currentEndDate={activeDateFilter.endDate}
            onChange={(preset, startDate, endDate) => {
              setTabDateFilters((previous) => ({
                ...previous,
                [activeTab]: { preset, startDate, endDate },
              }));
            }}
          />
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="financial-tabs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("overview")}
          data-active={activeTab === "overview"}
          className="admin-tab flex shrink-0 items-center gap-2 px-3.5 py-2 text-xs font-bold"
        >
          <PiggyBank className="h-4 w-4 text-[#D8B46A]" />
          <span>{isRtl ? "ملخص الخزائن والأرصدة" : "Overview & Safes"}</span>
        </button>

        {/* Profit & Loss tab temporarily hidden; remove the false guard to restore it. */}
        {false && (<button
          onClick={() => setActiveTab("pnl")}
          data-active={activeTab === "pnl"}
          className="admin-tab flex shrink-0 items-center gap-2 px-3.5 py-2 text-xs font-bold"
        >
          <BarChart3 className="h-4 w-4 text-[#D8B46A]" />
          <span>{isRtl ? "قائمة الأرباح والخسائر" : "Profit & Loss (P&L)"}</span>
        </button>)}

        <button
          onClick={() => setActiveTab("cashflow")}
          data-active={activeTab === "cashflow"}
          className="admin-tab flex shrink-0 items-center gap-2 px-3.5 py-2 text-xs font-bold"
        >
          <Activity className="h-4 w-4 text-[#D8B46A]" />
          <span>{isRtl ? "التدفق النقدي" : "Cash Flow"}</span>
        </button>

        <button
          onClick={() => setActiveTab("expenses")}
          data-active={activeTab === "expenses"}
          className="admin-tab flex shrink-0 items-center gap-2 px-3.5 py-2 text-xs font-bold"
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
          data-active={activeTab === "settlements"}
          className="admin-tab flex shrink-0 items-center gap-2 px-3.5 py-2 text-xs font-bold"
        >
          <ShieldCheck className="h-4 w-4 text-[#D8B46A]" />
          <span>{isRtl ? "التسوية الأسبوعية" : "Weekly Settlement"}</span>
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          data-active={activeTab === "orders"}
          className="admin-tab flex shrink-0 items-center gap-2 px-3.5 py-2 text-xs font-bold"
        >
          <ShoppingBag className="h-4 w-4 text-[#D8B46A]" />
          <span>{isRtl ? "ربحية الطلبات" : "Order Profitability"}</span>
        </button>

        {/* Projections & Restock tab temporarily hidden; remove the false guard to restore it. */}
        {false && (<button
          onClick={() => setActiveTab("forecasting")}
          data-active={activeTab === "forecasting"}
          className="admin-tab flex shrink-0 items-center gap-2 px-3.5 py-2 text-xs font-bold"
        >
          <Calculator className="h-4 w-4 text-[#D8B46A]" />
          <span>{isRtl ? "التوقعات وإعادة التخزين" : "Projections & Restock"}</span>
        </button>)}
      </div>

      {/* TAB 1: OVERVIEW & SAFES */}
      {activeTab === "overview" && (
        <div className="space-y-5">
          {/* Top 3 Primary Safes Header & Quick Transfer Action */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="font-playfair text-base font-extrabold text-[#942E3A]">
                Treasury System (The 3 Safes)
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
              <div className="rounded-2xl border border-[#942E3A]/15 bg-white p-4 shadow-xs relative overflow-visible flex flex-col justify-between">
                <div className="absolute top-0 left-0 h-1 w-full bg-[#942E3A]" />
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-[#FFF9EB] p-2 text-[#942E3A] shrink-0">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/70">
                      {isRtl ? "خزينة المبيعات (إيرادات المبيعات)" : "Sales Treasury (Sales Revenue)"}
                    </span>
                  </div>

                  <AdminDailyLogDatePicker
                    currentPreset={salesCardFilter.preset}
                    currentStartDate={salesCardFilter.startDate}
                    currentEndDate={salesCardFilter.endDate}
                    onChange={(preset, startDate, endDate) =>
                      setSalesCardFilter({ preset, startDate, endDate })
                    }
                    buttonClassName="group flex items-center gap-1 rounded-xl border border-[#942E3A]/20 bg-[#FFF9EB] px-2.5 py-1 text-[10px] font-bold text-[#942E3A] hover:bg-white hover:border-[#942E3A] transition cursor-pointer shadow-2xs shrink-0"
                  />
                </div>

                <div className="mt-3">
                  <p className="font-playfair text-2xl font-black text-[#942E3A]">
                    {formatCurrency(salesCardData.totalSales)}
                  </p>
                  <p className="mt-1 text-[10px] text-[#6B1F2A]/65">
                    {isRtl
                      ? `إجمالي مبيعات ${salesCardData.deliveredOrdersCount} طلبات مكتملة`
                      : `Total sales volume from ${salesCardData.deliveredOrdersCount} completed orders`}
                  </p>
                </div>
              </div>

              {/* Safe 2: Net Profit Safe */}
              <div className="rounded-2xl border border-[#D8B46A]/40 bg-[#FFFDF5] p-4 shadow-xs relative overflow-visible flex flex-col justify-between">
                <div className="absolute top-0 left-0 h-1 w-full bg-[#D8B46A]" />
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-[#D8B46A]/20 p-2 text-[#942E3A] shrink-0">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/70">
                      {isRtl ? "خزينة صافي الربح (صافي الربح)" : "Net Profit Treasury (Net Profit)"}
                    </span>
                  </div>

                  <AdminDailyLogDatePicker
                    currentPreset={profitCardFilter.preset}
                    currentStartDate={profitCardFilter.startDate}
                    currentEndDate={profitCardFilter.endDate}
                    onChange={(preset, startDate, endDate) =>
                      setProfitCardFilter({ preset, startDate, endDate })
                    }
                    buttonClassName="group flex items-center gap-1 rounded-xl border border-[#D8B46A]/40 bg-[#FFF9EB] px-2.5 py-1 text-[10px] font-bold text-[#942E3A] hover:bg-white hover:border-[#D8B46A] transition cursor-pointer shadow-2xs shrink-0"
                  />
                </div>

                <div className="mt-3">
                  <p className="font-playfair text-2xl font-black text-[#942E3A]">
                    {formatCurrency(profitCardData.netProfit)}
                  </p>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-[#6B1F2A]/70">
                    <span>
                      {isRtl ? "هامش الربح: " : "Profit Margin: "}
                      <strong className="text-[#942E3A]">{profitCardData.profitMargin}%</strong>
                    </span>
                    <span>{isRtl ? "بعد الخصومات والمصروفات" : "After discounts & expenses"}</span>
                  </div>
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
                  {formatCurrency(paymentAccounts.totalLiquidity + totalIncome - totalPurchaseInvoices)}
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
                  Current Inventory Valuation & Projected Profits
                </h3>
              </div>
              <span className="rounded-full bg-[#FFF9EB] px-3 py-1 text-[11px] font-bold text-[#942E3A] border border-[#D8B46A]/30">
                {inventoryStats.totalItemsInStock} items in stock
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-xl border border-[#942E3A]/10 bg-[#FFF9EB]/50 p-3">
                <span className="text-[10px] font-bold text-[#6B1F2A]/60 block">{isRtl ? "إجمالي وحدات المخزون" : "Total Stock Units"}</span>
                <p className="mt-1 font-playfair text-lg font-black text-[#942E3A]">
                  {inventoryStats.totalItemsInStock} <span className="text-xs font-normal">{isRtl ? "وحدة" : "units"}</span>
                </p>
              </div>

              <div className="rounded-xl border border-[#942E3A]/10 bg-[#FFF9EB]/50 p-3">
                <span className="text-[10px] font-bold text-[#6B1F2A]/60 block">{isRtl ? "تكلفة شراء المخزون (COGS)" : "Stock Wholesale Cost (COGS)"}</span>
                <p className="mt-1 font-playfair text-lg font-black text-[#942E3A]">
                  {formatCurrency(inventoryStats.stockWholesaleValue)}
                </p>
              </div>

              <div className="rounded-xl border border-[#942E3A]/10 bg-[#FFF9EB]/50 p-3">
                <span className="text-[10px] font-bold text-[#6B1F2A]/60 block">{isRtl ? "قيمة المبيعات المتوقعة (التجزئة)" : "Projected Sales Value (Retail)"}</span>
                <p className="mt-1 font-playfair text-lg font-black text-[#942E3A]">
                  {formatCurrency(inventoryStats.stockRetailValue)}
                </p>
              </div>

              <div className="rounded-xl border border-[#D8B46A]/40 bg-[#FFFDF5] p-3">
                <span className="text-[10px] font-bold text-[#6B1F2A]/60 block">{isRtl ? "الربح المتوقع من البيع" : "Projected Profit on Sale"}</span>
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
                Recent Account Transfers Log
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
            <h2 className="font-playfair text-lg font-bold text-[#942E3A]">{isRtl ? "قائمة الدخل (الربح والخسارة)" : "Income Statement (Profit & Loss)"}</h2>
            <p className="text-xs text-[#6B1F2A]/70">{isRtl ? "تفصيل مالي لإيرادات المتجر وتكاليفه ومصروفاته التشغيلية وصافي الربح." : "Official financial breakdown of store revenues, costs, operating expenses, and net profit."}</p>
          </div>

          <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 sm:p-6 shadow-xs">
            <table className="w-full text-start text-xs">
              <thead>
                <tr className="border-b border-[#942E3A]/15 text-[10px] uppercase text-[#6B1F2A]/60">
                  <th className="pb-3 text-start">{isRtl ? "البند المالي" : "Financial Line Item"}</th>
                  <th className="pb-3 text-end">{isRtl ? "المبلغ (ج.م)" : "Amount (EGP)"}</th>
                  <th className="pb-3 text-end">{isRtl ? "% من إجمالي المبيعات" : "% of Gross Sales"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#942E3A]/10">
                {/* Gross Revenue */}
                <tr className="bg-[#FFF9EB]/30">
                  <td className="py-3 text-start font-bold text-[#942E3A]">{isRtl ? "1. إجمالي إيرادات المبيعات" : "1. Gross Sales Revenue"}</td>
                  <td className="py-3 text-end font-bold text-[#942E3A]">{formatCurrency(grossSalesBeforeDiscounts)}</td>
                  <td className="py-3 text-end font-bold text-[#942E3A]">100%</td>
                </tr>

                {/* Promotional Discounts */}
                <tr>
                  <td className="py-2.5 px-4 text-start text-[#6B1F2A]">{isRtl ? "مطروحًا: الخصومات الترويجية" : "Less: Promotional Discounts"}</td>
                  <td className="py-2.5 text-end text-red-600">({formatCurrency(summary.totalDiscounts)})</td>
                  <td className="py-2.5 text-end text-[#6B1F2A]/70">
                    {grossSalesBeforeDiscounts > 0 ? ((summary.totalDiscounts / grossSalesBeforeDiscounts) * 100).toFixed(1) : 0}%
                  </td>
                </tr>

                {/* Net Sales */}
                <tr className="font-semibold text-[#942E3A]">
                  <td className="py-2.5 text-start">{isRtl ? "2. صافي إيرادات المبيعات" : "2. Net Sales Revenue"}</td>
                  <td className="py-2.5 text-end">{formatCurrency(summary.totalSales)}</td>
                  <td className="py-2.5 text-end">
                    {grossSalesBeforeDiscounts > 0 ? ((summary.totalSales / grossSalesBeforeDiscounts) * 100).toFixed(1) : 0}%
                  </td>
                </tr>

                {/* Cost of Goods Sold */}
                <tr>
                  <td className="py-2.5 px-4 text-start text-[#6B1F2A]">{isRtl ? "مطروحًا: تكلفة المنتجات النقدية (COGS)" : "Less: Cash Product Cost (COGS)"}</td>
                  <td className="py-2.5 text-end text-red-600">({formatCurrency(summary.totalCOGS)})</td>
                  <td className="py-2.5 text-end text-[#6B1F2A]/70">
                    {summary.totalSales > 0 ? ((summary.totalCOGS / summary.totalSales) * 100).toFixed(1) : 0}%
                  </td>
                </tr>

                {/* Gross Profit */}
                <tr className="bg-[#FFF9EB] font-bold text-[#942E3A]">
                  <td className="py-3 text-start">{isRtl ? "3. إجمالي أرباح التشغيل" : "3. Gross Operating Profit"}</td>
                  <td className="py-3 text-end font-black">{formatCurrency(summary.grossProfit)}</td>
                  <td className="py-3 text-end font-black">{summary.grossMarginPct}%</td>
                </tr>

                {/* Operating Expenses Section */}
                <tr className="bg-[#f7f1e8]/40">
                  <td colSpan={3} className="py-2 text-start font-bold text-[11px] text-[#942E3A] uppercase tracking-wider">
                    {isRtl ? "4. تفاصيل المصروفات التشغيلية" : "4. Operating Expenses Breakdown"}
                  </td>
                </tr>

                {Object.entries(expensesByCategory).map(([catKey, catAmt]) => (
                  <tr key={catKey}>
                    <td className="py-2 px-6 text-start text-[#6B1F2A]/80">{CATEGORY_LABELS[catKey] || catKey}</td>
                    <td className="py-2 text-end text-red-600">({formatCurrency(catAmt)})</td>
                    <td className="py-2 text-end text-[#6B1F2A]/60">
                      {summary.totalSales > 0 ? ((catAmt / summary.totalSales) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))}

                <tr className="font-semibold text-[#6B1F2A]">
                  <td className="py-2.5 px-4 text-start">{isRtl ? "إجمالي المصروفات التشغيلية" : "Total Operating Expenses"}</td>
                  <td className="py-2.5 text-end text-red-700">({formatCurrency(summary.totalExpenses)})</td>
                  <td className="py-2.5 text-end">
                    {summary.totalSales > 0 ? ((summary.totalExpenses / summary.totalSales) * 100).toFixed(1) : 0}%
                  </td>
                </tr>

                {/* Net Income */}
                <tr className="bg-[#942E3A] text-[#FFF9EB] font-black text-sm">
                  <td className="py-3.5 px-3 text-start rounded-s-xl">{isRtl ? "5. صافي الدخل التشغيلي (صافي الربح)" : "5. Net Operating Income (Net Profit)"}</td>
                  <td className="py-3.5 text-end font-extrabold">{formatCurrency(summary.netProfit)}</td>
                  <td className="py-3.5 text-end px-3 rounded-e-xl">{summary.profitMargin}%</td>
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
            <h2 className="font-playfair text-lg font-bold text-[#942E3A]">{isRtl ? "التدفق النقدي ومصادر السيولة" : "Cash Flow & Liquidity Streams"}</h2>
            <p className="text-xs text-[#6B1F2A]/70">{isRtl ? "تحليل التدفقات النقدية من المبيعات مقابل المصروفات." : "Analysis of cash inflows from sales vs outflow from expenses."}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Cash Inflow Card */}
            <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-xs relative overflow-visible flex flex-col justify-between">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-bold text-[#6B1F2A]/60 block uppercase truncate">
                  {isRtl ? "التدفق الداخل (المبيعات)" : "Cash Inflow (Sales)"}
                </span>
                <AdminDailyLogDatePicker
                  currentPreset={cashInflowFilter.preset}
                  currentStartDate={cashInflowFilter.startDate}
                  currentEndDate={cashInflowFilter.endDate}
                  onChange={(preset, startDate, endDate) =>
                    setCashInflowFilter({ preset, startDate, endDate })
                  }
                  buttonClassName="group flex items-center gap-1 rounded-xl border border-[#942E3A]/20 bg-[#FFF9EB] px-2 py-1 text-[10px] font-bold text-[#942E3A] hover:bg-white hover:border-[#942E3A] transition cursor-pointer shadow-2xs shrink-0"
                />
              </div>
              <div className="mt-3">
                <p className="font-playfair text-2xl font-black text-[#942E3A]">
                  {formatCurrency(cashInflowData.totalSales)}
                </p>
                <p className="mt-1 text-[10px] text-[#6B1F2A]/60">
                  {isRtl ? "من طلبات العملاء المكتملة" : "From completed client orders"}
                </p>
              </div>
            </div>

            {/* Cash Outflow Card */}
            <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-xs relative overflow-visible flex flex-col justify-between">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-bold text-[#6B1F2A]/60 block uppercase truncate">
                  {isRtl ? "التدفق الخارج (المصروفات)" : "Cash Outflow (COGS + Expenses)"}
                </span>
                <AdminDailyLogDatePicker
                  currentPreset={cashOutflowFilter.preset}
                  currentStartDate={cashOutflowFilter.startDate}
                  currentEndDate={cashOutflowFilter.endDate}
                  onChange={(preset, startDate, endDate) =>
                    setCashOutflowFilter({ preset, startDate, endDate })
                  }
                  buttonClassName="group flex items-center gap-1 rounded-xl border border-red-200 bg-red-50/50 px-2 py-1 text-[10px] font-bold text-red-700 hover:bg-white hover:border-red-300 transition cursor-pointer shadow-2xs shrink-0"
                />
              </div>
              <div className="mt-3">
                <p className="font-playfair text-2xl font-black text-red-600">
                  {formatCurrency(cashOutflowData.totalOutflow)}
                </p>
                <p className="mt-1 text-[10px] text-[#6B1F2A]/60">
                  {isRtl ? "تكلفة المنتجات + المصروفات التشغيلية" : "Product cost + operational expenses"}
                </p>
              </div>
            </div>

            {/* Net Cash Position Card */}
            <div className="rounded-2xl border border-[#D8B46A]/40 bg-[#FFFDF5] p-4 shadow-xs relative overflow-visible flex flex-col justify-between">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-bold text-[#6B1F2A]/60 block uppercase truncate">
                  {isRtl ? "صافي المركز النقدي" : "Net Cash Position"}
                </span>
                <AdminDailyLogDatePicker
                  currentPreset={netCashFilter.preset}
                  currentStartDate={netCashFilter.startDate}
                  currentEndDate={netCashFilter.endDate}
                  onChange={(preset, startDate, endDate) =>
                    setNetCashFilter({ preset, startDate, endDate })
                  }
                  buttonClassName="group flex items-center gap-1 rounded-xl border border-[#D8B46A]/40 bg-[#FFF9EB] px-2 py-1 text-[10px] font-bold text-[#942E3A] hover:bg-white hover:border-[#D8B46A] transition cursor-pointer shadow-2xs shrink-0"
                />
              </div>
              <div className="mt-3">
                <p className="font-playfair text-2xl font-black text-[#942E3A]">
                  {formatCurrency(netCashData.netCash)}
                </p>
                <p className="mt-1 text-[10px] text-[#6B1F2A]/60">
                  {isRtl ? "صافي النقد المحتفظ به في خزينة المتجر" : "Net cash retained in store treasury"}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Methods Share */}
          <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-xs">
            <h3 className="font-playfair text-sm font-bold text-[#942E3A] mb-3">{isRtl ? "نسبة قنوات الدفع" : "Payment Channels Share"}</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 text-xs">
              <div className="rounded-xl border border-[#942E3A]/10 bg-[#FFF9EB]/40 p-3">
                <span className="font-bold text-[#942E3A] block">{isRtl ? "الدفع عند الاستلام (COD)" : "Cash on Delivery (COD)"}</span>
                <strong className="font-playfair text-lg font-black text-[#942E3A] block mt-1">
                  {formatCurrency(paymentAccounts.cashSales)}
                </strong>
                <span className="text-[10px] text-[#6B1F2A]/60">
                  {summary.totalSales > 0 ? ((paymentAccounts.cashSales / summary.totalSales) * 100).toFixed(1) : 0}% {isRtl ? "من إجمالي المبيعات" : "of total sales"}
                </span>
              </div>

              <div className="rounded-xl border border-[#942E3A]/10 bg-[#FFF9EB]/40 p-3">
                <span className="font-bold text-[#942E3A] block">InstaPay / Visa</span>
                <strong className="font-playfair text-lg font-black text-[#942E3A] block mt-1">
                  {formatCurrency(paymentAccounts.instapaySales)}
                </strong>
                <span className="text-[10px] text-[#6B1F2A]/60">
                  {summary.totalSales > 0 ? ((paymentAccounts.instapaySales / summary.totalSales) * 100).toFixed(1) : 0}% {isRtl ? "من إجمالي المبيعات" : "of total sales"}
                </span>
              </div>

              <div className="rounded-xl border border-[#942E3A]/10 bg-[#FFF9EB]/40 p-3">
                <span className="font-bold text-[#942E3A] block">{isRtl ? "المحافظ الإلكترونية (Vodafone Cash)" : "E-Wallets (Vodafone Cash)"}</span>
                <strong className="font-playfair text-lg font-black text-[#942E3A] block mt-1">
                  {formatCurrency(paymentAccounts.walletSales)}
                </strong>
                <span className="text-[10px] text-[#6B1F2A]/60">
                  {summary.totalSales > 0 ? ((paymentAccounts.walletSales / summary.totalSales) * 100).toFixed(1) : 0}% {isRtl ? "من إجمالي المبيعات" : "of total sales"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EXPENSES & INCOME (FINANCIAL TRANSACTIONS) */}
      {activeTab === "expenses" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#D8B46A]/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-[#942E3A]">
                  {isRtl ? "إدارة الخزائن والسيولة" : "Treasury & Cashflow"}
                </span>
              </div>
              <h2 className="mt-1 font-playfair text-xl sm:text-2xl font-black text-[#942E3A]">
                {isRtl ? "إدارة المعاملات المالية (المصروفات والإيرادات)" : "Financial Transactions (Expenses & Income)"}
              </h2>
              <p className="text-xs text-[#6B1F2A]/70">
                {isRtl
                  ? "تسجيل ومتابعة كافة المصروفات التشغيلية والدخلات، مع حماية المعاملات المغلقة رسمياً."
                  : "Record & track operating expenses and income entries with settled-week lock protection."}
              </p>
            </div>
            <button
              onClick={openAddExpenseModal}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#942E3A] px-4 py-2.5 text-xs font-bold text-[#FFF9EB] hover:bg-[#7A242F] transition shadow-md self-start sm:self-auto cursor-pointer"
            >
              <PlusCircle className="h-4 w-4 text-[#D8B46A]" />
              <span>{isRtl ? "+ إضافة حركة جديدة (مصروف / إيراد)" : "+ Add New Transaction"}</span>
            </button>
          </div>

          {/* Treasury KPI Summary Cards */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-3 shadow-xs">
              <span className="text-[10px] font-bold text-[#6B1F2A]/60 block truncate">
                {isRtl ? "خزنة المبيعات (الطلبيات)" : "Sales Treasury (Orders)"}
              </span>
              <strong className="font-playfair text-base font-black text-[#942E3A] block mt-1">
                {formatCurrency(summary.totalSales)}
              </strong>
              <span className="text-[9px] text-[#6B1F2A]/50 block mt-0.5">{isRtl ? "مبيعات الطلبيات فقط" : "Orders revenue"}</span>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-3 shadow-xs">
              <span className="text-[10px] font-bold text-emerald-800 block truncate">
                {isRtl ? "إجمالي الدخل والإيرادات" : "Total Income / Capital"}
              </span>
              <strong className="font-playfair text-base font-black text-emerald-700 block mt-1">
                +{formatCurrency(totalIncome)}
              </strong>
              <span className="text-[9px] text-emerald-600 block mt-0.5">{isRtl ? "دخلات إضافية وتوطين" : "External income"}</span>
            </div>

            <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-3 shadow-xs">
              <span className="text-[10px] font-bold text-rose-800 block truncate">
                {isRtl ? "المصروفات التشغيلية" : "Operating Expenses"}
              </span>
              <strong className="font-playfair text-base font-black text-rose-700 block mt-1">
                -{formatCurrency(totalOperatingExpenses)}
              </strong>
              <span className="text-[9px] text-rose-600 block mt-0.5">{isRtl ? "مصاريف تشغيل المتجر" : "Excl. purchase invoices"}</span>
            </div>

            <div className="rounded-2xl border border-purple-200 bg-purple-50/40 p-3 shadow-xs">
              <span className="text-[10px] font-bold text-purple-800 block truncate">
                {isRtl ? "فواتير الشراء والتوريد" : "Purchase Invoices"}
              </span>
              <strong className="font-playfair text-base font-black text-purple-700 block mt-1">
                -{formatCurrency(totalPurchaseInvoices)}
              </strong>
              <span className="text-[9px] text-purple-600 block mt-0.5">{isRtl ? "تقتطع من الإجمالي فقط" : "Deducted from liquidity"}</span>
            </div>

            <div className="rounded-2xl border border-[#D8B46A]/40 bg-[#FFF9EB]/60 p-3 shadow-xs">
              <span className="text-[10px] font-bold text-[#942E3A] block truncate">
                {isRtl ? "صافي الربح التشغيلي" : "Net Operating Profit"}
              </span>
              <strong className="font-playfair text-base font-black text-[#942E3A] block mt-1">
                {formatCurrency(netOperatingProfit)}
              </strong>
              <span className="text-[9px] text-[#6B1F2A]/60 block mt-0.5">{isRtl ? "المبيعات - COGS - الصرف" : "Sales - COGS - Expenses"}</span>
            </div>

            <div className="rounded-2xl border border-[#942E3A]/20 bg-gradient-to-br from-[#FFF9EB] to-[#F5E6C8] p-3 shadow-xs">
              <span className="text-[10px] font-extrabold text-[#942E3A] block truncate">
                {isRtl ? "خزنة السيولة الكلية" : "Total Treasury Liquidity"}
              </span>
              <strong className="font-playfair text-base font-black text-[#942E3A] block mt-1">
                {formatCurrency(paymentAccounts.totalLiquidity + totalIncome - totalPurchaseInvoices)}
              </strong>
              <span className="text-[9px] text-[#942E3A]/80 font-bold block mt-0.5">{isRtl ? "رصيد الخزينة الإجمالي" : "Total cash & accounts"}</span>
            </div>
          </div>

          {/* Search, Type & Category Filter Toolbar */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-white p-3 rounded-2xl border border-[#942E3A]/10 shadow-xs">
            <div className="relative flex-1">
              <Search className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-[#D8B46A] ${isRtl ? "right-3" : "left-3"}`} />
              <input
                type="text"
                placeholder={isRtl ? "البحث بالبيان أو الملاحظات..." : "Search title or notes..."}
                value={expenseSearch}
                onChange={(e) => setExpenseSearch(e.target.value)}
                className={`w-full rounded-xl border border-[#942E3A]/20 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#942E3A] ${isRtl ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left"}`}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Type Filter */}
              <div className="flex items-center gap-1 bg-[#FFF9EB] p-1 rounded-xl border border-[#D8B46A]/30 text-xs">
                <button
                  type="button"
                  onClick={() => setTypeFilter("all")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] cursor-pointer ${typeFilter === "all" ? "bg-[#942E3A] text-white shadow-xs" : "text-[#6B1F2A]/70 hover:text-[#942E3A]"}`}
                >
                  {isRtl ? "الكل" : "All"}
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter("expense")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] cursor-pointer ${typeFilter === "expense" ? "bg-rose-700 text-white shadow-xs" : "text-[#6B1F2A]/70 hover:text-rose-700"}`}
                >
                  {isRtl ? "المصروفات" : "Expenses"}
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter("income")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] cursor-pointer ${typeFilter === "income" ? "bg-emerald-700 text-white shadow-xs" : "text-[#6B1F2A]/70 hover:text-emerald-700"}`}
                >
                  {isRtl ? "الإيرادات والدخلات" : "Income"}
                </button>
              </div>

              {/* Custom Styled Category Filter Dropdown */}
              <div className={`relative ${isCategoryFilterDropdownOpen ? "z-50" : ""}`}>
                <button
                  type="button"
                  onClick={() => setIsCategoryFilterDropdownOpen(!isCategoryFilterDropdownOpen)}
                  className="flex items-center gap-2 rounded-xl border border-[#942E3A]/20 bg-[#FFF9EB] px-3.5 py-1.5 text-xs font-bold text-[#942E3A] hover:border-[#942E3A] transition cursor-pointer shadow-xs"
                >
                  <SlidersHorizontal className="h-4 w-4 text-[#D8B46A]" />
                  <span>
                    {expenseCategoryFilter === "all"
                      ? (isRtl ? "كل الفئات" : "All Categories")
                      : (isRtl
                        ? (expenseCategoryFilter === "capital" ? "رأس مال / استثمارات"
                          : expenseCategoryFilter === "external_profit" ? "أرباح خارجية"
                          : expenseCategoryFilter === "supplier_refund" ? "استرداد ومرتجعات توريد"
                          : expenseCategoryFilter === "other_income" ? "إيرادات أخرى"
                          : expenseCategoryFilter === "marketing" ? "التسويق والإعلانات"
                          : expenseCategoryFilter === "shipping_ops" ? "اللوجستيات والشحن"
                          : expenseCategoryFilter === "packaging" ? "الحقائب والتغليف"
                          : expenseCategoryFilter === "utilities" ? "الخدمات والمرافق"
                          : expenseCategoryFilter === "salaries" ? "الرواتب والعمولات"
                          : expenseCategoryFilter === "purchase_invoice" ? "فواتير الشراء والتوريد"
                          : "مصروفات أخرى")
                        : expenseCategoryFilter)}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-[#D8B46A] transition-transform ${isCategoryFilterDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isCategoryFilterDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsCategoryFilterDropdownOpen(false)}
                    />
                    <div className={`absolute ${isRtl ? "left-0 right-auto" : "right-0 left-auto"} top-full mt-2 z-[100] w-64 rounded-2xl border border-[#942E3A]/15 bg-white p-2 shadow-2xl space-y-1.5 text-xs animate-in fade-in zoom-in-95 duration-150`}>
                      {/* All Option */}
                      <button
                        type="button"
                        onClick={() => {
                          setExpenseCategoryFilter("all");
                          setIsCategoryFilterDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-start font-bold transition cursor-pointer ${
                          expenseCategoryFilter === "all"
                            ? "bg-[#942E3A] text-white"
                            : "text-[#6B1F2A] hover:bg-[#FFF9EB]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4" />
                          <span>{isRtl ? "كل الفئات المتاحة" : "All Categories"}</span>
                        </div>
                        {expenseCategoryFilter === "all" && <Check className="h-4 w-4 text-[#D8B46A]" />}
                      </button>

                      <div
                        onWheel={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                        className="max-h-60 overflow-y-auto overscroll-contain touch-pan-y space-y-2 pr-1.5 text-xs [scrollbar-width:thin] [::-webkit-scrollbar]:w-1.5 [::-webkit-scrollbar-thumb]:bg-[#D8B46A] [::-webkit-scrollbar-thumb]:rounded-full"
                      >
                        {/* Expense Categories Group */}
                        <div>
                          <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-rose-800 bg-rose-50 rounded-lg mb-1 flex items-center gap-1">
                            <Receipt className="h-3 w-3 text-rose-600" />
                            <span>{isRtl ? "فئات المصروفات" : "Expense Categories"}</span>
                          </div>
                          <div className="space-y-0.5">
                            {[
                              { id: "marketing", ar: "التسويق والإعلانات", en: "Marketing & Ads", icon: Tag },
                              { id: "shipping_ops", ar: "اللوجستيات والشحن", en: "Shipping & Ops", icon: Package },
                              { id: "packaging", ar: "الحقائب والتغليف", en: "Packaging & Supplies", icon: ShoppingBag },
                              { id: "utilities", ar: "الخدمات والمرافق", en: "Utilities & Bills", icon: Building2 },
                              { id: "salaries", ar: "الرواتب والعمولات", en: "Salaries & Commissions", icon: Wallet },
                              { id: "purchase_invoice", ar: "فواتير الشراء والتوريد", en: "Purchase Invoices", icon: Receipt },
                              { id: "other", ar: "مصروفات أخرى", en: "Other Expenses", icon: DollarSign },
                            ].map((item) => {
                              const IconComponent = item.icon;
                              const isSelected = expenseCategoryFilter === item.id;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => {
                                    setExpenseCategoryFilter(item.id);
                                    setIsCategoryFilterDropdownOpen(false);
                                  }}
                                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-start transition cursor-pointer ${
                                    isSelected
                                      ? "bg-[#942E3A] text-white font-bold"
                                      : "text-[#6B1F2A]/90 hover:bg-[#FFF9EB]"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <IconComponent className={`h-3.5 w-3.5 ${isSelected ? "text-[#D8B46A]" : "text-[#942E3A]/70"}`} />
                                    <span>{isRtl ? item.ar : item.en}</span>
                                  </div>
                                  {isSelected && <Check className="h-3.5 w-3.5 text-[#D8B46A]" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Income Categories Group */}
                        <div>
                          <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 rounded-lg mb-1 flex items-center gap-1">
                            <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                            <span>{isRtl ? "فئات الإيرادات والدخل" : "Income Categories"}</span>
                          </div>
                          <div className="space-y-0.5">
                            {[
                              { id: "capital", ar: "رأس مال / استثمارات", en: "Capital / Investment", icon: PiggyBank },
                              { id: "external_profit", ar: "أرباح خارجية", en: "External Profits", icon: TrendingUp },
                              { id: "supplier_refund", ar: "استرداد ومرتجعات توريد", en: "Supplier Refunds", icon: ArrowRightLeft },
                              { id: "other_income", ar: "إيرادات أخرى", en: "Other Income", icon: Sparkles },
                            ].map((item) => {
                              const IconComponent = item.icon;
                              const isSelected = expenseCategoryFilter === item.id;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => {
                                    setExpenseCategoryFilter(item.id);
                                    setIsCategoryFilterDropdownOpen(false);
                                  }}
                                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-start transition cursor-pointer ${
                                    isSelected
                                      ? "bg-emerald-700 text-white font-bold"
                                      : "text-emerald-950 hover:bg-emerald-50"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <IconComponent className={`h-3.5 w-3.5 ${isSelected ? "text-emerald-200" : "text-emerald-700"}`} />
                                    <span>{isRtl ? item.ar : item.en}</span>
                                  </div>
                                  {isSelected && <Check className="h-3.5 w-3.5 text-emerald-200" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Transactions Table & Mobile List */}
          <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-xs">
            {filteredExpenses.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#6B1F2A]/60">
                <Receipt className="h-8 w-8 text-[#D8B46A]/60 mx-auto mb-2" />
                <span>{isRtl ? "لا توجد معاملات مالية مطابقة للفلتر الحقيقي." : "No matching transactions found."}</span>
              </div>
            ) : (
              <>
                {/* Desktop View Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-start text-xs">
                    <thead className="border-b border-[#942E3A]/10 text-[10px] uppercase text-[#6B1F2A]/60">
                      <tr>
                        <th className="pb-2.5 text-start">{isRtl ? "التاريخ" : "Date"}</th>
                        <th className="pb-2.5 text-start">{isRtl ? "نوع الحركة" : "Type"}</th>
                        <th className="pb-2.5 text-start">{isRtl ? "البيان والتفاصيل" : "Title & Details"}</th>
                        <th className="pb-2.5 text-start">{isRtl ? "الفئة" : "Category"}</th>
                        <th className="pb-2.5 text-start">{isRtl ? "الحساب المالي" : "Payment Account"}</th>
                        <th className="pb-2.5 text-end">{isRtl ? "المبلغ" : "Amount"}</th>
                        <th className="pb-2.5 text-center">{isRtl ? "الإجراءات والتحكم" : "Control"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#942E3A]/10">
                      {filteredExpenses.map((expense) => {
                        const isIncome = expense.type === "income";
                        const isPurchase = expense.category === "purchase_invoice" || expense.isPurchaseInvoice;
                        const locked = isEntryLocked(expense.date);

                        return (
                          <tr key={expense.id} className="hover:bg-[#FFF9EB]/50 transition">
                            <td className="py-3 text-start text-[#6B1F2A]/70 font-medium whitespace-nowrap">
                              {new Date(expense.date).toLocaleDateString(isRtl ? "ar-EG" : "en-GB", { month: "short", day: "numeric", year: "numeric" })}
                            </td>
                            <td className="py-3 text-start whitespace-nowrap">
                              {isIncome ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-300">
                                  <ArrowUpRight className="h-3 w-3" />
                                  {isRtl ? "إيراد / دخل" : "Income"}
                                </span>
                              ) : isPurchase ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-800 border border-purple-300">
                                  <Package className="h-3 w-3" />
                                  {isRtl ? "فاتورة توريد" : "Purchase Invoice"}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-800 border border-rose-300">
                                  <Receipt className="h-3 w-3" />
                                  {isRtl ? "مصروف" : "Expense"}
                                </span>
                              )}
                            </td>
                            <td className="py-3 text-start font-bold text-[#942E3A]">
                              <span>{expense.title}</span>
                              {expense.notes && (
                                <span className="block text-[10px] font-normal text-[#6B1F2A]/60 mt-0.5">{expense.notes}</span>
                              )}
                            </td>
                            <td className="py-3 text-start whitespace-nowrap">
                              <span className="rounded-md bg-[#FFF9EB] px-2 py-0.5 text-[10px] font-bold text-[#942E3A] border border-[#D8B46A]/30">
                                {isRtl
                                  ? (expense.category === "capital" ? "رأس مال / استثمارات"
                                    : expense.category === "external_profit" ? "أرباح خارجية"
                                    : expense.category === "supplier_refund" ? "استرداد ومرتجعات توريد"
                                    : expense.category === "other_income" ? "إيرادات أخرى"
                                    : expense.category === "marketing" ? "التسويق والإعلانات"
                                    : expense.category === "shipping_ops" ? "اللوجستيات والشحن"
                                    : expense.category === "packaging" ? "الحقائب والتغليف"
                                    : expense.category === "utilities" ? "الخدمات والمرافق"
                                    : expense.category === "salaries" ? "الرواتب والعمولات"
                                    : expense.category === "purchase_invoice" ? "فواتير الشراء والتوريد"
                                    : "مصروفات أخرى")
                                  : expense.category}
                              </span>
                            </td>
                            <td className="py-3 text-start text-[#6B1F2A] whitespace-nowrap">
                              {ACCOUNT_LABELS[expense.paymentAccount] || expense.paymentAccount}
                            </td>
                            <td className="py-3 text-end font-black whitespace-nowrap">
                              {isIncome ? (
                                <span className="text-emerald-700 font-extrabold text-sm">+{formatCurrency(expense.amount)}</span>
                              ) : (
                                <span className="text-rose-700 font-extrabold text-sm">-{formatCurrency(expense.amount)}</span>
                              )}
                            </td>
                            <td className="py-3 text-center whitespace-nowrap">
                              {locked || expense.isPurchaseInvoice ? (
                                <span
                                  className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-1 text-[10px] font-bold text-stone-500 border border-stone-200"
                                  title={isRtl ? "أسبوع مغلق ومسجّل رسمياً، لا يمكن تعديله" : "Settled week transaction locked"}
                                >
                                  <Lock className="h-3 w-3 text-stone-400" />
                                  <span>{isRtl ? "مغلق" : "Locked"}</span>
                                </span>
                              ) : (
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => openEditExpenseModal(expense)}
                                    className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                                    title={isRtl ? "تعديل الحركة" : "Edit Transaction"}
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteExpense(expense.id)}
                                    className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                    title={isRtl ? "حذف الحركة" : "Delete Transaction"}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Cards */}
                <div className="md:hidden space-y-3">
                  {filteredExpenses.map((expense) => {
                    const isIncome = expense.type === "income";
                    const isPurchase = expense.category === "purchase_invoice" || expense.isPurchaseInvoice;
                    const locked = isEntryLocked(expense.date);

                    return (
                      <div key={expense.id} className="rounded-xl border border-[#942E3A]/10 bg-[#FFF9EB]/30 p-3 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-[#6B1F2A]/60 font-medium">
                            {new Date(expense.date).toLocaleDateString("ar-EG", { day: "numeric", month: "short", year: "numeric" })}
                          </span>

                          {isIncome ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800">
                              <ArrowUpRight className="h-3 w-3" />
                              {isRtl ? "إيراد / دخل" : "Income"}
                            </span>
                          ) : isPurchase ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[9px] font-bold text-purple-800">
                              <Package className="h-3 w-3" />
                              {isRtl ? "فاتورة توريد" : "Purchase"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-bold text-rose-800">
                              <Receipt className="h-3 w-3" />
                              {isRtl ? "مصروف" : "Expense"}
                            </span>
                          )}
                        </div>

                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <strong className="font-bold text-[#942E3A] block text-sm">{expense.title}</strong>
                            {expense.notes && <p className="text-[10px] text-[#6B1F2A]/70 mt-0.5">{expense.notes}</p>}
                          </div>
                          <strong className={`font-playfair text-base font-black ${isIncome ? "text-emerald-700" : "text-rose-700"}`}>
                            {isIncome ? `+${formatCurrency(expense.amount)}` : `-${formatCurrency(expense.amount)}`}
                          </strong>
                        </div>

                        <div className="flex items-center justify-between border-t border-[#942E3A]/10 pt-2 text-[10px]">
                          <span className="rounded-md bg-white px-2 py-0.5 font-bold text-[#942E3A] border border-[#D8B46A]/30">
                            {isRtl
                              ? (expense.category === "capital" ? "رأس مال"
                                : expense.category === "external_profit" ? "أرباح خارجية"
                                : expense.category === "supplier_refund" ? "مرتجعات توريد"
                                : expense.category === "other_income" ? "إيرادات أخرى"
                                : expense.category === "marketing" ? "التسويق والإعلانات"
                                : expense.category === "shipping_ops" ? "اللوجستيات والشحن"
                                : expense.category === "packaging" ? "الحقائب والتغليف"
                                : expense.category === "utilities" ? "الخدمات والمرافق"
                                : expense.category === "salaries" ? "الرواتب والعمولات"
                                : expense.category === "purchase_invoice" ? "فواتير التوريد"
                                : "مصروفات أخرى")
                              : expense.category}
                          </span>

                          <div className="flex items-center gap-2">
                            <span className="text-[#6B1F2A]/60">{ACCOUNT_LABELS[expense.paymentAccount] || expense.paymentAccount}</span>
                            {locked || expense.isPurchaseInvoice ? (
                              <span className="inline-flex items-center gap-1 rounded bg-stone-100 px-1.5 py-0.5 text-[9px] font-bold text-stone-500">
                                <Lock className="h-2.5 w-2.5" />
                                <span>{isRtl ? "مغلق" : "Locked"}</span>
                              </span>
                            ) : (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    setEditingExpense(expense);
                                    setModalTransactionType((expense.type || "expense") as "expense" | "income");
                                    setErrorMsg(null);
                                  }}
                                  className="rounded p-1 text-blue-600 hover:bg-blue-50"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteExpense(expense.id)}
                                  className="rounded p-1 text-rose-600 hover:bg-rose-50"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: SETTLEMENTS */}
      {activeTab === "settlements" && (
        <div className="space-y-6">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#942E3A]/10 pb-4">
            <div>
              <h2 className="font-playfair text-xl font-extrabold text-[#942E3A]">
                {isRtl ? "التسوية الأسبوعية والدورية (السبت - الجمعة)" : "Weekly Settlement (Sat - Fri)"}
              </h2>
              <p className="text-xs text-[#6B1F2A]/70 mt-0.5">
                {isRtl
                  ? "دورة الأسبوع الرسمية تبدأ من السبت حتى الجمعة. يمكنك متابعة الأسبوع الحالي، وإغلاق الأسابيع السابقة، واستعراض كافة التفاصيل."
                  : "Official week cycle runs Sat to Fri. Track active week, close past weeks, and inspect full details."}
              </p>
            </div>
          </div>

          {/* SECTION 1: HIGHLIGHTED CURRENT ACTIVE WEEK */}
          {currentWeekPeriod && (
            <div className="rounded-2xl border-2 border-[#942E3A]/30 bg-gradient-to-br from-[#FFF9EB] via-[#FFF6E3] to-[#FCE8D5] p-4 sm:p-6 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-[#942E3A] via-[#D8B46A] to-[#942E3A]" />

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#942E3A]/15 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-full bg-[#942E3A] px-3 py-1 text-[11px] font-bold text-white shadow-xs">
                      {currentWeekPeriod.weekId}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-3 py-0.5 text-[11px] font-bold text-emerald-800 animate-pulse">
                      <span className="h-2 w-2 rounded-full bg-emerald-600" />
                      {isRtl ? "الأسبوع الحالي (جارٍ العمل به)" : "Current Active Week (In Progress)"}
                    </span>
                  </div>
                  <h3 className="font-playfair text-base sm:text-lg font-bold text-[#942E3A]">
                    {isRtl
                      ? `أسبوع السبت ${currentWeekPeriod.startSat.toLocaleDateString("ar-EG", { day: "numeric", month: "long" })} – الجمعة ${currentWeekPeriod.endFri.toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" })}`
                      : `Sat ${currentWeekPeriod.startSat.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – Fri ${currentWeekPeriod.endFri.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setInspectingWeek(currentWeekPeriod);
                      setActiveInspectTab("orders");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#942E3A]/30 bg-white px-3.5 py-2 text-xs font-bold text-[#942E3A] hover:bg-[#FFF9EB] transition shadow-xs"
                  >
                    <Eye className="h-4 w-4 text-[#D8B46A]" />
                    <span>{isRtl ? "استعراض تفاصيل الأسبوع الحالي" : "Inspect Week Details"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openSettlingModal(currentWeekPeriod)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#942E3A] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#7A242F] transition shadow-xs"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[#D8B46A]" />
                    <span>{isRtl ? "إغلاق تسوية الأسبوع" : "Settle & Lock Week"}</span>
                  </button>
                </div>
              </div>

              {/* METRICS GRID FOR CURRENT WEEK */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div className="rounded-xl bg-white/90 p-2.5 border border-[#942E3A]/10">
                  <span className="text-[10px] font-bold text-[#6B1F2A]/60 block">{isRtl ? "إجمالي المبيعات" : "Total Sales"}</span>
                  <strong className="font-playfair text-sm sm:text-base font-extrabold text-[#942E3A]">
                    {formatCurrency(currentWeekPeriod.totalSales)}
                  </strong>
                  <span className="text-[9px] text-[#6B1F2A]/50 block mt-0.5">{currentWeekPeriod.ordersCount} {isRtl ? "طلبيات" : "orders"}</span>
                </div>

                <div className="rounded-xl bg-white/90 p-2.5 border border-[#942E3A]/10">
                  <span className="text-[10px] font-bold text-[#6B1F2A]/60 block">{isRtl ? "تكلفة المنتجات" : "Product COGS"}</span>
                  <strong className="font-playfair text-sm sm:text-base font-extrabold text-[#6B1F2A]">
                    {formatCurrency(currentWeekPeriod.totalCOGS)}
                  </strong>
                </div>

                <div className="rounded-xl bg-white/90 p-2.5 border border-[#942E3A]/10">
                  <span className="text-[10px] font-bold text-[#6B1F2A]/60 block">{isRtl ? "المصروفات" : "Expenses"}</span>
                  <strong className="font-playfair text-sm sm:text-base font-extrabold text-red-600">
                    {formatCurrency(currentWeekPeriod.totalExpenses)}
                  </strong>
                  <span className="text-[9px] text-[#6B1F2A]/50 block mt-0.5">{currentWeekPeriod.expensesCount} {isRtl ? "مصروفات" : "entries"}</span>
                </div>

                <div className="rounded-xl bg-white/90 p-2.5 border border-[#942E3A]/10">
                  <span className="text-[10px] font-bold text-[#6B1F2A]/60 block">{isRtl ? "الخصومات" : "Discounts"}</span>
                  <strong className="font-playfair text-sm sm:text-base font-extrabold text-amber-700">
                    {formatCurrency(currentWeekPeriod.totalDiscounts)}
                  </strong>
                </div>

                <div className="col-span-2 sm:col-span-1 rounded-xl bg-[#942E3A] p-2.5 text-white shadow-xs">
                  <span className="text-[10px] font-bold text-white/80 block">{isRtl ? "صافي ربح الأسبوع" : "Weekly Net Profit"}</span>
                  <strong className="font-playfair text-base sm:text-lg font-black text-[#D8B46A]">
                    {formatCurrency(currentWeekPeriod.netProfit)}
                  </strong>
                </div>
              </div>

              {/* PAYMENT BREAKDOWN */}
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] bg-white/60 p-2 rounded-xl border border-[#942E3A]/10">
                <span className="font-bold text-[#942E3A]">{isRtl ? "تحصيلات الأسبوع:" : "Collections:"}</span>
                <span className="text-[#6B1F2A]">{isRtl ? "كاش:" : "Cash:"} <strong>{formatCurrency(currentWeekPeriod.cashSales)}</strong></span>
                <span className="text-[#6B1F2A]/30">|</span>
                <span className="text-[#6B1F2A]">{isRtl ? "إنستا باي/فيزا:" : "InstaPay/Visa:"} <strong>{formatCurrency(currentWeekPeriod.instapaySales)}</strong></span>
                <span className="text-[#6B1F2A]/30">|</span>
                <span className="text-[#6B1F2A]">{isRtl ? "محفظة:" : "Wallet:"} <strong>{formatCurrency(currentWeekPeriod.walletSales)}</strong></span>
              </div>
            </div>
          )}

          {/* SECTION 2: UNCLOSED PAST WEEKS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-playfair text-base font-bold text-[#942E3A] flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-amber-600" />
                <span>{isRtl ? "أسابيع سابقة غير مغلقة (تتطلب إتمام التسوية)" : "Unclosed Past Weeks (Action Required)"}</span>
              </h3>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                {unclosedPastWeeks.length} {isRtl ? "أسابيع معلقة" : "pending"}
              </span>
            </div>

            {unclosedPastWeeks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#942E3A]/20 bg-[#FFF9EB]/30 p-6 text-center text-xs text-[#6B1F2A]/60">
                {isRtl ? "لا توجد أسابيع سابقة معلقة. جميع الأسابيع السابقة مغلقة ومسجلة بنجاح." : "No pending unclosed weeks. All past weeks have been settled and locked."}
              </div>
            ) : (
              <div className="space-y-3">
                {unclosedPastWeeks.map((week) => (
                  <div
                    key={week.weekId}
                    className="rounded-2xl border border-amber-300 bg-amber-50/50 p-4 text-xs shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-amber-200 pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#942E3A] text-sm">{week.weekId}</span>
                          <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[9px] font-bold text-amber-900">
                            {isRtl ? "أسبوع غير مغلق" : "Unclosed Week"}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6B1F2A]/70 mt-0.5">
                          {isRtl
                            ? `السبت ${week.startSat.toLocaleDateString("ar-EG", { day: "numeric", month: "short" })} – الجمعة ${week.endFri.toLocaleDateString("ar-EG", { day: "numeric", month: "short", year: "numeric" })}`
                            : `Sat ${week.startSat.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – Fri ${week.endFri.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setInspectingWeek(week);
                            setActiveInspectTab("orders");
                          }}
                          className="rounded-xl border border-[#942E3A]/20 bg-white px-3 py-1.5 text-xs font-bold text-[#942E3A] hover:bg-[#FFF9EB]"
                        >
                          <Eye className="h-3.5 w-3.5 text-[#D8B46A] inline ltr:mr-1 rtl:ml-1" />
                          <span>{isRtl ? "معاينة التفاصيل والطلبيات" : "View Details"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openSettlingModal(week)}
                          className="rounded-xl bg-[#942E3A] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#7A242F]"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#D8B46A] inline ltr:mr-1 rtl:ml-1" />
                          <span>{isRtl ? "إتمام وإغلاق التسوية" : "Complete Settlement"}</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div>{isRtl ? "المبيعات:" : "Sales:"} <strong>{formatCurrency(week.totalSales)}</strong> ({week.ordersCount})</div>
                      <div>{isRtl ? "المصروفات:" : "Expenses:"} <strong className="text-red-600">{formatCurrency(week.totalExpenses)}</strong> ({week.expensesCount})</div>
                      <div>{isRtl ? "صافي الربح:" : "Net Profit:"} <strong className="text-[#942E3A] font-bold">{formatCurrency(week.netProfit)}</strong></div>
                      <div>{isRtl ? "التحصيلات:" : "Collections:"} <strong>كاش {formatCurrency(week.cashSales)}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 3: CLOSED SETTLEMENTS ARCHIVE */}
          <div className="space-y-3 pt-2">
            <h3 className="font-playfair text-base font-bold text-[#942E3A] flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#942E3A]" />
              <span>{isRtl ? "أرشيف التسويات المغلقة والمكتملة" : "Closed Settlements Archive"}</span>
            </h3>

            {closedWeeks.length === 0 ? (
              <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-6 text-center text-xs text-[#6B1F2A]/60">
                {isRtl ? "لا توجد تسويات مغلقة سابقة في الأرشيف حتى الآن." : "No closed settlements in archive yet."}
              </div>
            ) : (
              <div className="space-y-3">
                {closedWeeks.map((week) => (
                  <div key={week.weekId} className="rounded-2xl border border-[#942E3A]/15 bg-white p-3.5 text-xs shadow-xs space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#942E3A]/10 pb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#942E3A]">{week.weekId}</span>
                          <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-[9px] font-bold text-emerald-800">
                            {isRtl ? "مكتمل ومغلق" : "Completed & Locked"}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#6B1F2A]/70 mt-0.5">
                          {isRtl
                            ? `السبت ${week.startSat.toLocaleDateString("ar-EG", { day: "numeric", month: "short" })} – الجمعة ${week.endFri.toLocaleDateString("ar-EG", { day: "numeric", month: "short", year: "numeric" })}`
                            : `Sat ${week.startSat.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – Fri ${week.endFri.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setInspectingWeek(week);
                          setActiveInspectTab("orders");
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#942E3A]/20 bg-[#FFF9EB] px-3 py-1.5 text-xs font-bold text-[#942E3A] hover:bg-[#FFF3D6]"
                      >
                        <Eye className="h-3.5 w-3.5 text-[#D8B46A]" />
                        <span>{isRtl ? "استعراض أرشيف الأسبوع والطلبيات" : "Inspect Week Archive"}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div>{isRtl ? "المبيعات:" : "Sales:"} <strong>{formatCurrency(week.totalSales)}</strong></div>
                      <div>{isRtl ? "المصروفات:" : "Expenses:"} <strong>{formatCurrency(week.totalExpenses)}</strong></div>
                      <div>{isRtl ? "صافي الربح:" : "Net Profit:"} <strong className="text-[#942E3A]">{formatCurrency(week.netProfit)}</strong></div>
                      <div>{isRtl ? "تاريخ الإغلاق:" : "Settled On:"} <strong>{week.dbSettlement ? new Date(week.dbSettlement.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "-"}</strong></div>
                    </div>

                    {week.dbSettlement?.notes && (
                      <p className="text-[10px] bg-[#FFF9EB] p-2 rounded-lg text-[#6B1F2A]/80">
                        <strong>{isRtl ? "ملاحظات الإغلاق:" : "Settlement Notes:"}</strong> {week.dbSettlement.notes}
                      </p>
                    )}
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
            <h2 className="font-playfair text-lg font-bold text-[#942E3A]">{isRtl ? "تفاصيل ربحية الطلبات" : "Order Profitability Breakdown"}</h2>
            <p className="text-xs text-[#6B1F2A]/70">{isRtl ? "مقارنة سعر البيع بتكلفة شراء المنتجات لكل طلب." : "Compare sales price against wholesale cash item costs per order."}</p>
          </div>

          {/* Search Toolbar */}
          <div className="rounded-xl border border-[#D8B46A]/40 bg-[#FFF9EB]/60 px-3 py-2 text-xs text-[#6B1F2A]">
            <span className="font-bold">{isRtl ? "مصاريف الفترة الموزعة: " : "Period expenses allocated: "}</span>
            <span className="font-black text-[#942E3A]">{formatCurrency(profitabilityExpenses)}</span>
            <span className="ml-2 text-[10px] text-[#6B1F2A]/70">
              {isRtl ? "يتم توزيعها حسب نسبة مبيعات كل طلب. فواتير الشراء والدخل خارج الحساب." : "Allocated by each order's share of period sales. Purchase invoices and income are excluded."}
            </span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-[#942E3A]/10">
            <div className="relative w-full">
              <Search className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-[#D8B46A] ${isRtl ? "right-3" : "left-3"}`} />
              <input
                type="text"
                placeholder={isRtl ? "البحث عن طلب برقم الطلب أو اسم العميل..." : "Search orders by number or customer name..."}
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className={`w-full rounded-xl border border-[#942E3A]/20 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#942E3A] ${isRtl ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left"}`}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-xs overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="border-b border-[#942E3A]/10 text-[10px] uppercase text-[#6B1F2A]/60">
                <tr>
                  <th className="pb-2 text-start">{isRtl ? "رقم الطلب" : "Order #"}</th>
                  <th className="pb-2 text-start">{isRtl ? "العميل" : "Customer"}</th>
                  <th className="pb-2 text-center">{isRtl ? "الحالة" : "Status"}</th>
                  <th className="pb-2 text-end">{isRtl ? "إجمالي المبيعات" : "Total Sales"}</th>
                  <th className="pb-2 text-end">{isRtl ? "تكلفة المنتج" : "Product Cost"}</th>
                  <th className="pb-2 text-end">{isRtl ? "الخصم" : "Discount"}</th>
                  <th className="pb-2 text-end">{isRtl ? "ربح الطلب" : "Order Profit"}</th>
                  <th className="pb-2 text-center">{isRtl ? "الهامش %" : "Margin %"}</th>
                  <th className="pb-2 text-end">{isRtl ? "صافي ربح الأوردر" : "Net Profit / Order"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#942E3A]/10">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-xs text-[#6B1F2A]/60">
                      {ordersProfit.length === 0
                        ? (isRtl ? "لا توجد طلبات مسلّمة في الفترة المحددة." : "No delivered orders in the selected period.")
                        : (isRtl ? "لا توجد طلبات مطابقة للبحث الحالي." : "No orders match the current search.")}
                    </td>
                  </tr>
                ) : filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FFF9EB]/50 transition">
                    <td className="py-2.5 text-start font-bold text-[#942E3A]">
                      <Link href={`/admin/orders/${order.id}`} className="hover:underline flex items-center gap-1">
                        <span>{order.orderNumber}</span>
                        <ArrowUpRight className="h-3 w-3 text-[#D8B46A]" />
                      </Link>
                    </td>
                    <td className="py-2.5 text-start text-[#6B1F2A]">{order.customerName}</td>
                    <td className="py-2.5 text-center">
                      <span className="rounded-md bg-[#FFF9EB] px-2 py-0.5 text-[10px] font-bold text-[#942E3A]">
                        {order.status === "delivered" ? (isRtl ? "تم التسليم" : "delivered") : order.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-end font-bold text-[#942E3A]">{formatCurrency(order.totalPrice)}</td>
                    <td className="py-2.5 text-end text-[#6B1F2A]">{formatCurrency(order.itemsCost)}</td>
                    <td className="py-2.5 text-end text-red-600">{formatCurrency(order.discountAmount)}</td>
                    <td className="py-2.5 text-end font-black text-[#942E3A]">{formatCurrency(order.orderProfit)}</td>
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
                    <td
                      className={`py-2.5 text-end font-black ${
                        order.netOrderProfit >= 0 ? "text-emerald-700" : "text-red-700"
                      }`}
                      title={formatCurrency(order.weeklyExpenseShare)}
                    >
                      {formatCurrency(order.netOrderProfit)}
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
          <h2 className="font-playfair text-lg font-bold text-[#942E3A]">Financial Projections & Stock Replenishment</h2>
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

      {/* ADD & EDIT TRANSACTION MODAL (EXPENSES & INCOME) */}
      {(isAddExpenseOpen || editingExpense) && (
        <div dir={isRtl ? "rtl" : "ltr"} className="fixed inset-0 z-50 flex items-center justify-center bg-[#8B7CC7]/45 backdrop-blur-[2px] p-4 text-start">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#942E3A]/10 pb-3">
              <h3 className="font-playfair text-base font-bold text-[#942E3A]">
                {editingExpense
                  ? (isRtl ? "تعديل الحركة المالية" : "Edit Financial Transaction")
                  : (isRtl ? "إضافة حركة مالية جديدة" : "Add New Transaction")}
              </h3>
              <button
                onClick={() => {
                  setIsAddExpenseOpen(false);
                  setEditingExpense(null);
                  setErrorMsg(null);
                }}
                className="text-[#6B1F2A]/60 hover:text-[#942E3A] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && <div className="rounded-lg bg-red-50 p-2.5 text-xs font-bold text-red-700">{errorMsg}</div>}

            {/* Type Selector Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-[#FFF9EB] p-1 rounded-xl border border-[#D8B46A]/30">
              <button
                type="button"
                onClick={() => setModalTransactionType("expense")}
                className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                  modalTransactionType === "expense"
                    ? "bg-rose-700 text-white shadow-xs"
                    : "text-[#6B1F2A]/70 hover:text-rose-700"
                }`}
              >
                {isRtl ? "مصروف (تسجيل تكلفة)" : "Expense"}
              </button>
              <button
                type="button"
                onClick={() => setModalTransactionType("income")}
                className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                  modalTransactionType === "income"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-[#6B1F2A]/70 hover:text-emerald-700"
                }`}
              >
                {isRtl ? "إيراد / دخل (تسجيل إيراد)" : "Income"}
              </button>
            </div>

            <form onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense} className="space-y-3 text-xs">
              <input type="hidden" name="type" value={modalTransactionType} />

              <div>
                <label className="block font-bold text-[#6B1F2A] mb-1">
                  {isRtl ? "بيان/عنوان الحركة *" : "Transaction Title *"}
                </label>
                <input
                  name="title"
                  required
                  defaultValue={editingExpense?.title || ""}
                  placeholder={
                    modalTransactionType === "expense"
                      ? (isRtl ? "مثال: تمويل حملة إعلانات فيسبوك" : "e.g., Facebook Ads Campaign")
                      : (isRtl ? "مثال: إيداع رأس مال إضافي" : "e.g., Additional Capital Deposit")
                  }
                  className="w-full rounded-xl border border-[#942E3A]/20 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#942E3A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#6B1F2A] mb-1">{isRtl ? "المبلغ (EGP) *" : "Amount (EGP) *"}</label>
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={editingExpense?.amount || ""}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-[#942E3A]/20 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#942E3A]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#6B1F2A] mb-1">{isRtl ? "التاريخ" : "Date"}</label>
                  <input
                    name="date"
                    type="date"
                    defaultValue={
                      editingExpense
                        ? new Date(editingExpense.date).toISOString().slice(0, 10)
                        : new Date().toISOString().slice(0, 10)
                    }
                    className="w-full rounded-xl border border-[#942E3A]/20 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#942E3A]"
                  />
                </div>
              </div>

              {/* Modal Category Custom Dropdown */}
              <div>
                <label className="block font-bold text-[#6B1F2A] mb-1">{isRtl ? "الفئة *" : "Category *"}</label>
                <input type="hidden" name="category" value={modalCategory} />

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsModalCategoryDropdownOpen(!isModalCategoryDropdownOpen)}
                    className="w-full flex items-center justify-between rounded-xl border border-[#942E3A]/20 bg-[#FFF9EB]/60 p-2.5 text-xs font-bold text-[#942E3A] hover:border-[#942E3A] transition cursor-pointer"
                  >
                    <span>
                      {isRtl
                        ? (modalCategory === "capital" ? "رأس مال / استثمارات"
                          : modalCategory === "external_profit" ? "أرباح خارجية"
                          : modalCategory === "supplier_refund" ? "استرداد ومرتجعات توريد"
                          : modalCategory === "other_income" ? "إيرادات أخرى"
                          : modalCategory === "marketing" ? "التسويق والإعلانات"
                          : modalCategory === "shipping_ops" ? "اللوجستيات والشحن"
                          : modalCategory === "packaging" ? "الحقائب والتغليف"
                          : modalCategory === "utilities" ? "الخدمات والمرافق"
                          : modalCategory === "salaries" ? "الرواتب والعمولات"
                          : modalCategory === "purchase_invoice" ? "فواتير الشراء والتوريد"
                          : "مصروفات أخرى")
                        : modalCategory}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-[#D8B46A] transition-transform ${isModalCategoryDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isModalCategoryDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsModalCategoryDropdownOpen(false)} />
                      <div
                        onWheel={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                        className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border border-[#942E3A]/15 bg-white p-1.5 shadow-xl space-y-1 text-xs max-h-52 overflow-y-auto overscroll-contain touch-pan-y [scrollbar-width:thin] [::-webkit-scrollbar]:w-1.5 [::-webkit-scrollbar-thumb]:bg-[#D8B46A] [::-webkit-scrollbar-thumb]:rounded-full"
                      >
                        {(modalTransactionType === "expense"
                          ? [
                              { id: "marketing", ar: "التسويق والإعلانات", en: "Marketing & Ads" },
                              { id: "shipping_ops", ar: "اللوجستيات والشحن", en: "Shipping & Operations" },
                              { id: "packaging", ar: "الحقائب والتغليف", en: "Bags & Packaging" },
                              { id: "utilities", ar: "الخدمات والمرافق", en: "Utilities & Services" },
                              { id: "salaries", ar: "الرواتب والعمولات", en: "Salaries & Commissions" },
                              { id: "purchase_invoice", ar: "فواتير الشراء والتوريد", en: "Purchase Invoices" },
                              { id: "other", ar: "مصروفات أخرى", en: "Other Expenses" },
                            ]
                          : [
                              { id: "capital", ar: "رأس مال / استثمارات", en: "Capital / Investment" },
                              { id: "external_profit", ar: "أرباح خارجية", en: "External Profits" },
                              { id: "supplier_refund", ar: "استرداد ومرتجعات توريد", en: "Supplier Refunds" },
                              { id: "other_income", ar: "إيرادات أخرى", en: "Other Income" },
                            ]
                        ).map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setModalCategory(item.id);
                              setIsModalCategoryDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-start transition cursor-pointer ${
                              modalCategory === item.id
                                ? (modalTransactionType === "income" ? "bg-emerald-700 text-white font-bold" : "bg-[#942E3A] text-white font-bold")
                                : "text-[#6B1F2A] hover:bg-[#FFF9EB]"
                            }`}
                          >
                            <span>{isRtl ? item.ar : item.en}</span>
                            {modalCategory === item.id && <Check className="h-4 w-4 text-[#D8B46A]" />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Modal Payment Account Custom Dropdown */}
              <div>
                <label className="block font-bold text-[#6B1F2A] mb-1">
                  {modalTransactionType === "expense"
                    ? (isRtl ? "الخصم من حساب *" : "Deduct from Account *")
                    : (isRtl ? "الإيداع في حساب *" : "Deposit into Account *")}
                </label>
                <input type="hidden" name="paymentAccount" value={modalPaymentAccount} />

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsModalAccountDropdownOpen(!isModalAccountDropdownOpen)}
                    className="w-full flex items-center justify-between rounded-xl border border-[#942E3A]/20 bg-[#FFF9EB]/60 p-2.5 text-xs font-bold text-[#942E3A] hover:border-[#942E3A] transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {modalPaymentAccount === "cash" && <Wallet className="h-4 w-4 text-[#D8B46A]" />}
                      {modalPaymentAccount === "instapay_visa" && <CreditCard className="h-4 w-4 text-[#D8B46A]" />}
                      {modalPaymentAccount === "wallet" && <Building2 className="h-4 w-4 text-[#D8B46A]" />}
                      <span>
                        {modalPaymentAccount === "cash"
                          ? (isRtl ? "الخزنة النقدي (Cash on Hand)" : "Cash Vault")
                          : modalPaymentAccount === "instapay_visa"
                          ? "InstaPay / Visa"
                          : (isRtl ? "المافظ الإلكترونية (E-Wallets)" : "E-Wallets")}
                      </span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-[#D8B46A] transition-transform ${isModalAccountDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isModalAccountDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsModalAccountDropdownOpen(false)} />
                      <div
                        onWheel={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                        className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border border-[#942E3A]/15 bg-white p-1.5 shadow-xl space-y-1 text-xs max-h-52 overflow-y-auto overscroll-contain touch-pan-y [scrollbar-width:thin] [::-webkit-scrollbar]:w-1.5 [::-webkit-scrollbar-thumb]:bg-[#D8B46A] [::-webkit-scrollbar-thumb]:rounded-full"
                      >
                        {[
                          { id: "cash", ar: "الخزنة النقدي (Cash on Hand)", en: "Cash Vault", icon: Wallet },
                          { id: "instapay_visa", ar: "InstaPay / Visa", en: "InstaPay / Visa", icon: CreditCard },
                          { id: "wallet", ar: "المحافظ الإلكترونية (E-Wallets)", en: "E-Wallets", icon: Building2 },
                        ].map((acc) => {
                          const IconComp = acc.icon;
                          const isSel = modalPaymentAccount === acc.id;
                          return (
                            <button
                              key={acc.id}
                              type="button"
                              onClick={() => {
                                setModalPaymentAccount(acc.id);
                                setIsModalAccountDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-start transition cursor-pointer ${
                                isSel
                                  ? "bg-[#942E3A] text-white font-bold"
                                  : "text-[#6B1F2A] hover:bg-[#FFF9EB]"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <IconComp className={`h-4 w-4 ${isSel ? "text-[#D8B46A]" : "text-[#942E3A]/70"}`} />
                                <span>{isRtl ? acc.ar : acc.en}</span>
                              </div>
                              {isSel && <Check className="h-4 w-4 text-[#D8B46A]" />}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#6B1F2A] mb-1">{isRtl ? "ملاحظات إضافية" : "Additional Notes"}</label>
                <textarea
                  name="notes"
                  rows={2}
                  defaultValue={editingExpense?.notes || ""}
                  placeholder={isRtl ? "أي تفاصيل أو ملاحظات إضافية..." : "Detailed notes..."}
                  className="w-full rounded-xl border border-[#942E3A]/20 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#942E3A]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddExpenseOpen(false);
                    setEditingExpense(null);
                    setErrorMsg(null);
                  }}
                  className="rounded-xl border border-stone-300 px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className={`rounded-xl px-5 py-2 text-xs font-bold text-white shadow-md transition cursor-pointer ${
                    modalTransactionType === "income"
                      ? "bg-emerald-700 hover:bg-emerald-800"
                      : "bg-rose-700 hover:bg-rose-800"
                  }`}
                >
                  {isPending
                    ? (isRtl ? "جارٍ الحفظ..." : "Saving...")
                    : editingExpense
                    ? (isRtl ? "حفظ التعديلات" : "Update Transaction")
                    : modalTransactionType === "income"
                    ? (isRtl ? "حفظ الإيراد" : "Save Income")
                    : (isRtl ? "حفظ المصروف" : "Save Expense")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACCOUNT TRANSFER MODAL */}
      {isTransferOpen && (
        <div dir={isRtl ? "rtl" : "ltr"} className="fixed inset-0 z-50 flex items-center justify-center bg-[#8B7CC7]/45 backdrop-blur-[2px] p-4 text-start">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#942E3A]/10 pb-3">
              <h3 className="font-playfair text-base font-bold text-[#942E3A]">{isRtl ? "تحويل بين الحسابات" : "Transfer Between Accounts"}</h3>
              <button onClick={() => setIsTransferOpen(false)} className="text-[#6B1F2A]/60 hover:text-[#942E3A]">
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && <div className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-700">{errorMsg}</div>}

            <form onSubmit={handleCreateTransfer} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#6B1F2A] mb-1">{isRtl ? "من حساب" : "From Account"}</label>
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
                  <label className="block font-bold text-[#6B1F2A] mb-1">{isRtl ? "إلى حساب" : "To Account"}</label>
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
                  <label className="block font-bold text-[#6B1F2A] mb-1">{isRtl ? "مبلغ التحويل (EGP) *" : "Transfer Amount (EGP) *"}</label>
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
                  <label className="block font-bold text-[#6B1F2A] mb-1">{isRtl ? "رسوم / ضريبة التحويل (EGP)" : "Transfer Fee / Tax (EGP)"}</label>
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
                <label className="block font-bold text-[#6B1F2A] mb-1">{isRtl ? "ملاحظات / السبب" : "Notes / Reason"}</label>
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

      {/* WEEK INSPECTOR MODAL */}
      {inspectingWeek && (
        <div dir={isRtl ? "rtl" : "ltr"} className="fixed inset-0 z-50 flex items-center justify-center bg-[#8B7CC7]/45 backdrop-blur-[2px] p-3 sm:p-4 text-start">
          <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#942E3A]/10 bg-[#FFF9EB] px-5 py-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#942E3A] text-sm sm:text-base">{inspectingWeek.weekId}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      inspectingWeek.isCurrentWeek
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : inspectingWeek.isLocked
                        ? "bg-stone-200 text-stone-800"
                        : "bg-amber-100 text-amber-800 border border-amber-300"
                    }`}
                  >
                    {inspectingWeek.isCurrentWeek
                      ? isRtl
                        ? "الأسبوع الحالي (جارٍ العمل)"
                        : "Current Active Week"
                      : inspectingWeek.isLocked
                      ? isRtl
                        ? "أسبوع مغلق ومكتمل"
                        : "Completed & Locked"
                      : isRtl
                      ? "أسبوع غير مغلق (مستحق الإغلاق)"
                      : "Unclosed Week"}
                  </span>
                </div>
                <p className="text-xs font-bold text-[#6B1F2A]/70 mt-0.5">
                  {isRtl
                    ? `دورة الأسبوع: السبت ${inspectingWeek.startSat.toLocaleDateString("ar-EG", { day: "numeric", month: "long" })} – الجمعة ${inspectingWeek.endFri.toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" })}`
                    : `Cycle: Sat ${inspectingWeek.startSat.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – Fri ${inspectingWeek.endFri.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                </p>
              </div>
              <button type="button" onClick={() => setInspectingWeek(null)} className="rounded-lg p-1 text-[#6B1F2A]/60 hover:bg-[#942E3A]/10 hover:text-[#942E3A]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div className="rounded-xl bg-[#FFF9EB] p-2.5 border border-[#942E3A]/10">
                  <span className="text-[10px] font-bold text-[#6B1F2A]/60 block">{isRtl ? "المبيعات" : "Total Sales"}</span>
                  <strong className="font-playfair text-sm sm:text-base font-extrabold text-[#942E3A]">{formatCurrency(inspectingWeek.totalSales)}</strong>
                </div>
                <div className="rounded-xl bg-[#FFF9EB] p-2.5 border border-[#942E3A]/10">
                  <span className="text-[10px] font-bold text-[#6B1F2A]/60 block">{isRtl ? "تكلفة المنتجات" : "COGS"}</span>
                  <strong className="font-playfair text-sm sm:text-base font-extrabold text-[#6B1F2A]">{formatCurrency(inspectingWeek.totalCOGS)}</strong>
                </div>
                <div className="rounded-xl bg-[#FFF9EB] p-2.5 border border-[#942E3A]/10">
                  <span className="text-[10px] font-bold text-[#6B1F2A]/60 block">{isRtl ? "المصروفات" : "Expenses"}</span>
                  <strong className="font-playfair text-sm sm:text-base font-extrabold text-red-600">{formatCurrency(inspectingWeek.totalExpenses)}</strong>
                </div>
                <div className="rounded-xl bg-[#FFF9EB] p-2.5 border border-[#942E3A]/10">
                  <span className="text-[10px] font-bold text-[#6B1F2A]/60 block">{isRtl ? "الخصومات" : "Discounts"}</span>
                  <strong className="font-playfair text-sm sm:text-base font-extrabold text-amber-700">{formatCurrency(inspectingWeek.totalDiscounts)}</strong>
                </div>
                <div className="col-span-2 sm:col-span-1 rounded-xl bg-[#942E3A] p-2.5 text-white">
                  <span className="text-[10px] font-bold text-white/80 block">{isRtl ? "صافي الربح" : "Net Profit"}</span>
                  <strong className="font-playfair text-base sm:text-lg font-black text-[#D8B46A]">{formatCurrency(inspectingWeek.netProfit)}</strong>
                </div>
              </div>

              {/* Subtabs for Orders and Expenses */}
              <div className="flex border-b border-[#942E3A]/10 gap-4 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveInspectTab("orders")}
                  className={`pb-2 border-b-2 transition ${activeInspectTab === "orders" ? "border-[#942E3A] text-[#942E3A]" : "border-transparent text-[#6B1F2A]/60"}`}
                >
                  {isRtl ? `طلبيات الأسبوع (${inspectingWeek.orders.length})` : `Week Orders (${inspectingWeek.orders.length})`}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveInspectTab("expenses")}
                  className={`pb-2 border-b-2 transition ${activeInspectTab === "expenses" ? "border-[#942E3A] text-[#942E3A]" : "border-transparent text-[#6B1F2A]/60"}`}
                >
                  {isRtl ? `مصروفات الأسبوع (${inspectingWeek.expenses.length})` : `Week Expenses (${inspectingWeek.expenses.length})`}
                </button>
              </div>

              {/* TAB 1: ORDERS TABLE */}
              {activeInspectTab === "orders" && (
                <div className="rounded-xl border border-[#942E3A]/10 overflow-hidden">
                  {inspectingWeek.orders.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#6B1F2A]/60">{isRtl ? "لا توجد طلبيات مسجلة في هذا الأسبوع." : "No orders in this week."}</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-start text-xs">
                        <thead className="bg-[#FFF9EB] border-b border-[#942E3A]/10 text-[10px] uppercase text-[#6B1F2A]/70">
                          <tr>
                            <th className="p-2.5 text-start">{isRtl ? "رقم الطلب" : "Order #"}</th>
                            <th className="p-2.5 text-start">{isRtl ? "العميل" : "Customer"}</th>
                            <th className="p-2.5 text-center">{isRtl ? "طريقة الدفع" : "Payment"}</th>
                            <th className="p-2.5 text-end">{isRtl ? "إجمالي المبلغ" : "Total Sales"}</th>
                            <th className="p-2.5 text-end">{isRtl ? "الربح" : "Profit"}</th>
                            <th className="p-2.5 text-center">{isRtl ? "الهامش %" : "Margin %"}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#942E3A]/10">
                          {inspectingWeek.orders.map((ord) => (
                            <tr key={ord.id} className="hover:bg-[#FFF9EB]/40">
                              <td className="p-2.5 text-start font-bold text-[#942E3A]">{ord.orderNumber}</td>
                              <td className="p-2.5 text-start text-[#6B1F2A]">{ord.customerName}</td>
                              <td className="p-2.5 text-center uppercase text-[10px] font-bold text-[#6B1F2A]/70">{ord.paymentMethod}</td>
                              <td className="p-2.5 text-end font-bold text-[#942E3A]">{formatCurrency(ord.totalPrice)}</td>
                              <td className="p-2.5 text-end font-bold text-emerald-700">{formatCurrency(ord.orderProfit)}</td>
                              <td className="p-2.5 text-center font-bold">{ord.profitMargin}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: EXPENSES TABLE */}
              {activeInspectTab === "expenses" && (
                <div className="rounded-xl border border-[#942E3A]/10 overflow-hidden">
                  {inspectingWeek.expenses.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#6B1F2A]/60">{isRtl ? "لا توجد مصروفات مسجلة في هذا الأسبوع." : "No expenses in this week."}</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-start text-xs">
                        <thead className="bg-[#FFF9EB] border-b border-[#942E3A]/10 text-[10px] uppercase text-[#6B1F2A]/70">
                          <tr>
                            <th className="p-2.5 text-start">{isRtl ? "عنوان المصروف" : "Title"}</th>
                            <th className="p-2.5 text-start">{isRtl ? "الفئة" : "Category"}</th>
                            <th className="p-2.5 text-end">{isRtl ? "المبلغ" : "Amount"}</th>
                            <th className="p-2.5 text-start">{isRtl ? "الحساب المالي" : "Account"}</th>
                            <th className="p-2.5 text-end">{isRtl ? "التاريخ" : "Date"}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#942E3A]/10">
                          {inspectingWeek.expenses.map((exp) => (
                            <tr key={exp.id} className="hover:bg-[#FFF9EB]/40">
                              <td className="p-2.5 text-start font-bold text-[#942E3A]">{exp.title}</td>
                              <td className="p-2.5 text-start text-[#6B1F2A]">{exp.category}</td>
                              <td className="p-2.5 text-end font-bold text-red-600">{formatCurrency(exp.amount)}</td>
                              <td className="p-2.5 text-start uppercase text-[10px] font-bold text-[#6B1F2A]/70">{exp.paymentAccount}</td>
                              <td className="p-2.5 text-end text-[10px] text-[#6B1F2A]/70">{new Date(exp.date).toLocaleDateString(isRtl ? "ar-EG" : "en-GB", { month: "short", day: "numeric" })}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[#942E3A]/10 bg-[#FFF9EB]/50 px-5 py-3.5">
              <button
                type="button"
                onClick={() => setInspectingWeek(null)}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                {isRtl ? "إغلاق النافذة" : "Close"}
              </button>

              {!inspectingWeek.isLocked && (
                <button
                  type="button"
                  onClick={() => {
                    const target = inspectingWeek;
                    setInspectingWeek(null);
                    openSettlingModal(target);
                  }}
                  className="rounded-xl bg-[#942E3A] px-4 py-2 text-xs font-bold text-white hover:bg-[#7A242F]"
                >
                  {isRtl ? "إتمام وإغلاق التسوية لهذا الأسبوع" : "Proceed to Settle & Lock Week"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SETTLEMENT CONFIRMATION & LOCK MODAL */}
      {settlingWeek && (
        <div dir={isRtl ? "rtl" : "ltr"} className="fixed inset-0 z-50 flex items-center justify-center bg-[#8B7CC7]/45 backdrop-blur-[2px] p-3 sm:p-4 text-start">
          <div className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#942E3A]/10 bg-[#FFF9EB] px-5 py-3.5">
              <div>
                <h3 className="font-playfair text-base font-bold text-[#942E3A]">
                  {isRtl ? `تأكيد وإغلاق تسوية الأسبوع (${settlingWeek.weekId})` : `Confirm & Lock Settlement (${settlingWeek.weekId})`}
                </h3>
                <p className="text-[11px] text-[#6B1F2A]/70 mt-0.5">
                  {isRtl
                    ? `دورة الأسبوع: السبت ${settlingWeek.startSat.toLocaleDateString("ar-EG", { day: "numeric", month: "short" })} – الجمعة ${settlingWeek.endFri.toLocaleDateString("ar-EG", { day: "numeric", month: "short", year: "numeric" })}`
                    : `Sat ${settlingWeek.startSat.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – Fri ${settlingWeek.endFri.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                </p>
              </div>
              <button type="button" onClick={() => setSettlingWeek(null)} className="rounded-lg p-1 text-[#6B1F2A]/60 hover:bg-[#942E3A]/10 hover:text-[#942E3A]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {errorMsg && <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">{errorMsg}</div>}

              {/* Detailed Week Breakdown Preview */}
              <div className="rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB]/60 p-3.5 space-y-2">
                <div className="flex justify-between"><span>{isRtl ? "إجمالي مبيعات الأسبوع:" : "Total Week Sales:"}</span><strong className="font-bold text-[#942E3A]">{formatCurrency(settlingWeek.totalSales)}</strong></div>
                <div className="flex justify-between"><span>{isRtl ? "تكلفة المنتجات (COGS):" : "Product COGS:"}</span><strong>{formatCurrency(settlingWeek.totalCOGS)}</strong></div>
                <div className="flex justify-between"><span>{isRtl ? "إجمالي المصروفات:" : "Total Expenses:"}</span><strong className="text-red-600">{formatCurrency(settlingWeek.totalExpenses)}</strong></div>
                <div className="flex justify-between"><span>{isRtl ? "الخصومات المطبقة:" : "Total Discounts:"}</span><strong className="text-amber-700">{formatCurrency(settlingWeek.totalDiscounts)}</strong></div>

                <div className="flex justify-between border-t border-[#942E3A]/20 pt-2 text-[#942E3A] font-extrabold text-sm">
                  <span>{isRtl ? "صافي ربح الأسبوع للإغلاق:" : "Net Profit to Lock:"}</span>
                  <strong className="text-[#D8B46A]">{formatCurrency(settlingWeek.netProfit)}</strong>
                </div>
              </div>

              {/* Summary of Included Entries */}
              <div className="rounded-xl bg-stone-50 border border-stone-200 p-3 text-[11px] space-y-1">
                <div className="flex justify-between text-stone-700">
                  <span>{isRtl ? "عدد طلبيات الأسبوع المسجلة:" : "Included Orders Count:"}</span>
                  <strong>{settlingWeek.ordersCount} {isRtl ? "طلبات" : "orders"}</strong>
                </div>
                <div className="flex justify-between text-stone-700">
                  <span>{isRtl ? "عدد مصروفات الأسبوع المسجلة:" : "Included Expenses Count:"}</span>
                  <strong>{settlingWeek.expensesCount} {isRtl ? "مصروفات" : "expenses"}</strong>
                </div>
              </div>

              {/* Editable Transfers Inputs */}
              <div className="space-y-2.5 pt-1">
                <h4 className="font-bold text-[#942E3A] text-xs">{isRtl ? "توزيع المحصلات المحولة الخزينة:" : "Transferred Liquidity Amounts:"}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-[#6B1F2A] mb-1">{isRtl ? "تحويل كاش (COD):" : "Cash (COD):"}</label>
                    <input
                      type="number"
                      value={cashTransferred}
                      onChange={(e) => setCashTransferred(Number(e.target.value))}
                      className="w-full rounded-lg border border-[#942E3A]/20 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#942E3A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#6B1F2A] mb-1">{isRtl ? "تحويل إنستا باي/فيزا:" : "InstaPay/Visa:"}</label>
                    <input
                      type="number"
                      value={instapayTransferred}
                      onChange={(e) => setInstapayTransferred(Number(e.target.value))}
                      className="w-full rounded-lg border border-[#942E3A]/20 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#942E3A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#6B1F2A] mb-1">{isRtl ? "تحويل محفظة:" : "Wallet:"}</label>
                    <input
                      type="number"
                      value={walletTransferred}
                      onChange={(e) => setWalletTransferred(Number(e.target.value))}
                      className="w-full rounded-lg border border-[#942E3A]/20 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#942E3A]"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-[#6B1F2A] mb-1">{isRtl ? "ملاحظات التسوية والتقرير" : "Settlement Notes"}</label>
                <textarea
                  value={settlementNotes}
                  onChange={(e) => setSettlementNotes(e.target.value)}
                  rows={2}
                  placeholder={isRtl ? "مثال: تم إغلاق حسابات الأسبوع ومطابقة مبالغ الكاش والفيزا بنجاح" : "e.g., Closed weekly accounts and reconciled cash balances successfully"}
                  className="w-full rounded-xl border border-[#942E3A]/20 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#942E3A]"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-[#942E3A]/10 bg-[#FFF9EB]/50 px-5 py-3.5">
              <button
                type="button"
                onClick={() => setSettlingWeek(null)}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                {isRtl ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleCreateSettlement}
                disabled={isPending}
                className="rounded-xl bg-[#942E3A] px-5 py-2 text-xs font-bold text-white hover:bg-[#7A242F] disabled:opacity-50"
              >
                {isPending ? (isRtl ? "جارٍ الحفظ والترحييل..." : "Locking...") : (isRtl ? "تأكيد وإتمام تسوية الأسبوع" : "Confirm & Lock Settlement")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
