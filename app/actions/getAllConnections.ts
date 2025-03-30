"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { redirect } from "next/navigation";

export async function getAllConnections() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return redirect("/login");
  }

  const connections = await prisma.connection.findMany({
    where: {
      OR: [{ requesterId: currentUser.id }, { receiverId: currentUser.id }],
      status: "ACCEPTED",
    },
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          image: true,
          email: true,
          userRole: true,
          headline: true,
        },
      },
      receiver: {
        select: {
          id: true,
          name: true,
          image: true,
          email: true,
          userRole: true,
          headline: true,
        },
      },
    },
  });

  const userConnections = connections.map((connection) => ({
    id:
      connection.requesterId === currentUser.id
        ? connection.receiver.id
        : connection.requester.id,
    name:
      (connection.requesterId === currentUser.id
        ? connection.receiver.name
        : connection.requester.name) ?? "Unknown",
    image:
      connection.requesterId === currentUser.id
        ? connection.receiver.image
        : connection.requester.image,
    email:
      (connection.requesterId === currentUser.id
        ? connection.receiver.email
        : connection.requester.email) ?? "No email",
    userRole:
      connection.requesterId === currentUser.id
        ? connection.receiver.userRole
        : connection.requester.userRole,
    headline:
      connection.requesterId === currentUser.id
        ? connection.receiver.headline
        : connection.requester.headline,
  }));

  return userConnections;
}
