import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { unstable_cache } from "next/cache";

const getCachedEvents = unstable_cache(
  async (userId: string) => {
    const now = new Date();
    const events = await prisma.userEvent.findMany({
      where: {
        AND: [
          {
            OR: [{ creatorId: userId }, { participantId: userId }],
          },
          {
            endTime: { lt: now },
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
      },
      orderBy: {
        startTime: "desc",
      },
    });

    return events.map((event) => ({
      ...event,
      startTime: new Date(event.startTime),
      endTime: new Date(event.endTime),
    }));
  },
  ["events", "user-events"], 
  {
    revalidate: 60, 
    tags: ["events"],
  }
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