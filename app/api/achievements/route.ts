import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";

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

  const awardedAchievements = [];

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
      const existingJobAchievement = await prisma.userAchievement.findFirst({
        where: {
          userId,
          achievement: {
            name: `Applied ${milestone} Jobs`,
          },
        },
      });

      if (!existingJobAchievement) {
        const achievedDate = jobMilestonesMap.get(milestone);
        if (achievedDate) {
          const jobAchievement = await prisma.achievement.create({
            data: {
              name: `Applied to ${milestone} Jobs`,
              description: `Awarded for applying to ${milestone} jobs on ${new Date(
                achievedDate
              ).toLocaleDateString()}.`,
              userAchievements: {
                create: {
                  userId,
                },
              },
            },
          });
          awardedAchievements.push(jobAchievement);
        }
      }
    }
  }

  for (let milestone of interviewMilestones) {
    if (interviewMilestonesMap.has(milestone)) {
      const existingInterviewAchievement =
        await prisma.userAchievement.findFirst({
          where: {
            userId,
            achievement: {
              name: `Attended ${milestone} Interviews`,
            },
          },
        });

      if (!existingInterviewAchievement) {
        const achievedDate = interviewMilestonesMap.get(milestone);
        if (achievedDate) {
          const interviewAchievement = await prisma.achievement.create({
            data: {
              name: `Attended ${milestone} Interviews`,
              description: `Awarded for attending ${milestone} interviews by ${new Date(
                achievedDate
              ).toLocaleDateString()}.`,
              userAchievements: {
                create: {
                  userId,
                },
              },
            },
          });
          awardedAchievements.push(interviewAchievement);
        }
      }
    }
  }

  return awardedAchievements;
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

    const newAchievements = await calculateAchievements(
      currentUser.id,
      userJobs,
      userInterviews
    );

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

    const allAchievements = allUserAchievements.map((ua) => ua.achievement);

    return NextResponse.json({
      newAchievements: newAchievements.map((a) => ({
        id: a.id,
        description: a.description,
      })),
      allAchievements: allAchievements,
    });
  } catch (error) {
    console.error("Error fetching or calculating user achievements:", error);
    return NextResponse.error();
  }
}
