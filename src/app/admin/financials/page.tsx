import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import FinancialsClient from "@/components/FinancialsClient";
import { DatePreset } from "@/components/AdminDailyLogDatePicker";

export const dynamic = "force-dynamic";

function formatDateYYYYMMDD(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function computeDateRange(params: {
  preset?: string;
  startDate?: string;
  endDate?: string;
  date?: string;
}): { preset: DatePreset; startDate: string; endDate: string } {
  const now = new Date();
  const todayStr = formatDateYYYYMMDD(now);

  const preset =
    (params.preset as DatePreset) ||
    (params.startDate || params.endDate || params.date ? "custom" : "this_month");

  if (params.startDate && params.endDate) {
    return { preset: "custom", startDate: params.startDate, endDate: params.endDate };
  }

  if (params.date) {
    return { preset: "custom", startDate: params.date, endDate: params.date };
  }

  switch (preset) {
    case "today":
      return { preset: "today", startDate: todayStr, endDate: todayStr };

    case "this_week": {
      const day = now.getDay();
      const diffToMon = day === 0 ? -6 : 1 - day;
      const mon = new Date(now);
      mon.setDate(now.getDate() + diffToMon);
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);
      return {
        preset: "this_week",
        startDate: formatDateYYYYMMDD(mon),
        endDate: formatDateYYYYMMDD(sun),
      };
    }

    case "last_week": {
      const day = now.getDay();
      const diffToMon = (day === 0 ? -6 : 1 - day) - 7;
      const mon = new Date(now);
      mon.setDate(now.getDate() + diffToMon);
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);
      return {
        preset: "last_week",
        startDate: formatDateYYYYMMDD(mon),
        endDate: formatDateYYYYMMDD(sun),
      };
    }

    case "this_month": {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return {
        preset: "this_month",
        startDate: formatDateYYYYMMDD(first),
        endDate: formatDateYYYYMMDD(last),
      };
    }

    case "last_month": {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        preset: "last_month",
        startDate: formatDateYYYYMMDD(first),
        endDate: formatDateYYYYMMDD(last),
      };
    }

    case "this_year": {
      const first = new Date(now.getFullYear(), 0, 1);
      const last = new Date(now.getFullYear(), 11, 31);
      return {
        preset: "this_year",
        startDate: formatDateYYYYMMDD(first),
        endDate: formatDateYYYYMMDD(last),
      };
    }

    case "last_year": {
      const first = new Date(now.getFullYear() - 1, 0, 1);
      const last = new Date(now.getFullYear() - 1, 11, 31);
      return {
        preset: "last_year",
        startDate: formatDateYYYYMMDD(first),
        endDate: formatDateYYYYMMDD(last),
      };
    }

    case "custom":
    default: {
      const start = params.startDate || todayStr;
      const end = params.endDate || todayStr;
      return { preset: "custom", startDate: start, endDate: end };
    }
  }
}

