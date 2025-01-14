import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";

const usHolidays = [
  { name: "New Year's Day", date: "01-01" },
  { name: "Martin Luther King Jr. Day", type: "monday_in_january" },
  { name: "Inauguration Day", date: "01-20", special: true },
  { name: "President's Day", type: "third_monday_in_february" },
  { name: "Memorial Day", type: "last_monday_in_may" },
  { name: "Juneteenth", date: "06-19" },
  { name: "Independence Day", date: "07-04" },
  { name: "Labor Day", type: "first_monday_in_september" },
  { name: "Columbus Day", type: "second_monday_in_october" },
  { name: "Halloween", date: "10-31" },
  { name: "Veterans Day", date: "11-11" },
  { name: "Thanksgiving Day", type: "fourth_thursday_in_november" },
  { name: "Christmas Day", date: "12-25" },
];

interface HolidayAchievement {
  name: string;
  description: string;
  unlocked: boolean;
}

const getHolidayDate = (holiday: any, year: number): Date => {
  const [month, day] = holiday.date ? holiday.date.split("-") : ["", ""];
  let date = new Date(year, parseInt(month) - 1, parseInt(day));

  if (holiday.type === "monday_in_january") {
    date = getNthMondayOfMonth(year, 1, 3); // Third Monday of January
  } else if (holiday.type === "third_monday_in_february") {
    date = getNthMondayOfMonth(year, 2, 3); // Third Monday of February
  } else if (holiday.type === "last_monday_in_may") {
    date = getLastMondayOfMonth(year, 5); // Last Monday in May
  } else if (holiday.type === "first_monday_in_september") {
    date = getNthMondayOfMonth(year, 9, 1); // First Monday in September
  } else if (holiday.type === "second_monday_in_october") {
    date = getNthMondayOfMonth(year, 10, 2); // Second Monday in October
  } else if (holiday.type === "fourth_thursday_in_november") {
    date = getNthThursdayOfMonth(year, 11, 4); // Fourth Thursday in November
  }

  return date;
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

const checkIfHoliday = (date: Date, holidays: any[]): string | null => {
  const formattedDate = `${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

  for (const holiday of holidays) {
    const holidayDate = getHolidayDate(holiday, date.getFullYear());
    if (
      formattedDate ===
      `${(holidayDate.getMonth() + 1).toString().padStart(2, "0")}-${holidayDate
        .getDate()
        .toString()
        .padStart(2, "0")}`
    ) {
      return holiday.name;
    }
  }

  return null;
};

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

    let achievementName = "";
    let achievementDescription = "";

    if (streakWeeks >= 12) {
      achievementName = "Persistent";
      achievementDescription = "Target met for 3 months in a row";
    } else if (streakWeeks >= 8) {
      achievementName = "Consistent";
      achievementDescription = "Target met for 2 months in a row";
    } else if (streakWeeks >= 4) {
      achievementName = "Steady";
      achievementDescription = "Target met for 1 month in a row";
    } else if (streakWeeks >= 2) {
      achievementName = "Steady";
      achievementDescription = "Target met for 2 weeks in a row";
    } else if (streakWeeks >= 1) {
      achievementName = "Committed";
      achievementDescription = "Target met for 1 week in a row";
    }

    if (achievementName) {
      await prisma.userAchievement.create({
        data: {
          user: { connect: { id: userId } },
          achievement: {
            connectOrCreate: {
              where: { name: achievementName },
              create: {
                name: achievementName,
                description: achievementDescription,
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

  return {
    awardedAchievements,
    lockedAchievements,
  };
};

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userJobs = await prisma.job.findMany({
      where: {
        userId: currentUser.id,
        status: {
          not: "SAVED",
        },
      },
    });

    const userInterviews = await prisma.interview.findMany({
      where: {
        userId: currentUser.id,
        interviewDate: {
          not: null,
        },
      },
    });

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
      const holidayName = holiday.name;
      const holidayExists = userJobs.some((job) => {
        const jobDate = new Date(job.createdAt);
        return (
          jobDate.toISOString().split("T")[0] ===
          holidayDate.toISOString().split("T")[0]
        );
      });

      if (!holidayExists) {
        lockedHolidayAchievements.push({
          name: `Applied on ${holidayName} ${new Date().getFullYear()}`,
          description: `Awarded for applying on ${holidayName} in ${new Date().getFullYear()}`,
          unlocked: false,
        });
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

      // Sort by holiday order in usHolidays
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