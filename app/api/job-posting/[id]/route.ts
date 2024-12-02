import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";

// Get job by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const jobId = params.id;

  try {
    // Retrieve the current authenticated user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      // Return an error response if the user is not authenticated
      return NextResponse.error();
    }
    // Find the job posting using the jobId
    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId },
      include: {
        requiredSkills: {
          // Include the related required skills
          include: { skill: true },
        },
        bonusSkills: {
          // Include the related bonus skills
          include: { skill: true },
        },
      },
    });
    //  If the job posting does not exist, return a 404 error
    if (!job) {
      return NextResponse.json(
        { message: "Job posting not found" },
        { status: 404 }
      );
    }
    // Return the job posting data as JSON in the response
    return NextResponse.json({ job });
  } catch (error) {
    console.error("Error fetching job:", error);
    // Return a 500 error if something goes wrong while fetching the job
    return NextResponse.json(
      { message: "Error fetching job" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    const jobPostingId = params.id;

    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id: jobPostingId },
      include: {
        requiredSkills: true,
        bonusSkills: true,
        interviewInvites: true,
        requiredDegree: true,
      },
    });

    if (!jobPosting) {
      throw new Error("Job not found");
    }

    if (jobPosting.userId !== currentUser.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    await Promise.all([
      prisma.interviewInvite.deleteMany({
        where: { jobPostingId: jobPostingId },
      }),
      prisma.offer.deleteMany({ where: { jobPostingId: jobPostingId } }),
      prisma.rejection.deleteMany({ where: { jobPostingId: jobPostingId } }),
      prisma.jobRecommendation.deleteMany({
        where: { jobPostingId: jobPostingId },
      }),
      prisma.jobTag.deleteMany({ where: { jobPostingId: jobPostingId } }),
    ]);
    await prisma.jobPosting.delete({ where: { id: jobPostingId } });

    return NextResponse.json({
      message: "Job posting and associated data deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting job posting:", error);
    return NextResponse.json(
      { message: "Error deleting job posting" },
      { status: 500 }
    );
  }
}
