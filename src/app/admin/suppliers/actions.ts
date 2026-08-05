"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

type InvoiceItemInput = {
  variantId: string;
  quantity: number;
  wholesalePrice: number;
  retailPrice: number;
  notes?: string;
};

async function createSupplierRecord(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim() || null;
  const email = String(formData.get("email") || "").trim() || null;
  const address = String(formData.get("address") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;
  if (!name) throw new Error("Supplier name is required.");
  const supplier = await prisma.supplier.create({
    data: { name, phone, email, address, notes },
  });
  return supplier;
}

export async function createSupplierAction(formData: FormData) {
  await createSupplierRecord(formData);
  revalidatePath("/admin/suppliers");
  revalidatePath("/admin/products/new");
}

export async function createSupplierWithResultAction(formData: FormData) {
  const supplier = await createSupplierRecord(formData);
  revalidatePath("/admin/suppliers");
  revalidatePath("/admin/products/new");
  return { id: supplier.id, name: supplier.name };
}

export async function deleteSupplierAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Supplier id is required.");
  const count = await prisma.purchaseInvoice.count({ where: { supplierId: id } });
  if (count > 0) {
    throw new Error(`Cannot delete supplier with ${count} existing purchase invoice(s).`);
  }
  await prisma.supplier.delete({ where: { id } });
  revalidatePath("/admin/suppliers");
  revalidatePath("/admin/products");
}

function parseInvoiceItems(value: FormDataEntryValue | null): InvoiceItemInput[] {
  try {
    const items: unknown = JSON.parse(String(value || "[]"));
    if (!Array.isArray(items)) throw new Error();
    return items as InvoiceItemInput[];
  } catch {
    throw new Error("Invoice products are invalid.");
  }
}

export async function createPurchaseInvoiceAction(formData: FormData) {
  await requireAdmin();
  const supplierId = String(formData.get("supplierId") || "").trim();
  const invoiceDate = new Date(String(formData.get("invoiceDate") || ""));
  const reference = String(formData.get("reference") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;
  const shippingCost = Number(formData.get("shippingCost") || 0);
  const discount = Number(formData.get("discount") || 0);
  const items = parseInvoiceItems(formData.get("items"));

  if (!supplierId || Number.isNaN(invoiceDate.getTime())) throw new Error("Supplier and invoice date are required.");
  if ([shippingCost, discount].some((value) => !Number.isFinite(value) || value < 0)) throw new Error("Invoice totals must be valid positive numbers.");
  if (!items.length || items.some((item) => !item.variantId || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1 || !Number.isFinite(Number(item.wholesalePrice)) || Number(item.wholesalePrice) < 0 || !Number.isFinite(Number(item.retailPrice)) || Number(item.retailPrice) < 0)) throw new Error("Add at least one complete invoice product.");
  if (new Set(items.map((item) => item.variantId)).size !== items.length) throw new Error("Each product variant can only be added once per invoice.");

  const variants = await prisma.productVariant.findMany({ where: { id: { in: items.map((item) => item.variantId) } }, include: { product: true } });
  const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
  if (!supplier || variants.length !== items.length) throw new Error("Supplier or one of the selected variants no longer exists.");

  const subtotal = items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.wholesalePrice), 0);
  const total = Math.max(0, subtotal + shippingCost - discount);
  const amountPaid = total;
  const status = "paid";
  const dueDate = null;
  const invoiceNumber = `INV-${new Date().getFullYear()}-${randomUUID().slice(0, 6).toUpperCase()}`;

  const invoice = await prisma.$transaction(async (tx) => {
    const created = await tx.purchaseInvoice.create({
      data: {
        invoiceNumber, supplierId, invoiceDate, dueDate, reference, notes, status, subtotal, shippingCost, discount, total, amountPaid,
        items: { create: items.map((item) => { const variant = variants.find((candidate) => candidate.id === item.variantId)!; return { productId: variant.productId, variantId: variant.id, quantity: Number(item.quantity), wholesalePrice: Number(item.wholesalePrice), retailPrice: Number(item.retailPrice), lineTotal: Number(item.quantity) * Number(item.wholesalePrice), notes: item.notes?.trim() || null }; }) },
      },
      include: { items: true },
    });
    for (const item of created.items) {
      const input = items.find((candidate) => candidate.variantId === item.variantId)!;
      const variant = variants.find((candidate) => candidate.id === item.variantId)!;
      await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
      await tx.inventoryLot.create({ data: { variantId: item.variantId, invoiceItemId: item.id, quantity: item.quantity, remaining: item.quantity, wholesalePrice: input.wholesalePrice, retailPrice: input.retailPrice } });
      if (variant.stock === 0) await tx.product.update({ where: { id: variant.productId }, data: { price: input.retailPrice, wholesalePrice: input.wholesalePrice } });
    }
    return created;
  });

  revalidatePath("/admin/suppliers");
  revalidatePath(`/admin/suppliers/${supplierId}`);
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect(`/admin/suppliers/invoices/${invoice.id}`);
}
