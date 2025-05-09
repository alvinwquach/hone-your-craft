import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

interface Holiday {
  name: string;
  date?: string;
  special?: boolean;
  type?: string;
  weekday?: { month: number; n: number; day: "monday" | "thursday" };
}

interface HolidayAchievement {
  name: string;
  description: string;
  unlocked: boolean;
}

const holidayTypeHandlers: { [key: string]: (year: number) => Date | null } = {
  monday_in_january: (year: number) => getNthMondayOfMonth(year, 1, 3),
  third_monday_in_february: (year: number) => getNthMondayOfMonth(year, 2, 3),
  last_monday_in_may: (year: number) => getLastMondayOfMonth(year, 5),
  first_monday_in_september: (year: number) => getNthMondayOfMonth(year, 9, 1),
  second_monday_in_october: (year: number) => getNthMondayOfMonth(year, 10, 2),
  fourth_thursday_in_november: (year: number) =>
    getNthThursdayOfMonth(year, 11, 4),
};

const getHolidayDate = (holiday: Holiday, year: number): Date | null => {
  if (holiday.date) {
    const [month, day] = holiday.date.split("-");
    return new Date(year, parseInt(month) - 1, parseInt(day));
  }
  if (holiday.weekday) {
    const { month, n, day } = holiday.weekday;
    if (day === "monday") return getNthMondayOfMonth(year, month, n);
    if (day === "thursday") return getNthThursdayOfMonth(year, month, n);
  }
  if (holiday.type && holidayTypeHandlers[holiday.type]) {
    return holidayTypeHandlers[holiday.type](year);
  }
  return null;
};

const getNthMondayOfMonth = (
  year: number,
  month: number,
  nth: number
): Date => {
  const date = new Date(year, month - 1, 1);
  const dayOfWeek = date.getDay();
  const diff = (7 - dayOfWeek + 1) % 7;
  date.setDate(date.getDate() + diff + 7 * (nth - 1));
  return date;
};

const getLastMondayOfMonth = (year: number, month: number): Date => {
  const date = new Date(year, month, 0);
  const dayOfWeek = date.getDay();
  const diff = (7 - dayOfWeek + 1) % 7;
  date.setDate(date.getDate() - diff);
  return date;
};

const getNthThursdayOfMonth = (
  year: number,
  month: number,
  nth: number
): Date => {
  const date = new Date(year, month - 1, 1);
  const dayOfWeek = date.getDay();
  const diff = (7 - dayOfWeek + 4) % 7;
  date.setDate(date.getDate() + diff + 7 * (nth - 1));
  return date;
};

const holidayDatesCache = new Map<string, { name: string; date: Date }>();
const currentYear = new Date().getFullYear();
const usHolidays: Holiday[] = [
  { name: "New Year's Day", date: "01-01" },
  {
    name: "Martin Luther King Jr. Day",
    weekday: { month: 1, n: 3, day: "monday" },
  },
  { name: "Inauguration Day", date: "01-20", special: true },
  { name: "President's Day", weekday: { month: 2, n: 3, day: "monday" } },
  { name: "Memorial Day", weekday: { month: 5, n: -1, day: "monday" } },
  { name: "Juneteenth", date: "06-19" },
  { name: "Independence Day", date: "07-04" },
  { name: "Labor Day", weekday: { month: 9, n: 1, day: "monday" } },
  { name: "Columbus Day", weekday: { month: 10, n: 2, day: "monday" } },
  { name: "Halloween", date: "10-31" },
  { name: "Veterans Day", date: "11-11" },
  { name: "Thanksgiving Day", weekday: { month: 11, n: 4, day: "thursday" } },
  { name: "Christmas Day", date: "12-25" },
];
usHolidays.forEach((holiday) => {
  const date = getHolidayDate(holiday, currentYear);
  if (date) {
    const key = `${(date.getMonth() + 1).toString().padStart(2, "0")}-${date
      .getDate()
      .toString()
      .padStart(2, "0")}`;
    holidayDatesCache.set(key, { name: holiday.name, date });
  }
});

