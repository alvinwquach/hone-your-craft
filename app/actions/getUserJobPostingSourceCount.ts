"use server";

import getCurrentUser from "./getCurrentUser";
import prisma from "../lib/db/prisma";

const getSourceFromUrl = (postUrl: string) => {
  if (postUrl.includes("otta")) {
    return "Otta";
  } else if (postUrl.includes("linkedin")) {
    return "LinkedIn";
  } else if (postUrl.includes("wellfound")) {
    return "Wellfound";
  } else if (postUrl.includes("glassdoor")) {
    return "Glassdoor";
  } else if (postUrl.includes("monster")) {
    return "Monster";
  } else if (postUrl.includes("ziprecruiter")) {
    return "Zip Recruiter";
  } else if (postUrl.includes("careerbuilder")) {
    return "Career Builder";
  } else if (postUrl.includes("indeed")) {
    return "Indeed";
  } else if (postUrl.includes("simplyhired")) {
    return "SimplyHired";
  } else if (postUrl.includes("stackoverflow")) {
    return "Stack Overflow";
  } else if (postUrl.includes("dice")) {
    return "Dice";
  } else if (postUrl.includes("weworkremotely")) {
    return "We Work Remotely";
  } else if (postUrl.includes("adzuna")) {
    return "Adzuna";
  } else {
    return "Company Website";
  }
};

export const getUserJobPostingSourceCount = async () => {
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
