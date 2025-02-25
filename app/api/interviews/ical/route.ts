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

    const userInterviews = await prisma.interview.findMany({
      where: {
        userId: currentUser.id,
      },
      include: {
        job: {
          select: {
            title: true,
            company: true,
          },
        },
      },
    });

    if (!userInterviews.length) {
      return NextResponse.json(
        { error: "No interviews found" },
        { status: 404 }
      );
    }

    const calendar = ical({
      name: "Interviews Calendar",
      timezone: "America/Los_Angeles",
    });

    userInterviews.forEach((interview) => {
      const start = new Date(interview.interviewDate ?? Date.now());
      const end = new Date(start);
      end.setHours(end.getHours() + 1);

      calendar.createEvent({
        summary: `${interview.job.title} - ${interview.interviewType}`,
        description: `Interview at ${interview.job.company}`,
        start,
        end,
        timezone: "America/Los_Angeles",
        organizer: {
          name: interview.job.company,
          email: "interviews@example.com",
        },
        attendees: [
          {
            name: currentUser.name || "Interview Candidate",
            email: currentUser.email || "candidate@example.com",
            rsvp: true,
          },
        ],
        url: interview.videoUrl,
        location: interview.videoUrl
          ? "Virtual Interview"
          : "In-person Interview",
      });
    });

    return new Response(calendar.toString(), {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="interviews-${Date.now()}.ics"`,
      },
    });
  } catch (error) {
    console.error("Error generating interview calendar:", error);
    return NextResponse.json(
      { error: "Failed to generate interview calendar" },
      { status: 500 }
    );
  }
}
