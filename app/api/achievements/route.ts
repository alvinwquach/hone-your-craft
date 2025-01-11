import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";
import { ApplicationStatus } from "@prisma/client";

// Helper function to determine the user's milestones based on applied jobs
const calculateAchievements = async (userId: string, appliedJobs: any[]) => {
  // Define the milestones (number of jobs applied to)
  const milestones = [
    10, 25, 50, 75, 100, 125, 250, 500, 750, 1000, 2500, 5000, 10000,
  ];
  const awardedAchievements = [];

  // Count the jobs per milestone based on 'createdAt'
  let appliedJobsCount = 0;
  const milestonesMap = new Map<number, string>(); // Store milestones and their corresponding createdAt

  // Sort jobs by 'createdAt' in ascending order
  const sortedJobs = appliedJobs.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Iterate through the sorted jobs and count towards milestones
  for (const job of sortedJobs) {
    appliedJobsCount++;

    // Check if the applied jobs count has reached any of the milestones
    for (let milestone of milestones) {
      if (appliedJobsCount === milestone && !milestonesMap.has(milestone)) {
        milestonesMap.set(milestone, job.createdAt); // Set the createdAt of the job when milestone is hit
      }
    }
  }

  // Iterate over each milestone and check if the user has reached it
  for (let milestone of milestones) {
    if (milestonesMap.has(milestone)) {
      // Award achievement only if not already awarded
      const existingAchievement = await prisma.userAchievement.findFirst({
        where: {
          userId,
          achievement: {
            name: `Applied ${milestone} Jobs`,
          },
        },
      });

      // If the user hasn't already earned the achievement
      if (!existingAchievement) {
        const achievedDate = milestonesMap.get(milestone);
        if (achievedDate) {
          // Check if achievedDate is defined
          const achievement = await prisma.achievement.create({
            data: {
              name: `Applied to ${milestone} Jobs`,
              description: `Awarded for applying to ${milestone} jobs on ${new Date(
                achievedDate
              ).toLocaleDateString()}.`,
              iconUrl: "", // Optional: Add an icon URL if needed
              userAchievements: {
                create: {
                  userId,
                },
              },
            },
          });
          awardedAchievements.push(achievement);
        }
      }
    }
  }

  return awardedAchievements;
};

export async function GET(request: NextRequest) {
  try {
    // Get the current user
    const currentUser = await getCurrentUser();

    // If user is not authenticated, return a 401 response
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Fetch user jobs from the database, excluding 'SAVED' status
    const userJobs = await prisma.job.findMany({
      where: {
        userId: currentUser.id,
        status: {
          not: "SAVED",
        },
      },
    });

    // Calculate achievements based on applied jobs (award achievements incrementally)
    const newAchievements = await calculateAchievements(
      currentUser.id,
      userJobs
    );

    // Fetch all achievements linked to this user
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

    // Map the achievements to include only id and description
    const allAchievements = allUserAchievements.map((ua) => ua.achievement);

    // Return both new and existing achievements
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
