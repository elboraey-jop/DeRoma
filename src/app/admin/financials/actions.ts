"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { revalidatePath } from "next/cache";

function getSaturdayWeekBounds(date: Date) {
  // Expense dates are date-only values stored at UTC midnight. Use their UTC
  // calendar date, then construct the application's local Sat-Fri boundaries.
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const dayOfMonth = date.getUTCDate();
  const dayOfWeek = date.getUTCDay();
  const diffToSat = (dayOfWeek + 1) % 7;

  const startSat = new Date(year, month, dayOfMonth - diffToSat, 0, 0, 0, 0);
  const endFri = new Date(startSat);
  endFri.setDate(startSat.getDate() + 6);
  endFri.setHours(23, 59, 59, 999);

  const weekId = `STL-${startSat.getFullYear()}${String(startSat.getMonth() + 1).padStart(2, "0")}${String(startSat.getDate()).padStart(2, "0")}`;

  return { weekId, startSat, endFri };
}

function dateAround(value: Date, toleranceMs = 1000) {
  return {
    gte: new Date(value.getTime() - toleranceMs),
    lte: new Date(value.getTime() + toleranceMs),
  };
}

export async function createExpenseAction(formData: FormData) {
  await requireAdmin();

  const type = ((formData.get("type") as string) || "expense").trim();
  const title = (formData.get("title") as string)?.trim();
  const amountStr = formData.get("amount") as string;
  const category = (formData.get("category") as string) || (type === "income" ? "other_income" : "other");
  const paymentAccount = (formData.get("paymentAccount") as string) || "cash";
  const dateStr = formData.get("date") as string;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!title || !amountStr) {
    throw new Error("Title and Amount are required.");
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    throw new Error("Please enter a valid positive amount.");
  }

  const date = dateStr ? new Date(dateStr) : new Date();

  await (prisma.expense as any).create({
    data: {
      type,
      title,
      amount,
      category,
      paymentAccount,
      date,
      notes,
    },
  });

  revalidatePath("/admin/financials");
  return { success: true };
}

export async function updateExpenseAction(expenseId: string, formData: FormData) {
  await requireAdmin();

  if (!expenseId) {
    throw new Error("Transaction ID is required.");
  }

  const existing = await prisma.expense.findUnique({
    where: { id: expenseId },
  });

  if (!existing) {
    throw new Error("Transaction not found.");
  }

  const weekBounds = getSaturdayWeekBounds(existing.date);
  const lockedSettlement = await prisma.weeklySettlement.findFirst({
    where: {
      settlementNumber: weekBounds.weekId,
      startDate: dateAround(weekBounds.startSat),
      endDate: dateAround(weekBounds.endFri),
      status: "completed",
    },
  });

  if (lockedSettlement) {
    throw new Error("لا يمكن تعديل هذه الحركة لأنها تقع في أسبوع أُغلقت تسويته رسمياً.");
  }

  const type = ((formData.get("type") as string) || (existing as any).type || "expense").trim();
  const title = (formData.get("title") as string)?.trim() || existing.title;
  const amountStr = formData.get("amount") as string;
  const category = (formData.get("category") as string) || existing.category;
  const paymentAccount = (formData.get("paymentAccount") as string) || existing.paymentAccount;
  const dateStr = formData.get("date") as string;
  const notes = formData.has("notes") ? ((formData.get("notes") as string)?.trim() || null) : existing.notes;

  const amount = amountStr ? parseFloat(amountStr) : Number(existing.amount);
  if (isNaN(amount) || amount <= 0) {
    throw new Error("Please enter a valid positive amount.");
  }

  const date = dateStr ? new Date(dateStr) : existing.date;

  await (prisma.expense as any).update({
    where: { id: expenseId },
    data: {
      type,
      title,
      amount,
      category,
      paymentAccount,
      date,
      notes,
    },
  });

  revalidatePath("/admin/financials");
  return { success: true };
}

export async function deleteExpenseAction(expenseId: string) {
  await requireAdmin();

  if (!expenseId) {
    throw new Error("Expense ID is required.");
  }

  const existing = await prisma.expense.findUnique({
    where: { id: expenseId },
  });

  if (!existing) {
    return { success: true };
  }

  const weekBounds = getSaturdayWeekBounds(existing.date);
  const lockedSettlement = await prisma.weeklySettlement.findFirst({
    where: {
      settlementNumber: weekBounds.weekId,
      startDate: dateAround(weekBounds.startSat),
      endDate: dateAround(weekBounds.endFri),
      status: "completed",
    },
  });

  if (lockedSettlement) {
    throw new Error("لا يمكن حذف هذه الحركة لأنها تقع في أسبوع أُغلقت تسويته رسمياً.");
  }

  await prisma.expense.delete({
    where: { id: expenseId },
  });

  revalidatePath("/admin/financials");
  return { success: true };
}

export async function createSettlementAction(data: {
  settlementNumber?: string;
  startDate: string;
  endDate: string;
  totalSales: number;
  totalCOGS: number;
  totalExpenses: number;
  netProfit: number;
  cashTransferred: number;
  instapayTransferred: number;
  walletTransferred: number;
  notes?: string;
}) {
  await requireAdmin();

  const satDateStr = new Date(data.startDate).toISOString().slice(0, 10).replace(/-/g, "");
  const defaultNum = `STL-${satDateStr}`;
  const settlementNumber = data.settlementNumber || defaultNum;

  const existing = await prisma.weeklySettlement.findFirst({
    where: {
      OR: [
        { settlementNumber },
        {
          startDate: { gte: new Date(new Date(data.startDate).setHours(0, 0, 0, 0)) },
          endDate: { lte: new Date(new Date(data.endDate).setHours(23, 59, 59, 999)) },
        },
      ],
    },
  });

  if (existing) {
    await prisma.weeklySettlement.update({
      where: { id: existing.id },
      data: {
        settlementNumber,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        totalSales: data.totalSales,
        totalCOGS: data.totalCOGS,
        totalExpenses: data.totalExpenses,
        netProfit: data.netProfit,
        cashTransferred: data.cashTransferred,
        instapayTransferred: data.instapayTransferred,
        walletTransferred: data.walletTransferred,
        notes: data.notes || null,
        status: "completed",
      },
    });
  } else {
    await prisma.weeklySettlement.create({
      data: {
        settlementNumber,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        totalSales: data.totalSales,
        totalCOGS: data.totalCOGS,
        totalExpenses: data.totalExpenses,
        netProfit: data.netProfit,
        cashTransferred: data.cashTransferred,
        instapayTransferred: data.instapayTransferred,
        walletTransferred: data.walletTransferred,
        notes: data.notes || null,
        status: "completed",
      },
    });
  }

  revalidatePath("/admin/financials");
  return { success: true };
}

export async function createTransferAction(formData: FormData) {
  await requireAdmin();

  const fromAccount = formData.get("fromAccount") as string;
  const toAccount = formData.get("toAccount") as string;
  const amountStr = formData.get("amount") as string;
  const feeStr = formData.get("fee") as string;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!fromAccount || !toAccount || !amountStr) {
    throw new Error("From account, To account, and Amount are required.");
  }

  if (fromAccount === toAccount) {
    throw new Error("Source and destination accounts must be different.");
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    throw new Error("Please enter a valid positive amount.");
  }

  const fee = feeStr ? Math.max(0, parseFloat(feeStr) || 0) : 0;

  await (prisma as any).accountTransfer.create({
    data: {
      fromAccount,
      toAccount,
      amount,
      fee,
      notes,
    },
  });

  revalidatePath("/admin/financials");
  return { success: true };
}

