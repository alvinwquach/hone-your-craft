"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath } from "next/cache";

export async function moveSentMessageToTrash(messageId: string) {
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
        message: "You can only trash your own sent messages",
      };
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { isDeletedBySender: true },
    });

    revalidatePath("/messages");

    return {
      success: true,
      message: "Message moved to trash",
      data: updatedMessage,
    };
  } catch (error) {
    console.error("Error moving message to trash:", error);
    return { success: false, message: "Error moving message to trash" };
  }
}
