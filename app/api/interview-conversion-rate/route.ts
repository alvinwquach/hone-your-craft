import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    console.timeLog("getCurrentUser");

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const jobData = await prisma.job.findMany({
      where: {
        userId: currentUser.id,
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

    const response = {
      totalApplications: totalJobs,
      totalInterviews,
      interviewRate,
      message: `You have logged ${totalInterviews} interviews out of ${totalJobs} applications. Your interview rate is ${interviewRate}%.`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Failed to fetch interview data" },
      { status: 500 }
    );
  }
}
