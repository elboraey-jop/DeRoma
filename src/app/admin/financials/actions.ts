"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { revalidatePath } from "next/cache";

export async function createExpenseAction(formData: FormData) {
  await requireAdmin();

  const title = (formData.get("title") as string)?.trim();
  const amountStr = formData.get("amount") as string;
  const category = (formData.get("category") as string) || "other";
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

  await prisma.expense.create({
    data: {
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

  await prisma.expense.delete({
    where: { id: expenseId },
  });

  revalidatePath("/admin/financials");
  return { success: true };
}

export async function createSettlementAction(data: {
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

  const count = await prisma.weeklySettlement.count();
  const sequenceStr = String(count + 1).padStart(4, "0");
  const dateTag = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const settlementNumber = `STL-${dateTag}-${sequenceStr}`;

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


