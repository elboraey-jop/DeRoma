"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

type VariantInput = {
  size: string;
  stock: number;
  price?: number | string;
  compareAtPrice?: number | string | null;
  wholesalePrice?: number | string | null;
  additionalCost?: number | string | null;
};
type ReviewInput = {
  customerName: string;
  rating: number;
  title?: string;
  body: string;
};

const productCategories = new Set(["shoes", "bags", "perfumes", "accessories"]);
const productStatuses = new Set(["active", "archived"]);

export async function updateProductDiscountAction(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId") || "").trim();
  const action = String(formData.get("action") || "apply");
  const discountType = String(formData.get("discountType") || "percentage");
  const discountValue = Number(formData.get("discountValue"));

  if (!productId) throw new Error("Product id is required.");

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { price: true, compareAtPrice: true },
  });
  if (!product) throw new Error("Product not found.");

  if (action === "remove") {
    const restoredPrice = product.compareAtPrice
      ? Number(product.compareAtPrice)
      : Number(product.price);
    await prisma.product.update({
      where: { id: productId },
      data: { price: restoredPrice, compareAtPrice: null },
    });
  } else {
    const basePrice = Number(product.price);
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      throw new Error("Discount value must be greater than zero.");
    }
    if (discountType === "percentage" && discountValue >= 100) {
      throw new Error("Percentage discount must be less than 100.");
    }
    if (discountType === "fixed" && discountValue >= basePrice) {
      throw new Error("Fixed discount must be less than the product price.");
    }

    const discountedPrice =
      discountType === "fixed"
        ? basePrice - discountValue
        : basePrice * (1 - discountValue / 100);
    const roundedPrice =
      Math.round((discountedPrice + Number.EPSILON) * 100) / 100;

    await prisma.product.update({
      where: { id: productId },
      data: { price: roundedPrice, compareAtPrice: basePrice },
    });
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath(`/shop/${productId}`);
}

