"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function updateReviewStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "pending");
  if (!id || !["pending", "approved", "rejected"].includes(status)) throw new Error("Invalid review update.");
  const review = await prisma.review.update({ where: { id }, data: { status } });
  const approved = await prisma.review.aggregate({ where: { productId: review.productId, status: "approved" }, _avg: { rating: true }, _count: { _all: true } });
  await prisma.product.update({ where: { id: review.productId }, data: { rating: approved._avg.rating || 0, reviewsCount: approved._count._all } });
  revalidatePath("/admin/reviews");
  revalidatePath(`/shop/${review.productId}`);
}

export async function deleteReviewAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const review = await prisma.review.delete({ where: { id } });
  const approved = await prisma.review.aggregate({ where: { productId: review.productId, status: "approved" }, _avg: { rating: true }, _count: { _all: true } });
  await prisma.product.update({ where: { id: review.productId }, data: { rating: approved._avg.rating || 0, reviewsCount: approved._count._all } });
  revalidatePath("/admin/reviews");
  revalidatePath(`/shop/${review.productId}`);
}
