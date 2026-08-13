"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function createTeamMemberAction(formData: FormData) {
  await requireAdmin();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const name = String(formData.get("name") || "").trim();
  const password = String(formData.get("password") || "");
  if (!email || !password || password.length < 8)
    throw new Error(
      "Email and a password of at least 8 characters are required.",
    );
  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: name || null,
      passwordHash: await bcrypt.hash(password, 12),
      role: "admin",
    },
    update: {
      name: name || null,
      passwordHash: await bcrypt.hash(password, 12),
      role: "admin",
    },
  });
  revalidatePath("/admin/team");
}

export async function changeAdminPasswordAction(
  prevStateOrFormData: any,
  formDataOrUndefined?: FormData
) {
  try {
    const current = await requireAdmin();
    let formData: FormData;
    if (formDataOrUndefined instanceof FormData) {
      formData = formDataOrUndefined;
    } else if (prevStateOrFormData instanceof FormData) {
      formData = prevStateOrFormData;
    } else {
      formData = new FormData();
    }

    const currentPassword = String(formData.get("currentPassword") || "");
    const newPassword = String(formData.get("newPassword") || "");
    const confirmation = String(formData.get("confirmPassword") || "");

    if (newPassword.length < 8) {
      return { success: false, error: "يجب أن تتكون كلمة السر من 8 أحرف على الأقل." };
    }
    if (newPassword !== confirmation) {
      return { success: false, error: "كلمتا السر غير متطابقتين." };
    }

    const user = await prisma.user.findUnique({
      where: { id: current.id },
      select: { passwordHash: true },
    });

    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      return { success: false, error: "كلمة السر الحالية غير صحيحة." };
    }

    await prisma.user.update({
      where: { id: current.id },
      data: { passwordHash: await bcrypt.hash(newPassword, 12) },
    });

    revalidatePath("/admin/team");
    return { success: true, message: "تم تغيير كلمة السر بنجاح!" };
  } catch (err: any) {
    console.error("Error in changeAdminPasswordAction:", err);
    return { success: false, error: err?.message || "حدث خطأ أثناء تغيير كلمة السر." };
  }
}

export async function changeTeamMemberPasswordAction(
  prevStateOrFormData: any,
  formDataOrUndefined?: FormData
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

    const id = String(formData.get("id") || "");
    const newPassword = String(formData.get("newPassword") || "");
    const confirmation = String(formData.get("confirmPassword") || "");

    if (!id) {
      return { success: false, error: "معرف العضو غير صحيح." };
    }
    if (newPassword.length < 8) {
      return { success: false, error: "يجب أن تتكون كلمة السر من 8 أحرف على الأقل." };
    }
    if (newPassword !== confirmation) {
      return { success: false, error: "كلمتا السر غير متطابقتين." };
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id },
      data: { passwordHash, role: "admin" },
    });

    revalidatePath("/admin/team");
    revalidatePath(`/admin/team/${id}`);

    return { success: true, message: "تم تغيير كلمة السر للعضو بنجاح!" };
  } catch (err: any) {
    console.error("Error in changeTeamMemberPasswordAction:", err);
    return { success: false, error: err?.message || "حدث خطأ أثناء تغيير كلمة السر." };
  }
}

export async function removeTeamMemberAction(formData: FormData) {
  const current = await requireAdmin();
  const id = String(formData.get("id") || "");
  if (id && id !== current.id)
    await prisma.user.update({ where: { id }, data: { role: "customer" } });
  revalidatePath("/admin/team");
  redirect("/admin/team");
}
