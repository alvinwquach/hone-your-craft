"use server";

import prisma from "@/app/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { ApplicationStatus, WorkLocation } from "@prisma/client";
import getCurrentUser from "./getCurrentUser";

interface UpdateJobData {
  status?: ApplicationStatus;
  company?: string;
  title?: string;
  postUrl?: string;
  description?: string;
  workLocation?: WorkLocation | null;
  salary?: string | null;
  industry?: string | null;
}

export async function updateJob(jobId: string, jobData: UpdateJobData) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return { error: "User not authenticated", status: 401 };
    }

    if (
      !jobData.status &&
      !jobData.company &&
      !jobData.title &&
      !jobData.postUrl &&
      !jobData.description &&
      !jobData.workLocation &&
      !jobData.salary &&
      !jobData.industry
    ) {
      return {
        error:
          "At least one field (status, company, title, postUrl, description, workLocation, salary, or industry) is required.",
        status: 400,
      };
    }

    const existingJob = await prisma.job.findUnique({
      where: { id: jobId },
      select: { userId: true },
    });

    if (!existingJob || existingJob.userId !== currentUser.id) {
      return { error: "Job not found or unauthorized", status: 403 };
    }

    const dataToUpdate = {
      ...(jobData.status && { status: jobData.status }),
      ...(jobData.company && { company: jobData.company }),
      ...(jobData.title && { title: jobData.title }),
      ...(jobData.postUrl && { postUrl: jobData.postUrl }),
      ...(jobData.description && { description: jobData.description }),
      ...(jobData.workLocation !== undefined && {
        workLocation: jobData.workLocation,
      }),
      ...(jobData.salary !== undefined && { salary: jobData.salary }),
      ...(jobData.industry !== undefined && { industry: jobData.industry }),
    };

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: dataToUpdate,
    });

    revalidatePath("/track", "page");
    revalidatePath("/api/tracked-jobs");

    return { job: updatedJob, status: 200 };
  } catch (error) {
    console.error("Error updating job:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    };
  }
}
