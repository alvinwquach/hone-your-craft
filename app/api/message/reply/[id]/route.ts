import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: messageId } = params;

    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { message: "Content is required" },
        { status: 400 }
      );
    }

    const originalMessage = await prisma.message.findUnique({
      where: { id: messageId },
      select: {
        senderId: true,
        recipientId: true,
        subject: true,
        threadId: true,
      },
    });

    if (!originalMessage) {
      return NextResponse.json(
        { message: "Original message not found" },
        { status: 404 }
      );
    }

    const newThreadId = originalMessage.threadId;

    const newMessage = await prisma.message.create({
      data: {
        senderId: currentUser.id,
        recipientId: [originalMessage.senderId],
        content: content,
        subject: originalMessage.subject,
        replyToId: messageId,
        threadId: newThreadId,
        isReadByRecipient: false,
      },
    });

    return NextResponse.json({
      message: "Message replied successfully",
      data: newMessage,
    });
  } catch (error: unknown) {
    console.error("Error replying to message:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { message: "Error replying to message", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Error replying to message",
        error: "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
