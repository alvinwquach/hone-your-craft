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
          (subject) => {
            return {
              subject,
              messages: groupedBySubject[subject],
              lastMessage:
                groupedBySubject[subject][groupedBySubject[subject].length - 1],
            };
          }
        );

        return groupedConversations;
      })
    );

    const flattenedConversations = usersConversations
      .flat()
      .filter((conversation) => conversation !== null);

    return NextResponse.json(
      {
        message: "Conversations retrieved successfully",
        data: flattenedConversations,
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
