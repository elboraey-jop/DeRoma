"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function createSupplierAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim() || null;
  const email = String(formData.get("email") || "").trim() || null;
  const address = String(formData.get("address") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;
  if (!name) throw new Error("Supplier name is required.");
  await prisma.supplier.create({
    data: { name, phone, email, address, notes },
  });
  revalidatePath("/admin/suppliers");
}

export async function deleteSupplierAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Supplier id is required.");
  await prisma.supplier.delete({ where: { id } });
  revalidatePath("/admin/suppliers");
  revalidatePath("/admin/products");
}
