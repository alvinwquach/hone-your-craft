"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { redirect } from "next/navigation";

export async function getTrashedSentMessages() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return redirect("/login");
  }

  const trashedMessages = await prisma.message.findMany({
    where: {
      senderId: currentUser.id,
      isDeletedBySender: true,
    },
    select: {
      id: true,
      subject: true,
      content: true,
      messageType: true,
      isDeletedBySender: true,
      createdAt: true,
      mentionedUserIds: true,
      recipientId: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const recipientIds = [
    ...new Set(trashedMessages.flatMap((msg) => msg.recipientId)),
  ];
  const users = await prisma.user.findMany({
    where: { id: { in: recipientIds } },
    select: { id: true, name: true, email: true, image: true },
  });

  const messagesWithRecipients = trashedMessages.map((msg) => ({
    ...msg,
    createdAt: msg.createdAt.toISOString(),
    recipients: msg.recipientId
      .map((id) => users.find((u) => u.id === id))
      .filter((u): u is NonNullable<typeof u> => u !== undefined),
  }));

  return {
    message: "Trashed messages retrieved successfully",
    data: messagesWithRecipients,
  };
}
