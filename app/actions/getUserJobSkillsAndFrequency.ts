"use server";
import getCurrentUser from "./getCurrentUser";
import prisma from "../lib/db/prisma";
import { unstable_cache } from "next/cache";
import { extractSkillsFromDescription } from "../lib/extractSkillsFromDescription";

const getCachedUserJobSkillsAndFrequency = unstable_cache(
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

    // Count frequency of each skill using count()
    const skillFrequencies = await Promise.all(
      Array.from(uniqueSkills).map(async (skill) => {
        const count = await prisma.job.count({
          where: {
            userId: currentUser.id,
            description: {
              contains: skill,
            },
          },
        });
        return { skill, frequency: count };
      })
    );

    // Sort by frequency in descending order
    skillFrequencies.sort((a, b) => b.frequency - a.frequency);

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedSkills = skillFrequencies.slice(startIndex, endIndex);

    return {
      sortedSkills: paginatedSkills.map((entry) => entry.skill),
      sortedFrequencies: paginatedSkills.map((entry) => entry.frequency),
      totalPages: Math.ceil(skillFrequencies.length / pageSize),
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

export const getUserJobSkillsAndFrequency = async (
  page: number = 1,
  pageSize: number = 10
) => {
  try {
    return await getCachedUserJobSkillsAndFrequency(page, pageSize);
  } catch (error) {
    console.error(
      "Error fetching cached user job skills and frequency:",
      error
    );
    throw new Error("Failed to fetch user jobs or calculate skill frequency");
  }
};
