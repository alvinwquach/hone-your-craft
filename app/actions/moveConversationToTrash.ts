"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath } from "next/cache";

export async function moveConversationToTrash(conversationId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, message: "Unauthorized" };
    }

    if (!conversationId) {
      return { success: false, message: "Conversation ID is required" };
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: true,
        userConversations: {
          where: { userId: currentUser.id },
        },
      },
    });

    if (!conversation) {
      return { success: false, message: "Conversation not found" };
    }

    if (conversation.userConversations.length === 0) {
      return {
        success: false,
        message: "You are not a participant in this conversation",
      };
    }

    await prisma.userConversation.update({
      where: {
        userId_conversationId: {
          userId: currentUser.id,
          conversationId: conversationId,
        },
      },
      data: {
        isDeleted: true,
      },
    });

    const messageUpdates = conversation.messages.map((message) => {
      const isSender = message.senderId === currentUser.id;
      const isRecipient = message.recipientId.includes(currentUser.id);

      const updateData: any = {};
      if (isSender) {
        updateData.isDeletedBySender = true;
      }
      if (isRecipient) {
        updateData.isDeletedByRecipient = true;
      }

      return prisma.message.update({
        where: { id: message.id },
        data: updateData,
      });
    });

    await Promise.all(messageUpdates);

    revalidatePath("/messages");

    return {
      success: true,
      message: "Conversation moved to trash",
    };
  } catch (error) {
    console.error("Error moving conversation to trash:", error);
    return { success: false, message: "Error moving conversation to trash" };
  }
}
