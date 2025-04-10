"use server";
import getCurrentUser from "./getCurrentUser";
import prisma from "../lib/db/prisma";
import { extractSkillsFromDescription } from "../lib/extractSkillsFromDescription";

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

const ITEMS_PER_PAGE = 9;

const getSourceFromUrl = (postUrl: string): string => {
  const lowercaseUrl = postUrl.toLowerCase();
  return (
    Object.entries(SOURCE_MAPPINGS).find(([key]) =>
      lowercaseUrl.includes(key)
    )?.[1] ?? "Company Website"
  );
};

export const getUserJobPostingsWithSkillMatch = async (
  page: number = 1,
  take: number = ITEMS_PER_PAGE
) => {
  console.time("getUserJobPostingsWithSkillMatch");
  try {
    const currentUser = await getCurrentUser();

    const userSkills = new Set(currentUser?.skills || []);
    const userJobs = await prisma.job.findMany({
      where: { userId: currentUser?.id },
      select: {
        id: true,
        title: true,
        company: true,
        postUrl: true,
        description: true,
        referral: true,
      },
    });
    console.timeLog("getUserJobPostingsWithSkillMatch", "Fetched jobs");

    const processedJobs = userJobs.map((job) => {
      const jobSkills = [
        ...new Set(extractSkillsFromDescription(job.description)),
      ];
      const matchingSkills = jobSkills.filter((skill) => userSkills.has(skill));
      const missingSkills = jobSkills.filter((skill) => !userSkills.has(skill));
      const totalSkills = jobSkills.length;
      const matchPercentage =
        totalSkills > 0
          ? Math.round((matchingSkills.length / totalSkills) * 100)
          : 0;

      return {
        id: job.id.toString(),
        title: job.title,
        company: job.company,
        postUrl: job.postUrl,
        source:
          job.referral === true ? "Referral" : getSourceFromUrl(job.postUrl),
        matchingSkills,
        missingSkills,
        matchPercentage,
      };
    });

    console.timeLog("getUserJobPostingsWithSkillMatch", "Processed jobs");
    const sortedJobs = processedJobs.sort(
      (a, b) => b.matchPercentage - a.matchPercentage
    );
    console.timeLog("getUserJobPostingsWithSkillMatch", "Sorted jobs");

    const totalPages = Math.ceil(sortedJobs.length / take);
    const startIndex = (page - 1) * take;
    const resultJobs = sortedJobs.slice(startIndex, startIndex + take);

    console.timeEnd("getUserJobPostingsWithSkillMatch");
    return {
      jobs: resultJobs,
      totalPages,
      currentPage: page,
      totalJobs: sortedJobs.length,
    };
  } catch (error) {
    console.error("Error fetching user job postings with skill match:", error);
    throw new Error("Failed to fetch user jobs or process skills");
  }
};
