"use server";

import getCurrentUser from "./getCurrentUser";
import prisma from "../lib/db/prisma";
import { JobApplicationStatus } from "@prisma/client";
import { convertToSentenceCase } from "../lib/convertToSentenceCase";
import { unstable_cache } from "next/cache";

const getCachedCandidateApplications = unstable_cache(
  async () => {
    try {
      // Retrieve the current user
      const currentUser = await getCurrentUser();

      // Check if the user ID is missing
      if (!currentUser?.id) {
        throw new Error("User not authenticated or user ID not found");
      }

      const applications = await prisma.application.findMany({
        where: {
          candidateId: currentUser.id,
        },
        select: {
          status: true,
        },
      });

      const statusCounts: Record<string, number> = {};
      applications.forEach((application) => {
        const status: JobApplicationStatus = application.status;
        const capitalizedStatus = convertToSentenceCase(status);
        statusCounts[capitalizedStatus] =
          (statusCounts[capitalizedStatus] || 0) + 1;
      });

      const statusData = Object.entries(statusCounts).map(
        ([status, count]) => ({
          status,
          count,
        })
      );

      return { statusData };
    } catch (error) {
      console.error("Error fetching application statuses:", error);
      throw new Error("Failed to fetch application statuses");
    }
  },
  ["candidate-applications"],
  {
    tags: ["applications"],
    revalidate: 300,
  }
);

export const getCandidateApplicationStatus = async () => {
  return await getCachedCandidateApplications();
};
