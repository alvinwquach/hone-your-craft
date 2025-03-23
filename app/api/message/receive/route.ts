import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

const getCachedConversations = unstable_cache(
  async (userId: string) => {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverIds: { has: userId } }],
      },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
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
        const lastMessage = conversation.messages[0];
        const sender = await prisma.user.findUnique({
          where: { id: lastMessage?.senderId },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        });
        return {
          conversationId: conversation.id,
          receiverIds: conversation.receiverIds,
          lastMessage: lastMessage
            ? {
                ...lastMessage,
                sender,
              }
            : null,
        };
      })
    );

    const unreadMessageCount = await prisma.message.count({
      where: {
        recipientId: { has: userId },
        isReadByRecipient: false,
      },
    });

    return {
      conversations: conversationsWithMessages,
      unreadMessageCount,
    };
  },
  ["conversations"], 
  {
    revalidate: 30, 
    tags: ["conversations", "messages"],
  }
);

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { conversations, unreadMessageCount } = await getCachedConversations(
      currentUser.id
    );

    return NextResponse.json({
      message: "Conversations and messages retrieved successfully",
      data: conversations,
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