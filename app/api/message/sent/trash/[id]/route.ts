import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const { messageId } = await request.json();
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!messageId) {
      return NextResponse.json(
        { message: "Message ID is required" },
        { status: 400 }
      );
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json(
        { message: "Message not found" },
        { status: 404 }
      );
    }

    if (message.senderId !== currentUser.id) {
      return NextResponse.json(
        { message: "You can only restore your own trashed messages" },
        { status: 403 }
      );
    }

    if (!message.isDeletedBySender) {
      return NextResponse.json(
        { message: "This message is not in the trash" },
        { status: 400 }
      );
    }

    const restoredMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        isDeletedBySender: true, 
        isDeletedFromTrashBySender: true, 
      },
    });

    return NextResponse.json({
      message: "Message restored from trash",
      data: restoredMessage,
    });
  } catch (error: unknown) {
    console.error("Error restoring message from trash:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { message: "Error restoring message", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Error restoring message",
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
    });

    revalidatePath("/messages", "page");
    
    // Return the trashed messages
    return NextResponse.json({
      message: "Trashed messages fetched successfully",
      data: trashedMessages,
    });
  } catch (error: unknown) {
    console.error("Error fetching trashed messages:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { message: "Error fetching trashed messages", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Error fetching trashed messages",
        error: "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
