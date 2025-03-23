import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath } from "next/cache";
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const rejectionId = params.id;

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.error();
    }

    const rejection = await prisma.rejection.findUnique({
      where: { id: rejectionId },
      include: { job: true, user: true },
    });

    if (!rejection) {
      return NextResponse.json(
        { message: "Rejection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ rejection });
  } catch (error) {
    console.error("Error fetching rejection:", error);
    return NextResponse.json(
      { message: "Error fetching rejection" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.error();
  }

  const { date, initiatedBy, notes, jobId, userId } = await request.json();

  const validationError = validateRequiredRejectionData({ date, initiatedBy });
  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  try {
    const rejection = await prisma.rejection.create({
      data: {
        date,
        initiatedBy,
        notes,
        jobId,
        userId,
      },
    });

    revalidatePath("/profile", "page");

    return NextResponse.json({ rejection }, { status: 201 });
  } catch (error) {
    console.error("Error creating rejection:", error);
    return NextResponse.json(
      { message: "Error creating rejection" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const currentUser = await getCurrentUser();
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

    const updatedRejection = await prisma.rejection.update({
      where: { id: rejectionId },
      data: updateData,
    });

    revalidatePath("/profile", "page");

    return NextResponse.json({ rejection: updatedRejection });
  } catch (error) {
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

    revalidatePath("/profile", "page");

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
