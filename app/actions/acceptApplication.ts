"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath } from "next/cache";

export async function acceptApplication(id: string) {
  // Retrieve the current user from the session
  const currentUser = await getCurrentUser();

  // Validate user exists and has client role
  if (!currentUser || currentUser.userRole !== "CLIENT") {
    return {
      error: "Unauthorized: Must be a client user to accept applications",
      status: 403,
    };
  }

  try {
    // Find the application by ID
    const application = await prisma.application.findUnique({
      where: { id },
      include: { jobPosting: true },
    });

    // Validate application exists and user owns it
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

    // Check if the application is already accepted
    if (application.status === "ACCEPTED") {
      return {
        error: "Application has already been accepted",
        status: 400,
      };
    }

    // Update the application status
    const acceptedApplication = await prisma.application.update({
      where: { id: application.id },
      data: {
        status: "ACCEPTED",
        acceptedAt: new Date(),
      },
    });

    // Revalidate cache
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
