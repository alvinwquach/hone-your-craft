import { NextResponse } from "next/server";
import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "User is not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, length } = body;

    if (!title || !length) {
      return NextResponse.json(
        { error: "Missing or incorrect required fields" },
        { status: 400 }
      );
    }

    // Create the EventType
    const event = await prisma.eventType.create({
      data: {
        userId: currentUser.id,
        title,
        length,
      },
    });

    // Fetch existing InterviewAvailability for the user
    const availabilities = await prisma.interviewAvailability.findMany({
      where: {
        userId: currentUser.id,
      },
    });

    // Link all existing availability to the new event type
    for (const availability of availabilities) {
      await prisma.eventTypeAvailability.create({
        data: {
          eventTypeId: event.id,
          availabilityId: availability.id,
        },
      });
    }

    return NextResponse.json(
      { message: "Event type created successfully", event },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating event type:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the event type" },
      { status: 500 }
    );
  }
}