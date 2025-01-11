import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
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
        receiverIds: true, 
      },
    });

    const detailedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        const allMessages = await prisma.message.findMany({
          where: {
            conversationId: conversation.id,
            isDeletedBySender: false,
            isDeletedByRecipient: { not: true },
          },
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            content: true,
            createdAt: true,
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

        const receivers = await prisma.user.findMany({
          where: { id: { in: conversation.receiverIds } },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        });

        return {
          ...conversation,
          messages: allMessages,
          receivers: receivers,
          lastMessage: conversation.messages[0],
        };
      })
    );

    return NextResponse.json(
      {
        message: "Conversations retrieved successfully",
        data: detailedConversations,
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