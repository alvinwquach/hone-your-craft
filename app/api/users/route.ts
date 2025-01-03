import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.error();
    }

    const users = await prisma.user.findMany({
      where: {
        id: { not: currentUser.id },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        headline: true,
        role: true,
        userRole: true,
        status: true,
        connectionsSent: {
          where: {
            receiverId: currentUser.id,
            status: { in: ["PENDING", "ACCEPTED"] },
          },
          select: { receiver: true, status: true },
        },
        connectionsReceived: {
          where: {
            requesterId: currentUser.id,
            status: { in: ["PENDING", "ACCEPTED"] },
          },
          select: { requester: true, status: true },
        },
      },
    });

    const usersWithStatus = users.map((user) => {
      let connectionStatus: "NONE" | "PENDING" | "ACCEPTED" | "REJECTED" =
        "NONE";

      const sentConnection = user.connectionsSent[0];
      if (sentConnection) {
        connectionStatus = sentConnection.status;
      }

      const receivedConnection = user.connectionsReceived[0];
      if (!sentConnection && receivedConnection) {
        connectionStatus = receivedConnection.status;
      }

      return { ...user, connectionStatus };
    });

    return NextResponse.json(usersWithStatus);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Error fetching users" },
      { status: 500 }
    );
  }
}
