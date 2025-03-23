import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const getCachedMentions = unstable_cache(
  async (userId: string) => {
    return await prisma.message.findMany({
      where: {
        mentionedUserIds: {
          has: userId,
        },
      },
      select: {
        id: true,
        subject: true,
        content: true,
        createdAt: true,
        conversationId: true,
        conversation: true,
        sender: {
          select: {
            id: true,
            image: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },
  ["mentions"],
  { revalidate: 30 } 
);

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const cachedMentions = await getCachedMentions(currentUser.id);
    return NextResponse.json({
      message: "Mentions retrieved successfully",
      data: cachedMentions,
    });
  } catch (error: unknown) {
    console.error("Error retrieving mentions:", error);
    return NextResponse.json(
      {
        message: "Error retrieving mentions",
        error: "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}