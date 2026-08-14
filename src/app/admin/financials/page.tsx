import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import FinancialsClient from "@/components/FinancialsClient";
import { DatePreset } from "@/components/AdminDailyLogDatePicker";
import { getOrderProductSales } from "@/lib/orderAccounting";

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
    case "all":
      return { preset: "all", startDate: "2000-01-01", endDate: "2099-12-31" };

    case "today":
      return { preset: "today", startDate: todayStr, endDate: todayStr };

    case "this_week": {
      const day = now.getDay();
      const diffToSat = (day + 1) % 7;
      const startSat = new Date(now);
      startSat.setDate(now.getDate() - diffToSat);
      const endFri = new Date(startSat);
      endFri.setDate(startSat.getDate() + 6);
      return {
        preset: "this_week",
        startDate: formatDateYYYYMMDD(startSat),
        endDate: formatDateYYYYMMDD(endFri),
      };
    }

    case "last_week": {
      const day = now.getDay();
      const diffToSat = (day + 1) % 7;
      const startSat = new Date(now);
      startSat.setDate(now.getDate() - diffToSat - 7);
      const endFri = new Date(startSat);
      endFri.setDate(startSat.getDate() + 6);
      return {
        preset: "last_week",
        startDate: formatDateYYYYMMDD(startSat),
        endDate: formatDateYYYYMMDD(endFri),
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

  // Fetch the full financial dataset once. Each financial tab applies its
  // own date range in the client so changing one tab does not change another.
  const allOrders = await prisma.order.findMany({
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

  const orders = allOrders.filter(
    (order) => order.createdAt >= startFilter && order.createdAt <= endFilter,
  );

  // Financial sales are recognized only after delivery. Cancelled and returned
  // orders, as well as unconfirmed online payments, therefore never enter the
  // financial dataset.
  const isFinancialOrder = (o: { status: string; paymentMethod?: string | null }) =>
    o.status === "delivered";
  const activeOrders = orders.filter(isFinancialOrder);
  const allActiveOrders = allOrders.filter(isFinancialOrder);
  const deliveredOrders = activeOrders;
  const returnedOrders = orders.filter((o) => o.status === "returned");
  const totalReturnedAmount = returnedOrders.reduce((sum, o) => sum + getOrderProductSales(o), 0);


  const totalSales = activeOrders.reduce((sum, o) => sum + getOrderProductSales(o), 0);
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

  // 2. Fetch all Purchase Invoices. The active tab date range is applied below.
  let purchaseInvoicesRaw: any[] = [];
  try {
    purchaseInvoicesRaw = await (prisma as any).purchaseInvoice.findMany({
      where: {},
      include: { supplier: true },
      orderBy: { invoiceDate: "desc" },
    });
  } catch (e) {
    console.error("PurchaseInvoice query error:", e);
  }
  // 3. Fetch all Expenses. The active tab date range is applied below.
  let expensesRaw: any[] = [];
  try {
    expensesRaw = await (prisma as any).expense.findMany({
      where: {},
      orderBy: { date: "desc" },
    });
  } catch (e) {
    console.error("Expenses query error:", e);
  }
  const expensesInRange = expensesRaw.filter(
    (expense) => expense.date >= startFilter && expense.date <= endFilter,
  );

  const totalExpenses = expensesInRange
    .filter((exp) => (exp.type || "expense") !== "income")
    .reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

  const expensesByCategory = expensesInRange
    .filter((exp) => (exp.type || "expense") !== "income")
    .reduce((acc, exp) => {
      const cat = exp.category || "other";
      acc[cat] = (acc[cat] || 0) + Number(exp.amount || 0);
      return acc;
    }, {} as Record<string, number>);

  const expensesByAccount = expensesInRange.reduce(
    (acc, exp) => {
      if ((exp.type || "expense") === "income") return acc;
      const acct = exp.paymentAccount || "cash";
      acc[acct] = (acc[acct] || 0) + Number(exp.amount || 0);
      return acc;
    },
    { cash: 0, instapay_visa: 0, wallet: 0 } as Record<string, number>
  );

  // 4. Fetch Treasury Account Transfers
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

  // totalSales is already the amount after the order discount.
  // Keep totalDiscounts as a reporting metric only; do not subtract it again.
  const grossProfit = totalSales - totalCOGS;
  const netProfit = grossProfit - totalCombinedExpenses;
  const profitMargin = totalSales > 0 ? Math.round((netProfit / totalSales) * 100) : 0;
  const grossMarginPct = totalSales > 0 ? Math.round((grossProfit / totalSales) * 100) : 0;

  // 5. Payment Accounts Liquidity
  let cashSales = 0;
  let instapaySales = 0;
  let walletSales = 0;

  activeOrders.forEach((o) => {
    const method = (o.paymentMethod || "cod").toLowerCase();
    const val = getOrderProductSales(o);
    if (method.includes("instapay") || method.includes("card") || method.includes("visa")) {
      instapaySales += val;
    } else if (method.includes("wallet") || method.includes("vodafone") || method.includes("cash_app")) {
      walletSales += val;
    } else {
      // COD Cash on Delivery enters available cash treasury only after delivery.
      if (o.status === "delivered") {
        cashSales += val;
      }
    }
  });

  const cashOnHand = Math.max(0, cashSales - expensesByAccount.cash + transferAdjustments.cash);
  const instapayVisa = Math.max(0, instapaySales - expensesByAccount.instapay_visa + transferAdjustments.instapay_visa);
  const wallet = Math.max(0, walletSales - expensesByAccount.wallet + transferAdjustments.wallet);
  const totalLiquidity = cashOnHand + instapayVisa + wallet;


  // 6. Inventory Valuation & Low Stock Replenishment Forecast
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

  // 7. Fetch Weekly Settlements
  let settlementsRaw: any[] = [];
  try {
    settlementsRaw = await (prisma as any).weeklySettlement.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    console.error("WeeklySettlement query error:", e);
  }

  // 8. Order Profitability List
  const ordersProfit = allActiveOrders.map((o) => {
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

    const tot = getOrderProductSales(o);
    const disc = Number(o.discountAmount || 0);
    // totalPrice already includes the discount, so subtracting disc here would
    // count the same discount twice.
    const orderProfit = tot - itemCosts;
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
      expenses={[
        ...expensesRaw.map((e) => ({
          id: e.id,
          type: (e.type as string) || "expense",
          title: e.title,
          amount: Number(e.amount),
          category: e.category,
          paymentAccount: e.paymentAccount,
          date: e.date.toISOString(),
          notes: e.notes || null,
        })),
        ...purchaseInvoicesRaw.map((pi) => ({
          id: `pi-${pi.id}`,
          type: "expense",
          title: `فاتورة شراء: ${pi.invoiceNumber}${pi.supplier?.name ? ` (${pi.supplier.name})` : ""}`,
          amount: Number(pi.total),
          category: "purchase_invoice",
          paymentAccount: "cash",
          date: pi.invoiceDate.toISOString(),
          notes: pi.notes || null,
          isPurchaseInvoice: true,
        })),
      ]}
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
