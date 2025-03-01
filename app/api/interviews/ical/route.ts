import ical from "ical-generator";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";

const interviewTypeMapping = {
  FINAL_ROUND: "Final Round",
  ON_SITE: "On-site Interview",
  TECHNICAL: "Technical Interview",
  PANEL: "Panel Interview",
  PHONE_SCREEN: "Phone Screen",
  ASSESSMENT: "Assessment",
  INTERVIEW: "Interview",
  VIDEO_INTERVIEW: "Video Interview",
  FOLLOW_UP: "Follow-up Interview",
  OFFER_EXTENDED: "Offer Extended",
  OFFER_ACCEPTED: "Offer Accepted",
  OFFER_REJECTED: "Offer Rejected",
  REJECTION: "Rejection",
  CONTRACT_SIGNED: "Contract Signed",
  SALARY_NEGOTIATION: "Salary Negotiation",
  FINAL_DECISION: "Final Decision",
  PRE_SCREENING: "Pre-Screening",
  GROUP_INTERVIEW: "Group Interview",
  REFERENCE_CHECK: "Reference Check",
  TRIAL_PERIOD: "Trial Period",
  FINAL_OFFER: "Final Offer",
  OFFER_WITHDRAWN: "Offer Withdrawn",
  NEGOTIATION_PHASE: "Negotiation Phase",
  ADDITIONAL_DOCS_REQUIRED: "Additional Docs Required",
  NO_SHOW: "No Show",
  CANDIDATE_WITHDREW: "Candidate Withdrew",
  HIRING_FREEZE: "Hiring Freeze",
  TAKE_HOME_ASSESSMENT: "Take Home Assessment",
};

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

      const humanReadableType =
        interviewTypeMapping[interview.interviewType] ||
        interview.interviewType;

      calendar.createEvent({
        summary: `${interview.job.title} - ${humanReadableType}`,
        description: `Interview with ${interview.job.company}`,
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
