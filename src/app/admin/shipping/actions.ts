"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function updateFreeShippingSettingsAction(formData: FormData) {
  await requireAdmin();
  const enabled = formData.get("freeShippingEnabled") === "on";
  const rawThreshold = String(
    formData.get("freeShippingThreshold") || "",
  ).trim();
  const threshold = rawThreshold ? Number(rawThreshold) : null;
  if (
    enabled &&
    (threshold === null || !Number.isFinite(threshold) || threshold < 0)
  )
    throw new Error("Enter a valid minimum order value for free shipping.");
  await prisma.shippingSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      freeShippingEnabled: enabled,
      freeShippingThreshold: threshold,
    },
    update: { freeShippingEnabled: enabled, freeShippingThreshold: threshold },
  });
  revalidatePath("/admin/shipping");
  revalidatePath("/api/shipping");
  revalidatePath("/checkout");
}

export async function createShippingZoneAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const governorates = String(formData.get("governorates") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const fee = Number(formData.get("fee"));
  const estimatedDays = null;
  const freeShippingThreshold = null;
  const exceptions = parseExceptions(formData);
  if (!name || governorates.length === 0 || !Number.isFinite(fee) || fee < 0)
    throw new Error("Zone name, governorates, and a valid fee are required.");
  await prisma.shippingZone.create({
    data: {
      name,
      governorates: [...new Set(governorates)],
      fee,
      estimatedDays,
      freeShippingThreshold,
      exceptions: { create: exceptions },
    },
  });
  revalidatePath("/admin/shipping");
  revalidatePath("/api/shipping");
  revalidatePath("/checkout");
}

function parseExceptions(formData: FormData) {
  try {
    const raw = JSON.parse(String(formData.get("exceptionsJson") || "[]"));
    if (!Array.isArray(raw)) return [];
    return raw
      .filter(
        (item): item is { city: string; fee: number } =>
          typeof item?.city === "string" &&
          item.city.trim() &&
          Number.isFinite(Number(item.fee)) &&
          Number(item.fee) >= 0,
      )
      .map((item) => ({ city: item.city.trim(), fee: Number(item.fee) }));
  } catch {
    return [];
  }
}

export async function updateShippingZoneAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const governorates = String(formData.get("governorates") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const fee = Number(formData.get("fee"));
  const exceptions = parseExceptions(formData);
  if (!id || !name || !governorates.length || !Number.isFinite(fee) || fee < 0)
    throw new Error("Zone name, governorates, and a valid fee are required.");
  await prisma.shippingZone.update({
    where: { id },
    data: {
      name,
      governorates: [...new Set(governorates)],
      fee,
      exceptions: { deleteMany: {}, create: exceptions },
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
