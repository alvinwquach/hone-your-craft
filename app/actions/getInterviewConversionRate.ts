"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function getInterviewConversionRate() {
  try {
    const currentUser = await getCurrentUser();

    const jobData = await prisma.job.findMany({
      where: {
        userId: currentUser?.id,
        status: { not: "SAVED" },
      },
      select: {
        id: true,
        _count: {
          select: {
            interviews: true,
          },
        },
      },
    });

    const totalJobs = jobData.length;
    const totalInterviews = jobData.reduce(
      (count, job) => count + job._count.interviews,
      0
    );

    let interviewRate = 0;
    if (totalJobs > 0) {
      interviewRate = Number(((totalInterviews / totalJobs) * 100).toFixed(2));
    }

    return {
      totalApplications: totalJobs,
      totalInterviews,
      interviewRate,
      message: `You have logged ${totalInterviews} interviews out of ${totalJobs} applications. Your interview rate is ${interviewRate}%.`,
    };
  } catch (error) {
    console.error("Error fetching interview conversion rate:", error);
    throw error;
  }
}
