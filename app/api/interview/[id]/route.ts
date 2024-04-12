import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/lib/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";

interface RequiredInterviewData {
  interviewDate: string;
  interviewType: string;
}

function validateRequiredInterviewData(interviewData: RequiredInterviewData) {
  if (!interviewData.interviewDate || !interviewData.interviewType) {
    return "Interview date, and interview type  are required fields.";
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
    const currentUser = await getCurrentUser(); // Get the current user

    if (!currentUser) {
      // If user is not authenticated, return a 401 response
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Attempt to find the interview by ID
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: { user: true, job: true }, // Include related user, job, and interview rounds data
    });

    // If interview is not found, return a 404 response
    if (!interview) {
      return NextResponse.json(
        { message: "Interview not found" },
        { status: 404 }
      );
    }

    // Return the interview as a JSON response
    return NextResponse.json({ interview });
  } catch (error) {
    // Handle errors and return a 500 response
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
    const currentUser = await getCurrentUser(); // Get the current user

    if (!currentUser) {
      // If user is not authenticated, return a 401 response
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check if interviewDate is provided and not null
    if (!interviewData.interviewDate) {
      return NextResponse.json(
        { message: "interviewDate must not be null" },
        { status: 400 }
      );
    }

    // Attempt to create a new interview
    const interview = await prisma.interview.create({
      data: {
        user: { connect: { id: currentUser.id } }, // Connect the user to the id
        job: { connect: { id: interviewData.jobId } }, // Connect the interview to the job
        acceptedDate: interviewData.acceptedDate,
        interviewDate: interviewData.interviewDate,
        interviewType: interviewData.interviewType,
      },
    });

    // Return the created interview as a JSON response with a 201 status code
    return NextResponse.json({ interview }, { status: 201 });
  } catch (error) {
    // Handle errors and return a 500 response
    console.error("Error creating interview:", error);
    return NextResponse.json(
      { message: "Error creating interview" },
      { status: 500 }
    );
  }
}

// Update interview by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const interviewId = params.id;
  const interviewData = await request.json();

  // Validate the interview data
  const validationError = validateRequiredInterviewData(interviewData);
  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  try {
    const currentUser = await getCurrentUser(); // Get the current user

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Attempt to update the interview
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

// Delete interview by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const interviewId = params.id;
  try {
    const currentUser = await getCurrentUser(); // Get the current user

    if (!currentUser) {
      // If user is not authenticated, return a 401 response
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check if the interview belongs to the current user
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      select: { userId: true },
    });

    if (!interview || interview.userId !== currentUser.id) {
      // If the interview does not exist or does not belong to the current user, return a 404 response
      return NextResponse.json(
        { message: "Interview not found" },
        { status: 404 }
      );
    }

    // Attempt to delete the interview
    await prisma.interview.delete({
      where: { id: interviewId },
    });

    // Return a success message as a JSON response
    return NextResponse.json({ message: "Interview deleted successfully" });
  } catch (error) {
    // Handle errors and return a 500 response
    console.error("Error deleting interview:", error);
    return NextResponse.json(
      { message: "Error deleting interview" },
      { status: 500 }
    );
  }
}
