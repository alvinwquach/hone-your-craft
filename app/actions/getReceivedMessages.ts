"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";

const getCachedConversations = unstable_cache(
  async (userId: string) => {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverIds: { has: userId } }],
      },
      select: {
        id: true,
        senderId: true,
        receiverIds: true,
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
        const receiverIds = conversation.receiverIds.filter(
          (id) => id !== userId
        );
        const participantIds = [...new Set([...senderIds, ...receiverIds])];

        const participants = await prisma.user.findMany({
          where: { id: { in: participantIds } },
          select: { id: true, name: true, email: true, image: true },
        });

        return {
          id: conversation.id,
          senderId: conversation.senderId,
          receiverIds: conversation.receiverIds,
          participants: participants.map((p) => ({
            id: p.id,
            name: p.name,
            email: p.email,
            image: p.image,
          })),
          messages: messages.map((msg) => ({
            ...msg,
            createdAt: msg.createdAt.toISOString(),
            sender: participants.find((p) => p.id === msg.senderId) || {
              id: msg.senderId,
              name: null,
              email: null,
              image: null,
            },
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