"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";

interface SentMessage {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  subject: string | null;
  messageType: string;
  isReadByRecipient: boolean;
  isDeletedBySender: boolean;
  isDeletedByRecipient: boolean;
}

interface Receiver {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface SentConversation {
  conversationId: string;
  receiverIds: string[];
  sentMessages: SentMessage[];
  receivers: Receiver[];
}

const getCachedConversations = unstable_cache(
  async (userId: string) => {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverIds: { has: userId } }],
      },
      include: {
        messages: {
          where: {
            senderId: userId,
            isDeletedBySender: false,
          },
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
        userConversations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    const filteredConversations = conversations.filter(
      (conversation) => conversation.messages.length > 0
    );

    return {
      message: "Sent messages retrieved successfully",
      data: filteredConversations.map((conversation) => ({
        conversationId: conversation.id,
        receiverIds: conversation.receiverIds,
        sentMessages: conversation.messages.map((message) => ({
          id: message.id,
          senderId: message.senderId,
          content: message.content,
          createdAt: message.createdAt.toISOString(),
          subject: message.subject,
          messageType: message.messageType,
          isReadByRecipient: message.isReadByRecipient,
          isDeletedBySender: message.isDeletedBySender,
          isDeletedByRecipient: message.isDeletedByRecipient,
        })),
        receivers: conversation.userConversations
          .filter((uc) => uc.userId !== userId)
          .map((uc) => ({
            id: uc.user.id,
            name: uc.user.name,
            email: uc.user.email,
            image: uc.user.image,
          })),
      })),
    };
  },
  ["sent-conversations"],
  { revalidate: 30, tags: ["conversations", "messages"] }
);

export async function getSentMessages() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return redirect("/login");
  }
  return await getCachedConversations(currentUser.id);
}
