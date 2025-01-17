import { NextResponse } from "next/server";
import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (
      !currentUser ||
      !currentUser.id ||
      currentUser.userRole !== "CANDIDATE"
    ) {
      return NextResponse.json(
        { error: "User not authenticated or not a candidate" },
        { status: 401 }
      );
    }

    const { jobPostingId } = await request.json();

    if (!jobPostingId) {
      return NextResponse.json(
        { error: "Job posting ID is required" },
        { status: 400 }
      );
    }

    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id: jobPostingId },
      include: { user: true },
    });

    if (!jobPosting) {
      return NextResponse.json(
        { error: "Job posting not found" },
        { status: 404 }
      );
    }
    if (jobPosting.user.userRole !== "CLIENT") {
      return NextResponse.json(
        { error: "You can only apply to job postings created by clients" },
        { status: 400 }
      );
    }

    if (jobPosting.status !== "OPEN") {
      return NextResponse.json(
        { error: "This job posting is no longer open for applications" },
        { status: 400 }
      );
    }
    const existingApplication = await prisma.application.findFirst({
      where: {
        candidateId: currentUser.id,
        jobPostingId,
        status: { not: "REJECTED" },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied to this job posting." },
        { status: 400 }
      );
    }

    const document = await prisma.document.findFirst({
      where: {
        userId: currentUser.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        url: true,
        documentType: true,
      },
    });

    if (!document) {
      return NextResponse.json({ error: "No resume found" }, { status: 404 });
    }

    const application = await prisma.application.create({
      data: {
        candidateId: currentUser.id,
        jobPostingId,
        resumeUrl: document.url,
        status: "PENDING",
      },
    });

    await prisma.jobPosting.update({
      where: { id: jobPostingId },
      data: {
        applicationsReceived: {
          increment: 1,
        },
      },
    });
    return NextResponse.json(application);
  } catch (error: unknown) {
    console.error("Error applying to job:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
