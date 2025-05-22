"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";

interface Holiday {
  name: string;
  date?: string;
  special?: boolean;
  type?: string;
  weekday?: { month: number; n: number; day: "monday" | "thursday" };
}

interface HolidayAchievement {
  id: string;
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
  easter: (year: number) => calculateEasterSunday(year),
};

const calculateEasterSunday = (year: number): Date | null => {
  console.time(`calculateEasterSunday-${year}`);
  try {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  } finally {
    console.timeEnd(`calculateEasterSunday-${year}`);
  }
};

const getHolidayDate = (holiday: Holiday, year: number): Date | null => {
  console.time(`getHolidayDate-${holiday.name}-${year}`);
  try {
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
  } finally {
    console.timeEnd(`getHolidayDate-${holiday.name}-${year}`);
  }
};

const getNthMondayOfMonth = (
  year: number,
  month: number,
  nth: number
): Date => {
  console.time(`getNthMondayOfMonth-${year}-${month}-${nth}`);
  try {
    const date = new Date(year, month - 1, 1);
    const dayOfWeek = date.getDay();
    const diff = (7 - dayOfWeek + 1) % 7;
    date.setDate(date.getDate() + diff + 7 * (nth - 1));
    return date;
  } finally {
    console.timeEnd(`getNthMondayOfMonth-${year}-${month}-${nth}`);
  }
};

const getLastMondayOfMonth = (year: number, month: number): Date => {
  console.time(`getLastMondayOfMonth-${year}-${month}`);
  try {
    const date = new Date(year, month, 0);
    const dayOfWeek = date.getDay();
    const diff = dayOfWeek === 1 ? 0 : dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    date.setDate(date.getDate() - diff);
    return date;
  } finally {
    console.timeEnd(`getLastMondayOfMonth-${year}-${month}`);
  }
};

const getNthThursdayOfMonth = (
  year: number,
  month: number,
  nth: number
): Date => {
  console.time(`getNthThursdayOfMonth-${year}-${month}-${nth}`);
  try {
    const date = new Date(year, month - 1, 1);
    const dayOfWeek = date.getDay();
    const diff = (7 - dayOfWeek + 4) % 7;
    date.setDate(date.getDate() + diff + 7 * (nth - 1));
    return date;
  } finally {
    console.timeEnd(`getNthThursdayOfMonth-${year}-${month}-${nth}`);
  }
};

// Precompute holidays for current and next year
const holidayDatesCache = new Map<string, { name: string; date: Date }>();
const currentYear = new Date().getFullYear();
const yearsToCache = [currentYear, currentYear + 1];

