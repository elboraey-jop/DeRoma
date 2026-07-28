"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function submitReviewAction(input: { productId: string; customerName: string; rating: number; body: string }) {
  const customerName = input.customerName.trim();
  const body = input.body.trim();
  if (!input.productId || !customerName || !body || !Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    return { success: false, error: "Please complete the review." };
  }
  await prisma.review.create({ data: { productId: input.productId, customerName, rating: input.rating, body, status: "pending" } });
  revalidatePath(`/shop/${input.productId}`);
  return { success: true };
}