export default async function FinancialsPage({
  searchParams,
}: {
  searchParams: Promise<{ preset?: string; startDate?: string; endDate?: string; date?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const timeRange = computeDateRange(params);

  const startFilter = new Date(`${timeRange.startDate}T00:00:00.000`);
  const endFilter = new Date(`${timeRange.endDate}T23:59:59.999`);

  // 1. Fetch Orders within date range
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startFilter,
        lte: endFilter,
      },
    },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Filter out cancelled and returned orders for active sales & revenue calculations
  const isInactiveStatus = (s: string) => s === "cancelled" || s === "returned";
  const activeOrders = orders.filter((o) => !isInactiveStatus(o.status));
  const deliveredOrders = orders.filter((o) => o.status === "delivered" || o.status === "shipped");
  const returnedOrders = orders.filter((o) => o.status === "returned");
  const totalReturnedAmount = returnedOrders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);


  const totalSales = activeOrders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);
  const totalShipping = activeOrders.reduce((sum, o) => sum + Number(o.shippingCost || 0), 0);
  const totalDiscounts = activeOrders.reduce((sum, o) => sum + Number(o.discountAmount || 0), 0);

  // Compute Cost of Goods Sold (COGS)
  let totalCOGS = 0;
  activeOrders.forEach((order) => {
    order.items.forEach((item) => {
      const cost =
        Number(item.unitCost) > 0
          ? Number(item.unitCost)
          : Number(item.variant?.wholesalePrice) > 0
          ? Number(item.variant?.wholesalePrice)
          : Number(item.product?.wholesalePrice) > 0
          ? Number(item.product?.wholesalePrice)
          : Number(item.price) * 0.5;
      totalCOGS += cost * item.quantity;
    });
  });

  // 2. Fetch Expenses within date range
  let expensesRaw: any[] = [];
  try {
    expensesRaw = await (prisma as any).expense.findMany({
      where: {
        date: {
          gte: startFilter,
          lte: endFilter,
        },
      },
      orderBy: { date: "desc" },
    });
  } catch (e) {
    console.error("Expenses query error:", e);
  }

  const totalExpenses = expensesRaw.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

  const expensesByCategory = expensesRaw.reduce((acc, exp) => {
    const cat = exp.category || "other";
    acc[cat] = (acc[cat] || 0) + Number(exp.amount || 0);
    return acc;
  }, {} as Record<string, number>);

  const expensesByAccount = expensesRaw.reduce(
    (acc, exp) => {
      const acct = exp.paymentAccount || "cash";
      acc[acct] = (acc[acct] || 0) + Number(exp.amount || 0);
      return acc;
    },
    { cash: 0, instapay_visa: 0, wallet: 0 } as Record<string, number>
  );

  // 3. Fetch Treasury Account Transfers
  let transfersRaw: any[] = [];
  try {
    transfersRaw = await (prisma as any).accountTransfer.findMany({
      orderBy: { date: "desc" },
    });
  } catch (e) {
    console.error("AccountTransfer query error:", e);
  }

  // Adjust liquidity per account based on transfers (including transfer fees)
  let transferAdjustments = { cash: 0, instapay_visa: 0, wallet: 0 };
  let totalTransferFees = 0;
  transfersRaw.forEach((tr) => {
    const amt = Number(tr.amount || 0);
    const fee = Number(tr.fee || 0);
    totalTransferFees += fee;

    if (tr.fromAccount in transferAdjustments) {
      transferAdjustments[tr.fromAccount as keyof typeof transferAdjustments] -= (amt + fee);
    }
    if (tr.toAccount in transferAdjustments) {
      transferAdjustments[tr.toAccount as keyof typeof transferAdjustments] += amt;
    }
  });

  // Total Expenses includes operational expenses + transfer fees
  const totalCombinedExpenses = totalExpenses + totalTransferFees;

  // Net Profit & Profit Margin Calculations
  const grossProfit = totalSales - totalCOGS - totalDiscounts;
  const netProfit = grossProfit - totalCombinedExpenses;
  const profitMargin = totalSales > 0 ? Math.round((netProfit / totalSales) * 100) : 0;
  const grossMarginPct = totalSales > 0 ? Math.round((grossProfit / totalSales) * 100) : 0;

  // 4. Payment Accounts Liquidity
  let cashSales = 0;
  let instapaySales = 0;
  let walletSales = 0;

  activeOrders.forEach((o) => {
    const method = (o.paymentMethod || "cod").toLowerCase();
    const val = Number(o.totalPrice || 0);
    if (method.includes("instapay") || method.includes("card") || method.includes("visa")) {
      instapaySales += val;
    } else if (method.includes("wallet") || method.includes("vodafone") || method.includes("cash_app")) {
      walletSales += val;
    } else {
      // COD Cash on Delivery enters available cash treasury ONLY when order status becomes delivered
      if (o.status === "delivered" || o.status === "shipped") {
        cashSales += val;
      }
    }
  });

  const cashOnHand = Math.max(0, cashSales - expensesByAccount.cash + transferAdjustments.cash);
  const instapayVisa = Math.max(0, instapaySales - expensesByAccount.instapay_visa + transferAdjustments.instapay_visa);
  const wallet = Math.max(0, walletSales - expensesByAccount.wallet + transferAdjustments.wallet);
  const totalLiquidity = cashOnHand + instapayVisa + wallet;


  // 5. Inventory Valuation & Low Stock Replenishment Forecast
  const variants = await prisma.productVariant.findMany({
    include: {
      product: true,
    },
  });

  let totalItemsInStock = 0;
  let stockWholesaleValue = 0;
  let stockRetailValue = 0;
  let lowStockReplenishmentCost = 0;
  let lowStockItemsCount = 0;

  variants.forEach((v) => {
    const qty = v.stock || 0;
    const lowLimit = v.product?.lowStockLimit ?? 2;

    const wholesalePrice =
      Number(v.wholesalePrice) > 0
        ? Number(v.wholesalePrice)
        : Number(v.product?.wholesalePrice) > 0
        ? Number(v.product?.wholesalePrice)
        : Number(v.price || v.product?.price || 0) * 0.5;

    const retailPrice = Number(v.price || v.product?.price || 0);

    if (qty > 0) {
      totalItemsInStock += qty;
      stockWholesaleValue += wholesalePrice * qty;
      stockRetailValue += retailPrice * qty;
    }

    if (qty <= lowLimit) {
      lowStockItemsCount += 1;
      const targetRestockQty = Math.max(5, lowLimit * 3) - qty;
      lowStockReplenishmentCost += targetRestockQty * wholesalePrice;
    }
  });

  const projectedProfit = Math.max(0, stockRetailValue - stockWholesaleValue);

  // 6. Fetch Weekly Settlements
  let settlementsRaw: any[] = [];
  try {
    settlementsRaw = await (prisma as any).weeklySettlement.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    console.error("WeeklySettlement query error:", e);
  }

  // 7. Order Profitability List
  const ordersProfit = activeOrders.map((o) => {
    let itemCosts = 0;
    o.items.forEach((item) => {
      const c =
        Number(item.unitCost) > 0
          ? Number(item.unitCost)
          : Number(item.variant?.wholesalePrice) > 0
          ? Number(item.variant?.wholesalePrice)
          : Number(item.product?.wholesalePrice) > 0
          ? Number(item.product?.wholesalePrice)
          : Number(item.price) * 0.5;
      itemCosts += c * item.quantity;
    });

    const tot = Number(o.totalPrice || 0);
    const disc = Number(o.discountAmount || 0);
    const ship = Number(o.shippingCost || 0);
    const orderProfit = tot - itemCosts - disc;
    const margin = tot > 0 ? Math.round((orderProfit / tot) * 100) : 0;

    return {
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      status: o.status,
      paymentMethod: o.paymentMethod || "cod",
      totalPrice: tot,
      itemsCost: itemCosts,
      discountAmount: disc,
      shippingCost: ship,
      orderProfit,
      profitMargin: margin,
      createdAt: o.createdAt.toISOString(),
    };
  });

  return (
    <FinancialsClient
      timeRange={timeRange}
      summary={{
        totalSales,
        totalCOGS,
        totalDiscounts,
        totalShipping,
        totalExpenses,
        grossProfit,
        grossMarginPct,
        netProfit,
        profitMargin,
        deliveredOrdersCount: deliveredOrders.length,
        allOrdersCount: activeOrders.length,
        avgOrderValue: activeOrders.length > 0 ? Math.round(totalSales / activeOrders.length) : 0,
        avgProfitPerOrder: activeOrders.length > 0 ? Math.round(netProfit / activeOrders.length) : 0,
      }}
      inventoryStats={{
        totalItemsInStock,
        stockWholesaleValue,
        stockRetailValue,
        projectedProfit,
        lowStockItemsCount,
        lowStockReplenishmentCost,
      }}
      paymentAccounts={{
        cashOnHand,
        instapayVisa,
        wallet,
        totalLiquidity,
        cashSales,
        instapaySales,
        walletSales,
      }}
      expensesByCategory={expensesByCategory}
      expenses={expensesRaw.map((e) => ({
        id: e.id,
        title: e.title,
        amount: Number(e.amount),
        category: e.category,
        paymentAccount: e.paymentAccount,
        date: e.date.toISOString(),
        notes: e.notes || null,
      }))}
      transfers={transfersRaw.map((t) => ({
        id: t.id,
        fromAccount: t.fromAccount,
        toAccount: t.toAccount,
        amount: Number(t.amount),
        fee: Number(t.fee || 0),
        notes: t.notes || null,
        date: t.date.toISOString(),
      }))}

      settlements={settlementsRaw.map((s) => ({
        id: s.id,
        settlementNumber: s.settlementNumber,
        startDate: s.startDate.toISOString(),
        endDate: s.endDate.toISOString(),
        totalSales: Number(s.totalSales),
        totalCOGS: Number(s.totalCOGS),
        totalExpenses: Number(s.totalExpenses),
        netProfit: Number(s.netProfit),
        cashTransferred: Number(s.cashTransferred),
        instapayTransferred: Number(s.instapayTransferred),
        walletTransferred: Number(s.walletTransferred),
        notes: s.notes || null,
        status: s.status,
        createdAt: s.createdAt.toISOString(),
      }))}
      ordersProfit={ordersProfit}
    />
  );
}
