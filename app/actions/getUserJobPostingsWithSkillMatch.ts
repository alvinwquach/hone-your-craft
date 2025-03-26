"use server";
import getCurrentUser from "./getCurrentUser";
import prisma from "../lib/db/prisma";
import { extractSkillsFromDescription } from "../lib/extractSkillsFromDescription";
import { unstable_cache } from "next/cache";

const SOURCE_MAPPINGS: Record<string, string> = {
  otta: "Otta",
  linkedin: "LinkedIn",
  wellfound: "Wellfound",
  glassdoor: "Glassdoor",
  monster: "Monster",
  ziprecruiter: "Zip Recruiter",
  careerbuilder: "Career Builder",
  indeed: "Indeed",
  simplyhired: "SimplyHired",
  stackoverflow: "Stack Overflow",
  dice: "Dice",
  weworkremotely: "We Work Remotely",
  adzuna: "Adzuna",
};

const getSourceFromUrl = (postUrl: string): string => {
  const lowercaseUrl = postUrl.toLowerCase();
  return (
    Object.entries(SOURCE_MAPPINGS).find(([key]) =>
      lowercaseUrl.includes(key)
    )?.[1] ?? "Company Website"
  );
};

const getCachedUserJobPostingsWithSkillMatch = unstable_cache(
  async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
      throw new Error("User not authenticated or user ID not found");
    }

    const userSkills = new Set(currentUser.skills || []);

    const userJobs = await prisma.job.findMany({
      where: {
        userId: currentUser.id,
      },
      select: {
        id: true,
        title: true,
        company: true,
        postUrl: true,
        description: true,
        referral: true,
      },
    });

    return userJobs
      .map((job) => {
        const jobSkills = [
          ...new Set(extractSkillsFromDescription(job.description)),
        ];
        const matchingSkills = jobSkills.filter((skill) =>
          userSkills.has(skill)
        );
        const missingSkills = jobSkills.filter(
          (skill) => !userSkills.has(skill)
        );
        const totalSkills = jobSkills.length;
        const matchPercentage =
          totalSkills > 0
            ? Math.round((matchingSkills.length / totalSkills) * 100)
            : 0;

        return {
          id: job.id,
          title: job.title,
          company: job.company,
          postUrl: job.postUrl,
          source:
            job.referral === true ? "Referral" : getSourceFromUrl(job.postUrl),
          matchingSkills,
          missingSkills,
          matchPercentage,
        };
      })
      .sort((a, b) => b.matchPercentage - a.matchPercentage);
  },
  ["user-job-postings-with-skills"],
  {
    revalidate: 30,
    tags: ["jobs", "skills"],
  }
);

export const getUserJobPostingsWithSkillMatch = async () => {
  try {
    return await getCachedUserJobPostingsWithSkillMatch();
  } catch (error) {
    console.error(
      "Error fetching cached user job postings with skill match:",
      error
    );
    throw new Error("Failed to fetch user jobs or process skills");
  }
};
