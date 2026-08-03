"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

function customerData(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const phone2 = String(formData.get("phone2") || "").trim() || null;
  const email = String(formData.get("email") || "").trim().toLowerCase() || null;
  const governorate = String(formData.get("governorate") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const notes = String(formData.get("notes") || "").trim() || null;
  if (!name || !phone || !governorate || !city || !address) throw new Error("Name, phone, governorate, city, and address are required.");
  return { name, email, phone, phone2, governorate, city, address, notes };
}

export async function createCustomerAction(formData: FormData) {
  await requireAdmin();
  const data = customerData(formData);
  await prisma.customer.create({ data });
  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}

export async function updateCustomerAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const originalPhone = String(formData.get("originalPhone") || "").trim();
  const redirectTo = String(formData.get("redirectTo") || "/admin/customers");
  const data = customerData(formData);
  const current = id ? await prisma.customer.findUnique({ where: { id }, select: { id: true, phone: true } }) : originalPhone ? await prisma.customer.findUnique({ where: { phone: originalPhone }, select: { id: true, phone: true } }) : null;
  if (current) await prisma.customer.update({ where: { id: current.id }, data });
  else await prisma.customer.create({ data });
  revalidatePath("/admin/customers");
  if (current) revalidatePath(`/admin/customers/${encodeURIComponent(current.phone)}`);
  revalidatePath(`/admin/customers/${encodeURIComponent(data.phone)}`);
  redirect(redirectTo);
}
