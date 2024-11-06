import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/lib/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";

interface RequiredInterviewData {
  interviewDate: string;
  interviewType: string;
}

function validateRequiredInterviewData(interviewData: RequiredInterviewData) {
  if (!interviewData.interviewDate || !interviewData.interviewType) {
    return "Interview date and interview type are required fields.";
  }
  return null;
}

// Get interview by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const interviewId = params.id;
  try {
    // Retrieve the current authenticated user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      // Return an error response if the user is not authenticated
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    // Find the interview by its ID
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      // Include related user and job information
      include: { user: true, job: true },
    });
    // Check if the interview exists
    if (!interview) {
      return NextResponse.json(
        { message: "Interview not found" },
        { status: 404 }
      );
    }
    // If the current user is a candidate, ensure they can only view interviews of their own
    if (
      currentUser.userType === "CANDIDATE" &&
      interview.userId !== currentUser.id
    ) {
      // Candidate cannot view interviews of others
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Return the interview data as a JSON response
    return NextResponse.json({ interview });
  } catch (error) {
    console.error("Error fetching interview:", error);
    return NextResponse.json(
      { message: "Error fetching interview" },
      { status: 500 }
    );
  }
}

// Create a new interview
export async function POST(request: NextRequest) {
  const interviewData = await request.json();
  const validationError = validateRequiredInterviewData(interviewData);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  try {
    // Retrieve the current authenticated user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Candidate-specific check - Only allow certain interview types
    const candidateInterviewTypes = [
      "FINAL_ROUND",
      "ON_SITE",
      "TECHNICAL",
      "PANEL",
      "PHONE_SCREEN",
      "ASSESSMENT",
      "INTERVIEW",
      "VIDEO_INTERVIEW",
      "FOLLOW_UP",
    ];

    // Candidates can only create interviews from the above list
    if (
      currentUser.userType === "CANDIDATE" &&
      !candidateInterviewTypes.includes(interviewData.interviewType)
    ) {
      return NextResponse.json(
        { message: "Unauthorized interview type" },
        { status: 403 }
      );
    }

    // Create the interview (for both candidates and clients)
    const interview = await prisma.interview.create({
      data: {
        user: { connect: { id: currentUser.id } }, // Connect the user to the interview
        job: { connect: { id: interviewData.jobId } }, // Connect the interview to a job
        acceptedDate: interviewData.acceptedDate,
        interviewDate: interviewData.interviewDate,
        interviewType: interviewData.interviewType,
        startTime: interviewData.startTime,
        endTime: interviewData.endTime,
      },
    });

    // Return the created interview as a JSON response
    return NextResponse.json({ interview }, { status: 201 });
  } catch (error) {
    console.error("Error creating interview:", error);
    return NextResponse.json(
      { message: "Error creating interview" },
      { status: 500 }
    );
  }
}

// Update an existing interview - Clients can update any interview, candidates can update only their own
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const interviewId = params.id;
  const interviewData = await request.json();

  const validationError = validateRequiredInterviewData(interviewData);
  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  try {
    // Retrieve the current authenticated user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      // Return an error response if the user is not authenticated
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Find the interview by ID
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
    });

    // If the current user is a candidate, ensure they can only update their own interview
    if (
      currentUser.userType === "CANDIDATE" &&
      interview?.userId !== currentUser.id
    ) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Update the interview
    const updatedInterview = await prisma.interview.update({
      where: { id: interviewId },
      data: {
        interviewDate: interviewData.interviewDate,
        interviewType: interviewData.interviewType,
      },
    });

    return NextResponse.json({ interview: updatedInterview });
  } catch (error) {
    console.error("Error updating interview:", error);
    return NextResponse.json(
      { message: "Error updating interview" },
      { status: 500 }
    );
  }
}

// Delete an interview by ID - Candidates can delete only their own interviews, clients can delete any interview
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const interviewId = params.id;

  try {
    // Retrieve the current authenticated user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      // Return an error response if the user is not authenticated
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    // Find the interview to check ownership by ID
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      select: { userId: true },
    });
    // If the current user is a candidate, ensure they can only delete their own interview
    if (
      !interview ||
      (currentUser.userType === "CANDIDATE" &&
        interview.userId !== currentUser.id)
    ) {
      // Return a 404 error if the interview doesn't exist
      return NextResponse.json(
        { message: "Interview not found or not allowed to delete" },
        { status: 404 }
      );
    }
    //  Delete the interview
    await prisma.interview.delete({
      where: { id: interviewId },
    });
    // Return a success message
    return NextResponse.json({ message: "Interview deleted successfully" });
  } catch (error) {
    console.error("Error deleting interview:", error);
    return NextResponse.json(
      { message: "Error deleting interview" },
      { status: 500 }
    );
  }
}
