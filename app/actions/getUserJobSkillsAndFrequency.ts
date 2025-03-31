"use server";

import getCurrentUser from "./getCurrentUser";
import prisma from "../lib/db/prisma";
import { extractSkillsFromDescription } from "../lib/extractSkillsFromDescription";
import { redirect } from "next/navigation";

const updateSkillFrequencyMap = (
  skillFrequencyMap: Map<string, number>,
  jobSkills: string[]
) => {
  for (const skill of jobSkills) {
    skillFrequencyMap.set(skill, (skillFrequencyMap.get(skill) || 0) + 1);
  }
};

export const getUserJobSkillsAndFrequency = async (
  page: number = 1,
  pageSize: number = 10
) => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return redirect("/login");
    }

    const userJobs = await prisma.job.findMany({
      where: {
        userId: currentUser.id,
      },
    });

    const skillFrequencyMap = new Map<string, number>();
    const jobSkills: string[] = [];

    for (const job of userJobs) {
      const extractedSkills = extractSkillsFromDescription(job.description);
      jobSkills.push(...extractedSkills);
    }

    updateSkillFrequencyMap(skillFrequencyMap, jobSkills);

    const skillFrequencyArray = Array.from(skillFrequencyMap.entries()).map(
      ([skill, frequency]) => ({ skill, frequency })
    );

    skillFrequencyArray.sort((a, b) => b.frequency - a.frequency);

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedSkills = skillFrequencyArray.slice(startIndex, endIndex);

    const sortedSkills = paginatedSkills.map((entry) => entry.skill);
    const sortedFrequencies = paginatedSkills.map((entry) => entry.frequency);

    const totalPages = Math.ceil(skillFrequencyArray.length / pageSize);

    return {
      sortedSkills,
      sortedFrequencies,
      totalPages,
      currentPage: page,
      pageSize,
    };
  } catch (error) {
    console.error(
      "Error fetching user jobs or calculating skill frequency:",
      error
    );
    throw new Error("Failed to fetch user jobs or calculate skill frequency");
  }
};