"use server";
import getCurrentUser from "./getCurrentUser";
import prisma from "../lib/db/prisma";
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
  weeworkremotely: "We Work Remotely",
  adzuna: "Adzuna",
};

const SOURCE_MAPPINGS_SET = new Set(Object.keys(SOURCE_MAPPINGS));

const getSourceFromUrl = (postUrl: string): string => {
  const lowercaseUrl = postUrl.toLowerCase();
  for (const source of SOURCE_MAPPINGS_SET) {
    if (lowercaseUrl.includes(source)) {
      return SOURCE_MAPPINGS[source];
    }
  }
  return "Company Website";
};

const getCachedCandidateJobPostingSourceCount = unstable_cache(
  async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
      throw new Error("User not authenticated or user ID not found");
    }

    const jobSourceCount = await prisma.job.groupBy({
      by: ["postUrl", "referral"],
      where: {
        userId: currentUser.id,
        referral: { not: null },
      },
      _count: {
        postUrl: true,
      },
      orderBy: {
        _count: {
          postUrl: "desc",
        },
      },
    });

    const sourceCountRecord: Record<string, number> = {
      ...SOURCE_MAPPINGS,
      Referral: 0,
      "Company Website": 0,
    };

    jobSourceCount.forEach((group) => {
      const source = group.referral
        ? "Referral"
        : getSourceFromUrl(group.postUrl);
      sourceCountRecord[source] =
        (sourceCountRecord[source] || 0) + group._count.postUrl;
    });

    return sourceCountRecord;
  },
  ["user-job-sources"],
  {
    revalidate: 30,
    tags: ["jobs", "sources"],
  }
);

export const getCandidateJobPostingSourceCount = async () => {
  try {
    return await getCachedCandidateJobPostingSourceCount();
  } catch (error) {
    console.error("Error fetching cached user job posting sources:", error);
    throw new Error("Failed to fetch user jobs or count sources");
  }
};
