"use server";

import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

type VariantInput = { sku: string; color: string; size: string; stock: number };
type ReviewInput = {
  customerName: string;
  rating: number;
  title?: string;
  body: string;
};

const productCategories = new Set(["shoes", "bags", "perfumes", "accessories"]);

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
  const category = String(formData.get("category") || "shoes").trim();
  const status = formData.get("status") === "draft" ? "draft" : "active";
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
    !productCategories.has(category) ||
    !Number.isFinite(price) ||
    price < 0
  )
    throw new Error("Product name, category, and a valid price are required.");
  if (!Number.isInteger(lowStockLimit) || lowStockLimit < 0)
    throw new Error("Low-stock warning must be a positive whole number.");
  if (
    !variants.length ||
    variants.some(
      (variant) =>
        !variant.sku?.trim() ||
        !variant.color?.trim() ||
        !variant.size?.trim() ||
        !Number.isInteger(Number(variant.stock)) ||
        Number(variant.stock) < 0,
    )
  )
    throw new Error("At least one complete stock variant is required.");
  if (
    new Set(variants.map((variant) => variant.sku.trim().toLowerCase()))
      .size !== variants.length
  )
    throw new Error("Variant SKUs must be unique.");
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
      category,
      description: String(formData.get("description") || "").trim() || null,
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
      status,
      rating,
      reviewsCount: reviews.length,
      variants: {
        create: variants.map((variant) => ({
          sku: variant.sku.trim(),
          color: variant.color.trim(),
          size: variant.size.trim(),
          stock: Number(variant.stock),
        })),
      },
      reviews: {
        create: reviews.map((review) => ({
          customerName: review.customerName.trim(),
          rating: Number(review.rating),
          title: review.title?.trim() || null,
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

  redirect(`/admin/products/${product.id}`);
}
