import { NextResponse } from "next/server";
import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    // Check if the user is authenticated and has the role "CANDIDATE"
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

    // Check if the current user has already applied to the job posting
    const existingApplication = await prisma.application.findFirst({
      where: {
        candidateId: currentUser.id,
        jobPostingId,
        // Exclude applications with "REJECTED" status
        status: { not: "REJECTED" },
      },
    });

    // If an application already exists (not rejected), prevent applying again
    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied to this job posting." },
        { status: 400 }
      );
    }

    // Fetch the most recent resume document for the candidate
    const document = await prisma.document.findFirst({
      where: {
        userId: currentUser.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        // Get the URL of the resume
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

    return NextResponse.json(application);
  } catch (error: unknown) {
    console.error("Error applying to job:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
