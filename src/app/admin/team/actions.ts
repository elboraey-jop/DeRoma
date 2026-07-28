"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
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

export async function changeAdminPasswordAction(formData: FormData) {
  const current = await requireAdmin();
  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  const confirmation = String(formData.get("confirmPassword") || "");
  if (newPassword.length < 8)
    throw new Error("The new password must be at least 8 characters.");
  if (newPassword !== confirmation)
    throw new Error("The new password confirmation does not match.");
  const user = await prisma.user.findUnique({
    where: { id: current.id },
    select: { passwordHash: true },
  });
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash)))
    throw new Error("The current password is incorrect.");
  await prisma.user.update({
    where: { id: current.id },
    data: { passwordHash: await bcrypt.hash(newPassword, 12) },
  });
  revalidatePath("/admin/team");
}

export async function removeTeamMemberAction(formData: FormData) {
  const current = await requireAdmin();
  const id = String(formData.get("id") || "");
  if (id && id !== current.id)
    await prisma.user.update({ where: { id }, data: { role: "customer" } });
  revalidatePath("/admin/team");
}
