"use server";

import getCurrentUser from "./getCurrentUser";
import prisma from "../lib/db/prisma";
import { extractSkillsFromDescription } from "../lib/extractSkillsFromDescription";
import { unstable_cache } from "next/cache";

// Update the missing skills frequency map
const updateMissingSkillsFrequencyMap = (
  missingSkillsFrequencyMap: Map<string, number>,
  jobSkills: string[],
  userSkills: string[]
) => {
  // Iterate through each job skill to check if it's missing
  for (const skill of jobSkills) {
    if (!userSkills.includes(skill)) {
      missingSkillsFrequencyMap.set(
        skill,
        (missingSkillsFrequencyMap.get(skill) || 0) + 1
      );
    }
  }
};

const getCachedUserMissingSkillsAndFrequency = unstable_cache(
  async (page: number = 1, pageSize: number = 10) => {
    // Retrieve the current user

    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      throw new Error("User not authenticated or user ID not found");
    }

    // Fetch user jobs from the database
    const userJobs = await prisma.job.findMany({
      where: {
        userId: currentUser.id,
      },
    });

    // Fetch user skills from the current user
    const userSkills = currentUser.skills || [];

    // Initialize a Map to store the frequency of missing skills
    const missingSkillsFrequencyMap = new Map<string, number>();
    // Iterate over user jobs
    for (const job of userJobs) {
      // Get the list of job skills extracted from the job description
      const extractedSkills = extractSkillsFromDescription(job.description);

      // Update the missing skills frequency map for this job
      updateMissingSkillsFrequencyMap(
        missingSkillsFrequencyMap,
        extractedSkills,
        userSkills
      );
    }

    // Convert the missingSkillsFrequencyMap to an array of objects for sorting
    const missingSkillsFrequencyArray = Array.from(
      missingSkillsFrequencyMap.entries()
    ).map(([skill, frequency]) => ({ skill, frequency }));

    // Sort the missing skills frequency array by frequency in descending order
    missingSkillsFrequencyArray.sort((a, b) => b.frequency - a.frequency);

    const totalPages = Math.ceil(missingSkillsFrequencyArray.length / pageSize);

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedMissingSkills = missingSkillsFrequencyArray.slice(
      startIndex,
      endIndex
    );

    const sortedMissingSkills = paginatedMissingSkills.map(
      (entry) => entry.skill
    );
    const sortedMissingFrequencies = paginatedMissingSkills.map(
      (entry) => entry.frequency
    );

    return {
      sortedMissingSkills,
      sortedMissingFrequencies,
      totalPages,
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
    return await getCachedUserMissingSkillsAndFrequency(page, pageSize);
  } catch (error) {
    console.error(
      "Error fetching cached user job skills and frequency:",
      error
    );
    throw new Error("Failed to fetch user jobs or calculate skill frequency");
  }
};
