import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import AdminMessagesClient from "@/components/AdminMessagesClient";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  await requireAdmin();
  try {
    const rawMessages = await (prisma as any).contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
    const messages = rawMessages.map((m: any) => ({
      id: m.id,
      name: m.name,
      phone: m.phone,
      message: m.message,
      status: m.status,
      notes: m.notes || null,
      createdAt: m.createdAt.toISOString(),
    }));
    return <AdminMessagesClient messages={messages} />;
  } catch (error) {
    console.error("Unable to load contact messages:", error);
    return <AdminMessagesClient messages={[]} />;
  }
}
