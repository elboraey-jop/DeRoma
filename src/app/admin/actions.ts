"use server";

import { redirect } from "next/navigation";
import { loginAdmin, logoutAdmin } from "@/lib/adminAuth";
import { checkRateLimit } from "@/lib/rateLimit";

export async function loginAdminAction(_previousState: { error: string } | null, formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  if (!email || !password) return { error: "Enter your email and password." };

  const rateCheck = await checkRateLimit(`admin_login_${email}`, 5, 300);
  if (!rateCheck.success) {
    return { error: "Too many failed login attempts. Please wait 5 minutes before trying again." };
  }

  try {
    const result = await loginAdmin(email, password);
    if (!result.success) return { error: result.error };
  } catch (error) {
    console.error("Admin login failed", error);
    if (error instanceof Error && error.message === "ADMIN_SECRET is not configured.") {
      return { error: "Admin login is not configured yet. Add ADMIN_SECRET (or NEXTAUTH_SECRET) and an admin user first." };
    }
    return { error: "The admin service is temporarily unavailable. Please try again." };
  }

  redirect("/admin");
}


export async function logoutAdminAction() {
  await logoutAdmin();
  redirect("/admin/login");
}
