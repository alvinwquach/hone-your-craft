import ical from "ical-generator";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const events = await prisma.userEvent.findMany({
      where: {
        OR: [{ creatorId: currentUser.id }, { participantId: currentUser.id }],
      },
      select: {
        id: true,
        title: true,
        description: true,
        startTime: true,
        endTime: true,
        creator: {
          select: {
            name: true,
            email: true,
          },
        },
        participant: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
    });

    if (!events.length) {
      return NextResponse.json({ error: "No events found" }, { status: 404 });
    }

    const calendar = ical({
      name: "Events Calendar",
      timezone: "America/Los_Angeles",
    });

    events.forEach((event) => {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);

      const summary = `${event.title} Scheduled with ${event.participant.name}`;

      calendar.createEvent({
        summary: summary,
        description: event.description || "",
        start,
        end,
        timezone: "America/Los_Angeles",
        organizer: {
          name: event.creator.name || "Unknown Creator",
          email: event.creator.email || "creator@example.com",
        },
        attendees: [
          {
            name: event.participant.name || "Unknown Participant",
            email: event.participant.email || "participant@example.com",
            rsvp: true,
          },
        ],
      });
    });

    return new Response(calendar.toString(), {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="events-${Date.now()}.ics"`,
      },
    });
  } catch (error) {
    console.error("Error generating calendar:", error);
    return NextResponse.json(
      { error: "Failed to generate calendar" },
      { status: 500 }
    );
  }
}
