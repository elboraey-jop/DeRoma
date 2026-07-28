"use server";

import { redirect } from "next/navigation";
import { loginAdmin, logoutAdmin } from "@/lib/adminAuth";

export async function loginAdminAction(_previousState: { error: string } | null, formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  if (!email || !password) return { error: "Enter your email and password." };

  try {
    const result = await loginAdmin(email, password);
    if (!result.success) return { error: result.error };
  } catch (error) {
    console.error("Admin login failed", error);
    return { error: "Admin login is not configured yet. Add ADMIN_SECRET (or NEXTAUTH_SECRET) and an admin user first." };
  }

  redirect("/admin");
}

export async function logoutAdminAction() {
  await logoutAdmin();
  redirect("/admin/login");
}
