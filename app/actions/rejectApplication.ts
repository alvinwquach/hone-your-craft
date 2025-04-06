"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath } from "next/cache";

export async function rejectApplication(id: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { error: "User not authenticated" };
    }

    if (currentUser.userRole !== "CLIENT") {
      return { error: "You must be a client to reject an application" };
    }

    if (!id) {
      return { error: "Application ID is required" };
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: { jobPosting: true },
    });

    if (!application) {
      return { error: "Application not found" };
    }

    if (application.jobPosting.userId !== currentUser.id) {
      return { error: "You are not authorized to reject this application" };
    }

    const rejectedApplication = await prisma.application.update({
      where: { id: application.id },
      data: {
        status: "REJECTED",
        rejectedAt: new Date(),
      },
    });

    revalidatePath("/jobs", "page");

    return {
      message: "Application rejected successfully",
      application: rejectedApplication,
    };
  } catch (error: unknown) {
    console.error("Error rejecting application:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
