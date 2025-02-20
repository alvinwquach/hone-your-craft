import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const { id } = params;

    const event = await prisma.eventType.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        availabilities: {
          include: {
            availability: {
              select: {
                id: true,
                userId: true,
                dayOfWeek: true,
                isRecurring: true,
                startTime: true,
                endTime: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event type not found" },
        { status: 404 }
      );
    }

    const bookedSlots = await prisma.timeSlot.findMany({
      where: {
        isBooked: true,
        event: {
          OR: [{ creatorId: event.userId }, { participantId: event.userId }],
        },
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            startTime: true,
            endTime: true,
            creator: { select: { id: true, name: true, email: true } },
            participant: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { startTime: "asc" },
    });

    const formattedEvent = {
      ...event,
      availabilities: event.availabilities.map((ea) => ea.availability),
    };

    return NextResponse.json(
      {
        message: "Event type and booked slots retrieved successfully",
        event: formattedEvent,
        bookedSlots,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching event type and booked slots:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching data" },
      { status: 500 }
    );
  }
}
