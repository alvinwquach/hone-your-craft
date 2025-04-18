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

    const {
      title,
      description,
      startTime,
      endTime,
      participantId,
      eventTypeId,
    } = await req.json();

    if (!title || !startTime || !endTime || !participantId || !eventTypeId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);

    const existingUserEvents = await prisma.userEvent.findMany({
      where: {
        OR: [
          { creatorId: { in: [currentUser.id, participantId] } },
          { participantId: { in: [currentUser.id, participantId] } },
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

    if (existingUserEvents.length > 0) {
      return NextResponse.json(
        {
          error:
            "The selected time conflicts with an existing event for one or both users.",
        },
        { status: 400 }
      );
    }

    const existingInterviews = await prisma.interview.findMany({
      where: {
        OR: [{ userId: { in: [currentUser.id, participantId] } }],
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

    if (existingInterviews.length > 0) {
      return NextResponse.json(
        {
          error:
            "The selected time conflicts with an existing interview for one or both users.",
        },
        { status: 400 }
      );
    }

    const event = await prisma.userEvent.create({
      data: {
        eventTypeId,
        title,
        description,
        startTime: startDateTime,
        endTime: endDateTime,
        creatorId: currentUser.id,
        participantId,
      },
    });

    await prisma.timeSlot.create({
      data: {
        eventId: event.id,
        startTime: startDateTime,
        endTime: endDateTime,
        isBooked: true,
        bookedBy: participantId,
      },
    });

    const creator = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { name: true, email: true },
    });

    const participant = await prisma.user.findUnique({
      where: { id: participantId },
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
    const subject = `Event Scheduled: ${title} between ${creator.name} and ${participant.name}`;

    let conversationId;
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { senderId: currentUser.id, receiverIds: { has: participantId } },
          { senderId: participantId, receiverIds: { has: currentUser.id } },
        ],
      },
    });

    if (existingConversation) {
      conversationId = existingConversation.id;
    } else {
      const newConversation = await prisma.conversation.create({
        data: {
          senderId: currentUser.id,
          receiverIds: [participantId],
        },
      });
      conversationId = newConversation.id;
    }

    await prisma.message.create({
      data: {
        senderId: currentUser.id,
        recipientId: [currentUser.id],
        subject,
        content: `You scheduled an event with ${participant.name} from ${formattedStartTime} to ${formattedEndTime}`,
        messageType: "TEXT",
        isReadByRecipient: true,
        conversationId,
      },
    });

    await prisma.message.create({
      data: {
        senderId: currentUser.id,
        recipientId: [participantId],
        subject,
        content: `New event scheduled by ${creator.name} from ${formattedStartTime} to ${formattedEndTime}`,
        messageType: "TEXT",
        isReadByRecipient: false,
        conversationId,
      },
    });

    revalidatePath("/calendar", "page");

    return NextResponse.json(
      {
        message: "Event scheduled successfully",
        event,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error scheduling event:", error);
    return NextResponse.json(
      { error: "An error occurred while scheduling the event" },
      { status: 500 }
    );
  }
}
