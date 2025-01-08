import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";
import { startOfWeek, endOfWeek } from "date-fns";
import { ApplicationStatus } from "@prisma/client";
import { toZonedTime } from "date-fns-tz";

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
    const timeZone = "America/Los_Angeles";

    const currentPSTTime = toZonedTime(now, timeZone);
    const startOfCurrentWeek = startOfWeek(currentPSTTime, { weekStartsOn: 0 });
    const endOfCurrentWeek = endOfWeek(currentPSTTime, { weekStartsOn: 0 });

    const startOfCurrentWeekUTC = toZonedTime(startOfCurrentWeek, timeZone);
    const endOfCurrentWeekUTC = toZonedTime(endOfCurrentWeek, timeZone);

    const userJobs = await prisma.job.findMany({
      where: {
        userId: currentUser.id,
        status: {
          in: [ApplicationStatus.APPLIED, ApplicationStatus.INTERVIEW],
        },
        createdAt: {
          gte: startOfCurrentWeekUTC,
          lte: endOfCurrentWeekUTC,
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

    const applicationPresence = new Map<
      DayOfWeek,
      { presence: boolean; count: number }
    >(daysOfWeek.map((day) => [day, { presence: false, count: 0 }]));

    userJobs.forEach((job) => {
      const jobCreatedDate = new Date(job.createdAt);
      const jobDayOfWeek = daysOfWeek[jobCreatedDate.getDay()];

      const dayData = applicationPresence.get(jobDayOfWeek);
      if (dayData) {
        dayData.presence = true;
        dayData.count += 1;
      }
    });

    const currentDayIndex = new Date().getDay();
    const filteredApplicationPresence = Array.from(
      applicationPresence.entries()
    ).filter(([dayKey]) => daysOfWeek.indexOf(dayKey) <= currentDayIndex);

    const totalApplications = userJobs.length;

    return NextResponse.json({
      applicationPresence: filteredApplicationPresence,
      jobsAppliedToDaysPerWeekGoal: currentUser.jobsAppliedToDaysPerWeekGoal,
      totalApplications,
    });
  } catch (error) {
    console.error("Error fetching or filtering jobs:", error);
    return NextResponse.error();
  }
}
