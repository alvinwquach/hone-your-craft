import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { format, getDay } from "date-fns";
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

export async function DELETE(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { date } = body;

    if (!date) {
      return NextResponse.json(
        { error: "Missing required date parameter" },
        { status: 400 }
      );
    }

    const selectedDate = new Date(date);
    if (isNaN(selectedDate.getTime())) {
      throw new Error("Invalid date: " + date);
    }

    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const dayOfWeek = convertToDayOfWeek(selectedDate.getDay());

    await prisma.clientInterviewAvailability.deleteMany({
      where: {
        clientId: currentUser.id,
        dayOfWeek: dayOfWeek,
        startTime: {
          gte: startOfDay,
        },
        endTime: {
          lte: endOfDay,
        },
      },
    });

    return NextResponse.json(
      {
        message: `Availability cleared for ${format(
          selectedDate,
          "EEEE, LLLL d, yyyy"
        )}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error clearing availability:", error);
    return NextResponse.json(
      { error: "An error occurred while clearing availability" },
      { status: 500 }
    );
  }
}



