"use server";

import prisma from "@/app/lib/db/prisma";
import { unstable_cache } from "next/cache";

export async function getCachedCandidateJobPostings(
  page: number = 1,
  limit: number = 10
) {
  const cacheKey = [`candidate-job-postings-page-${page}`];
  return unstable_cache(
    async () => {
      const skip = (page - 1) * limit;
      const jobs = await prisma.jobPosting.findMany({
        where: { status: "OPEN" },
        include: {
          salary: true,
          requiredSkills: { include: { skill: true } },
          bonusSkills: { include: { skill: true } },
          requiredDegree: true,
          applications: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      });

      const totalJobs = await prisma.jobPosting.count({
        where: { status: "OPEN" },
      });
      return {
        jobs,
        totalJobs,
        totalPages: Math.ceil(totalJobs / limit),
        currentPage: page,
      };
    },
    cacheKey,
    { revalidate: 300 }
  )();
}
