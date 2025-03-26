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

const getCachedUserJobPostings = unstable_cache(
  async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
      throw new Error("User not authenticated or user ID not found");
    }

    const userJobs = await prisma.job.findMany({
      where: { userId: currentUser.id },
      select: {
        id: true,
        title: true,
        company: true,
        postUrl: true,
        description: true,
        referral: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return userJobs.map((job) => ({
      ...job,
      source: job.referral ? "Referral" : getSourceFromUrl(job.postUrl),
      skills: extractSkillsFromDescription(job.description),
    }));
  },
  ["user-job-postings"],
  {
    revalidate: 30,
    tags: ["jobs", "postings"],
  }
);

export default async function getUserJobPostings() {
  try {
    return await getCachedUserJobPostings();
  } catch (error) {
    console.error("Error fetching cached user job postings:", error);
    throw new Error("Failed to fetch user jobs or extract skills");
  }
}
