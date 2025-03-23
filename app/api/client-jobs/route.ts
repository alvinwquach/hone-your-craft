import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

const getPostedJobs = unstable_cache(
  async (userId: string) => {
    return await prisma.jobPosting.findMany({
      where: {
        userId: userId,
      },
      include: {
        salary: true,
        requiredSkills: {
          include: {
            skill: true,
          },
        },
        bonusSkills: {
          include: {
            skill: true,
          },
        },
        requiredDegree: true,
        applications: {
          select: {
            id: true,
            candidate: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            resumeUrl: true,
            status: true,
            appliedAt: true,
            acceptedAt: true,
            rejectedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },
  ["job_postings"],
  { tags: ["job_postings"] }
);
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }
    const postedJobs = await getPostedJobs(currentUser.id);
    return NextResponse.json({ jobPostings: postedJobs }, { status: 200 });
  } catch (error) {
    console.error("Error fetching job postings:", error);
    return NextResponse.json(
      { message: "Error fetching job postings" },
      { status: 500 }
    );
  }
}
