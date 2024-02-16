import { InterviewRound, PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// Get interview by ID
export async function GET({ params }: { params: { id: string } }) {
  const interviewId = params.id;

  try {
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
  const { userId, jobId, date, scheduledDate, interviewRounds } =
    await request.json();

  try {
    // Attempt to create a new interview
    const interview = await prisma.interview.create({
      data: {
        userId,
        jobId,
        date,
        scheduledDate,
        interviewRounds: {
          createMany: {
            data: interviewRounds,
          },
        },
      },
      include: { interviewRounds: true }, // Include related interview rounds data
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
  const { date, scheduledDate, interviewRounds } = await request.json();

  try {
    // Attempt to update the interview
    const updatedInterview = await prisma.interview.update({
      where: { id: interviewId },
      data: {
        date,
        scheduledDate,
        interviewRounds: {
          upsert: interviewRounds.map((round: InterviewRound) => ({
            where: { id: round.id },
            update: round,
            create: round,
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
