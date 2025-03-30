"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { redirect } from "next/navigation";

export async function getAllUsers() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return redirect("/login");
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
        connectionsSent: {
          where: {
            receiverId: currentUser.id,
            status: { in: ["PENDING", "ACCEPTED"] },
          },
          select: { status: true },
        },
        connectionsReceived: {
          where: {
            requesterId: currentUser.id,
            status: { in: ["PENDING", "ACCEPTED"] },
          },
          select: { status: true },
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

      return {
        id: user.id,
        name: user.name ?? "Unknown",
        email: user.email ?? "No email",
        image: user.image,
        headline: user.headline,
        role: user.role ?? undefined,
        userRole: user.userRole ?? undefined,
        connectionStatus,
      };
    });

    return usersWithStatus;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}
