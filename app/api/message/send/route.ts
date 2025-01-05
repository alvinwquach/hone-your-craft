import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { receiverEmails, content, messageType, mentionedUserIds, subject } =
      requestBody;

    if (!receiverEmails || !content) {
      console.log("Missing receiverEmails or content");
      return NextResponse.json(
        { message: "Receiver emails and content are required" },
        { status: 400 }
      );
    }

    const messageTypeEnum = messageType || "TEXT";
    const mentionedUserIdsArray = mentionedUserIds || [];

    const receivers = await prisma.user.findMany({
      where: {
        email: {
          in: receiverEmails,
        },
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (receivers.length !== receiverEmails.length) {
      console.log("Mismatch in number of recipients");
      return NextResponse.json(
        { message: "One or more recipients were not found" },
        { status: 400 }
      );
    }

    const recipientIds = receivers.map((receiver) => receiver.id);

    const messages = await Promise.all(
      recipientIds.map((recipientId) =>
        prisma.message.create({
          data: {
            senderId: currentUser.id,
            recipientId: [recipientId],
            subject,
            content,
            messageType: messageTypeEnum,
            mentionedUserIds: mentionedUserIdsArray,
            isReadByRecipient: false,
            isDeletedBySender: false,
            isDeletedByRecipient: false,
            replyToId: null,
            threadId: null,
            deliveryStatus: null,
            reactionCount: 0,
            readAt: null,
          },
        })
      )
    );


    return NextResponse.json({
      message: "Messages sent successfully",
      data: messages, 
    });
  } catch (error: unknown) {
    console.error("Error sending message:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { message: "Error sending message", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Error sending message", error: "Unknown error occurred" },
      { status: 500 }
    );
  }
}
