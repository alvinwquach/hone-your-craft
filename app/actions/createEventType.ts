"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { EventType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

interface CreateEventTypeInput {
  title: string;
  length: number;
}

export async function createEventType({
  title,
  length,
}: CreateEventTypeInput): Promise<{ message: string; event: EventType }> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return redirect("/login");
  }

  if (!title || !length) {
    throw new Error("Missing or incorrect required fields");
  }

  const event = await prisma.eventType.create({
    data: {
      userId: currentUser.id,
      title,
      length,
    },
  });

  const availabilities = await prisma.interviewAvailability.findMany({
    where: { userId: currentUser.id },
  });

  if (availabilities.length > 0) {
    await prisma.eventTypeAvailability.createMany({
      data: availabilities.map((availability) => ({
        eventTypeId: event.id,
        availabilityId: availability.id,
      })),
    });
  }
  revalidatePath("/calendar");

  return { message: "Event type created successfully", event };
}
