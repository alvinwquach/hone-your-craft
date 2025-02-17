import { NextResponse } from "next/server";
import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const eventId = params.id;

  try {
    const event = await prisma.eventType.findUnique({
      where: { id: eventId },
      include: {
        availabilities: {
          include: {
            availability: true,
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

    const formattedEvent = {
      ...event,
      availabilities: event.availabilities.map((ea) => ea.availability),
    };

    return NextResponse.json(formattedEvent);
  } catch (error) {
    console.error("Error fetching event type:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching the event type" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const eventId = params.id;

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "User is not authenticated" },
        { status: 401 }
      );
    }

    const event = await prisma.eventType.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event type not found" },
        { status: 404 }
      );
    }

    if (event.userId !== currentUser.id) {
      return NextResponse.json(
        { error: "You do not have permission to delete this event type" },
        { status: 403 }
      );
    }

    await prisma.eventTypeAvailability.deleteMany({
      where: {
        eventTypeId: eventId,
      },
    });

    await prisma.eventType.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ message: "Event type deleted successfully" });
  } catch (error) {
    console.error("Error deleting event type:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting the event type" },
      { status: 500 }
    );
  }
}

