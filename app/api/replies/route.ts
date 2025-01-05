import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const receivedMessages = await prisma.message.findMany({
      where: {
        recipientId: {
          has: currentUser.id,
        },
      },
      select: {
        id: true,
        subject: true,
        content: true,
        messageType: true,
        isReadByRecipient: true,
        createdAt: true,
        senderId: true,
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const sentMessages = await prisma.message.findMany({
      where: {
        senderId: currentUser.id,
      },
      select: {
        id: true,
        subject: true,
        content: true,
        messageType: true,
        isReadByRecipient: true,
        createdAt: true,
        mentionedUserIds: true,
        recipientId: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const recipientIds = [
      ...new Set(sentMessages.flatMap((message) => message.recipientId)),
    ];

    const users = await prisma.user.findMany({
      where: {
        id: { in: recipientIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    const messagesWithRecipients = sentMessages.map((message) => {
      const recipients = users.filter(
        (user) => message.recipientId && message.recipientId.includes(user.id)
      );
      return {
        ...message,
        recipients,
      };
    });

    const allMessages = [...receivedMessages, ...messagesWithRecipients];
    const uniqueMessages = Array.from(
      new Map(allMessages.map((message) => [message.id, message])).values()
    );

    const messagesWithReplies = await Promise.all(
      uniqueMessages.map(async (message) => {
        const replies = await prisma.message.findMany({
          where: {
            replyToId: message.id,
            senderId: currentUser.id,
            NOT: {
              id: message.id,
            },
          },
          select: {
            id: true,
            content: true,
            senderId: true,
            createdAt: true,
            threadId: true,
            replyToId: true,
            subject: true,
            sender: {
              select: { id: true, name: true, image: true, email: true },
            },
          },
        });

        return {
          ...message,
          replies,
        };
      })
    );

    return NextResponse.json({
      message: "All messages retrieved successfully",
      data: messagesWithReplies,
    });
  } catch (error: unknown) {
    console.error("Error retrieving all messages:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { message: "Error retrieving all messages", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Error retrieving all messages",
        error: "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
