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

    const jobPostings = userJobs.map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      postUrl: job.postUrl,
      source:
        job.referral === true ? "Referral" : getSourceFromUrl(job.postUrl),
      skills: extractSkillsFromDescription(job.description),
    }));

    return jobPostings;
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
