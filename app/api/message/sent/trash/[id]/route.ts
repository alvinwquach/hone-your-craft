import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { messageId } = await request.json();
    const currentUser = await getCurrentUser();

    // Check if user is authenticated
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check if messageId is provided
    if (!messageId) {
      return NextResponse.json(
        { message: "Message ID is required" },
        { status: 400 }
      );
    }

    // Find the message in the database
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    // If message is not found
    if (!message) {
      return NextResponse.json(
        { message: "Message not found" },
        { status: 404 }
      );
    }

    // Ensure the current user is the sender
    if (message.senderId !== currentUser.id) {
      return NextResponse.json(
        { message: "You can only restore your own trashed messages" },
        { status: 403 }
      );
    }

    // Check if the message is trashed by the sender
    if (!message.isDeletedBySender) {
      return NextResponse.json(
        { message: "This message is not in the trash" },
        { status: 400 }
      );
    }

    // Restore the message by unsetting the trash flag (does not delete it)
    const restoredMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        isDeletedBySender: true, // Unset the trash flag
        isDeletedFromTrashBySender: true, // Mark as restored
      },
    });

    // Respond with success
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

    // Check if user is authenticated
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Fetch all trashed messages by the current user
    const trashedMessages = await prisma.message.findMany({
      where: {
        senderId: currentUser.id, // Ensure the message is from the current user
        isDeletedBySender: true, // Ensure the message is trashed by the sender
      },
    });

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
