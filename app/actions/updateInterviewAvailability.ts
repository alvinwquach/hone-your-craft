"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { DayOfWeek } from "@prisma/client";
import { getDay } from "date-fns";
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

export async function updateInterviewAvailability(
  data:
    | {
        id: string;
        startTime: string;
        endTime: string;
      }
    | {
        events: {
          id: string;
          startTime: string;
          endTime: string;
          isRecurring?: boolean;
        }[];
      }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error("Unauthorized");
    }

    if ("id" in data) {
      const { id, startTime, endTime } = data;

      const availability = await prisma.interviewAvailability.findUnique({
        where: { id },
      });

      if (!availability || availability.userId !== currentUser.id) {
        throw new Error("Availability not found or not owned by user");
      }

      const updatedStart = new Date(startTime);
      const updatedEnd = new Date(endTime);

      if (isNaN(updatedStart.getTime()) || isNaN(updatedEnd.getTime())) {
        throw new Error("Invalid startTime or endTime");
      }

      if (updatedEnd <= updatedStart) {
        throw new Error("End time must be after start time");
      }

      const overlapping = await prisma.interviewAvailability.findMany({
        where: {
          userId: currentUser.id,
          id: { not: id },
          dayOfWeek: availability.dayOfWeek,
          OR: [
            {
              startTime: { lte: updatedEnd },
              endTime: { gte: updatedStart },
            },
          ],
        },
      });

      if (overlapping.length > 0) {
        throw new Error(
          "Updated time range overlaps with existing availability"
        );
      }

      const updatedAvailability = await prisma.interviewAvailability.update({
        where: { id },
        data: {
          startTime: updatedStart,
          endTime: updatedEnd,
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        message: "Availability updated successfully",
        updatedAvailability,
      };
    } else if ("events" in data) {
      const { events } = data;

      if (!events || events.length === 0) {
        throw new Error("No events provided for update");
      }

      const updatedAvailabilities = await prisma.$transaction(
        events.map((event) => {
          const updatedStart = new Date(event.startTime);
          const updatedEnd = new Date(event.endTime);
          const dayOfWeek = convertToDayOfWeek(getDay(updatedStart)); // Using getDay here

          if (isNaN(updatedStart.getTime()) || isNaN(updatedEnd.getTime())) {
            throw new Error(`Invalid time for event ${event.id}`);
          }

          if (updatedEnd <= updatedStart) {
            throw new Error(
              `End time must be after start time for event ${event.id}`
            );
          }

          return prisma.interviewAvailability.update({
            where: {
              id: event.id,
              userId: currentUser.id,
            },
            data: {
              startTime: updatedStart,
              endTime: updatedEnd,
              dayOfWeek,
              isRecurring:
                event.isRecurring !== undefined ? event.isRecurring : false,
              updatedAt: new Date(),
            },
          });
        })
      );

      revalidatePath("/calendar");

      return {
        success: true,
        message: "Availabilities updated successfully",
        updatedAvailabilities,
      };
    } else {
      throw new Error("Invalid request data");
    }
  } catch (error) {
    console.error("Error updating availability:", error);
    return {
      success: false,
      message: "Failed to update availability",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
