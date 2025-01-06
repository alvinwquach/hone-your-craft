import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const sentMessages = await prisma.message.findMany({
      where: {
        senderId: currentUser.id,
        isDeletedBySender: false,
      },
      select: {
        id: true,
        subject: true,
        content: true,
        messageType: true,
        isDeletedBySender: true,
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
      const recipients = message.recipientId
        .map((recipientId) => {
          return users.find((user) => user.id === recipientId);
        })
        .filter((user) => user !== undefined);

      return {
        ...message,
        recipients,
      };
    });

    return NextResponse.json({
      message: "Sent messages retrieved successfully",
      data: messagesWithRecipients,
    });
  } catch (error: unknown) {
    console.error("Error retrieving sent messages:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { message: "Error retrieving sent messages", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Error retrieving sent messages",
        error: "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
