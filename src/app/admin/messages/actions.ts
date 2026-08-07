"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateMessageStatusAction(id: string, status: string) {
  try {
    await (prisma as any).contactMessage.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/admin/messages");
    return { success: true };
  } catch (error) {
    console.error("Failed to update message status:", error);
    return { success: false, error: "Failed to update status." };
  }
}

export async function deleteMessageAction(id: string) {
  try {
    await (prisma as any).contactMessage.delete({
      where: { id },
    });
    revalidatePath("/admin/messages");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete message:", error);
    return { success: false, error: "Failed to delete message." };
  }
}

export async function updateMessageNotesAction(id: string, notes: string) {
  try {
    await (prisma as any).contactMessage.update({
      where: { id },
      data: { notes },
    });
    revalidatePath("/admin/messages");
    return { success: true };
  } catch (error) {
    console.error("Failed to update message notes:", error);
    return { success: false, error: "Failed to update notes." };
  }
}
