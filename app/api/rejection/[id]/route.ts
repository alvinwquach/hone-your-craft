import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";

interface RequiredRejectionData {
  date: string;
  initiatedBy: string;
}

function validateRequiredRejectionData(rejectionData: RequiredRejectionData) {
  if (!rejectionData.date || !rejectionData.initiatedBy) {
    return "Rejection date, and initiated by are required fields.";
  }
  return null;
}

// Get rejection by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const rejectionId = params.id;

  try {
    const currentUser = await getCurrentUser();
    // If no current user, return an error response
    if (!currentUser) {
      return NextResponse.error();
    }

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
  const currentUser = await getCurrentUser();
  // If no current user, return an error response
  if (!currentUser) {
    return NextResponse.error();
  }

  const { date, initiatedBy, notes, jobId, userId } = await request.json();

  const validationError = validateRequiredRejectionData({ date, initiatedBy });
  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

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
  const currentUser = await getCurrentUser();
  // If no current user, return an error response
  if (!currentUser) {
    return NextResponse.error();
  }

  const rejectionId = params.id;
  const { date, initiatedBy, notes, jobId, userId } = await request.json();

  const validationError = validateRequiredRejectionData({ date, initiatedBy });
  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  try {
    const updateData: any = {};
    if (date) updateData.date = date;
    if (initiatedBy) updateData.initiatedBy = initiatedBy;
    if (notes !== undefined) updateData.notes = notes;
    if (jobId) updateData.jobId = jobId;
    if (userId) updateData.userId = userId;

    // Attempt to update the rejection
    const updatedRejection = await prisma.rejection.update({
      where: { id: rejectionId },
      data: updateData,
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
  const currentUser = await getCurrentUser();
  // If no current user, return an error response
  if (!currentUser) {
    return NextResponse.error();
  }

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