const checkIfHoliday = (date: Date): string | null => {
  const formattedDate = `${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
  const holiday = holidayDatesCache.get(formattedDate);
  return holiday && holiday.date.getFullYear() === date.getFullYear()
    ? holiday.name
    : null;
};

const trackApplicationDays = (jobs: { createdAt: Date }[]): number =>
  new Set(
    jobs.map((job) => new Date(job.createdAt).toISOString().split("T")[0])
  ).size;

const calculateWeeklyApplicationStreak = async (userId: string) => {
  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { jobsAppliedToDaysPerWeekGoal: true },
  });
  if (!target) throw new Error("User not found");

  const now = new Date();
  const currentWeekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  currentWeekStart.setHours(0, 0, 0, 0);
  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
  currentWeekEnd.setHours(23, 59, 59, 999);

  const jobsThisWeek = await prisma.job.findMany({
    where: {
      userId,
      status: { not: "SAVED" },
      createdAt: { gte: currentWeekStart, lte: currentWeekEnd },
    },
    select: { createdAt: true },
  });

  const distinctDaysApplied = trackApplicationDays(jobsThisWeek);
  const goalMet =
    distinctDaysApplied >= (target.jobsAppliedToDaysPerWeekGoal ?? 0);

  let newStreak = 0;
  if (goalMet) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { weeklyStreak: true, lastStreakUpdate: true },
    });
    if (!user) throw new Error("User not found");

    const lastStreakUpdate = user.lastStreakUpdate;
    if (
      !lastStreakUpdate ||
      lastStreakUpdate.getTime() < currentWeekStart.getTime()
    ) {
      newStreak = (user.weeklyStreak ?? 0) + 1;
    } else {
      newStreak = user.weeklyStreak ?? 0;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { weeklyStreak: newStreak, lastStreakUpdate: currentWeekStart },
    });

    const streakWeeks = newStreak;
    const achievements = [
      {
        weeks: 12,
        name: "Persistent",
        description: "Target met for 3 months in a row",
      },
      {
        weeks: 8,
        name: "Consistent",
        description: "Target met for 2 months in a row",
      },
      {
        weeks: 4,
        name: "Steady",
        description: "Target met for 1 month in a row",
      },
      {
        weeks: 2,
        name: "Steady",
        description: "Target met for 2 weeks in a row",
      },
      {
        weeks: 1,
        name: "Committed",
        description: "Target met for 1 week in a row",
      },
    ];

    const achievement = achievements.find((a) => streakWeeks >= a.weeks);
    if (achievement) {
      await prisma.userAchievement.create({
        data: {
          user: { connect: { id: userId } },
          achievement: {
            connectOrCreate: {
              where: { name: achievement.name },
              create: {
                name: achievement.name,
                description: achievement.description,
              },
            },
          },
        },
      });
    }
  }

  return { appliedDaysCount: distinctDaysApplied, streak: newStreak };
};

const calculateAchievements = async (
  userId: string,
  appliedJobs: { createdAt: Date }[],
  interviews: { acceptedDate: Date }[]
) => {
  const jobMilestones = [
    10, 25, 50, 75, 100, 125, 250, 500, 750, 1000, 1250, 1500, 2000, 2500, 5000,
    10000,
  ];
  const interviewMilestones = [
    1, 5, 10, 20, 30, 50, 75, 100, 125, 150, 175, 200, 250, 300, 400, 500, 600,
    700, 800, 900, 1000, 1250, 1500, 2000, 2500, 3000, 4000, 5000, 10000,
  ];

  const awardedAchievements: HolidayAchievement[] = [];
  const lockedAchievements: HolidayAchievement[] = [];
  const jobMilestonesMap = new Map<number, Date>();
  const interviewMilestonesMap = new Map<number, Date>();
  let appliedJobsCount = 0;
  let interviewsCount = 0;

  const processedAppliedJobs = appliedJobs.map((job) => ({
    ...job,
    createdAt: new Date(job.createdAt),
  }));

  const processedInterviews = interviews.map((interview) => ({
    ...interview,
    acceptedDate: new Date(interview.acceptedDate),
  }));

  processedAppliedJobs
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .forEach((job) => {
      appliedJobsCount++;
      if (jobMilestones.includes(appliedJobsCount))
        jobMilestonesMap.set(appliedJobsCount, job.createdAt);
    });

  processedInterviews
    .sort((a, b) => a.acceptedDate.getTime() - b.acceptedDate.getTime())
    .forEach((interview) => {
      interviewsCount++;
      if (interviewMilestones.includes(interviewsCount))
        interviewMilestonesMap.set(interviewsCount, interview.acceptedDate);
    });

  jobMilestones.forEach((milestone) => {
    const achievedDate = jobMilestonesMap.get(milestone);
    if (achievedDate) {
      awardedAchievements.push({
        name: `Applied to ${milestone} Jobs`,
        description: `Awarded for applying to ${milestone} jobs on ${achievedDate.toLocaleDateString()}.`,
        unlocked: true,
      });
    } else {
      lockedAchievements.push({
        name: `Applied to ${milestone} Jobs`,
        description: `Awarded for applying to ${milestone} jobs`,
        unlocked: false,
      });
    }
  });

  interviewMilestones.forEach((milestone) => {
    const achievedDate = interviewMilestonesMap.get(milestone);
    if (achievedDate) {
      awardedAchievements.push({
        name: `Attended ${milestone} Interviews`,
        description: `Awarded for attending ${milestone} interviews by ${achievedDate.toLocaleDateString()}.`,
        unlocked: true,
      });
    } else {
      lockedAchievements.push({
        name: `Attended ${milestone} Interviews`,
        description: `Awarded for attending ${milestone} interviews`,
        unlocked: false,
      });
    }
  });

  for (const achievement of awardedAchievements) {
    await prisma.userAchievement.create({
      data: {
        user: { connect: { id: userId } },
        achievement: {
          connectOrCreate: {
            where: { name: achievement.name },
            create: {
              name: achievement.name,
              description: achievement.description,
            },
          },
        },
      },
    });
  }

  return { awardedAchievements, lockedAchievements };
};

const getUserJobs = unstable_cache(
  async (userId: string) =>
    prisma.job.findMany({
      where: { userId, status: { not: "SAVED" } },
      select: { id: true, createdAt: true, status: true, holidayApplied: true },
    }),
  ["user_jobs"],
  { tags: ["user_data"], revalidate: 3600 }
);

const getUserInterviews = unstable_cache(
  async (userId: string) =>
    prisma.interview.findMany({
      where: { userId, interviewDate: { not: null } },
      select: { id: true, acceptedDate: true, interviewDate: true },
    }),
  ["user_interviews"],
  { tags: ["user_data"], revalidate: 3600 }
);

const getUserAchievements = unstable_cache(
  async (userId: string) =>
    prisma.userAchievement.findMany({
      where: { userId },
      select: { achievement: { select: { id: true, description: true } } },
    }),
  ["user_achievements"],
  { tags: ["user_data"], revalidate: 3600 }
);

const cachedCalculateAchievements = unstable_cache(
  calculateAchievements,
  ["achievements"],
  { tags: ["user_data"], revalidate: 3600 }
);

const sortAchievements = (a: HolidayAchievement, b: HolidayAchievement) => {
  if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
  const yearMatchA = a.name.match(/\d{4}$/);
  const yearMatchB = b.name.match(/\d{4}$/);
  const yearA = yearMatchA ? parseInt(yearMatchA[0], 10) : 0;
  const yearB = yearMatchB ? parseInt(yearMatchB[0], 10) : 0;
  if (yearA !== yearB) return yearA - yearB;

  const holidayNameMatchA = a.name.match(/Applied on (.*) \d{4}/);
  const holidayNameMatchB = b.name.match(/Applied on (.*) \d{4}/);
  const holidayNameA = holidayNameMatchA ? holidayNameMatchA[1] : "";
  const holidayNameB = holidayNameMatchB ? holidayNameMatchB[1] : "";
  const indexA = usHolidays.findIndex((h) => h.name === holidayNameA);
  const indexB = usHolidays.findIndex((h) => h.name === holidayNameB);
  return indexA === -1 || indexB === -1
    ? holidayNameA.localeCompare(holidayNameB)
    : indexA - indexB;
};

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const [userJobs, userInterviews, userAchievements] = await Promise.all([
      getUserJobs(currentUser.id),
      getUserInterviews(currentUser.id),
      getUserAchievements(currentUser.id),
    ]);

    const [achievementsResult, weeklyResult] = await Promise.all([
      cachedCalculateAchievements(currentUser.id, userJobs, userInterviews),
      calculateWeeklyApplicationStreak(currentUser.id),
    ]);

    const { awardedAchievements, lockedAchievements } = achievementsResult;
    const holidayAchievements: HolidayAchievement[] = [];
    const lockedHolidayAchievements: HolidayAchievement[] = [];
    const uniqueHolidaysAppliedOn = new Set<string>();

    userJobs.forEach((job) => {
      const holiday =
        job.holidayApplied || checkIfHoliday(new Date(job.createdAt));
      if (holiday && !uniqueHolidaysAppliedOn.has(holiday)) {
        uniqueHolidaysAppliedOn.add(holiday);
        holidayAchievements.push({
          name: `Applied on ${holiday} ${new Date(
            job.createdAt
          ).getFullYear()}`,
          description: `Awarded for applying on ${holiday} in ${new Date(
            job.createdAt
          ).getFullYear()}.`,
          unlocked: true,
        });
      }
    });

    usHolidays.forEach((holiday) => {
      if (!uniqueHolidaysAppliedOn.has(holiday.name)) {
        lockedHolidayAchievements.push({
          name: `Applied on ${holiday.name} ${currentYear}`,
          description: `Awarded for applying on ${holiday.name} in ${currentYear}`,
          unlocked: false,
        });
      }
    });

    const organizedAchievements = {
      jobAchievements: [
        ...awardedAchievements.filter((a) => a.name.includes("Applied to")),
        ...lockedAchievements.filter((a) => a.name.includes("Applied to")),
      ].sort(sortAchievements),
      interviewAchievements: [
        ...awardedAchievements.filter((a) => a.name.includes("Attended")),
        ...lockedAchievements.filter((a) => a.name.includes("Attended")),
      ].sort(sortAchievements),
      holidayAchievements: [
        ...holidayAchievements,
        ...lockedHolidayAchievements,
      ].sort(sortAchievements),
    };

    return NextResponse.json({
      ...organizedAchievements,
      allAchievements: userAchievements.map((ua) => ua.achievement),
      weeklyStreak: weeklyResult.streak,
      appliedDaysThisWeek: weeklyResult.appliedDaysCount,
    });
  } catch (error) {
    console.error("Error fetching or calculating user achievements:", error);
    return NextResponse.error();
  }
}