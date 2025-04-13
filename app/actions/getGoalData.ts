"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { ApplicationStatus } from "@prisma/client";
import { redirect } from "next/navigation";

export type CandidateGoal =
  | "ChangeMyCareer"
  | "GrowInMyExistingRole"
  | "BuildAPortfolio"
  | "ExploreNewOpportunities"
  | "ImproveSkillset"
  | "LookingForANewJob"
  | "ReceiveAnOffer"
  | "NotSureYet";

type DayOfWeek =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

export async function getGoalData() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return redirect("/login");
  }

  const now = new Date();
  const timeZone = "America/Los_Angeles";
  const currentPSTTime = toZonedTime(now, timeZone);

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: {
      jobsAppliedToDaysPerWeekGoal: true,
      jobsAppliedToWeeklyGoalMin: true,
      jobsAppliedToWeeklyGoalMax: true,
      monthlyInterviewGoal: true,
      candidateGoal: true,
      offerReceivedByDateGoal: true,
      offerReceivedByDateGoalStart: true,
      offerReceivedByDateGoalEnd: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const validCandidateGoals: CandidateGoal[] = [
    "ChangeMyCareer",
    "GrowInMyExistingRole",
    "BuildAPortfolio",
    "ExploreNewOpportunities",
    "ImproveSkillset",
    "LookingForANewJob",
    "ReceiveAnOffer",
    "NotSureYet",
  ];

  const candidateGoal: CandidateGoal | undefined = validCandidateGoals.includes(
    user.candidateGoal as CandidateGoal
  )
    ? (user.candidateGoal as CandidateGoal)
    : undefined;

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

  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);

  const userInterviews = await prisma.interview.findMany({
    where: {
      userId: currentUser.id,
      interviewDate: {
        gte: currentMonthStart,
        lte: currentMonthEnd,
      },
    },
  });

  const numberOfInterviewsThisMonth = userInterviews.length;
  const monthlyGoal = user.monthlyInterviewGoal ?? 0;
  const remainingInterviews = monthlyGoal - numberOfInterviewsThisMonth;

  return {
    currentGoalData: {
      jobsAppliedToDaysPerWeekGoal: user.jobsAppliedToDaysPerWeekGoal ?? 1,
      jobsAppliedToWeeklyGoalMin: user.jobsAppliedToWeeklyGoalMin ?? 1,
      jobsAppliedToWeeklyGoalMax: user.jobsAppliedToWeeklyGoalMax ?? 2,
      monthlyInterviewGoal: monthlyGoal,
      candidateGoal,
      offerReceivedByDateGoal: user.offerReceivedByDateGoal,
      offerReceivedByDateGoalStart: user.offerReceivedByDateGoalStart,
      offerReceivedByDateGoalEnd: user.offerReceivedByDateGoalEnd,
    },
    weeklyApplicationDayTrackerData: {
      applicationPresence: filteredApplicationPresence,
    },
    weeklyApplicationGoalTrackerData: {
      applicationPresence: Array.from(applicationPresence.entries()),
      totalApplications,
    },
    monthlyInterviewGoalTrackerData: {
      currentMonthInterviews: numberOfInterviewsThisMonth,
      targetInterviewsPerMonth: monthlyGoal,
      remainingInterviews,
      message:
        remainingInterviews > 0
          ? `You need ${remainingInterviews} more interviews to meet your goal.`
          : "You've met your interview goal!",
    },
  };
}