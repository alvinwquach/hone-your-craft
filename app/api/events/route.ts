import { NextResponse } from "next/server";
import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { unstable_cache } from "next/cache";

const getCachedEvents = unstable_cache(
  async (userId: string) => {
    return await prisma.eventType.findMany({
      where: {
        userId: userId,
      },
    });
  },
  ["event_types"],
  { tags: ["event_types"] }
);

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "User is not authenticated" },
        { status: 401 }
      );
    }

    const events = await getCachedEvents(currentUser.id);

    return NextResponse.json({ events }, { status: 200 });
  } catch (error) {
    console.error("Error fetching event types:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching event types" },
      { status: 500 }
    );
  }
}
