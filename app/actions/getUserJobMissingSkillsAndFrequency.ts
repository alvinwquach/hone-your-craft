"use server";

import getCurrentUser from "./getCurrentUser";
import prisma from "../lib/db/prisma";
import { extractSkillsFromDescription } from "../lib/extractSkillsFromDescription";

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

export const getUserJobMissingSkillsAndFrequency = async (
  page: number = 1,
  pageSize: number = 10
) => {
  console.time("getUserJobMissingSkillsAndFrequency");
  try {
    // Retrieve the current user
    const currentUser = await getCurrentUser();
    // Check if the user ID is missing
    if (!currentUser?.id) {
      throw new Error("User not authenticated or user ID not found");
    }

    // Fetch user jobs from the database
    const userJobs = await prisma.job.findMany({
      where: {
        userId: currentUser.id,
      },
      select: {
        id: true,
        description: true,
      },
    });
    console.timeLog("getUserJobMissingSkillsAndFrequency", "Fetched jobs");

    // Fetch user skills from the current user
    const userSkills = currentUser.skills || [];

    // Initialize a Map to store the frequency of missing skills
    const missingSkillsFrequencyMap = new Map<string, number>();

    // Iterate over user jobs
    for (const job of userJobs) {
      // Get the list of job skills extracted from the job description
      let extractedSkills: string[] = [];
      if (job.description) {
        try {
          extractedSkills = await extractSkillsFromDescription(job.description);
          extractedSkills = [...new Set(extractedSkills)];
        } catch (error) {
          console.error(`Failed to extract skills for job ${job.id}:`, error);
          extractedSkills = [];
        }
      }

      // Update the missing skills frequency map for this job
      updateMissingSkillsFrequencyMap(
        missingSkillsFrequencyMap,
        extractedSkills,
        userSkills
      );
    }
    console.timeLog("getUserJobMissingSkillsAndFrequency", "Processed skills");

    // Convert the missingSkillsFrequencyMap to an array of objects for sorting
    const missingSkillsFrequencyArray = Array.from(
      missingSkillsFrequencyMap.entries()
    ).map(([skill, frequency]) => ({ skill, frequency }));

    // Sort by frequency in descending order
    missingSkillsFrequencyArray.sort((a, b) => b.frequency - a.frequency);

    // Pagination
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

    console.timeEnd("getUserJobMissingSkillsAndFrequency");
    return {
      sortedMissingSkills,
      sortedMissingFrequencies,
      totalPages,
      currentPage: page,
      pageSize,
    };
  } catch (error) {
    console.error(
      "Error fetching user jobs or calculating missing skills frequency:",
      error
    );
    throw new Error(
      "Failed to fetch user jobs or calculate missing skills frequency"
    );
  }
};