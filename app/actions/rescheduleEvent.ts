"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { format } from "date-fns";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function rescheduleEvent(formData: FormData) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const eventId = formData.get("eventId") as string;
    const newStartTime = formData.get("newStartTime") as string;
    const newEndTime = formData.get("newEndTime") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    if (!eventId || !newStartTime || !newEndTime) {
      throw new Error(
        "Missing required fields: eventId, newStartTime, newEndTime"
      );
    }

    const startDateTime = new Date(newStartTime);
    const endDateTime = new Date(newEndTime);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      throw new Error("Invalid date format for startTime or endTime");
    }

    if (startDateTime >= endDateTime) {
      throw new Error("Start time must be before end time");
    }

    const existingEvent = await prisma.userEvent.findUnique({
      where: { id: eventId },
      include: { creator: true, participant: true, eventType: true },
    });

    if (!existingEvent) {
      throw new Error("Event not found");
    }

    if (
      existingEvent.creatorId !== currentUser.id &&
      existingEvent.participantId !== currentUser.id
    ) {
      throw new Error("Unauthorized to reschedule this event");
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
      throw new Error("The new time conflicts with an existing event.");
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
      throw new Error("The new time conflicts with an existing interview.");
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
      throw new Error("User details not found for notification");
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

    revalidatePath("/calendar");

    const formattedMeetingTime = `${format(
      startDateTime,
      "hh:mm a"
    )} - ${format(endDateTime, "hh:mm a")}, ${format(
      startDateTime,
      "EEEE, MMMM d, yyyy"
    )}`;
    const queryParams = new URLSearchParams({
      name,
      email,
      meetingTime: formattedMeetingTime,
    });

    redirect(`/schedule/confirmation?${queryParams.toString()}`);
  } catch (error) {
    console.error("Error in rescheduleEvent:", error);
    throw error;
  }
}