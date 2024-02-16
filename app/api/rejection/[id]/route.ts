import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// Get rejection by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const rejectionId = params.id;

  try {
    // Attempt to find the rejection by ID
    const rejection = await prisma.rejection.findUnique({
      where: { id: rejectionId },
      include: { job: true, user: true }, // Include related job and user data
    });

    // If rejection is not found, return a 404 response
    if (!rejection) {
      return NextResponse.json(
        { message: "Rejection not found" },
        { status: 404 }
      );
    }

    // Return the rejection as a JSON response
    return NextResponse.json({ rejection });
  } catch (error) {
    // Handle errors and return a 500 response
    console.error("Error fetching rejection:", error);
    return NextResponse.json(
      { message: "Error fetching rejection" },
      { status: 500 }
    );
  }
}

// Create a new rejection
export async function POST(request: NextRequest) {
  const { date, initiatedBy, notes, jobId, userId } = await request.json();

  try {
    // Attempt to create a new rejection
    const rejection = await prisma.rejection.create({
      data: {
        date,
        initiatedBy,
        notes,
        jobId,
        userId,
      },
    });

    // Return the created rejection as a JSON response with a 201 status code
    return NextResponse.json({ rejection }, { status: 201 });
  } catch (error) {
    // Handle errors and return a 500 response
    console.error("Error creating rejection:", error);
    return NextResponse.json(
      { message: "Error creating rejection" },
      { status: 500 }
    );
  }
}

// Update rejection by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const rejectionId = params.id;
  const { date, initiatedBy, notes, jobId, userId } = await request.json();

  try {
    // Attempt to update the rejection
    const updatedRejection = await prisma.rejection.update({
      where: { id: rejectionId },
      data: { date, initiatedBy, notes, jobId, userId },
    });

    // Return the updated rejection as a JSON response
    return NextResponse.json({ rejection: updatedRejection });
  } catch (error) {
    // Handle errors and return a 500 response
    console.error("Error updating rejection:", error);
    return NextResponse.json(
      { message: "Error updating rejection" },
      { status: 500 }
    );
  }
}

// Delete rejection by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const rejectionId = params.id;

  try {
    // Attempt to delete the rejection
    await prisma.rejection.delete({
      where: { id: rejectionId },
    });

    // Return a success message as a JSON response
    return NextResponse.json({ message: "Rejection deleted successfully" });
  } catch (error) {
    // Handle errors and return a 500 response
    console.error("Error deleting rejection:", error);
    return NextResponse.json(
      { message: "Error deleting rejection" },
      { status: 500 }
    );
  }
}
