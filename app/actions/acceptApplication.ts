"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath } from "next/cache";

export async function acceptApplication(id: string) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.userRole !== "CLIENT") {
    return {
      error: "Unauthorized: Must be a client user to accept applications",
      status: 403,
    };
  }

  try {
    const application = await prisma.application.findUnique({
      where: { id },
      include: { jobPosting: true },
    });

    if (!application) {
      return { error: "Application not found", status: 404 };
    }

    if (application.jobPosting.userId !== currentUser.id) {
      return {
        error:
          "Unauthorized: You are not authorized to accept this application",
        status: 403,
      };
    }

    if (application.status === "ACCEPTED") {
      return {
        error: "Application has already been accepted",
        status: 400,
      };
    }

    const acceptedApplication = await prisma.application.update({
      where: { id: application.id },
      data: {
        status: "ACCEPTED",
        acceptedAt: new Date(),
      },
    });

    revalidatePath("/jobs", "page");

    return {
      message: "Application accepted successfully",
      application: acceptedApplication,
    };
  } catch (error) {
    console.error("Error accepting application:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    };
  }
}
