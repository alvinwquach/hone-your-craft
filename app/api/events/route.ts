import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const events = await prisma.userEvent.findMany({
      where: {
        OR: [{ creatorId: currentUser.id }, { participantId: currentUser.id }],
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

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
