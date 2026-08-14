"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { checkRateLimit, sanitizeInput } from "@/lib/rateLimit";

export async function submitReviewAction(input: { productId: string; customerName: string; rating: number; body: string }) {
  const cleanName = sanitizeInput(input.customerName.trim());
  const cleanBody = sanitizeInput(input.body.trim());

  const rateCheck = await checkRateLimit(`review_${input.productId}_${cleanName}`, 3, 300);
  if (!rateCheck.success) {
    return { success: false, error: "Too many reviews submitted. Please wait a few minutes." };
  }

  if (!input.productId || !cleanName || !cleanBody || !Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    return { success: false, error: "Please complete the review with a valid rating." };
  }

  await prisma.review.create({
    data: {
      productId: input.productId,
      customerName: cleanName,
      rating: input.rating,
      body: cleanBody,
      status: "pending",
    },
  });

  revalidatePath(`/shop/${input.productId}`);
  return { success: true };
}

