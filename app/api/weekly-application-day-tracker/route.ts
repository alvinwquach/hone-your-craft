import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";
import { startOfWeek, endOfWeek } from "date-fns";
import { ApplicationStatus } from "@prisma/client";

type DayOfWeek =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 0 });
    const endOfCurrentWeek = endOfWeek(now, { weekStartsOn: 0 });

    const userJobs = await prisma.job.findMany({
      where: {
        userId: currentUser.id,
        status: {
          in: [ApplicationStatus.APPLIED, ApplicationStatus.INTERVIEW],
        },
        createdAt: {
          gte: startOfCurrentWeek,
          lte: endOfCurrentWeek,
        },
      },
    });

    const daysOfWeek: DayOfWeek[] = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const trackedJob = new Map<DayOfWeek, boolean>(
      daysOfWeek.map((day) => [day, false])
    );

    userJobs.forEach((job) => {
      const jobCreatedDate = new Date(job.createdAt);
      const jobDayOfWeek = daysOfWeek[jobCreatedDate.getDay()];

      trackedJob.set(jobDayOfWeek, true);
    });

    const currentDayIndex = new Date().getDay();

    const filteredApplicationPresence = Array.from(trackedJob.entries()).filter(
      ([dayKey]) => daysOfWeek.indexOf(dayKey) <= currentDayIndex
    );

    return NextResponse.json({
      applicationPresence: filteredApplicationPresence,
      jobsAppliedToDaysPerWeekGoal: currentUser.jobsAppliedToDaysPerWeekGoal,
    });
  } catch (error) {
    console.error("Error fetching or filtering jobs:", error);
    return NextResponse.error();
  }
}
