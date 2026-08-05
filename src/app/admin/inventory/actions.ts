"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function updateVariantStockAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("variantId") || "");
  const stock = Number(formData.get("stock"));
  if (!id || !Number.isInteger(stock) || stock < 0) {
    throw new Error("Stock must be a non-negative whole number.");
  }

  const variant = await prisma.productVariant.update({
    where: { id },
    data: { stock },
    select: { productId: true },
  });

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath(`/shop/${variant.productId}`);
}

export async function bulkRestockVariantsAction(variantIds: string[], addQuantity: number) {
  await requireAdmin();
  if (!variantIds || !variantIds.length || !Number.isInteger(addQuantity) || addQuantity <= 0) {
    return { success: false, error: "Invalid variant selection or quantity." };
  }

  try {
    await prisma.$transaction(
      variantIds.map((id) =>
        prisma.productVariant.update({
          where: { id },
          data: { stock: { increment: addQuantity } },
        })
      )
    );

    revalidatePath("/admin/inventory");
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return { success: true };
  } catch (error) {
    console.error("bulkRestockVariantsAction error:", error);
    return { success: false, error: "Failed to update selected variants stock." };
  }
}

export async function bulkUpdateProductsStatusAction(productIds: string[], status: "active" | "archived") {
  await requireAdmin();
  if (!productIds || !productIds.length || (status !== "active" && status !== "archived")) {
    return { success: false, error: "Invalid product selection or status." };
  }

  try {
    await prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: { status },
    });

    revalidatePath("/admin/inventory");
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return { success: true };
  } catch (error) {
    console.error("bulkUpdateProductsStatusAction error:", error);
    return { success: false, error: "Failed to update product statuses." };
  }
}

export async function createStockAuditAction(data: {
  title: string;
  notes?: string;
  items: Array<{
    variantId: string;
    productName: string;
    sku?: string;
    size: string;
    color?: string;
    expectedStock: number;
    actualStock: number;
    unitPrice: number;
    notes?: string;
  }>;
}) {
  const admin = await requireAdmin();

  if (!data.items || !data.items.length) {
    return { success: false, error: "Audit must contain at least one item." };
  }

  try {
    const auditCount = await prisma.stockAudit.count();
    const auditNumber = `AUD-${String(auditCount + 1).padStart(4, "0")}`;

    let totalExpected = 0;
    let totalActual = 0;
    let totalDiscrepancy = 0;
    let discrepancyValue = 0;

    const itemsData = data.items.map((item) => {
      const diff = item.actualStock - item.expectedStock;
      totalExpected += item.expectedStock;
      totalActual += item.actualStock;
      totalDiscrepancy += Math.abs(diff);
      discrepancyValue += diff * item.unitPrice;

      return {
        variantId: item.variantId,
        productName: item.productName,
        sku: item.sku || "",
        size: item.size,
        color: item.color || "",
        expectedStock: item.expectedStock,
        actualStock: item.actualStock,
        discrepancy: diff,
        unitPrice: item.unitPrice,
        notes: item.notes || "",
      };
    });

    const audit = await prisma.stockAudit.create({
      data: {
        auditNumber,
        title: data.title || `Stock Audit ${auditNumber}`,
        notes: data.notes || "",
        status: "completed",
        auditedBy: admin.name || admin.email || "Admin",
        totalExpected,
        totalActual,
        totalDiscrepancy,
        discrepancyValue,
        items: {
          create: itemsData,
        },
      },
    });

    // Update actual variant stocks in DB
    await prisma.$transaction(
      data.items.map((item) =>
        prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: item.actualStock },
        })
      )
    );

    revalidatePath("/admin/inventory");
    revalidatePath("/admin/inventory/audits");
    revalidatePath("/admin/products");
    revalidatePath("/shop");

    return { success: true, auditId: audit.id, auditNumber: audit.auditNumber };
  } catch (error) {
    console.error("createStockAuditAction error:", error);
    return { success: false, error: "Failed to save stock audit session." };
  }
}
