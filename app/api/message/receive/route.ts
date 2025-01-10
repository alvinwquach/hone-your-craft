import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    console.log("Current user:", currentUser);
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

    console.log("Received messages with senders:", receivedMessages);


    const unreadMessageCount = await prisma.message.count({
      where: {
        recipientId: {
          has: currentUser.id,
        },
        isReadByRecipient: false,
      },
    });

    return NextResponse.json({
      message: "Received messages retrieved successfully",
      data: receivedMessages,
      unreadMessageCount,
    });
  } catch (error: unknown) {
    console.error("Error retrieving received messages:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { message: "Error retrieving received messages", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Error retrieving received messages",
        error: "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
