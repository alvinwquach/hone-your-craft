"use server";

import getCurrentUser from "./getCurrentUser";
import prisma from "../lib/db/prisma";
import { extractSkillsFromDescription } from "../lib/extractSkillsFromDescription";

const updateSkillFrequencyMap = (
  skillFrequencyMap: Map<string, number>,
  jobSkills: string[]
) => {
  // Iterate through each skill in the jobSkills array
  for (const skill of jobSkills) {
    /* If the skill already exists in the skillFrequencyMap, 
    increment the value of skill in frequencyMap, 
    else set the value of skill in skillFrequency map to 1 */
    skillFrequencyMap.set(skill, (skillFrequencyMap.get(skill) || 0) + 1);
  }
};

export const getUserJobSkillsAndFrequency = async () => {
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
    });

    // Initialize a Map to store the frequency of skills
    const skillFrequencyMap = new Map<string, number>();

    // Initialize an array to store job skills
    const jobSkills: string[] = [];

    // Iterate over user jobs
    for (const job of userJobs) {
      // Get the list of job skills extracted from the job description
      const extractedSkills = extractSkillsFromDescription(job.description);
      // Push the extracted skills into the jobSkills array
      jobSkills.push(...extractedSkills);
    }

    // Update skill frequency map
    updateSkillFrequencyMap(skillFrequencyMap, jobSkills);

    // Convert the skillFrequencyMap to an array of objects for sorting
    const skillFrequencyArray = Array.from(skillFrequencyMap.entries()).map(
      ([skill, frequency]) => ({ skill, frequency })
    );

    // Sort the skillFrequencyArray by frequency in descending order
    skillFrequencyArray.sort((a, b) => b.frequency - a.frequency);

    // Extract sorted skills and frequencies
    const sortedSkills = skillFrequencyArray.map((entry) => entry.skill);
    const sortedFrequencies = skillFrequencyArray.map(
      (entry) => entry.frequency
    );

    return { sortedSkills, sortedFrequencies };
  } catch (error) {
    console.error(
      "Error fetching user jobs or calculating skill frequency:",
      error
    );
    throw new Error("Failed to fetch user jobs or calculate skill frequency");
  }
};