export async function updateProductStatusAction(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId") || "").trim();
  const status = String(formData.get("status") || "").trim();

  if (!productId || !productStatuses.has(status)) {
    throw new Error("A valid product and status are required.");
  }

  await prisma.product.update({
    where: { id: productId },
    data: { status },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath(`/shop/${productId}`);
}

function optionalNumber(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  if (!text) return null;
  const number = Number(text);
  if (!Number.isFinite(number) || number < 0)
    throw new Error("Prices and costs must be valid positive numbers.");
  return number;
}

function parseJsonArray<T>(
  value: FormDataEntryValue | null,
  field: string,
): T[] {
  try {
    const parsed: unknown = JSON.parse(String(value || "[]"));
    if (!Array.isArray(parsed)) throw new Error();
    return parsed as T[];
  } catch {
    throw new Error(`Invalid ${field} data.`);
  }
}

export async function createProductAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const sku = String(formData.get("sku") || "")
    .trim()
    .toUpperCase();
  const category = String(formData.get("category") || "shoes").trim();
  const requestedStatus = String(formData.get("status") || "active");
  const status = productStatuses.has(requestedStatus)
    ? requestedStatus
    : "active";
  const price = Number(formData.get("price"));
  const lowStockLimit = Number(formData.get("lowStockLimit") || 2);
  const images = String(formData.get("images") || "")
    .split("\n")
    .map((image) => image.trim())
    .filter(Boolean);
  const variants = parseJsonArray<VariantInput>(
    formData.get("variants"),
    "variant",
  );
  const reviews = parseJsonArray<ReviewInput>(
    formData.get("reviews"),
    "review",
  );
  const relatedProductIds = [
    ...new Set(
      formData.getAll("relatedProductIds").map(String).filter(Boolean),
    ),
  ];

  if (
    !name ||
    !sku ||
    !productCategories.has(category) ||
    !Number.isFinite(price) ||
    price < 0
  )
    throw new Error(
      "Product name, SKU, category, and a valid price are required.",
    );
  if (!Number.isInteger(lowStockLimit) || lowStockLimit < 0)
    throw new Error("Low-stock warning must be a positive whole number.");
  if (
    !variants.length ||
    variants.some(
      (variant) =>
        !variant.size?.trim() ||
        !Number.isInteger(Number(variant.stock)) ||
        Number(variant.stock) < 0,
    )
  )
    throw new Error("At least one complete stock variant is required.");
  if (
    category === "perfumes" &&
    variants.some((variant) => {
      const variantPrice = Number(variant.price);
      return !Number.isFinite(variantPrice) || variantPrice < 0;
    })
  ) {
    throw new Error("Every perfume volume must have a valid selling price.");
  }
  if (
    reviews.some(
      (review) =>
        !review.customerName?.trim() ||
        !review.body?.trim() ||
        !Number.isInteger(Number(review.rating)) ||
        Number(review.rating) < 1 ||
        Number(review.rating) > 5,
    )
  )
    throw new Error("Review details are incomplete.");

  const rating = reviews.length
    ? reviews.reduce((total, review) => total + Number(review.rating), 0) /
      reviews.length
    : 0;
  const product = await prisma.product.create({
    data: {
      name,
      sku,
      category,
      description: String(formData.get("description") || "").trim() || null,
      subcategory: String(formData.get("subcategory") || "").trim() || null,
      brand: String(formData.get("brand") || "").trim() || null,
      color: String(formData.get("color") || "").trim() || null,
      material: String(formData.get("material") || "").trim() || null,
      price,
      compareAtPrice: optionalNumber(formData.get("compareAtPrice")),
      wholesalePrice: optionalNumber(formData.get("wholesalePrice")),
      additionalCost: optionalNumber(formData.get("additionalCost")),
      supplierId: String(formData.get("supplierId") || "").trim() || null,
      badge: String(formData.get("badge") || "").trim() || null,
      featured: formData.get("featured") === "on",
      bestSeller: formData.get("bestSeller") === "on",
      lowStockLimit,
      images,
      status,
      rating,
      reviewsCount: reviews.length,
      variants: {
        create: variants.map((variant) => ({
          size: variant.size.trim(),
          stock: Number(variant.stock),
          price:
            category === "perfumes"
              ? optionalNumber(
                  variant.price == null ? null : String(variant.price),
                )
              : null,
          compareAtPrice:
            category === "perfumes"
              ? optionalNumber(
                  variant.compareAtPrice == null
                    ? null
                    : String(variant.compareAtPrice),
                )
              : null,
          wholesalePrice:
            category === "perfumes"
              ? optionalNumber(
                  variant.wholesalePrice == null
                    ? null
                    : String(variant.wholesalePrice),
                )
              : null,
          additionalCost:
            category === "perfumes"
              ? optionalNumber(
                  variant.additionalCost == null
                    ? null
                    : String(variant.additionalCost),
                )
              : null,
        })),
      },
      reviews: {
        create: reviews.map((review) => ({
          customerName: review.customerName.trim(),
          rating: Number(review.rating),
          title: null,
          body: review.body.trim(),
          status: "approved",
        })),
      },
      relatedFrom: {
        create: relatedProductIds.map((relatedProductId) => ({
          relatedProductId,
        })),
      },
    },
  });

  const redirectTo = String(formData.get("redirectTo") || "").trim();
  redirect(
    redirectTo === "/admin/suppliers/invoices/new"
      ? `${redirectTo}?productId=${product.id}`
      : `/admin/products/${product.id}`,
  );
}

export async function createProductBatchAction(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId") || "").trim();
  const supplierMode = String(formData.get("supplierMode") || "same");
  const supplierName = String(formData.get("supplierName") || "").trim();
  const requestedWholesalePrice = Number(formData.get("wholesalePrice"));
  const requestedRetailPrice = Number(formData.get("retailPrice"));
  const wholesaleSame = formData.get("wholesaleSame") === "on";
  const retailSame = formData.get("retailSame") === "on";
  const enabledOptions = parseJsonRecord(formData.get("enabledOptions"));
  const batchPrices = parseJsonRecord(formData.get("batchPrices"));
  const notes = null;
  const requestedSupplierId = String(formData.get("supplierId") || "").trim();
  let quantities: Record<string, unknown>;
  try {
    quantities = JSON.parse(String(formData.get("quantities") || "{}"));
  } catch {
    throw new Error("Batch quantities are invalid.");
  }
  if (!productId) throw new Error("Product and valid prices are required.");

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true },
  });
  if (!product) throw new Error("Product not found.");
  const isPerfume = product.category.toLowerCase() === "perfumes";
  const wholesalePrice = wholesaleSame
    ? Number(product.wholesalePrice)
    : requestedWholesalePrice;
  const retailPrice = retailSame ? Number(product.price) : requestedRetailPrice;
  if (
    !isPerfume &&
    (!Number.isFinite(wholesalePrice) ||
      wholesalePrice < 0 ||
      !Number.isFinite(retailPrice) ||
      retailPrice < 0)
  )
    throw new Error("Product and valid prices are required.");
  const requestedItems = Object.entries(quantities)
    .filter(
      ([key, value]) =>
        enabledOptions[key] !== false &&
        Number.isInteger(Number(value)) &&
        Number(value) > 0,
    )
    .map(([key, value]) => ({ key, quantity: Number(value) }));
  if (!requestedItems.length)
    throw new Error("Add at least one unit to the batch.");
  if (supplierMode !== "new" && !requestedSupplierId && !product.supplierId)
    throw new Error("A supplier is required.");
  if (supplierMode === "new" && !supplierName)
    throw new Error("New supplier name is required.");

  const invoice = await prisma.$transaction(
    async (tx) => {
      const supplierId =
        supplierMode === "new"
          ? (await tx.supplier.create({ data: { name: supplierName } })).id
          : requestedSupplierId || product.supplierId!;
      const items: {
        variant: (typeof product.variants)[number];
        quantity: number;
        wholesalePrice: number;
        retailPrice: number;
      }[] = [];
      for (const requested of requestedItems) {
        const existing = product.variants.find(
          (variant) =>
            variant.id === requested.key ||
            variant.size ===
              (requested.key.startsWith("new-")
                ? requested.key.slice(4)
                : requested.key),
        );
        const variant =
          existing ||
          (await tx.productVariant.create({
            data: { productId, size: requested.key.slice(4), stock: 0 },
          }));
        const prices = isPerfume
          ? (batchPrices[requested.key] as
              { wholesalePrice?: unknown; retailPrice?: unknown } | undefined)
          : undefined;
        const itemWholesale = isPerfume
          ? Number(prices?.wholesalePrice)
          : wholesalePrice;
        const itemRetail = isPerfume
          ? Number(prices?.retailPrice)
          : retailPrice;
        if (
          !Number.isFinite(itemWholesale) ||
          itemWholesale < 0 ||
          !Number.isFinite(itemRetail) ||
          itemRetail < 0
        )
          throw new Error(
            "Enter wholesale and selling prices for every selected perfume volume.",
          );
        items.push({
          variant,
          quantity: requested.quantity,
          wholesalePrice: itemWholesale,
          retailPrice: itemRetail,
        });
      }
      const subtotal = items.reduce(
        (sum, item) => sum + item.quantity * item.wholesalePrice,
        0,
      );
      const created = await tx.purchaseInvoice.create({
        data: {
          invoiceNumber: `INV-${new Date().getFullYear()}-${randomUUID().slice(0, 6).toUpperCase()}`,
          supplierId,
          invoiceDate: new Date(),
          status: "received",
          subtotal,
          total: subtotal,
          notes,
          items: {
            create: items.map((item) => ({
              productId,
              variantId: item.variant.id,
              quantity: item.quantity,
              wholesalePrice: item.wholesalePrice,
              retailPrice: item.retailPrice,
              lineTotal: item.quantity * item.wholesalePrice,
            })),
          },
        },
        include: { items: true },
      });
      for (const item of created.items) {
        const input = items.find(
          (candidate) => candidate.variant.id === item.variantId,
        )!;
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: { increment: input.quantity },
            ...(isPerfume
              ? {
                  wholesalePrice: input.wholesalePrice,
                  price: input.retailPrice,
                }
              : {}),
          },
        });
        await tx.inventoryLot.create({
          data: {
            variantId: item.variantId,
            invoiceItemId: item.id,
            quantity: input.quantity,
            remaining: input.quantity,
            wholesalePrice: input.wholesalePrice,
            retailPrice: input.retailPrice,
          },
        });
      }
      const firstItem = items[0];
      await tx.product.update({
        where: { id: productId },
        data: {
          supplierId,
          wholesalePrice: firstItem.wholesalePrice,
          price:
            product.variants.reduce(
              (sum, variant) => sum + variant.stock,
              0,
            ) === 0
              ? firstItem.retailPrice
              : product.price,
        },
      });
      return created;
    },
    { maxWait: 20000, timeout: 60000 },
  );
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/suppliers");
  revalidatePath(`/admin/suppliers/invoices/${invoice.id}`);
  revalidatePath(`/shop/${productId}`);
  revalidatePath("/shop");
  redirect(`/admin/suppliers/invoices/${invoice.id}`);
}

function parseJsonRecord(
  value: FormDataEntryValue | null,
): Record<string, unknown> {
  try {
    const parsed = JSON.parse(String(value || "{}"));
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    throw new Error("Batch data is invalid.");
  }
}
