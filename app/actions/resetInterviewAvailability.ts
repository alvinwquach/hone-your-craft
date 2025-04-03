"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { DayOfWeek } from "@prisma/client";
import { format, getDay } from "date-fns";
import { revalidatePath } from "next/cache";

function convertToDayOfWeek(day: number): DayOfWeek {
  const days: DayOfWeek[] = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  return days[day];
}

export async function resetInterviewAvailability(date: Date | null) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error("Unauthorized");
    }

    if (!date) {
      throw new Error("Missing required date parameter");
    }

    const selectedDate = new Date(date);
    if (isNaN(selectedDate.getTime())) {
      throw new Error("Invalid date: " + date);
    }

    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const dayOfWeek = convertToDayOfWeek(getDay(selectedDate));

    await prisma.$transaction([
      prisma.eventTypeAvailability.deleteMany({
        where: {
          availability: {
            userId: currentUser.id,
            dayOfWeek: dayOfWeek,
            startTime: { gte: startOfDay },
            endTime: { lte: endOfDay },
          },
        },
      }),
      prisma.interviewAvailability.deleteMany({
        where: {
          userId: currentUser.id,
          dayOfWeek: dayOfWeek,
          startTime: { gte: startOfDay },
          endTime: { lte: endOfDay },
        },
      }),
    ]);

    revalidatePath("/calendar");

    return {
      success: true,
      message: `Availability cleared for ${format(
        selectedDate,
        "EEEE, LLLL d, yyyy"
      )}`,
    };
  } catch (error) {
    console.error("Error clearing availability:", error);
    return {
      success: false,
      message: "Failed to reset availability",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
