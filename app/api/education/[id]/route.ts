import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const educationId = params.id;

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    const {
      school,
      majors,
      minor,
      startDateMonth,
      startDateYear,
      endDateMonth,
      endDateYear,
      gpa,
      activities,
      societies,
      description,
    } = await request.json();

    if (!school || !startDateYear || !endDateYear) {
      return NextResponse.json(
        { message: "School, Start Year, and End Year are required" },
        { status: 400 }
      );
    }

    const existingEducation = await prisma.education.findUnique({
      where: { id: educationId },
    });

    if (!existingEducation) {
      return NextResponse.json(
        { message: "Education record not found" },
        { status: 404 }
      );
    }
    if (existingEducation.userId !== currentUser.id) {
      return NextResponse.json(
        { message: "You do not have permission to update this education" },
        { status: 403 }
      );
    }

    const updatedEducation = await prisma.education.update({
      where: { id: educationId },
      data: {
        school,
        majors,
        minor,
        startDateMonth,
        startDateYear,
        endDateMonth,
        endDateYear,
        gpa: gpa ? parseFloat(gpa) : null,
        activities,
        societies,
        description,
      },
    });

    return NextResponse.json(updatedEducation, { status: 200 });
  } catch (error) {
    console.error("Error updating education:", error);
    return NextResponse.json(
      { message: "Error updating education" },
      { status: 500 }
    );
  }
}
