import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const { eventId, newStartTime, newEndTime } = await req.json();

    if (!eventId || !newStartTime || !newEndTime) {
      return NextResponse.json(
        { error: "Missing required fields: eventId, newStartTime, newEndTime" },
        { status: 400 }
      );
    }

    const startDateTime = new Date(newStartTime);
    const endDateTime = new Date(newEndTime);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format for startTime or endTime" },
        { status: 400 }
      );
    }

    if (startDateTime >= endDateTime) {
      return NextResponse.json(
        { error: "Start time must be before end time" },
        { status: 400 }
      );
    }

    const existingEvent = await prisma.userEvent.findUnique({
      where: { id: eventId },
      include: { creator: true, participant: true, eventType: true },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (
      existingEvent.creatorId !== currentUser.id &&
      existingEvent.participantId !== currentUser.id
    ) {
      return NextResponse.json(
        { error: "Unauthorized to reschedule this event" },
        { status: 403 }
      );
    }

    const conflictingEvents = await prisma.userEvent.findMany({
      where: {
        id: { not: eventId },
        OR: [
          {
            creatorId: {
              in: [existingEvent.creatorId, existingEvent.participantId],
            },
          },
          {
            participantId: {
              in: [existingEvent.creatorId, existingEvent.participantId],
            },
          },
        ],
        AND: [
          {
            OR: [
              { startTime: { lte: endDateTime, gte: startDateTime } },
              { endTime: { lte: endDateTime, gte: startDateTime } },
              {
                AND: [
                  { startTime: { lte: startDateTime } },
                  { endTime: { gte: endDateTime } },
                ],
              },
            ],
          },
        ],
      },
    });

    if (conflictingEvents.length > 0) {
      return NextResponse.json(
        {
          error:
            "The new time conflicts with an existing event for one or both users.",
        },
        { status: 400 }
      );
    }

    const conflictingInterviews = await prisma.interview.findMany({
      where: {
        OR: [
          {
            userId: {
              in: [existingEvent.creatorId, existingEvent.participantId],
            },
          },
        ],
        AND: [
          {
            OR: [
              { startTime: { lte: endDateTime, gte: startDateTime } },
              { endTime: { lte: endDateTime, gte: startDateTime } },
              {
                AND: [
                  { startTime: { lte: startDateTime } },
                  { endTime: { gte: endDateTime } },
                ],
              },
            ],
          },
        ],
      },
    });

    if (conflictingInterviews.length > 0) {
      return NextResponse.json(
        {
          error:
            "The new time conflicts with an existing interview for one or both users.",
        },
        { status: 400 }
      );
    }

    const updatedEvent = await prisma.userEvent.update({
      where: { id: eventId },
      data: {
        startTime: startDateTime,
        endTime: endDateTime,
        eventTypeId: existingEvent.eventTypeId,
      },
    });

    await prisma.timeSlot.updateMany({
      where: { eventId: eventId },
      data: {
        startTime: startDateTime,
        endTime: endDateTime,
      },
    });

    const creator = await prisma.user.findUnique({
      where: { id: existingEvent.creatorId },
      select: { name: true, email: true },
    });

    const participant = await prisma.user.findUnique({
      where: { id: existingEvent.participantId },
      select: { name: true, email: true },
    });

    if (!creator || !participant) {
      return NextResponse.json(
        { error: "User details not found for notification" },
        { status: 500 }
      );
    }

    const formattedStartTime = format(
      startDateTime,
      "MMMM d, yyyy 'at' h:mm a"
    );
    const formattedEndTime = format(endDateTime, "h:mm a");
    const subject = `Event Rescheduled: ${existingEvent.title} between ${creator.name} and ${participant.name}`;

    let conversationId;
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          {
            senderId: currentUser.id,
            receiverIds: { has: existingEvent.participantId },
          },
          {
            senderId: existingEvent.participantId,
            receiverIds: { has: currentUser.id },
          },
        ],
      },
    });

    if (existingConversation) {
      conversationId = existingConversation.id;
    } else {
      const newConversation = await prisma.conversation.create({
        data: {
          senderId: currentUser.id,
          receiverIds: [existingEvent.participantId],
        },
      });
      conversationId = newConversation.id;
    }

    await prisma.message.create({
      data: {
        senderId: currentUser.id,
        recipientId: [existingEvent.creatorId],
        subject,
        content: `The event "${existingEvent.title}" with ${participant.name} has been rescheduled to ${formattedStartTime} to ${formattedEndTime}`,
        messageType: "TEXT",
        isReadByRecipient: currentUser.id === existingEvent.creatorId,
        conversationId,
      },
    });

    await prisma.message.create({
      data: {
        senderId: currentUser.id,
        recipientId: [existingEvent.participantId],
        subject,
        content: `The event "${existingEvent.title}" with ${creator.name} has been rescheduled to ${formattedStartTime} to ${formattedEndTime}`,
        messageType: "TEXT",
        isReadByRecipient: currentUser.id === existingEvent.participantId,
        conversationId,
      },
    });

    revalidatePath("/calendar", "page");

    return NextResponse.json(
      {
        message: "Event rescheduled successfully",
        event: updatedEvent,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error rescheduling event:", error);
    return NextResponse.json(
      { error: "An error occurred while rescheduling the event" },
      { status: 500 }
    );
  }
}
