import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: conversationId } = params;
    const requestBody = await request.json();

    const { content, messageType, mentionedUserIds, subject } = requestBody;

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!content) {
      return NextResponse.json(
        { message: "Content is required" },
        { status: 400 }
      );
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { message: "Conversation not found" },
        { status: 404 }
      );
    }

    const isPartOfConversation =
      conversation.senderId === currentUser.id ||
      conversation.receiverIds.includes(currentUser.id);

    if (!isPartOfConversation) {
      return NextResponse.json(
        { message: "You are not part of this conversation" },
        { status: 403 }
      );
    }

    const lastMessage = conversation.messages[0];

    const messageTypeEnum = messageType || "TEXT";
    const mentionedUserIdsArray = mentionedUserIds || [];

    const replyMessage = await prisma.message.create({
      data: {
        senderId: currentUser.id,
        recipientId: conversation.receiverIds,
        subject: subject || lastMessage.subject,
        content,
        messageType: messageTypeEnum,
        mentionedUserIds: mentionedUserIdsArray,
        isReadByRecipient: false,
        isDeletedBySender: false,
        isDeletedByRecipient: false,
        replyToId: lastMessage.id,
        threadId: lastMessage.threadId || lastMessage.id,
        conversationId: conversation.id,
      },
    });

    revalidatePath("/messages");

    return NextResponse.json({
      message: "Reply sent successfully",
      data: {
        replyMessage,
        conversationId: conversation.id,
      },
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
      { message: "Error replying to message", error: "Unknown error occurred" },
      { status: 500 }
    );
  }
}
