import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { error: "Application ID is required" },
      { status: 400 }
    );
  }

  try {
    // Retrieve the current user from the session
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Check if the user is a CLIENT
    if (currentUser.userRole !== "CLIENT") {
      return NextResponse.json(
        { error: "You must be a client to reject an application" },
        { status: 403 }
      );
    }

    // Find the application by ID
    const application = await prisma.application.findUnique({
      where: { id: id },
      include: { jobPosting: true },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Ensure the current user owns the job posting
    if (application.jobPosting.userId !== currentUser.id) {
      return NextResponse.json(
        { error: "You are not authorized to reject this application" },
        { status: 403 }
      );
    }

    const rejectedApplication = await prisma.application.update({
      where: { id: application.id },
      data: {
        status: "REJECTED",
        rejectedAt: new Date(),
      },
    });

    revalidatePath("/jobs", "page");

    return NextResponse.json({
      message: "Application rejected successfully",
      application: rejectedApplication,
    });
  } catch (error) {
    console.error("Error rejecting application:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
