import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

const getCachedConversations = unstable_cache(
  async (userId: string) => {
    return await prisma.conversation.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverIds: { has: userId } }],
      },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
  },
  ["conversations"], 
  {
    revalidate: 30, 
    tags: ["conversations", "messages"], 
  }
);

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const conversations = await getCachedConversations(currentUser.id);
    return NextResponse.json({
      message: "Conversations retrieved successfully",
      data: conversations,
    });
  } catch (error: unknown) {
    console.error("Error retrieving conversations:", error);
    return NextResponse.error();
  }
}