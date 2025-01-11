import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const unreadMessageCount = await prisma.message.count({
      where: {
        OR: [
          { recipientId: { has: currentUser.id } },
          { senderId: currentUser.id },
        ],
        isReadByRecipient: false,
        isDeletedByRecipient: false,
      },
    });

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { senderId: currentUser.id },
          { receiverIds: { has: currentUser.id } },
        ],
      },
      select: {
        id: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            subject: true,
            content: true,
            messageType: true,
            isDeletedBySender: true,
            createdAt: true,
            mentionedUserIds: true,
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        receiverIds: false,
      },
    });

    const usersConversations = await Promise.all(
      conversations.map(async (conversation) => {
        const allMessages = await prisma.message.findMany({
          where: {
            conversationId: conversation.id,
            isDeletedBySender: false,
            isDeletedByRecipient: { not: true },
            isReadByRecipient: false,
          },
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            subject: true,
            content: true,
            createdAt: true,
            isReadByRecipient: false,
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        });

        if (allMessages.length === 0) {
          return null;
        }

        const filteredMessages = allMessages.filter(
          (message) =>
            message?.subject?.trim() !== "" || message.content.trim() !== ""
        );

        const lastMessage =
          conversation.messages.length > 0 ? conversation.messages[0] : null;

        if (
          lastMessage &&
          (lastMessage?.subject?.trim() === "" ||
            lastMessage.content.trim() === "")
        ) {
          return null;
        }

        return {
          ...conversation,
          messages: filteredMessages,
          lastMessage,
        };
      })
    );

    const filteredConversations = usersConversations.filter(
      (conversation) => conversation !== null
    );

    return NextResponse.json(
      {
        message: "Conversations retrieved successfully",
        data: filteredConversations,
        unreadMessageCount,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error fetching conversations:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { message: "Error fetching conversations", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Error fetching conversations",
        error: "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
