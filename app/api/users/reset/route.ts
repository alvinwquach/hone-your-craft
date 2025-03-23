import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.error();
    }

    const rejectedConnections = await prisma.connection.findMany({
      where: {
        OR: [
          { requesterId: currentUser.id, status: "NONE" },
          { receiverId: currentUser.id, status: "NONE" },
        ],
      },
    });

    if (rejectedConnections.length > 0) {
      const connectionIds = rejectedConnections.map(
        (connection) => connection.id
      );

      await prisma.user.update({
        where: {
          id: currentUser.id,
        },
        data: {
          connectionsSent: {
            disconnect: rejectedConnections.map((connection) => ({
              id: connection.id,
            })),
          },
          connectionsReceived: {
            disconnect: rejectedConnections.map((connection) => ({
              id: connection.id,
            })),
          },
        },
      });

      await prisma.connection.updateMany({
        where: {
          id: { in: connectionIds },
        },
        data: {
          status: "NONE",
        },
      });

      revalidatePath("/profile", "page");

      return NextResponse.json(
        { message: "Rejected connections have been reset successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "No rejected connections found" },
        { status: 404 }
      );
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error resetting rejected connections:", error.message);
      return NextResponse.json(
        {
          message: "Error resetting rejected connections",
          error: error.message,
        },
        { status: 500 }
      );
    } else {
      console.error("Unknown error occurred");
      return NextResponse.json(
        { message: "Unknown error occurred" },
        { status: 500 }
      );
    }
  }
}
