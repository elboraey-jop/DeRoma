"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

const productCategories = new Set(["shoes", "bags", "perfumes", "accessories"]);

function optionalNumber(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  return text ? Number(text) : null;
}

export async function updateProductAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const price = Number(formData.get("price"));
  const lowStockLimit = Number(formData.get("lowStockLimit") || 2);
  if (!id || !name) throw new Error("Product id and name are required.");
  if (!productCategories.has(category)) throw new Error("A valid product category is required.");
  if (!Number.isFinite(price) || price < 0) throw new Error("Product price must be a valid positive number.");
  if (!Number.isInteger(lowStockLimit) || lowStockLimit < 0) throw new Error("Low-stock warning must be a whole number.");
  const images = String(formData.get("images") || "")
    .split("\n")
    .map((image) => image.trim())
    .filter(Boolean);
  await prisma.product.update({
    where: { id },
    data: {
      name,
      description: String(formData.get("description") || "").trim() || null,
      category,
      status: formData.get("status") === "draft" ? "draft" : "active",
      subcategory: String(formData.get("subcategory") || "").trim() || null,
      brand: String(formData.get("brand") || "").trim() || null,
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
    },
  });
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  redirect(`/admin/products/${id}`);
}

export async function createVariantAction(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId") || "");
  const size = String(formData.get("size") || "").trim();
  const color = String(formData.get("color") || "").trim();
  const sku = String(formData.get("sku") || "").trim();
  const stock = Number(formData.get("stock") || 0);
  if (
    !productId ||
    !size ||
    !color ||
    !sku ||
    !Number.isInteger(stock) ||
    stock < 0
  )
    throw new Error("Variant details are incomplete.");
  await prisma.productVariant.create({
    data: { productId, size, color, sku, stock },
  });
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteVariantAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const productId = String(formData.get("productId") || "");
  if (!id || !productId)
    throw new Error("Variant id and product id are required.");
  const usedInOrders = await prisma.orderItem.count({
    where: { variantId: id },
  });
  if (usedInOrders)
    throw new Error(
      "This variant is used in existing orders and cannot be deleted.",
    );
  await prisma.productVariant.delete({ where: { id } });
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/inventory");
}

export async function createProductReviewAction(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId") || "");
  const customerName = String(formData.get("customerName") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const rating = Number(formData.get("rating"));
  if (
    !productId ||
    !customerName ||
    !body ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  )
    throw new Error("Complete review details are required.");
  await prisma.review.create({
    data: {
      productId,
      customerName,
      body,
      rating,
      title: String(formData.get("title") || "").trim() || null,
      status: "approved",
      verifiedPurchase: formData.get("verifiedPurchase") === "on",
    },
  });
  const approved = await prisma.review.aggregate({
    where: { productId, status: "approved" },
    _avg: { rating: true },
    _count: { _all: true },
  });
  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: approved._avg.rating || 0,
      reviewsCount: approved._count._all,
    },
  });
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath(`/shop/${productId}`);
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId") || "");
  if (!productId) throw new Error("Product id is required.");
  const orderCount = await prisma.orderItem.count({ where: { productId } });
  if (orderCount)
    throw new Error(
      "Products used in orders cannot be deleted. Set the product to draft instead.",
    );
  await prisma.product.delete({ where: { id: productId } });
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function setProductRelationsAction(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId") || "");
  const relatedProductIds = formData
    .getAll("relatedProductIds")
    .map(String)
    .filter((id) => id && id !== productId);
  if (!productId) throw new Error("Product id is required.");
  await prisma.$transaction([
    prisma.productRelation.deleteMany({ where: { productId } }),
    ...relatedProductIds.map((relatedProductId) =>
      prisma.productRelation.create({ data: { productId, relatedProductId } }),
    ),
  ]);
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath(`/shop/${productId}`);
}
