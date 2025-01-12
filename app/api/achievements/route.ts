import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";

const fetchWeeklyJobApplications = async (
  userId: string,
  startDate: Date,
  endDate: Date
) => {
  return await prisma.job.findMany({
    where: {
      userId: userId,
      status: { not: "SAVED" },
      createdAt: { gte: startDate, lte: endDate },
    },
    select: {
      createdAt: true,
    },
  });
};

interface Job {
  createdAt: Date | string;
}

const trackApplicationDays = (jobs: Job[]): number => {
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

  const jobsThisWeek = await fetchWeeklyJobApplications(
    userId,
    currentWeekStart,
    currentWeekEnd
  );

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
    10, 25, 50, 75, 100, 125, 250, 500, 750, 1000, 2500, 5000, 10000,
  ];
  const interviewMilestones = [
    1, 5, 10, 20, 30, 50, 75, 100, 150, 200, 500, 1000, 2000,
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

    return NextResponse.json({
      awardedAchievements,
      lockedAchievements,
      allAchievements,
      weeklyStreak: weeklyResult.streak,
      appliedDaysThisWeek: weeklyResult.appliedDaysCount,
    });
  } catch (error) {
    console.error("Error fetching or calculating user achievements:", error);
    return NextResponse.error();
  }
}
