import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import AdminCategoriesClient from "@/components/AdminCategoriesClient";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  let options: Array<{ id: string; category: string; type: string; name: string; value: string | null }> = [];
  try {
    options = await prisma.catalogOption.findMany({ where: { active: true }, orderBy: [{ category: "asc" }, { type: "asc" }, { sortOrder: "asc" }, { name: "asc" }] });
  } catch (error) {
    console.warn("Unable to load catalog options", error);
  }
  return <AdminCategoriesClient options={options} />;
}
