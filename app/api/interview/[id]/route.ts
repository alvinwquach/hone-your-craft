import getCurrentUser from "@/app/lib/getCurrentUser";
import { InterviewRound, PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

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
      include: { user: true, job: true, interviewRounds: true }, // Include related user, job, and interview rounds data
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
  const requestBody = await request.json();

  try {
    const currentUser = await getCurrentUser(); // Get the current user

    if (!currentUser) {
      // If user is not authenticated, return a 401 response
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check if interviewDate is provided and not null
    if (!requestBody.interviewDate) {
      return NextResponse.json(
        { message: "interviewDate must not be null" },
        { status: 400 }
      );
    }

    // Attempt to create a new interview
    const interview = await prisma.interview.create({
      data: {
        user: { connect: { id: currentUser.id } }, // Connect the user to the id
        job: { connect: { id: requestBody.jobId } }, // Connect the interview to the job
        acceptedDate: requestBody.acceptedDate,
        interviewDate: requestBody.interviewDate,
        interviewType: requestBody.interviewType,
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
  const { acceptedDate, interviewDate, interviewRounds, interviewType } =
    await request.json(); // Extract interviewType from the request body

  try {
    const currentUser = await getCurrentUser(); // Get the current user

    if (!currentUser) {
      // If user is not authenticated, return a 401 response
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Attempt to update the interview
    const updatedInterview = await prisma.interview.update({
      where: { id: interviewId },
      data: {
        acceptedDate,
        interviewDate,
        interviewType,
        interviewRounds: {
          upsert: interviewRounds.map((round: InterviewRound) => ({
            where: { id: round.id }, // Where condition for upsert
            update: round, // Update the existing round
            create: round, // Create a new round if it doesn't exist
          })),
        },
      },
      include: { interviewRounds: true },
    });

    // Return the updated interview as a JSON response
    return NextResponse.json({ interview: updatedInterview });
  } catch (error) {
    // Handle errors and return a 500 response
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
