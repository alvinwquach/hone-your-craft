"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath } from "next/cache";

export async function markMessageReadStatus(
  messageId: string,
  status: boolean
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, message: "Unauthorized" };
    }

    const message = await prisma.message.findFirst({
      where: { id: messageId, recipientId: { has: currentUser.id } },
    });

    if (!message) {
      return { success: false, message: "Message not found" };
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { isReadByRecipient: status },
    });

    revalidatePath("/messages");

    return {
      success: true,
      message: "Message status updated successfully",
      data: updatedMessage,
    };
  } catch (error) {
    console.error("Error toggling message status:", error);
    return { success: false, message: "Error updating message status" };
  }
}
