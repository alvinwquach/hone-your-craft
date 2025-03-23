import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { unstable_cache } from "next/cache";

const getCachedEvents = unstable_cache(
  async (userId: string) => {
    const now = new Date();
    return await prisma.userEvent.findMany({
      where: {
        AND: [
          {
            OR: [{ creatorId: userId }, { participantId: userId }],
          },
          {
            startTime: { gt: now },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
        startTime: true,
        endTime: true,
        creator: {
          select: {
            name: true,
            email: true,
          },
        },
        participant: {
          select: {
            name: true,
            email: true,
          },
        },
        eventType: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });
  },
  ["events"],
  { revalidate: 60 }
);

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }
    const cachedEvents = await getCachedEvents(currentUser.id);
    return NextResponse.json(cachedEvents, { status: 200 });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}