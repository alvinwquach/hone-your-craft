"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";

interface DBMessage {
  id: string;
  senderId: string;
  content: string;
  createdAt: Date;
  subject: string | null;
  messageType: string;
  isReadByRecipient: boolean;
  isDeletedBySender: boolean;
  isDeletedByRecipient: boolean;
}

const getCachedConversations = unstable_cache(
  async (userId: string) => {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverIds: { has: userId } }],
      },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            senderId: true,
            content: true,
            createdAt: true,
            subject: true,
            messageType: true,
            isReadByRecipient: true,
            isDeletedBySender: true,
            isDeletedByRecipient: true,
          },
        },
      },
    });

    const filteredConversations = conversations.filter(
      (conversation) => conversation.messages.length > 0
    );

    const conversationsWithMessages = await Promise.all(
      filteredConversations.map(async (conversation) => {
        const messages = conversation.messages;
        const senderIds = [...new Set(messages.map((msg) => msg.senderId))];
        const senders = await prisma.user.findMany({
          where: { id: { in: senderIds } },
          select: { id: true, name: true, email: true, image: true },
        });

        return {
          id: conversation.id,
          messages: messages.map((msg) => ({
            ...msg,
            createdAt: msg.createdAt.toISOString(),
            sender: senders.find((s) => s.id === msg.senderId)!,
          })),
        };
      })
    );

    const unreadMessageCount = await prisma.message.count({
      where: {
        recipientId: { has: userId },
        isReadByRecipient: false,
      },
    });

    return {
      data: conversationsWithMessages,
      unreadMessageCount,
    };
  },
  ["conversations"],
  { revalidate: 30, tags: ["conversations", "messages"] }
);

export async function getReceivedMessages() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/login");
  }
  const { data, unreadMessageCount } = await getCachedConversations(
    currentUser.id
  );
  return {
    message: "Conversations retrieved successfully",
    data,
    unreadMessageCount,
  };
}
