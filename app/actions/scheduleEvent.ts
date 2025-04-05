"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "./getCurrentUser";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";

export async function scheduleEvent(formData: FormData) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return redirect("/login");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;
  const participantId = formData.get("participantId") as string;
  const eventTypeId = formData.get("eventTypeId") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  if (!title || !startTime || !endTime || !participantId || !eventTypeId) {
    throw new Error("Missing required fields");
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
    throw new Error("Time slot conflicts with an existing event.");
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

  const formattedMeetingTime = `${format(startDateTime, "hh:mm a")} - ${format(
    endDateTime,
    "hh:mm a"
  )}, ${format(startDateTime, "EEEE, MMMM d, yyyy")}`;

  revalidatePath("/calendar");

  const queryParams = new URLSearchParams({
    name,
    email,
    meetingTime: formattedMeetingTime,
  });
  redirect(`/schedule/confirmation?${queryParams.toString()}`);
}
