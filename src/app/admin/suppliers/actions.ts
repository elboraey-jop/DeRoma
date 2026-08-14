"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

type InvoiceItemInput = {
  variantId: string;
  productId?: string;
  variantSize?: string;
  quantity: number;
  wholesalePrice: number;
  retailPrice: number;
  notes?: string;
};

type NewProductVariantInput = {
  size: string;
  stock: number;
  price?: number | string;
  compareAtPrice?: number | string | null;
  wholesalePrice?: number | string | null;
  additionalCost?: number | string | null;
};

type NewProductInput = {
  name: string;
  sku: string;
  category: string;
  description?: string;
  subcategory?: string;
  brand?: string;
  color?: string;
  material?: string;
  price: string | number;
  compareAtPrice?: string | number;
  wholesalePrice?: string | number;
  additionalCost?: string | number;
  supplierId?: string;
  badge?: string;
  featured?: boolean;
  bestSeller?: boolean;
  lowStockLimit: string | number;
  images?: string[];
  status?: string;
  variants: NewProductVariantInput[];
  reviews?: { customerName: string; rating: number; body: string }[];
  relatedProductIds?: string[];
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

function parseNewProduct(value: FormDataEntryValue | null): NewProductInput | null {
  if (!value || !String(value).trim()) return null;
  try {
    const parsed = JSON.parse(String(value)) as NewProductInput;
    if (!parsed || typeof parsed !== "object") throw new Error();
    return parsed;
  } catch {
    throw new Error("New product data is invalid.");
  }
}

function optionalInvoiceNumber(value: string | number | null | undefined) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const number = Number(text);
  if (!Number.isFinite(number) || number < 0) throw new Error("New product prices must be valid.");
  return number;
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
  const newProduct = parseNewProduct(formData.get("newProduct"));

  if (!supplierId || Number.isNaN(invoiceDate.getTime())) throw new Error("Supplier and invoice date are required.");
  if ([shippingCost, discount].some((value) => !Number.isFinite(value) || value < 0)) throw new Error("Invoice totals must be valid positive numbers.");
  if (!items.length && !newProduct) throw new Error("Add at least one complete invoice product.");
  if (items.some((item) => !item.variantId || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1 || !Number.isFinite(Number(item.wholesalePrice)) || Number(item.wholesalePrice) < 0 || !Number.isFinite(Number(item.retailPrice)) || Number(item.retailPrice) < 0)) throw new Error("Add at least one complete invoice product.");
  if (new Set(items.map((item) => item.variantId)).size !== items.length) throw new Error("Each product variant can only be added once per invoice.");
  if (newProduct) {
    const productPrice = Number(newProduct.price);
    const lowStockLimit = Number(newProduct.lowStockLimit);
    if (!newProduct.name?.trim() || !newProduct.sku?.trim() || !["shoes", "bags", "perfumes", "accessories"].includes(newProduct.category) || !Number.isFinite(productPrice) || productPrice < 0) throw new Error("New product details are incomplete.");
    if (!Number.isInteger(lowStockLimit) || lowStockLimit < 0) throw new Error("New product low-stock warning is invalid.");
    if (!Array.isArray(newProduct.variants) || !newProduct.variants.length || newProduct.variants.some((variant) => !variant.size?.trim() || !Number.isInteger(Number(variant.stock)) || Number(variant.stock) < 0)) throw new Error("New product stock variants are incomplete.");
    if (!newProduct.variants.some((variant) => Number(variant.stock) > 0)) throw new Error("Add at least one unit for the new product.");
  }

  const existingVariantIds = items.filter((item) => !item.variantId.startsWith("new:")).map((item) => item.variantId);
  const variants = await prisma.productVariant.findMany({ where: { id: { in: existingVariantIds } }, include: { product: true } });
  const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
  if (!supplier || variants.length !== existingVariantIds.length) throw new Error("Supplier or one of the selected variants no longer exists.");

  const status = "paid";
  const dueDate = null;
  const invoiceNumber = `INV-${new Date().getFullYear()}-${randomUUID().slice(0, 6).toUpperCase()}`;

  const invoice = await prisma.$transaction(async (tx) => {
    let invoiceItems = [...items];
    let allVariants = [...variants];
    const virtualVariantIds = new Map<string, string>();

    for (const item of items.filter((candidate) => candidate.variantId.startsWith("new:"))) {
      if (!item.productId || !item.variantSize?.trim()) throw new Error("A new batch size is incomplete.");
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new Error("The selected batch product no longer exists.");
      const createdVariant = await tx.productVariant.create({
        data: { productId: product.id, size: item.variantSize.trim(), stock: 0 },
        include: { product: true },
      });
      allVariants = [...allVariants, createdVariant];
      virtualVariantIds.set(item.variantId, createdVariant.id);
    }
    invoiceItems = invoiceItems.map((item) => ({
      ...item,
      variantId: virtualVariantIds.get(item.variantId) || item.variantId,
    }));

    if (newProduct) {
      const createdProduct = await tx.product.create({
        data: {
          name: newProduct.name.trim(),
          sku: newProduct.sku.trim().toUpperCase(),
          category: newProduct.category,
          description: newProduct.description?.trim() || null,
          subcategory: newProduct.subcategory?.trim() || null,
          brand: newProduct.brand?.trim() || null,
          color: newProduct.color?.trim() || null,
          material: newProduct.material?.trim() || null,
          price: Number(newProduct.price),
          compareAtPrice: optionalInvoiceNumber(newProduct.compareAtPrice),
          wholesalePrice: optionalInvoiceNumber(newProduct.wholesalePrice),
          additionalCost: optionalInvoiceNumber(newProduct.additionalCost),
          supplierId: newProduct.supplierId?.trim() || supplierId,
          badge: newProduct.badge?.trim() || null,
          featured: Boolean(newProduct.featured),
          bestSeller: Boolean(newProduct.bestSeller),
          lowStockLimit: Number(newProduct.lowStockLimit),
          images: Array.isArray(newProduct.images) ? newProduct.images : [],
          status: newProduct.status === "archived" ? "archived" : "active",
          variants: {
            create: newProduct.variants.map((variant) => ({
              size: variant.size.trim(),
              stock: 0,
              price: newProduct.category === "perfumes" ? optionalInvoiceNumber(variant.price) : null,
              compareAtPrice: newProduct.category === "perfumes" ? optionalInvoiceNumber(variant.compareAtPrice) : null,
              wholesalePrice: newProduct.category === "perfumes" ? optionalInvoiceNumber(variant.wholesalePrice) : null,
              additionalCost: newProduct.category === "perfumes" ? optionalInvoiceNumber(variant.additionalCost) : null,
            })),
          },
          reviews: {
            create: (newProduct.reviews || []).map((review) => ({
              customerName: review.customerName.trim(),
              rating: Number(review.rating),
              title: null,
              body: review.body.trim(),
              status: "approved",
            })),
          },
          relatedFrom: {
            create: (newProduct.relatedProductIds || []).map((relatedProductId) => ({ relatedProductId })),
          },
        },
        include: { variants: true },
      });
      allVariants = [...allVariants, ...createdProduct.variants.map((variant) => ({ ...variant, product: createdProduct }))];
      invoiceItems = [
        ...invoiceItems,
        ...createdProduct.variants
          .map((variant, index) => {
            const input = newProduct.variants[index];
            return {
              variantId: variant.id,
              quantity: Number(input.stock),
              wholesalePrice: Number(input.wholesalePrice ?? newProduct.wholesalePrice ?? 0),
              retailPrice: Number(input.price ?? newProduct.price),
              notes: undefined,
            };
          })
          .filter((item) => item.quantity > 0),
      ];
    }
    const subtotal = invoiceItems.reduce((sum, item) => sum + Number(item.quantity) * Number(item.wholesalePrice), 0);
    const total = Math.max(0, subtotal + shippingCost - discount);
    const amountPaid = total;
    const created = await tx.purchaseInvoice.create({
      data: {
        invoiceNumber, supplierId, invoiceDate, dueDate, reference, notes, status, subtotal, shippingCost, discount, total, amountPaid,
        items: { create: invoiceItems.map((item) => { const variant = allVariants.find((candidate) => candidate.id === item.variantId)!; return { productId: variant.productId, variantId: variant.id, quantity: Number(item.quantity), wholesalePrice: Number(item.wholesalePrice), retailPrice: Number(item.retailPrice), lineTotal: Number(item.quantity) * Number(item.wholesalePrice), notes: item.notes?.trim() || null }; }) },
      },
      include: { items: true },
    });
    for (const item of created.items) {
      const input = invoiceItems.find((candidate) => candidate.variantId === item.variantId)!;
      const variant = allVariants.find((candidate) => candidate.id === item.variantId)!;
      await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
      await tx.inventoryLot.create({ data: { variantId: item.variantId, invoiceItemId: item.id, quantity: item.quantity, remaining: item.quantity, wholesalePrice: input.wholesalePrice, retailPrice: input.retailPrice } });
      if (variant.stock === 0) await tx.product.update({ where: { id: variant.productId }, data: { price: input.retailPrice, wholesalePrice: input.wholesalePrice } });
    }
    return created;
  }, { maxWait: 20000, timeout: 120000 });

  revalidatePath("/admin/suppliers");
  revalidatePath(`/admin/suppliers/${supplierId}`);
  revalidatePath("/admin/financials");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect(`/admin/suppliers/invoices/${invoice.id}`);
}
