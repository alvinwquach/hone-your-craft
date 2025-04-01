"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath } from "next/cache";

export async function sendReply(conversationId: string, content: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, message: "Unauthorized" };
    }

    if (!content) {
      return { success: false, message: "Content is required" };
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
    });

    if (!conversation) {
      return { success: false, message: "Conversation not found" };
    }

    const isPartOfConversation =
      conversation.senderId === currentUser.id ||
      conversation.receiverIds.includes(currentUser.id);

    if (!isPartOfConversation) {
      return {
        success: false,
        message: "You are not part of this conversation",
      };
    }

    const lastMessage = conversation.messages[0];

    const replyMessage = await prisma.message.create({
      data: {
        senderId: currentUser.id,
        recipientId: conversation.receiverIds,
        subject: lastMessage.subject,
        content,
        messageType: "TEXT",
        mentionedUserIds: [],
        isReadByRecipient: false,
        isDeletedBySender: false,
        isDeletedByRecipient: false,
        replyToId: lastMessage.id,
        threadId: lastMessage.threadId || lastMessage.id,
        conversationId: conversation.id,
      },
    });

    revalidatePath("/messages");

    return {
      success: true,
      message: "Reply sent successfully",
      data: { replyMessage, conversationId: conversation.id },
    };
  } catch (error) {
    console.error("Error replying to message:", error);
    return { success: false, message: "Error replying to message" };
  }
}
