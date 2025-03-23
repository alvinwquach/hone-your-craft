"use server";

import getCurrentUser from "./getCurrentUser";
import prisma from "../lib/db/prisma";
import { ApplicationStatus } from "@prisma/client";
import { convertToSentenceCase } from "../lib/convertToSentenceCase";
import { unstable_cache } from "next/cache";

const getCachedJobsByApplicationStatus = unstable_cache(
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

    const statusCounts = new Map<string, number>();
    userJobs.forEach((job) => {
      const status: ApplicationStatus | null = job.status;
      if (status) {
        const capitalizedStatus = convertToSentenceCase(status);
        statusCounts.set(
          capitalizedStatus,
          (statusCounts.get(capitalizedStatus) || 0) + 1
        );
      }
    });

    const totalCount = userJobs.length;
    const percentages = new Map<string, number>();
    statusCounts.forEach((count, status) => {
      const percentage = (count / totalCount) * 100;
      const roundedPercentage = parseFloat(percentage.toFixed(2));
      percentages.set(status, roundedPercentage);
    });

    const applicationStatuses = Array.from(statusCounts.keys());

    return {
      userJobs,
      percentages,
      applicationStatuses,
    };
  },
  ["user-jobs"],
  {
    revalidate: 30,
    tags: ["jobs", "applications"],
  }
);

export const getJobsByApplicationStatus = async () => {
  try {
    return await getCachedJobsByApplicationStatus();
  } catch (error) {
    console.error("Error fetching cached user jobs:", error);
    throw new Error("Failed to fetch user jobs or application status");
  }
};
