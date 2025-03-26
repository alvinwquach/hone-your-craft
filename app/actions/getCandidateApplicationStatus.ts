"use server";
import getCurrentUser from "./getCurrentUser";
import prisma from "../lib/db/prisma";
import { JobApplicationStatus } from "@prisma/client";
import { convertToSentenceCase } from "../lib/convertToSentenceCase";
import { unstable_cache } from "next/cache";

const getCachedCandidateApplications = unstable_cache(
  async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser?.id) {
        throw new Error("User not authenticated or user ID not found");
      }

      const statusCounts = await prisma.application.groupBy({
        by: ["status"],
        where: { candidateId: currentUser.id },
        _count: { status: true },
      });

      const statusData = statusCounts.map(({ status, _count }) => ({
        status: convertToSentenceCase(status as JobApplicationStatus),
        count: _count.status,
      }));

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
