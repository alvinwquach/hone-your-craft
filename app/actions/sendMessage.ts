"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath } from "next/cache";

interface SendMessageInput {
  receiverEmails: string[];
  content: string;
  messageType?: string;
  mentionedUserIds?: string[];
  subject?: string;
}

export async function sendMessage(input: SendMessageInput) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        error: {
          message: "Unauthorized",
          status: 401,
        },
      };
    }

    if (!Array.isArray(input.receiverEmails)) {
      return {
        error: {
          message: "receiverEmails should be an array",
          status: 400,
        },
      };
    }

    if (!input.receiverEmails.length || !input.content) {
      return {
        error: {
          message: "Receiver emails and content are required",
          status: 400,
        },
      };
    }

    const messageTypeEnum = input.messageType || "TEXT";
    const mentionedUserIdsArray = input.mentionedUserIds || [];

    const receivers = await prisma.user.findMany({
      where: {
        email: {
          in: input.receiverEmails,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (receivers.length !== input.receiverEmails.length) {
      return {
        error: {
          message: "One or more recipients were not found",
          status: 400,
        },
      };
    }

    const recipientIds = receivers.map((receiver) => receiver.id);

    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            receiverIds: {
              hasSome: recipientIds,
            },
          },
          {
            senderId: currentUser.id,
          },
        ],
      },
    });

    let conversationId;
    if (existingConversation) {
      conversationId = existingConversation.id;
    } else {
      const newConversation = await prisma.conversation.create({
        data: {
          senderId: currentUser.id,
          receiverIds: recipientIds,
          messages: {
            create: [
              {
                senderId: currentUser.id,
                content: input.content,
                messageType: "TEXT",
                mentionedUserIds: mentionedUserIdsArray,
                isReadByRecipient: false,
                isDeletedBySender: false,
                isDeletedByRecipient: false,
                replyToId: null,
                threadId: null,
                deliveryStatus: null,
                reactionCount: 0,
                readAt: null,
              },
            ],
          },
        },
      });
      conversationId = newConversation.id;
    }

    const message = await prisma.message.create({
      data: {
        senderId: currentUser.id,
        recipientId: recipientIds,
        subject: input.subject,
        content: input.content,
        messageType: "TEXT",
        mentionedUserIds: mentionedUserIdsArray,
        isReadByRecipient: false,
        isDeletedBySender: false,
        isDeletedByRecipient: false,
        replyToId: null,
        threadId: null,
        deliveryStatus: null,
        reactionCount: 0,
        readAt: null,
        conversationId,
      },
    });

    revalidatePath("/messages");

    return {
      success: true,
      data: {
        message,
        conversationId,
        recipients: receivers,
      },
    };
  } catch (error: unknown) {
    console.error("Error sending message:", error);

    if (error instanceof Error) {
      return {
        error: {
          message: "Error sending message",
          status: 500,
          details: error.message,
        },
      };
    }

    return {
      error: {
        message: "Error sending message",
        status: 500,
        details: "Unknown error occurred",
      },
    };
  }
}
