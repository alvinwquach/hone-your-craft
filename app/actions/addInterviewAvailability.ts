"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "./getCurrentUser";
import { DayOfWeek } from "@prisma/client";
import { getDay } from "date-fns";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function convertToDayOfWeek(dayNumber: number): DayOfWeek {
  return [
    DayOfWeek.SUNDAY,
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
  ][dayNumber];
}

export async function addInterviewAvailability(
  dates: string[],
  timeRanges: { startTime: string; endTime: string }[],
  isRecurring: boolean
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return redirect("/login");
    }

    for (const date of dates) {
      const selectedDate = new Date(date);
      if (isNaN(selectedDate.getTime())) {
        throw new Error("Invalid date: " + date);
      }

      const dayOfWeek = convertToDayOfWeek(getDay(selectedDate));

      for (const timeRange of timeRanges) {
        const startParts = timeRange.startTime.match(
          /^(\d+):(\d+)\s*(AM|PM)$/i
        );
        const endParts = timeRange.endTime.match(/^(\d+):(\d+)\s*(AM|PM)$/i);

        if (!startParts || !endParts) {
          throw new Error("Invalid time format in time range");
        }

        const startHour =
          (parseInt(startParts[1]) % 12) +
          (startParts[3].toUpperCase() === "PM" ? 12 : 0);
        const endHour =
          (parseInt(endParts[1]) % 12) +
          (endParts[3].toUpperCase() === "PM" ? 12 : 0);
        const startMinute = parseInt(startParts[2]);
        const endMinute = parseInt(endParts[2]);

        const start = new Date(selectedDate);
        start.setHours(startHour, startMinute, 0, 0);

        const end = new Date(selectedDate);
        end.setHours(endHour, endMinute, 0, 0);

        const existingEntries = await prisma.interviewAvailability.findMany({
          where: {
            userId: currentUser.id,
            startTime: { lte: end },
            endTime: { gte: start },
            dayOfWeek: dayOfWeek,
          },
        });

        if (existingEntries.length > 0) {
          throw new Error(
            "An overlapping time range already exists for this day"
          );
        }

        const newAvailability = await prisma.interviewAvailability.create({
          data: {
            userId: currentUser.id,
            dayOfWeek: dayOfWeek,
            startTime: start,
            endTime: end,
            isRecurring: isRecurring,
          },
        });

        const eventTypes = await prisma.eventType.findMany({
          where: { userId: currentUser.id },
        });

        for (const eventType of eventTypes) {
          await prisma.eventTypeAvailability.create({
            data: {
              eventTypeId: eventType.id,
              availabilityId: newAvailability.id,
            },
          });
        }
      }
    }

    revalidatePath("/calendar");
    return { success: true, message: "Availability added successfully" };
  } catch (error) {
    console.error("Error adding availability:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
