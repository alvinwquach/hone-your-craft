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

    const { applicationId } = await request.json();
    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      );
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (application.status === "REJECTED") {
      return NextResponse.json(
        { error: "This application has already been rejected" },
        { status: 400 }
      );
    }

    if (application.status === "ACCEPTED") {
      return NextResponse.json(
        { error: "This application has already been accepted" },
        { status: 400 }
      );
    }

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: { status: "REJECTED" },
    });

    return NextResponse.json(updatedApplication);
  } catch (error: unknown) {
    console.error("Error rejecting application:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
