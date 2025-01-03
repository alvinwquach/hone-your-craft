import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function PUT(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.error();
  }

  const { connectionId } = await request.json();

  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
    include: {
      requester: true,
      receiver: true,
    },
  });

  if (!connection) {
    return NextResponse.json(
      { message: "Connection not found" },
      { status: 404 }
    );
  }

  // Ensure the current user is the receiver of this request
  if (connection.receiverId !== currentUser.id) {
    return NextResponse.json(
      { message: "You are not the receiver of this connection request" },
      { status: 400 }
    );
  }

  if (connection.status !== "PENDING") {
    return NextResponse.json(
      { message: "Connection request is no longer pending" },
      { status: 400 }
    );
  }

  try {
    const rejectedConnection = await prisma.connection.update({
      where: { id: connectionId },
      data: { status: "NONE" },
      include: {
        requester: true,
        receiver: true,
      },
    });

    return NextResponse.json(rejectedConnection, { status: 200 });
  } catch (error) {
    console.error("Error rejecting connection request:", error);
    return NextResponse.json(
      { message: "Error rejecting connection request" },
      { status: 500 }
    );
  }
}
