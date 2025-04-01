"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath, revalidateTag } from "next/cache";

export async function deleteTrashedSentMessage(messageId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, message: "Unauthorized" };
    }

    if (!messageId) {
      return { success: false, message: "Message ID is required" };
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return { success: false, message: "Message not found" };
    }

    if (message.senderId !== currentUser.id) {
      return {
        success: false,
        message: "You can only delete your own trashed messages",
      };
    }

    if (!message.isDeletedBySender) {
      return { success: false, message: "This message is not in the trash" };
    }

    await prisma.message.delete({
      where: { id: messageId },
    });

    revalidatePath("/messages");
    revalidateTag("trashed-messages");
    return {
      success: true,
      message: "Message permanently deleted from trash",
    };
  } catch (error) {
    console.error("Error deleting message from trash:", error);
    return { success: false, message: "Error deleting message from trash" };
  }
}
