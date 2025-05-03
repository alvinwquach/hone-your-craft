"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath } from "next/cache";

export async function moveMessageToTrash(messageId: string) {
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
      include: {
        conversation: true,
      },
    });

    if (!message) {
      return { success: false, message: "Message not found" };
    }

    const isSender = message.senderId === currentUser.id;
    const isRecipient = message.recipientId.includes(currentUser.id);

    if (!isSender && !isRecipient) {
      return {
        success: false,
        message: "You can only trash messages you sent or received",
      };
    }

    const updateData: any = {};
    if (isSender) {
      updateData.isDeletedBySender = true;
    }
    if (isRecipient) {
      updateData.isDeletedByRecipient = true;
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: updateData,
    });

    revalidatePath("/messages");

    return {
      success: true,
      message:
        "Message moved to trash. This won't trash the whole conversation.",
      data: updatedMessage,
    };
  } catch (error) {
    console.error("Error moving message to trash:", error);
    return { success: false, message: "Error moving message to trash" };
  }
}