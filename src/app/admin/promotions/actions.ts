"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

const promotionTypes = new Set(["percentage", "fixed", "free_shipping"]);
const promotionScopes = new Set([
  "order",
  "category",
  "product",
  "color",
  "material",
]);

function optionalNumber(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  if (!text) return null;
  const number = Number(text);
  if (!Number.isFinite(number) || number < 0)
    throw new Error("Numeric promotion values must be positive.");
  return number;
}

function optionalDate(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  if (!text) return null;
  const date = new Date(text);
  if (Number.isNaN(date.getTime()))
    throw new Error("Promotion date is invalid.");
  return date;
}

export async function createPromotionAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const code =
    String(formData.get("code") || "")
      .trim()
      .toUpperCase() || null;
  const type = String(formData.get("type") || "percentage");
  const scope = String(formData.get("scope") || "order");
  const value =
    type === "free_shipping" ? 0 : Number(formData.get("value") || 0);
  const targetValue = String(formData.get("targetValue") || "").trim() || null;
  const minimumOrderValue = optionalNumber(formData.get("minimumOrderValue"));
  const usageLimit = optionalNumber(formData.get("usageLimit"));
  const startsAt = optionalDate(formData.get("startsAt"));
  const endsAt = optionalDate(formData.get("endsAt"));

  if (
    !name ||
    !promotionTypes.has(type) ||
    !promotionScopes.has(scope) ||
    !Number.isFinite(value) ||
    value < 0
  )
    throw new Error("Complete valid promotion details are required.");
  if (type === "percentage" && value > 100)
    throw new Error("Percentage discounts cannot exceed 100%.");
  if (scope !== "order" && !targetValue)
    throw new Error("A target value is required for targeted promotions.");
  if (usageLimit !== null && !Number.isInteger(usageLimit))
    throw new Error("Usage limit must be a whole number.");
  if (startsAt && endsAt && endsAt <= startsAt)
    throw new Error("Promotion end date must be after its start date.");

  await prisma.promotion.create({
    data: {
      name,
      code,
      type,
      scope,
      value,
      targetValue,
      minimumOrderValue,
      usageLimit,
      startsAt,
      endsAt,
    },
  });
  revalidatePath("/admin/promotions");
}

export async function createAnnouncementAction(formData: FormData) {
  await requireAdmin();
  const text = String(formData.get("text") || "").trim();
  const backgroundColor = String(formData.get("backgroundColor") || "#942E3A");
  const textColor = String(formData.get("textColor") || "#FFF9EB");
  const moving = formData.get("moving") === "on";
  if (!text) throw new Error("Announcement text is required.");
  await prisma.$transaction([
    prisma.announcementBar.updateMany({ data: { active: false } }),
    prisma.announcementBar.create({
      data: { text, backgroundColor, textColor, moving, active: true },
    }),
  ]);
  revalidatePath("/admin/promotions");
  revalidatePath("/");
}

export async function togglePromotionAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const active = String(formData.get("active") || "false") === "true";
  if (id)
    await prisma.promotion.update({ where: { id }, data: { active: !active } });
  revalidatePath("/admin/promotions");
}

export async function deletePromotionAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Promotion id is required.");
  await prisma.promotion.delete({ where: { id } });
  revalidatePath("/admin/promotions");
}
