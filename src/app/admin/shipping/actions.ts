"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function createShippingZoneAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const governorates = String(formData.get("governorates") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const fee = Number(formData.get("fee"));
  const estimatedDays =
    String(formData.get("estimatedDays") || "").trim() || null;
  const threshold = String(formData.get("freeShippingThreshold") || "").trim();
  const freeShippingThreshold = threshold ? Number(threshold) : null;
  if (
    !name ||
    governorates.length === 0 ||
    !Number.isFinite(fee) ||
    fee < 0 ||
    (freeShippingThreshold !== null &&
      (!Number.isFinite(freeShippingThreshold) || freeShippingThreshold < 0))
  )
    throw new Error("Zone name, governorates, and valid fees are required.");
  await prisma.shippingZone.create({
    data: {
      name,
      governorates: [...new Set(governorates)],
      fee,
      estimatedDays,
      freeShippingThreshold,
    },
  });
  revalidatePath("/admin/shipping");
  revalidatePath("/api/shipping");
  revalidatePath("/checkout");
}

export async function toggleShippingZoneAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const active = String(formData.get("active") || "false") === "true";
  if (id)
    await prisma.shippingZone.update({
      where: { id },
      data: { active: !active },
    });
  revalidatePath("/admin/shipping");
  revalidatePath("/api/shipping");
  revalidatePath("/checkout");
}

export async function deleteShippingZoneAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Shipping zone id is required.");
  await prisma.shippingZone.delete({ where: { id } });
  revalidatePath("/admin/shipping");
  revalidatePath("/api/shipping");
  revalidatePath("/checkout");
}
