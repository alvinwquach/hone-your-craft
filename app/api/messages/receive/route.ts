import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const getCachedConversationData = unstable_cache(
  async (userId: string) => {
    const [countResult, conversations] = await Promise.all([
      prisma.message.count({
        where: {
          OR: [{ recipientId: { has: userId } }, { senderId: userId }],
          isReadByRecipient: false,
          isDeletedByRecipient: false,
        },
      }),
      prisma.conversation.findMany({
        where: {
          OR: [{ senderId: userId }, { receiverIds: { has: userId } }],
        },
        select: {
          id: true,
          messages: {
            orderBy: { createdAt: "desc" },
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
      }),
    ]);

    return { countResult, conversations };
  },
  ["conversation-data"], 
  {
    revalidate: 30, 
    tags: ["conversations", "messages"], 
  }
);

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { countResult, conversations } = await getCachedConversationData(
      currentUser.id
    );
    const usersConversations = await Promise.all(
      conversations.map(async (conversation) => {
        if (!conversation.messages.length) return null;
        const filteredMessages = conversation.messages.filter(
          (message) =>
            message?.subject?.trim() !== "" || message.content.trim() !== ""
        );
        const groupedBySubject = filteredMessages.reduce((acc, message) => {
          const subject = message.subject
            ? message.subject.trim()
            : "No Subject";
          if (!acc[subject]) {
            acc[subject] = [];
          }
          acc[subject].push(message);
          return acc;
        }, {} as Record<string, typeof conversation.messages>);
        const groupedConversations = Object.keys(groupedBySubject).map(
          (subject) => ({
            subject,
            messages: groupedBySubject[subject],
            lastMessage:
              groupedBySubject[subject][groupedBySubject[subject].length - 1],
          })
        );
        return groupedConversations;
      })
    );

    const flattenedConversations = usersConversations
      .flat()
      .filter((conversation) => conversation !== null);

    return NextResponse.json({
      message: "Conversations retrieved successfully",
      data: flattenedConversations,
      unreadMessageCount: countResult,
    });
  } catch (error: unknown) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      {
        message: "Error fetching conversations",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}