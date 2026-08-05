"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

const productCategories = new Set(["shoes", "bags", "perfumes", "accessories"]);
type VariantInput = {
  id?: string;
  size: string;
  stock: number;
  price?: number | string | null;
  compareAtPrice?: number | string | null;
  wholesalePrice?: number | string | null;
  additionalCost?: number | string | null;
};
type ReviewInput = {
  id?: string;
  customerName: string;
  rating: number;
  title?: string;
  body: string;
};

function optionalNumber(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  return text ? Number(text) : null;
}

export async function updateProductAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const sku = String(formData.get("sku") || "")
    .trim()
    .toUpperCase();
  const category = String(formData.get("category") || "").trim();
  const price = Number(formData.get("price"));
  const lowStockLimit = Number(formData.get("lowStockLimit") || 2);
  if (!id || !name || !sku)
    throw new Error("Product id, name, and SKU are required.");
  if (!productCategories.has(category))
    throw new Error("A valid product category is required.");
  if (!Number.isFinite(price) || price < 0)
    throw new Error("Product price must be a valid positive number.");
  if (!Number.isInteger(lowStockLimit) || lowStockLimit < 0)
    throw new Error("Low-stock warning must be a whole number.");
  const images = String(formData.get("images") || "")
    .split("\n")
    .map((image) => image.trim())
    .filter(Boolean);
  let variants: VariantInput[];
  try {
    const parsed = JSON.parse(String(formData.get("variants") || "[]"));
    variants = Array.isArray(parsed) ? parsed : [];
  } catch {
    throw new Error("Invalid inventory data.");
  }
  if (
    !variants.length ||
    variants.some(
      (variant) =>
        !variant.size?.trim() ||
        !Number.isInteger(Number(variant.stock)) ||
        Number(variant.stock) < 0,
    )
  )
    throw new Error("At least one valid inventory option is required.");
  const relatedProductIds = [
    ...new Set(
      formData
        .getAll("relatedProductIds")
        .map(String)
        .filter((relatedId) => relatedId && relatedId !== id),
    ),
  ];
  let reviews: ReviewInput[] = [];
  if (formData.has("reviews")) {
    try {
      const parsed = JSON.parse(String(formData.get("reviews") || "[]"));
      reviews = Array.isArray(parsed) ? parsed : [];
    } catch {
      throw new Error("Invalid reviews data.");
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
  }
  await prisma.$transaction(async (tx) => {
    const existingVariants = await tx.productVariant.findMany({
      where: { productId: id },
      select: { id: true, size: true },
    });
    await tx.product.update({
      where: { id },
      data: {
        name,
        sku,
        description: String(formData.get("description") || "").trim() || null,
        category,
        status: ["active", "archived"].includes(
          String(formData.get("status") || ""),
        )
          ? String(formData.get("status"))
          : "active",
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
      },
    });
    for (const variant of variants) {
      const data = {
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
      };
      const matched = existingVariants.find(
        (item) => item.id === variant.id || item.size === variant.size.trim(),
      );
      if (matched)
        await tx.productVariant.update({ where: { id: matched.id }, data });
      else await tx.productVariant.create({ data: { productId: id, ...data } });
    }
    const keepIds = variants
      .map(
        (variant) =>
          existingVariants.find(
            (item) =>
              item.id === variant.id || item.size === variant.size.trim(),
          )?.id,
      )
      .filter(Boolean) as string[];
    const removable = existingVariants.filter(
      (variant) => !keepIds.includes(variant.id),
    );
    for (const variant of removable) {
      const used = await tx.orderItem.count({
        where: { variantId: variant.id },
      });
      if (!used) await tx.productVariant.delete({ where: { id: variant.id } });
    }
    await tx.productRelation.deleteMany({ where: { productId: id } });
    if (relatedProductIds.length)
      await tx.productRelation.createMany({
        data: relatedProductIds.map((relatedProductId) => ({
          productId: id,
          relatedProductId,
        })),
      });
    if (formData.has("reviews")) {
      const existingReviews = await tx.review.findMany({
        where: { productId: id },
        select: { id: true },
      });
      for (const review of reviews) {
        const reviewData = {
          customerName: review.customerName.trim(),
          rating: Number(review.rating),
          title: null,
          body: review.body.trim(),
        };
        if (review.id && existingReviews.some((item) => item.id === review.id))
          await tx.review.update({
            where: { id: review.id },
            data: reviewData,
          });
        else
          await tx.review.create({
            data: { productId: id, ...reviewData, status: "approved" },
          });
      }
      const keepReviewIds = reviews
        .map((review) => review.id)
        .filter(Boolean) as string[];
      await tx.review.deleteMany({
        where: { productId: id, id: { notIn: keepReviewIds } },
      });
      const aggregate = await tx.review.aggregate({
        where: { productId: id, status: "approved" },
        _avg: { rating: true },
        _count: { _all: true },
      });
      await tx.product.update({
        where: { id },
        data: {
          rating: aggregate._avg.rating || 0,
          reviewsCount: aggregate._count._all,
        },
      });
    }
  });
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  redirect(`/admin/products/${id}`);
}

export async function createVariantAction(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId") || "");
  const size = String(formData.get("size") || "").trim();
  const stock = Number(formData.get("stock") || 0);
  if (!productId || !size || !Number.isInteger(stock) || stock < 0)
    throw new Error("Variant details are incomplete.");
  await prisma.productVariant.create({
    data: { productId, size, stock },
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
      "Products used in orders cannot be deleted. Set the product status to Archived instead.",
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
