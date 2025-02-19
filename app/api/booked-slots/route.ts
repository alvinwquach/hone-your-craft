import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const bookedSlots = await prisma.timeSlot.findMany({
      where: {
        isBooked: true,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            startTime: true,
            endTime: true,
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            participant: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    console.log("Fetched booked slots:", JSON.stringify(bookedSlots, null, 2));

    return NextResponse.json(
      {
        message: "Booked slots retrieved successfully",
        bookedSlots,
        total: bookedSlots.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching booked slots:", {
      error,
    });
    return NextResponse.json(
      {
        error: "An error occurred while fetching booked slots",
      },
      { status: 500 }
    );
  }
}
