"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "./getCurrentUser";
import { redirect } from "next/navigation";
import { skillsTrie } from "@/app/lib/trie";

const skillCache = new Map<string, string[]>();

const extractSkillsLocally = (description: string): string[] => {
  if (!description) {
    return [];
  }

  const cacheKey = description.slice(0, 100) + description.length;
  if (skillCache.has(cacheKey)) {
    return skillCache.get(cacheKey)!;
  }

  try {
    const skills = skillsTrie.searchSkills(description);
    if (skillCache.size > 1000) skillCache.clear();
    skillCache.set(cacheKey, skills);
    return skills;
  } catch (error) {
    console.error("Error extracting skills:", error);
    return [];
  }
};

export const getSuggestedSkills = async (): Promise<string[]> => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      console.error("No user authenticated");
      redirect("/login");
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { skills: true },
    });

    if (!user) {
      console.error("User not found:", currentUser.id);
      throw new Error("User data not found");
    }

    const jobPostings = await prisma.job.findMany({
      where: { userId: currentUser.id, description: {} },
      select: { id: true, description: true },
    });

    if (!jobPostings.length) {
      console.warn("No jobs with descriptions found for user:", currentUser.id);
      return [];
    }

    const jobSkills = new Set<string>();
    for (const job of jobPostings) {
      try {
        const skills = extractSkillsLocally(job.description!);
        skills.forEach((skill) => jobSkills.add(skill));
      } catch (error) {
        console.error(`Failed to extract skills for job ${job.id}:`, error);
      }
    }

    const suggestedSkills = Array.from(jobSkills)
      .filter((skill) => !user.skills.includes(skill))
      .sort((a, b) => a.localeCompare(b));

    return suggestedSkills;
  } catch (error) {
    console.error("Error fetching suggested skills:", error);
    return [];
  } finally {
  }
};

