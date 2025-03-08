"use server";

import getCurrentUser from "./getCurrentUser";
import prisma from "../lib/db/prisma";

// Define source mappings as a Record for O(1) lookup performance
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

export const getUserJobPostingSourceCount = async () => {
  try {
    // Retrieve the current user
    const currentUser = await getCurrentUser();

    // Check if the user ID is missing
    if (!currentUser?.id) {
      throw new Error("User not authenticated or user ID not found");
    }

    // Group jobs by source and count occurrences
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

    // Initialize source count record with known sources
    const sourceCountRecord: Record<string, number> = {
      ...SOURCE_MAPPINGS,
      Referral: 0,
      "Company Website": 0,
    };

    // Count occurrences of each source
    jobSourceCount.forEach((group) => {
      const source = group.referral
        ? "Referral"
        : getSourceFromUrl(group.postUrl);

      sourceCountRecord[source] =
        (sourceCountRecord[source] || 0) + group._count.postUrl;
    });

    return sourceCountRecord;
  } catch (error) {
    console.error("Error fetching user jobs or counting sources:", error);
    throw new Error("Failed to fetch user jobs or count sources");
  }
};