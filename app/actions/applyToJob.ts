"use server";

import prisma from "@/app/lib/db/prisma";
import { revalidatePath } from "next/cache";
import getCurrentUser from "./getCurrentUser";

export async function applyToJob(jobPostingId: string) {
  try {
    const currentUser = await getCurrentUser();

    if (
      !currentUser ||
      !currentUser.id ||
      currentUser.userRole !== "CANDIDATE"
    ) {
      return { error: "User not authenticated or not a candidate" };
    }

    if (!jobPostingId) {
      return { error: "Job posting ID is required" };
    }

    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id: jobPostingId },
      include: { user: true },
    });

    if (!jobPosting) {
      return { error: "Job posting not found" };
    }

    if (jobPosting.user.userRole !== "CLIENT") {
      return { error: "You can only apply to job postings created by clients" };
    }

    if (jobPosting.status !== "OPEN") {
      return { error: "This job posting is no longer open for applications" };
    }

    const existingApplication = await prisma.application.findFirst({
      where: {
        candidateId: currentUser.id,
        jobPostingId,
        status: { not: "REJECTED" },
      },
    });

    if (existingApplication) {
      return { error: "You have already applied to this job posting." };
    }

    const document = await prisma.document.findFirst({
      where: { userId: currentUser.id },
      orderBy: { createdAt: "desc" },
      select: { url: true, documentType: true },
    });

    if (!document) {
      return { error: "No resume found" };
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

    revalidatePath("/jobs", "page");

    return application;
  } catch (error: unknown) {
    console.error("Error applying to job:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