const usHolidays: Holiday[] = [
  { name: "New Year's Day", date: "01-01" },
  { name: "Martin Luther King Jr. Day", type: "monday_in_january" },
  { name: "Inauguration Day", date: "01-20", special: true },
  { name: "President's Day", type: "third_monday_in_february" },
  { name: "Easter", type: "easter" },
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

yearsToCache.forEach((year) => {
  console.time(`cacheHolidays-${year}`);
  try {
    usHolidays.forEach((holiday) => {
      const date = getHolidayDate(holiday, year);
      if (date) {
        const key = `${year}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
        holidayDatesCache.set(key, { name: holiday.name, date });
      }
    });
  } finally {
    console.timeEnd(`cacheHolidays-${year}`);
  }
});

const checkIfHoliday = (date: Date): string | null => {
  console.time(`checkIfHoliday-${date.toISOString()}`);
  try {
    const key = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    const holiday = holidayDatesCache.get(key);
    return holiday ? holiday.name : null;
  } finally {
    console.timeEnd(`checkIfHoliday-${date.toISOString()}`);
  }
};

const trackApplicationDays = (jobs: { createdAt: Date }[]): number => {
  console.time("trackApplicationDays");
  try {
    return new Set(
      jobs.map((job) => new Date(job.createdAt).toISOString().split("T")[0])
    ).size;
  } finally {
    console.timeEnd("trackApplicationDays");
  }
};

const calculateWeeklyApplicationStreak = async (userId: string) => {
  console.time(`calculateWeeklyApplicationStreak-${userId}`);
  try {
    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { jobsAppliedToDaysPerWeekGoal: true },
    });
    if (!target) {
      throw new Error("User not found");
    }

    const now = new Date();
    const currentWeekStart = new Date(
      now.setDate(now.getDate() - now.getDay())
    );
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

    console.log(`Jobs this week for user ${userId}: ${jobsThisWeek.length}`);

    const distinctDaysApplied = trackApplicationDays(jobsThisWeek);
    const goalMet =
      distinctDaysApplied >= (target.jobsAppliedToDaysPerWeekGoal ?? 0);

    let newStreak = 0;
    if (goalMet) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { weeklyStreak: true, lastStreakUpdate: true },
      });
      if (!user) {
        throw new Error("User not found");
      }

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

      console.log(`Updated streak for user ${userId}: ${newStreak}`);

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
        const achievementRecord = await prisma.achievement.upsert({
          where: { name: achievement.name },
          update: {},
          create: {
            name: achievement.name,
            description: achievement.description,
          },
          select: { id: true },
        });

        const existing = await prisma.userAchievement.findFirst({
          where: {
            userId,
            achievementId: achievementRecord.id,
          },
        });

        if (!existing) {
          await prisma.userAchievement.create({
            data: {
              user: { connect: { id: userId } },
              achievement: { connect: { id: achievementRecord.id } },
              awardedAt: new Date(),
            },
          });
          console.log(
            `Awarded streak achievement: ${achievement.name} for user ${userId}`
          );
        }
      }
    }

    return { appliedDaysCount: distinctDaysApplied, streak: newStreak };
  } catch (error) {
    console.error(
      `Error in calculateWeeklyApplicationStreak for user ${userId}:`,
      error
    );
    throw error;
  } finally {
    console.timeEnd(`calculateWeeklyApplicationStreak-${userId}`);
  }
};

const calculateAchievements = async (
  userId: string,
  appliedJobs: { createdAt: Date }[],
  interviews: { acceptedDate: Date }[]
) => {
  console.time(`calculateAchievements-${userId}`);
  try {
    const jobMilestones = [
      10, 25, 50, 75, 100, 125, 250, 500, 750, 1000, 1250, 1500, 1750, 2000,
      2250, 2500, 2750, 3000, 3250, 3500, 3750, 4000, 4250, 4500, 5000, 10000,
    ];
    const interviewMilestones = [
      1, 5, 10, 20, 25, 30, 50, 75, 100, 125, 150, 175, 200, 250, 300, 350, 400,
      450, 500, 600, 700, 800, 900, 1000, 1250, 1500, 2000, 2500, 3000, 4000,
      5000, 10000,
    ];

    const awardedAchievements: HolidayAchievement[] = [];
    const lockedAchievements: HolidayAchievement[] = [];
    let appliedJobsCount = 0;
    let interviewsCount = 0;

    const processedAppliedJobs = appliedJobs
      .map((job) => ({ ...job, createdAt: new Date(job.createdAt) }))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    const processedInterviews = interviews
      .map((interview) => ({
        ...interview,
        acceptedDate: new Date(interview.acceptedDate),
      }))
      .sort((a, b) => a.acceptedDate.getTime() - b.acceptedDate.getTime());

    console.log(
      `Processing ${processedAppliedJobs.length} jobs for user ${userId}`
    );
    console.log(
      `Processing ${processedInterviews.length} interviews for user ${userId}`
    );

    processedAppliedJobs.forEach((job) => {
      appliedJobsCount++;
      if (jobMilestones.includes(appliedJobsCount)) {
        console.log(
          `Milestone ${appliedJobsCount} reached on ${job.createdAt} for user ${userId}`
        );
        awardedAchievements.push({
          id: `${userId}-job-${appliedJobsCount}`,
          name: `Applied to ${appliedJobsCount} Jobs`,
          description: `Awarded for applying to ${appliedJobsCount} jobs on ${job.createdAt.toLocaleDateString()}.`,
          unlocked: true,
        });
      }
    });

    processedInterviews.forEach((interview) => {
      interviewsCount++;
      if (interviewMilestones.includes(interviewsCount)) {
        console.log(
          `Interview milestone ${interviewsCount} reached on ${interview.acceptedDate} for user ${userId}`
        );
        awardedAchievements.push({
          id: `${userId}-interview-${interviewsCount}`,
          name: `Attended ${interviewsCount} Interviews`,
          description: `Awarded for attending ${interviewsCount} interviews by ${interview.acceptedDate.toLocaleDateString()}.`,
          unlocked: true,
        });
      }
    });

    jobMilestones.forEach((milestone) => {
      if (
        !awardedAchievements.some(
          (a) => a.name === `Applied to ${milestone} Jobs`
        )
      ) {
        lockedAchievements.push({
          id: `${userId}-job-${milestone}`,
          name: `Applied to ${milestone} Jobs`,
          description: `Awarded for applying to ${milestone} jobs`,
          unlocked: false,
        });
      }
    });

    interviewMilestones.forEach((milestone) => {
      if (
        !awardedAchievements.some(
          (a) => a.name === `Attended ${milestone} Interviews`
        )
      ) {
        lockedAchievements.push({
          id: `${userId}-interview-${milestone}`,
          name: `Attended ${milestone} Interviews`,
          description: `Awarded for attending ${milestone} interviews`,
          unlocked: false,
        });
      }
    });

    console.time(`preFetchAchievements-${userId}`);
    const achievementNames = awardedAchievements.map((a) => a.name);
    const existingAchievements = await prisma.achievement.findMany({
      where: { name: { in: achievementNames } },
      select: { id: true, name: true },
    });
    const achievementMap = new Map(
      existingAchievements.map((a) => [a.name, a.id])
    );

    await prisma.$transaction(
      achievementNames
        .filter((name) => !achievementMap.has(name))
        .map((name) =>
          prisma.achievement.upsert({
            where: { name },
            update: {},
            create: {
              name,
              description:
                awardedAchievements.find((a) => a.name === name)?.description ||
                `Achievement for ${name}`,
            },
          })
        )
    );

    const updatedAchievements = await prisma.achievement.findMany({
      where: { name: { in: achievementNames } },
      select: { id: true, name: true },
    });
    updatedAchievements.forEach((a) => achievementMap.set(a.name, a.id));
    console.timeEnd(`preFetchAchievements-${userId}`);

    console.time(`batchInsertAchievements-${userId}`);
    const existingUserAchievements = await prisma.userAchievement.findMany({
      where: {
        userId,
        achievementId: { in: Array.from(achievementMap.values()) },
      },
      select: { achievementId: true },
    });
    const existingAchievementIds = new Set(
      existingUserAchievements.map((ua) => ua.achievementId)
    );

    await prisma.$transaction(
      awardedAchievements
        .filter((a) => !existingAchievementIds.has(achievementMap.get(a.name)!))
        .map((achievement) => {
          const achievementId = achievementMap.get(achievement.name);
          if (!achievementId) {
            throw new Error(`Achievement ID not found for ${achievement.name}`);
          }
          return prisma.userAchievement.create({
            data: {
              user: { connect: { id: userId } },
              achievement: { connect: { id: achievementId } },
              awardedAt: new Date(),
            },
          });
        })
    );
    console.timeEnd(`batchInsertAchievements-${userId}`);

    console.log(
      `Awarded ${awardedAchievements.length} achievements for user ${userId}`
    );
    console.log(
      `Locked ${lockedAchievements.length} achievements for user ${userId}`
    );

    return { awardedAchievements, lockedAchievements };
  } catch (error) {
    console.error(`Error in calculateAchievements for user ${userId}:`, error);
    throw error;
  } finally {
    console.timeEnd(`calculateAchievements-${userId}`);
  }
};

const getUserJobs = (userId: string) =>
  unstable_cache(
    async (id: string) => {
      console.time(`getUserJobs-${id}`);
      try {
        const jobs = await prisma.job.findMany({
          where: { userId: id, status: { not: "SAVED" } },
          select: {
            id: true,
            createdAt: true,
            status: true,
            holidayApplied: true,
          },
        });
        console.log(`Fetched ${jobs.length} jobs for user ${id}`);
        return jobs;
      } finally {
        console.timeEnd(`getUserJobs-${id}`);
      }
    },
    [`user_jobs_${userId}`],
    { tags: [`user_jobs_${userId}`], revalidate: 60 }
  )(userId);

const getUserInterviews = (userId: string) =>
  unstable_cache(
    async (id: string) => {
      console.time(`getUserInterviews-${id}`);
      try {
        const interviews = await prisma.interview.findMany({
          where: { userId: id, interviewDate: { not: null } },
          select: { id: true, acceptedDate: true, interviewDate: true },
        });
        console.log(`Fetched ${interviews.length} interviews for user ${id}`);
        return interviews;
      } finally {
        console.timeEnd(`getUserInterviews-${id}`);
      }
    },
    [`user_interviews_${userId}`],
    { tags: [`user_interviews_${userId}`], revalidate: 60 }
  )(userId);

const getUserAchievements = (userId: string) =>
  unstable_cache(
    async (id: string) => {
      console.time(`getUserAchievements-${id}`);
      try {
        const achievements = await prisma.userAchievement.findMany({
          where: { userId: id },
          select: {
            achievement: { select: { id: true, description: true } },
          },
        });
        console.log(
          `Fetched ${achievements.length} existing achievements for user ${id}`
        );
        return achievements;
      } finally {
        console.timeEnd(`getUserAchievements-${id}`);
      }
    },
    [`user_achievements_${userId}`],
    { tags: [`user_achievements_${userId}`], revalidate: 3600 }
  )(userId);

const cachedCalculateAchievements = unstable_cache(
  calculateAchievements,
  [`achievements`],
  { tags: [`achievements`], revalidate: 3600 }
);

const sortAchievements = (a: HolidayAchievement, b: HolidayAchievement) => {
  console.time(`sortAchievements`);
  try {
    if (a.unlocked !== b.unlocked) {
      return a.unlocked ? -1 : 1;
    }
    const yearMatchA = a.name.match(/\d{4}$/);
    const yearMatchB = b.name.match(/\d{4}$/);
    const yearA = yearMatchA ? parseInt(yearMatchA[0], 10) : 0;
    const yearB = yearMatchB ? parseInt(yearMatchB[0], 10) : 0;
    if (yearA !== yearB) {
      return yearA - yearB;
    }

    const holidayNameMatchA = a.name.match(/Applied on (.*) \d{4}/);
    const holidayNameMatchB = b.name.match(/Applied on (.*) \d{4}/);
    const holidayNameA = holidayNameMatchA ? holidayNameMatchA[1] : "";
    const holidayNameB = holidayNameMatchB ? holidayNameMatchB[1] : "";
    const indexA = usHolidays.findIndex((h) => h.name === holidayNameA);
    const indexB = usHolidays.findIndex((h) => h.name === holidayNameB);
    return indexA === -1 || indexB === -1
      ? holidayNameA.localeCompare(holidayNameB)
      : indexA - indexB;
  } finally {
    console.timeEnd(`sortAchievements`);
  }
};

export async function getAchievements() {
  console.time("getAchievements");
  try {
    const currentUser = await getCurrentUser();
    console.log(`Current user ID: ${currentUser?.id}`);

    if (!currentUser) {
      console.log("No current user, redirecting to login");
      return redirect("/login");
    }

    console.time(`fetchUserData-${currentUser.id}`);
    const [userJobs, userInterviews, userAchievements] = await Promise.all([
      getUserJobs(currentUser.id),
      getUserInterviews(currentUser.id),
      getUserAchievements(currentUser.id),
    ]);
    console.timeEnd(`fetchUserData-${currentUser.id}`);

    console.log(`Jobs fetched for user ${currentUser.id}: ${userJobs.length}`);
    console.log(
      `Interviews fetched for user ${currentUser.id}: ${userInterviews.length}`
    );
    console.log(
      `Existing achievements for user ${currentUser.id}: ${userAchievements.length}`
    );

    console.time(`calculateAchievementsAndStreak-${currentUser.id}`);
    const [achievementsResult, weeklyResult] = await Promise.all([
      cachedCalculateAchievements(currentUser.id, userJobs, userInterviews),
      calculateWeeklyApplicationStreak(currentUser.id),
    ]);
    console.timeEnd(`calculateAchievementsAndStreak-${currentUser.id}`);

    const { awardedAchievements, lockedAchievements } = achievementsResult;
    const holidayAchievements: HolidayAchievement[] = [];
    const lockedHolidayAchievements: HolidayAchievement[] = [];
    const uniqueHolidaysAppliedOn = new Set<string>();

    console.time(`processHolidayAchievements-${currentUser.id}`);
    userJobs.forEach((job) => {
      const holiday =
        job.holidayApplied || checkIfHoliday(new Date(job.createdAt));
      if (holiday && !uniqueHolidaysAppliedOn.has(holiday)) {
        uniqueHolidaysAppliedOn.add(holiday);
        holidayAchievements.push({
          id: `${currentUser.id}-holiday-${holiday}-${new Date(
            job.createdAt
          ).getFullYear()}`,
          name: `Applied on ${holiday} ${new Date(
            job.createdAt
          ).getFullYear()}`,
          description: `Awarded for applying on ${holiday} in ${new Date(
            job.createdAt
          ).getFullYear()}.`,
          unlocked: true,
        });
        console.log(
          `Added holiday achievement: Applied on ${holiday} for user ${currentUser.id}`
        );
      }
    });

    usHolidays.forEach((holiday) => {
      if (!uniqueHolidaysAppliedOn.has(holiday.name)) {
        lockedHolidayAchievements.push({
          id: `${currentUser.id}-holiday-${holiday.name}-${currentYear}`,
          name: `Applied on ${holiday.name} ${currentYear}`,
          description: `Awarded for applying on ${holiday.name} in ${currentYear}`,
          unlocked: false,
        });
      }
    });
    console.timeEnd(`processHolidayAchievements-${currentUser.id}`);

    console.time(`organizeAchievements-${currentUser.id}`);
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
    console.timeEnd(`organizeAchievements-${currentUser.id}`);

    console.log(
      `Job achievements for user ${currentUser.id}:`,
      organizedAchievements.jobAchievements.map(
        (a) => `${a.name} (unlocked: ${a.unlocked})`
      )
    );
    console.log(
      `Interview achievements for user ${currentUser.id}:`,
      organizedAchievements.interviewAchievements.map(
        (a) => `${a.name} (unlocked: ${a.unlocked})`
      )
    );
    console.log(
      `Holiday achievements for user ${currentUser.id}:`,
      organizedAchievements.holidayAchievements.map(
        (a) => `${a.name} (unlocked: ${a.unlocked})`
      )
    );
    console.log(
      `Weekly streak for user ${currentUser.id}: ${weeklyResult.streak}`
    );
    console.log(
      `Applied days this week for user ${currentUser.id}: ${weeklyResult.appliedDaysCount}`
    );

    return {
      ...organizedAchievements,
      allAchievements: userAchievements.map((ua) => ua.achievement),
      weeklyStreak: weeklyResult.streak,
      appliedDaysThisWeek: weeklyResult.appliedDaysCount,
    };
  } catch (error) {
    console.error("Error fetching or calculating user achievements:", error);
    throw error;
  } finally {
    console.timeEnd("getAchievements");
  }
};