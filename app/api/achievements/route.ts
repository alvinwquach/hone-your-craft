import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

interface Holiday {
  name: string;
  date?: string;
  special?: boolean;
  type?: string;
  weekday?: {
    month: number;
    n: number;
    day: "monday" | "thursday";
  };
}

interface HolidayAchievement {
  name: string;
  description: string;
  unlocked: boolean;
}

const holidayTypeHandlers: {
  [key: string]: (year: number) => Date | null;
} = {
  monday_in_january: (year: number) => getNthMondayOfMonth(year, 1, 3), // Third Monday of January
  third_monday_in_february: (year: number) => getNthMondayOfMonth(year, 2, 3), // Third Monday of February
  last_monday_in_may: (year: number) => getLastMondayOfMonth(year, 5), // Last Monday in May
  first_monday_in_september: (year: number) => getNthMondayOfMonth(year, 9, 1), // First Monday in September
  second_monday_in_october: (year: number) => getNthMondayOfMonth(year, 10, 2), // Second Monday in October
  fourth_thursday_in_november: (year: number) =>
    getNthThursdayOfMonth(year, 11, 4), // Fourth Thursday in November
};

const getHolidayDate = (holiday: Holiday, year: number): Date | null => {
  // Check if the holiday has a fixed date
  if (holiday.date) {
    const [month, day] = holiday.date.split("-");
    const holidayDate = new Date(year, parseInt(month) - 1, parseInt(day));
    return holidayDate;
  }
  if (holiday.weekday) {
    const { month, n, day } = holiday.weekday;
    if (day === "monday") {
      return getNthMondayOfMonth(year, month, n);
    } else if (day === "thursday") {
      return getNthThursdayOfMonth(year, month, n);
    }
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
  let date = new Date(year, month - 1, 1);
  let dayOfWeek = date.getDay();
  let diff = (7 - dayOfWeek + 1) % 7;
  date.setDate(date.getDate() + diff + 7 * (nth - 1));
  return date;
};

const getLastMondayOfMonth = (year: number, month: number): Date => {
  let date = new Date(year, month, 0);
  let dayOfWeek = date.getDay();
  let diff = (7 - dayOfWeek + 1) % 7;
  date.setDate(date.getDate() - diff);
  return date;
};

const getNthThursdayOfMonth = (
  year: number,
  month: number,
  nth: number
): Date => {
  let date = new Date(year, month - 1, 1);
  let dayOfWeek = date.getDay();
  let diff = (7 - dayOfWeek + 4) % 7;
  date.setDate(date.getDate() + diff + 7 * (nth - 1));
  return date;
};

const checkIfHoliday = (date: Date, holidays: Holiday[]): string | null => {
  const formattedDate = `${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
  for (const holiday of holidays) {
    const holidayDate = getHolidayDate(holiday, date.getFullYear());
    if (!holidayDate) continue;
    const holidayFormattedDate = `${(holidayDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${holidayDate.getDate().toString().padStart(2, "0")}`;
    if (formattedDate === holidayFormattedDate) {
      return holiday.name;
    }
  }
  return null;
};

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

const trackApplicationDays = (jobs: any[]): number => {
  const appliedDays = new Set<string>();
  jobs.forEach((job) => {
    const applicationDay = new Date(job.createdAt).toISOString().split("T")[0];
    appliedDays.add(applicationDay);
  });
  return appliedDays.size;
};

const calculateWeeklyApplicationStreak = async (userId: string) => {
  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { jobsAppliedToDaysPerWeekGoal: true },
  });
  if (!target) {
    throw new Error("User not found");
  }
  const now = new Date();
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - now.getDay());
  currentWeekStart.setHours(0, 0, 0, 0);
  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
  currentWeekEnd.setHours(23, 59, 59, 999);

  const jobsThisWeek = await prisma.job.findMany({
    where: {
      userId: userId,
      status: { not: "SAVED" },
      createdAt: { gte: currentWeekStart, lte: currentWeekEnd },
    },
    select: { createdAt: true },
  });

  const distinctDaysApplied = trackApplicationDays(jobsThisWeek);
  const goalMet =
    distinctDaysApplied >= (target?.jobsAppliedToDaysPerWeekGoal ?? 0);

  let newStreak = 0;
  if (goalMet) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }
    const lastStreakUpdate = user.lastStreakUpdate;
    if (
      !lastStreakUpdate ||
      new Date(lastStreakUpdate).getTime() < currentWeekStart.getTime()
    ) {
      newStreak = user.weeklyStreak ? user.weeklyStreak + 1 : 1;
    } else {
      newStreak = user.weeklyStreak || 0;
    }
    await prisma.user.update({
      where: { id: userId },
      data: {
        weeklyStreak: newStreak,
        lastStreakUpdate: currentWeekStart,
      },
    });

    const streakWeeks = Math.floor(newStreak / 1);
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

    const achievement = achievements.find(
      (achievement) => streakWeeks >= achievement.weeks
    );

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

  return {
    appliedDaysCount: distinctDaysApplied,
    streak: newStreak,
  };
};

const calculateAchievements = async (
  userId: string,
  appliedJobs: any[],
  interviews: any[]
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new Error("User not found");
  }

  const jobMilestones = [
    10, 25, 50, 75, 100, 125, 250, 500, 750, 1000, 1250, 1500, 2000, 2500, 5000,
    10000,
  ];

  const interviewMilestones = [
    1, 5, 10, 20, 30, 50, 75, 100, 125, 150, 175, 200, 250, 300, 400, 500, 600,
    700, 800, 900, 1000, 1250, 1500, 2000, 2500, 3000, 4000, 5000, 10000,
  ];

  const awardedAchievements: any[] = [];
  const lockedAchievements: any[] = [];
  let appliedJobsCount = 0;
  const jobMilestonesMap = new Map<number, string>();
  let interviewsCount = 0;
  const interviewMilestonesMap = new Map<number, string>();

  const sortedJobs = appliedJobs.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const sortedInterviews = interviews.sort(
    (a, b) =>
      new Date(a.acceptedDate).getTime() - new Date(b.acceptedDate).getTime()
  );

  for (const job of sortedJobs) {
    appliedJobsCount++;
    for (let milestone of jobMilestones) {
      if (appliedJobsCount === milestone && !jobMilestonesMap.has(milestone)) {
        jobMilestonesMap.set(milestone, job.createdAt);
      }
    }
  }

  for (const interview of sortedInterviews) {
    interviewsCount++;
    for (let milestone of interviewMilestones) {
      if (
        interviewsCount === milestone &&
        !interviewMilestonesMap.has(milestone)
      ) {
        interviewMilestonesMap.set(milestone, interview.acceptedDate);
      }
    }
  }

  for (let milestone of jobMilestones) {
    if (jobMilestonesMap.has(milestone)) {
      const achievedDate = jobMilestonesMap.get(milestone);
      if (achievedDate) {
        awardedAchievements.push({
          name: `Applied to ${milestone} Jobs`,
          description: `Awarded for applying to ${milestone} jobs on ${new Date(
            achievedDate
          ).toLocaleDateString()}.`,
          unlocked: true,
        });
      }
    } else {
      lockedAchievements.push({
        name: `Applied to ${milestone} Jobs`,
        description: `Awarded for applying to ${milestone} jobs`,
        unlocked: false,
      });
    }
  }

  for (let milestone of interviewMilestones) {
    if (interviewMilestonesMap.has(milestone)) {
      const achievedDate = interviewMilestonesMap.get(milestone);
      if (achievedDate) {
        awardedAchievements.push({
          name: `Attended ${milestone} Interviews`,
          description: `Awarded for attending ${milestone} interviews by ${new Date(
            achievedDate
          ).toLocaleDateString()}.`,
          unlocked: true,
        });
      }
    } else {
      lockedAchievements.push({
        name: `Attended ${milestone} Interviews`,
        description: `Awarded for attending ${milestone} interviews`,
        unlocked: false,
      });
    }
  }

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

  return {
    awardedAchievements,
    lockedAchievements,
  };
};

// Create cached versions of database queries
const getUserJobs = unstable_cache(
  async (userId: string) => {
    return await prisma.job.findMany({
      where: {
        userId,
        status: { not: "SAVED" },
      },
    });
  },
  ["user_jobs"],
  { tags: ["user_data"] }
);

const getUserInterviews = unstable_cache(
  async (userId: string) => {
    return await prisma.interview.findMany({
      where: {
        userId,
        interviewDate: { not: null },
      },
    });
  },
  ["user_interviews"],
  { tags: ["user_data"] }
);

const getUserAchievements = unstable_cache(
  async (userId: string) => {
    return await prisma.userAchievement.findMany({
      where: { userId },
      select: {
        achievement: {
          select: {
            id: true,
            description: true,
          },
        },
      },
    });
  },
  ["user_achievements"],
  { tags: ["user_data"] }
);

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Use cached versions of queries
    const [userJobs, userInterviews, userAchievements] = await Promise.all([
      getUserJobs(currentUser.id),
      getUserInterviews(currentUser.id),
      getUserAchievements(currentUser.id),
    ]);

    const { awardedAchievements, lockedAchievements } =
      await calculateAchievements(currentUser.id, userJobs, userInterviews);

    const weeklyResult = await calculateWeeklyApplicationStreak(currentUser.id);

    const holidayAchievements: HolidayAchievement[] = [];
    const lockedHolidayAchievements: HolidayAchievement[] = [];
    const uniqueHolidaysAppliedOn = new Set();

    userJobs.forEach((job) => {
      const appliedDate = new Date(job.createdAt);
      const holiday = checkIfHoliday(appliedDate, usHolidays);
      if (holiday && !uniqueHolidaysAppliedOn.has(holiday)) {
        uniqueHolidaysAppliedOn.add(holiday);
        holidayAchievements.push({
          name: `Applied on ${holiday} ${appliedDate.getFullYear()}`,
          description: `Awarded for applying on ${holiday} in ${appliedDate.getFullYear()}.`,
          unlocked: true,
        });
      }
    });

    usHolidays.forEach((holiday) => {
      const holidayDate = getHolidayDate(holiday, new Date().getFullYear());
      if (holidayDate) {
        const holidayExists = userJobs.some((job) => {
          const jobDate = new Date(job.createdAt);
          return (
            jobDate.toISOString().split("T")[0] ===
            holidayDate.toISOString().split("T")[0]
          );
        });
        if (!holidayExists) {
          lockedHolidayAchievements.push({
            name: `Applied on ${holiday.name} ${new Date().getFullYear()}`,
            description: `Awarded for applying on ${
              holiday.name
            } in ${new Date().getFullYear()}`,
            unlocked: false,
          });
        }
      } else {
        console.warn(
          `Holiday date for ${holiday.name} could not be determined.`
        );
      }
    });

    const allUserAchievements = await prisma.userAchievement.findMany({
      where: { userId: currentUser.id },
      select: {
        achievement: {
          select: {
            id: true,
            description: true,
          },
        },
      },
    });

    const allAchievements = [
      ...new Set(allUserAchievements.map((ua) => ua.achievement.id)),
    ].map(
      (id) =>
        allUserAchievements.find((ua) => ua.achievement.id === id)?.achievement
    );

    const sortAchievements = (a: HolidayAchievement, b: HolidayAchievement) => {
      if (a.unlocked !== b.unlocked) {
        return a.unlocked ? -1 : 1;
      }
      const yearMatchA = a.name.match(/\d{4}$/);
      const yearMatchB = b.name.match(/\d{4}$/);
      const yearA = yearMatchA ? parseInt(yearMatchA[0]) : 0;
      const yearB = yearMatchB ? parseInt(yearMatchB[0]) : 0;
      if (yearA !== yearB) {
        return yearA - yearB;
      }
      const holidayNameMatchA = a.name.match(/Applied on (.*) \d{4}/);
      const holidayNameMatchB = b.name.match(/Applied on (.*) \d{4}/);
      const holidayNameA = holidayNameMatchA ? holidayNameMatchA[1] : "";
      const holidayNameB = holidayNameMatchB ? holidayNameMatchB[1] : "";
      const indexA = usHolidays.findIndex((h) => h.name === holidayNameA);
      const indexB = usHolidays.findIndex((h) => h.name === holidayNameB);
      if (indexA === -1 || indexB === -1) {
        return holidayNameA.localeCompare(holidayNameB);
      }
      return indexA - indexB;
    };

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

    revalidatePath("/profile", "page");
    revalidateTag("user_data");

    return NextResponse.json({
      ...organizedAchievements,
      allAchievements,
      weeklyStreak: weeklyResult.streak,
      appliedDaysThisWeek: weeklyResult.appliedDaysCount,
    });
  } catch (error) {
    console.error("Error fetching or calculating user achievements:", error);
    return NextResponse.error();
  }
}