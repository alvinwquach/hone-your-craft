"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath } from "next/cache";
import { DayOfWeek } from "@prisma/client";

const dayOfWeekMap: Record<string, DayOfWeek> = {
  SUNDAY: "SUNDAY",
  MONDAY: "MONDAY",
  TUESDAY: "TUESDAY",
  WEDNESDAY: "WEDNESDAY",
  THURSDAY: "THURSDAY",
  FRIDAY: "FRIDAY",
  SATURDAY: "SATURDAY",
};

export async function createEventType({
  title,
  length,
  availabilityData,
}: {
  title: string;
  length: number;
  availabilityData: {
    dayOfWeek: string;
    isRecurring: boolean;
    startTime: string;
    endTime: string;
  }[];
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("User is not authenticated");
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

  if (availabilityData && availabilityData.length > 0) {
    const availabilityPromises = availabilityData.map(async (availability) => {
      const normalizedDay = availability.dayOfWeek.toUpperCase();
      const fullDayOfWeek = dayOfWeekMap[normalizedDay];
      if (!fullDayOfWeek) {
        throw new Error(`Invalid dayOfWeek value: ${availability.dayOfWeek}`);
      }

      const existingAvailability = await prisma.interviewAvailability.findFirst(
        {
          where: {
            userId: currentUser.id,
            dayOfWeek: fullDayOfWeek,
            startTime: new Date(availability.startTime),
            endTime: new Date(availability.endTime),
            isRecurring: availability.isRecurring,
          },
        }
      );

      if (!existingAvailability) {
        return prisma.interviewAvailability.create({
          data: {
            userId: currentUser.id,
            dayOfWeek: fullDayOfWeek,
            isRecurring: availability.isRecurring,
            startTime: new Date(availability.startTime),
            endTime: new Date(availability.endTime),
          },
        });
      }
      return existingAvailability;
    });

    const availabilities = await Promise.all(availabilityPromises);

    await prisma.eventTypeAvailability.createMany({
      data: availabilities.map((availability) => ({
        eventTypeId: event.id,
        availabilityId: availability!.id,
      })),
    });
  }

  revalidatePath("/calendar");

  return { message: "Event type created successfully", event };
}
