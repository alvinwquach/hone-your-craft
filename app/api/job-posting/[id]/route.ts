import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const jobId = params.id;

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.error();
    }
    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId },
      include: {
        requiredSkills: {
          include: { skill: true },
        },
        bonusSkills: {
          include: { skill: true },
        },
      },
    });
    if (!job) {
      return NextResponse.json(
        { message: "Job posting not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ job });
  } catch (error) {
    console.error("Error fetching job:", error);
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
        applications: true,
      },
    });

    if (!jobPosting) {
      throw new Error("Job posting not found");
    }

    if (jobPosting.userId !== currentUser.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    await prisma.application.deleteMany({
      where: { jobPostingId: jobPostingId },
    });

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

