"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { redirect } from "next/navigation";

export async function getSentConnectionRequests() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return redirect("/login");
  }

  const sentRequests = await prisma.connection.findMany({
    where: {
      requesterId: currentUser.id,
      status: "PENDING",
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

  return sentRequests.map((request) => ({
    ...request,
    status: request.status as "PENDING" | "ACCEPTED" | "NONE",
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    requester: {
      ...request.requester,
      name: request.requester.name ?? "Unknown",
      email: request.requester.email ?? "No email",
    },
    receiver: {
      ...request.receiver,
      name: request.receiver.name ?? "Unknown",
      email: request.receiver.email ?? "No email",
    },
  }));
}
