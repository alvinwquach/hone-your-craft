import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const { messageId, status } = await request.json();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        recipientId: { has: currentUser.id },
      },
    });

    if (!message) {
      return NextResponse.json(
        { message: "Message not found" },
        { status: 404 }
      );
    }

    const newStatus = status === "read" ? true : false;

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        isReadByRecipient: newStatus,
      },
    });

    revalidatePath("/messages", "page");

    return NextResponse.json({
      message: "Message status updated successfully",
      data: updatedMessage,
    });
  } catch (error) {
    console.error("Error toggling message status:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { message: "Error updating message status", error: error.message },
        { status: 500 }
      );
    }
  }
}
