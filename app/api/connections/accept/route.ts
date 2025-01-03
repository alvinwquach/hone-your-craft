import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: NextRequest) {
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
    const acceptedConnection = await prisma.connection.update({
      where: { id: connectionId },
      data: { status: "ACCEPTED" },
      include: {
        requester: true,
        receiver: true,
      },
    });

    return NextResponse.json(acceptedConnection, { status: 200 });
  } catch (error) {
    console.error("Error accepting connection request:", error);
    return NextResponse.json(
      { message: "Error accepting connection request" },
      { status: 500 }
    );
  }
}
