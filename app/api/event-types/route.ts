import { NextResponse } from "next/server";
import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { MeetingDuration } from "@prisma/client";

const formatMeetingDuration = (duration: MeetingDuration | null): string => {
  switch (duration) {
    case MeetingDuration.FIFTEEN_MINUTES:
      return "15-min, One-on-One";
    case MeetingDuration.THIRTY_MINUTES:
      return "30 min, One-on-One";
    case MeetingDuration.FORTY_FIVE_MINUTES:
      return "45 min, One-on-One";
    case MeetingDuration.SIXTY_MINUTES:
      return "1 hr, One-on-One";
    case MeetingDuration.CUSTOM:
      return "";
    default:
      return "";
  }
};

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    const formattedDurations = Object.values(MeetingDuration).map(
      formatMeetingDuration
    );

    return NextResponse.json(
      {
        message: "Formatted Meeting Durations",
        durations: formattedDurations,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching event types:", error);
    return NextResponse.json(
      { message: "Error fetching event types" },
      { status: 500 }
    );
  }
}
