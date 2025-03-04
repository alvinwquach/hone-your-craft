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
    const { dates, timeRanges, isRecurring } = body;

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
          return NextResponse.json(
            { error: "An overlapping time range already exists for this day" },
            { status: 400 }
          );
        }

        const newAvailability = await prisma.interviewAvailability.create({
          data: {
            userId: currentUser.id,
            dayOfWeek: dayOfWeek,
            startTime: start,
            endTime: end,
            isRecurring: Boolean(isRecurring),
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

    const availabilities = await prisma.interviewAvailability.findMany({
      where: { userId: currentUser.id },
      orderBy: { dayOfWeek: "asc" },
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

export async function PUT(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (body.id && body.startTime && body.endTime) {
      const { id, startTime, endTime } = body;

      const availability = await prisma.interviewAvailability.findUnique({
        where: { id },
      });

      if (!availability || availability.userId !== currentUser.id) {
        return NextResponse.json(
          { error: "Availability not found or not owned by user" },
          { status: 404 }
        );
      }

      const updatedStart = new Date(startTime);
      const updatedEnd = new Date(endTime);

      if (isNaN(updatedStart.getTime()) || isNaN(updatedEnd.getTime())) {
        return NextResponse.json(
          { error: "Invalid startTime or endTime" },
          { status: 400 }
        );
      }

      if (updatedEnd <= updatedStart) {
        return NextResponse.json(
          { error: "End time must be after start time" },
          { status: 400 }
        );
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
        return NextResponse.json(
          { error: "Updated time range overlaps with existing availability" },
          { status: 400 }
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

      return NextResponse.json(
        { message: "Availability updated successfully", updatedAvailability },
        { status: 200 }
      );
    } else if (body.events && Array.isArray(body.events)) {
      const { events } = body;

      if (events.length === 0) {
        return NextResponse.json(
          { error: "No events provided for update" },
          { status: 400 }
        );
      }

      const updatedAvailabilities = await prisma.$transaction(
        events.map(
          (event: {
            id: string;
            startTime: string;
            endTime: string;
            isRecurring?: boolean;
          }) => {
            const updatedStart = new Date(event.startTime);
            const updatedEnd = new Date(event.endTime);
            const dayOfWeek = convertToDayOfWeek(updatedStart.getDay());

            if (isNaN(updatedStart.getTime()) || isNaN(updatedEnd.getTime())) {
              throw new Error(`Invalid time for event ${event.id}`);
            }

            if (updatedEnd <= updatedStart) {
              throw new Error(
                `End time must be after start time for event ${event.id}`
              );
            }

            return prisma.interviewAvailability.update({
              where: { id: event.id, userId: currentUser.id },
              data: {
                startTime: updatedStart,
                endTime: updatedEnd,
                dayOfWeek,
                isRecurring:
                  event.isRecurring !== undefined ? event.isRecurring : false,
                updatedAt: new Date(),
              },
            });
          }
        )
      );

      return NextResponse.json(
        {
          message: "Availabilities updated successfully",
          updatedAvailabilities,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error updating availability:", error);
    return NextResponse.json(
      { error: "An error occurred while updating availability" },
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

    await prisma.eventTypeAvailability.deleteMany({
      where: {
        availability: {
          userId: currentUser.id,
          dayOfWeek: dayOfWeek,
          startTime: { gte: startOfDay },
          endTime: { lte: endOfDay },
        },
      },
    });

    await prisma.interviewAvailability.deleteMany({
      where: {
        userId: currentUser.id,
        dayOfWeek: dayOfWeek,
        startTime: { gte: startOfDay },
        endTime: { lte: endOfDay },
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

