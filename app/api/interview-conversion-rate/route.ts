import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const jobsAndInterviews = await prisma.job.findMany({
      where: {
        userId: currentUser.id,
        status: { not: "SAVED" },
      },
      include: {
        interviews: true,
      },
    });

    const totalJobs = jobsAndInterviews.length;
    const totalInterviews = jobsAndInterviews.filter(
      (item) => item.interviews && item.interviews.length > 0
    ).length;

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
    return NextResponse.error();
  }
}
