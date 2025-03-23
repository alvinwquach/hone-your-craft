import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { messageId } = requestBody;

    if (!messageId) {
      return NextResponse.json(
        { message: "Sent Message ID is required" },
        { status: 400 }
      );
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json(
        { message: "Sent message to trash not found" },
        { status: 404 }
      );
    }

    if (message.senderId !== currentUser.id) {
      return NextResponse.json(
        { message: "You can only trash your own sent messages," },
        { status: 403 }
      );
    }
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        isDeletedBySender: true,
      },
    });

    revalidatePath("/messages", "page");

    return NextResponse.json({
      message: "Message moved to trash",
      data: updatedMessage,
    });
  } catch (error: unknown) {
    console.error("Error trashing sent message:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { message: "Error trashing sent message", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Error trashing message",
        error: "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const trashedMessages = await prisma.message.findMany({
      where: {
        senderId: currentUser.id,
        isDeletedBySender: true,
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
        createdAt: "asc",
      },
    });

    const recipientIds = [
      ...new Set(trashedMessages.flatMap((message) => message.recipientId)),
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

    const messagesWithRecipients = trashedMessages.map((message) => {
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
      message: "Trashed messages retrieved successfully",
      data: messagesWithRecipients,
    });
  } catch (error: unknown) {
    console.error("Error retrieving trashed messages:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { message: "Error retrieving trashed messages", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Error retrieving trashed messages",
        error: "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
