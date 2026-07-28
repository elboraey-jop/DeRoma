"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function createCatalogOptionAction(formData: FormData) {
  await requireAdmin();
  const category = String(formData.get("category") || "").trim();
  const type = String(formData.get("type") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const value = String(formData.get("value") || "").trim() || null;
  if (!category || !type || !name) throw new Error("Category, option type, and name are required.");
  await prisma.catalogOption.upsert({ where: { category_type_name: { category, type, name } }, create: { category, type, name, value }, update: { value, active: true } });
  revalidatePath("/admin/products/categories");
}

export async function deleteCatalogOptionAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (id) await prisma.catalogOption.delete({ where: { id } });
  revalidatePath("/admin/products/categories");
}
