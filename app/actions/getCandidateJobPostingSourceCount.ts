"use server";
import getCurrentUser from "./getCurrentUser";
import prisma from "../lib/db/prisma";

const SOURCE_MAPPINGS = new Map([
  ["otta", "Otta"],
  ["linkedin", "LinkedIn"],
  ["wellfound", "Wellfound"],
  ["glassdoor", "Glassdoor"],
  ["monster", "Monster"],
  ["ziprecruiter", "Zip Recruiter"],
  ["indeed", "Indeed"],
  ["simplyhired", "SimplyHired"],
  ["stackoverflow", "Stack Overflow"],
  ["dice", "Dice"],
  ["weworkremotely", "We Work Remotely"],
  ["adzuna", "Adzuna"],
]);

const getSourceFromUrl = (postUrl: string): string => {
  const sourceDomain = Array.from(SOURCE_MAPPINGS.keys()).find((domain) =>
    postUrl.toLowerCase().includes(domain)
  );
  return sourceDomain ? SOURCE_MAPPINGS.get(sourceDomain)! : "Company Website";
};

export const getCandidateJobPostingSourceCount = async (): Promise<
  Record<string, number>
> => {
  try {
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

    const sourceCountRecord: Record<string, number> = {};
    jobSourceCount.forEach((group) => {
      const source = group.referral
        ? "Referral"
        : getSourceFromUrl(group.postUrl);
      sourceCountRecord[source] =
        (sourceCountRecord[source] || 0) + group._count.postUrl;
    });

    return sourceCountRecord;
  } catch (error) {
    console.error("Error fetching user jobs or extracting skills:", error);
    throw new Error("Failed to fetch user jobs or extract skills");
  }
};