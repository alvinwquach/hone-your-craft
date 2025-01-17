import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { getDay } from "date-fns";
import { DayOfWeek } from "@prisma/client";

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

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { dates, timeRanges } = body;

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

        // Create new Date objects with the correct date and time
        const start = new Date(selectedDate);
        start.setHours(startHour, startMinute, 0, 0);

        const end = new Date(selectedDate);
        end.setHours(endHour, endMinute, 0, 0);

        const existingEntries =
          await prisma.clientInterviewAvailability.findMany({
            where: {
              clientId: currentUser.id,
              startTime: {
                lte: end,
              },
              endTime: {
                gte: start,
              },
              dayOfWeek: dayOfWeek,
            },
          });

        if (existingEntries.length > 0) {
          return NextResponse.json(
            { error: "An overlapping time range already exists for this day" },
            { status: 400 }
          );
        }

        await prisma.clientInterviewAvailability.create({
          data: {
            clientId: currentUser.id,
            dayOfWeek: dayOfWeek,
            startTime: start,
            endTime: end,
          },
        });
      }
    }

    return NextResponse.json(
      { message: "Availability added successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding availability:", error);
    return NextResponse.json(
      { error: "An error occurred while adding availability" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const availabilities = await prisma.clientInterviewAvailability.findMany({
      where: {
        clientId: currentUser.id,
      },
      orderBy: {
        dayOfWeek: "asc",
      },
    });

    const formattedAvailabilities = availabilities.map((avail) => ({
      ...avail,
      dayOfWeek: convertToDayOfWeek(avail.dayOfWeek as unknown as number),
    }));

    return NextResponse.json(formattedAvailabilities, { status: 200 });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching availability" },
      { status: 500 }
    );
  }
}
