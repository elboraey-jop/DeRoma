"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function updateFreeShippingSettingsAction(
  prevStateOrFormData: any,
  formDataOrUndefined?: FormData,
) {
  try {
    await requireAdmin();
    let formData: FormData;
    if (formDataOrUndefined instanceof FormData) {
      formData = formDataOrUndefined;
    } else if (prevStateOrFormData instanceof FormData) {
      formData = prevStateOrFormData;
    } else {
      formData = new FormData();
    }

    const rawEnabled = formData.get("freeShippingEnabled");
    const enabled =
      rawEnabled === "on" || rawEnabled === "true" || rawEnabled === "1";
    const rawThreshold = String(
      formData.get("freeShippingThreshold") || "",
    ).trim();
    const threshold = rawThreshold !== "" ? Number(rawThreshold) : null;

    if (
      enabled &&
      (threshold === null || !Number.isFinite(threshold) || threshold < 0)
    ) {
      return {
        success: false,
        error: "يرجى إدخال مبلغ صحيح للحد الأدنى للشحن المجاني.",
      };
    }

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

    return {
      success: true,
      message: "تم حفظ إعدادات الشحن المجاني بنجاح.",
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "حدث خطأ أثناء حفظ الإعدادات.",
    };
  }
}

export async function createShippingZoneAction(
  _previousState: { success: boolean },
  formData: FormData,
) {
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
  return { success: true };
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
