"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath } from "next/cache";

export async function rescheduleEvent(
  eventId: string,
  newStartTime: string,
  newEndTime: string
) {
  const currentUser = await getCurrentUser();

  if (!eventId || !newStartTime || !newEndTime) {
    throw new Error("Event ID, start time, and end time are required");
  }

  const event = await prisma.userEvent.findUnique({
    where: { id: eventId },
  });

  if (
    !event ||
    (event.creatorId !== currentUser?.id &&
      event.participantId !== currentUser?.id)
  ) {
    throw new Error("Event not found or unauthorized");
  }

  const updatedEvent = await prisma.userEvent.update({
    where: { id: eventId },
    data: {
      startTime: new Date(newStartTime),
      endTime: new Date(newEndTime),
    },
  });

  revalidatePath("/profile/meetings");
  return { message: "Event rescheduled successfully", event: updatedEvent };
}
