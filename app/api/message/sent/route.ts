import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { senderId: currentUser.id }, 
          { receiverIds: { has: currentUser.id } }, 
        ],
      },
      include: {
        messages: {
          where: {
            senderId: currentUser.id,
          },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            senderId: true,
            content: true,
            createdAt: true,
            subject: true,
            messageType: true,
            isReadByRecipient: true,
            isDeletedBySender: true,
            isDeletedByRecipient: true,
          },
        },
      },
    });

    const filteredConversations = conversations.filter(
      (conversation) => conversation.messages.length > 0
    );

    const conversationsWithMessages = await Promise.all(
      filteredConversations.map(async (conversation) => {
        const sentMessages = conversation.messages; 
        const receiverIds = conversation.receiverIds;

        const receivers = await prisma.user.findMany({
          where: { id: { in: receiverIds } },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        });

        const filteredReceivers = receivers.filter(
          (receiver) => receiver.id !== currentUser.id
        );

        return {
          conversationId: conversation.id,
          receiverIds: filteredReceivers.map((receiver) => receiver.id), 
          sentMessages: sentMessages,
          receivers: filteredReceivers,
        };
      })
    );

    const unreadMessageCount = await prisma.message.count({
      where: {
        OR: [
          {
            recipientId: {
              has: currentUser.id, 
            },
            isReadByRecipient: false,
          },
          {
            senderId: currentUser.id,
            isReadByRecipient: false,
          },
        ],
      },
    });

    return NextResponse.json({
      message:
        "Sent conversations and unread message count retrieved successfully",
      data: conversationsWithMessages,
      unreadMessageCount,
    });
  } catch (error: unknown) {
    console.error("Error retrieving conversations and messages:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { message: "Error retrieving conversations", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Error retrieving conversations",
        error: "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
