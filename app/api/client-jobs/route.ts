import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Retrieve the current user from the session
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }
    // Fetch job postings created by the current user
    const postedJobs = await prisma.jobPosting.findMany({
      where: {
        userId: currentUser.id,
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

    return NextResponse.json({ jobPostings: postedJobs }, { status: 200 });
  } catch (error) {
    console.error("Error fetching job postings:", error);
    return NextResponse.json(
      { message: "Error fetching job postings" },
      { status: 500 }
    );
  }
}
