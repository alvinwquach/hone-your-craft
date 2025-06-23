"use server";

import getCurrentUser from "./getCurrentUser";
import prisma from "../lib/db/prisma";
import { extractSkillsFromDescription } from "../lib/extractSkillsFromDescription";
import { redirect } from "next/navigation";

interface SkillData {
  skills: string[];
  frequencies: number[];
}

const updateSkillFrequencyMap = (
  skillFrequencyMap: Map<string, number>,
  jobSkills: string[]
) => {
  for (const skill of jobSkills) {
    skillFrequencyMap.set(skill, (skillFrequencyMap.get(skill) || 0) + 1);
  }
};

export const getUserTopTenJobSkillsAndFrequency =
  async (): Promise<SkillData> => {
    let redirectPath: string | null = null;

    try {
      const currentUser = await getCurrentUser();
      if (!currentUser?.id) {
        redirectPath = "/login";
      }

      const userJobs = await prisma.job.findMany({
        where: { userId: currentUser?.id },
        select: { description: true },
      });

      const skillFrequencyMap = new Map<string, number>();
      const jobSkills: string[] = [];

      for (const job of userJobs) {
        const extractedSkills = await extractSkillsFromDescription(
          job.description
        );
        jobSkills.push(...extractedSkills);
      }

      updateSkillFrequencyMap(skillFrequencyMap, jobSkills);

      const skillFrequencyArray = Array.from(skillFrequencyMap.entries())
        .map(([skill, frequency]) => ({ skill, frequency }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 10);

      return {
        skills: skillFrequencyArray.map((entry) => entry.skill),
        frequencies: skillFrequencyArray.map((entry) => entry.frequency),
      };
    } catch (error) {
      console.error("Error fetching user skills:", error);
      throw error;
    } finally {
      if (redirectPath) {
        redirect(redirectPath);
      }
    }
  };
