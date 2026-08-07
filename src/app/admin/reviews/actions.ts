"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

async function syncProductRating(productId: string) {
  const approved = await prisma.review.aggregate({
    where: { productId, status: "approved" },
    _avg: { rating: true },
    _count: { _all: true },
  });
  await prisma.product.update({
    where: { id: productId },
    data: { rating: approved._avg.rating || 0, reviewsCount: approved._count._all },
  });
}

function reviewFields(formData: FormData) {
  const customerName = String(formData.get("customerName") || "").trim();
  const rating = Number(formData.get("rating"));
  const body = String(formData.get("body") || "").trim();
  if (!customerName || !body || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Complete the review details with a rating from 1 to 5.");
  }
  return {
    customerName,
    customerPhone: null,
    rating,
    title: null,
    body,
    status: String(formData.get("status") || "approved"),
    verifiedPurchase: formData.get("verifiedPurchase") === "on",
    showOnHome: formData.get("showOnHome") === "on",
  };
}

export async function createReviewAction(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId") || "");
  if (!productId) throw new Error("Choose a product for this review.");
  const fields = reviewFields(formData);
  if (!["pending", "approved", "rejected"].includes(fields.status)) throw new Error("Invalid review status.");
  await prisma.review.create({ data: { productId, ...fields } });
  await syncProductRating(productId);
  revalidatePath("/admin/reviews");
  revalidatePath("/");
  revalidatePath(`/shop/${productId}`);
}

export async function updateReviewAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const productId = String(formData.get("productId") || "");
  if (!id || !productId) throw new Error("Invalid review update.");
  const oldReview = await prisma.review.findUnique({ where: { id }, select: { productId: true } });
  if (!oldReview) throw new Error("Review not found.");
  const fields = reviewFields(formData);
  if (!["pending", "approved", "rejected"].includes(fields.status)) throw new Error("Invalid review status.");
  await prisma.review.update({ where: { id }, data: { productId, ...fields } });
  await syncProductRating(productId);
  if (oldReview.productId !== productId) await syncProductRating(oldReview.productId);
  revalidatePath("/admin/reviews");
  revalidatePath("/");
  revalidatePath(`/shop/${productId}`);
  revalidatePath(`/shop/${oldReview.productId}`);
}

export async function updateReviewStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "pending");
  if (!id || !["pending", "approved", "rejected"].includes(status)) throw new Error("Invalid review update.");
  const review = await prisma.review.update({ where: { id }, data: { status } });
  await syncProductRating(review.productId);
  revalidatePath("/admin/reviews");
  revalidatePath("/");
  revalidatePath(`/shop/${review.productId}`);
}

export async function toggleShowOnHomeAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const showOnHome = formData.get("showOnHome") === "true";
  if (!id) return;
  const review = await prisma.review.update({ where: { id }, data: { showOnHome } });
  revalidatePath("/admin/reviews");
  revalidatePath("/");
  revalidatePath(`/shop/${review.productId}`);
}

export async function deleteReviewAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const review = await prisma.review.delete({ where: { id } });
  await syncProductRating(review.productId);
  revalidatePath("/admin/reviews");
  revalidatePath("/");
  revalidatePath(`/shop/${review.productId}`);
}
