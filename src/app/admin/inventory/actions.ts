"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function updateVariantStockAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("variantId") || "");
  const stock = Number(formData.get("stock"));
  if (!id || !Number.isInteger(stock) || stock < 0)
    throw new Error("Stock must be a non-negative whole number.");
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
