"use server";
import getCurrentUser from "./getCurrentUser";
import prisma from "../lib/db/prisma";
import { extractSkillsFromDescription } from "../lib/extractSkillsFromDescription";
import { unstable_cache } from "next/cache";

const getCachedUserJobMissingSkillsAndFrequency = unstable_cache(
  async (page: number = 1, pageSize: number = 10) => {
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
      throw new Error("User not authenticated or user ID not found");
    }

    // Get all unique skills from user's jobs
    const skills = await prisma.job.findMany({
      where: { userId: currentUser.id },
      select: {
        description: true,
      },
    });

    // Extract skills and create a set of unique skills
    const uniqueSkills = new Set<string>();
    for (const job of skills) {
      const extractedSkills = extractSkillsFromDescription(job.description);
      extractedSkills.forEach((skill) => uniqueSkills.add(skill));
    }

    // Get user's skills
    const userSkills = currentUser.skills || [];

    // Count frequency of missing skills using count()
    const missingSkillsFrequencies = await Promise.all(
      Array.from(uniqueSkills).map(async (skill) => {
        if (!userSkills.includes(skill)) {
          const count = await prisma.job.count({
            where: {
              userId: currentUser.id,
              description: {
                contains: skill,
              },
            },
          });
          return { skill, frequency: count };
        }
        return { skill, frequency: 0 };
      })
    );

    // Filter out skills that aren't missing and sort by frequency
    const missingSkills = missingSkillsFrequencies
      .filter(({ frequency }) => frequency > 0)
      .sort((a, b) => b.frequency - a.frequency);

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedMissingSkills = missingSkills.slice(startIndex, endIndex);

    return {
      sortedMissingSkills: paginatedMissingSkills.map((entry) => entry.skill),
      sortedMissingFrequencies: paginatedMissingSkills.map(
        (entry) => entry.frequency
      ),
      totalPages: Math.ceil(missingSkills.length / pageSize),
      currentPage: page,
      pageSize,
    };
  },
  ["user-job-skills"],
  {
    revalidate: 30,
    tags: ["jobs", "skills"],
  }
);

export const getUserJobMissingSkillsAndFrequency = async (
  page: number = 1,
  pageSize: number = 10
) => {
  try {
    return await getCachedUserJobMissingSkillsAndFrequency(page, pageSize);
  } catch (error) {
    console.error(
      "Error fetching cached user missing skills and frequency:",
      error
    );
    throw new Error(
      "Failed to fetch user jobs or calculate missing skill frequency"
    );
  }
};
