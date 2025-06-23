"use server";

import getCurrentUser from "./getCurrentUser";
import prisma from "../lib/db/prisma";
import { extractSkillsFromDescription } from "../lib/extractSkillsFromDescription";
import { redirect } from "next/navigation";

export interface MissingSkillData {
  missingSkills: string[];
  missingSkillsFrequency: number[];
}

const updateMissingSkillsFrequencyMap = (
  missingSkillsFrequencyMap: Map<string, number>,
  jobSkills: string[],
  userSkills: string[]
) => {
  for (const skill of jobSkills) {
    if (!userSkills.includes(skill)) {
      missingSkillsFrequencyMap.set(
        skill,
        (missingSkillsFrequencyMap.get(skill) || 0) + 1
      );
    }
  }
};

export const getUserTopTenMissingJobSkillsAndFrequency =
  async (): Promise<MissingSkillData> => {
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

      const userSkills = currentUser?.skills || [];
      const missingSkillsFrequencyMap = new Map<string, number>();

      for (const job of userJobs) {
        const extractedSkills = await extractSkillsFromDescription(
          job.description
        );
        updateMissingSkillsFrequencyMap(
          missingSkillsFrequencyMap,
          extractedSkills,
          userSkills
        );
      }

      const missingSkillsFrequencyArray = Array.from(
        missingSkillsFrequencyMap.entries()
      )
        .map(([skill, frequency]) => ({ skill, frequency }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 10);

      return {
        missingSkills: missingSkillsFrequencyArray.map((entry) => entry.skill),
        missingSkillsFrequency: missingSkillsFrequencyArray.map(
          (entry) => entry.frequency
        ),
      };
    } catch (error) {
      console.error("Error fetching missing skills:", error);
      throw error;
    } finally {
      if (redirectPath) {
        redirect(redirectPath);
      }
    }
  };
