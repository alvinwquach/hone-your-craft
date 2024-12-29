import { NextResponse } from "next/server";
import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
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

    const newEducation = await prisma.education.create({
      data: {
        userId: currentUser.id,
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

    return NextResponse.json(newEducation, { status: 201 });
  } catch (error) {
    console.error("Error creating education:", error);
    return NextResponse.json(
      { message: "Error creating education" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    const educationRecords = await prisma.education.findMany({
      where: {
        userId: currentUser.id,
      },
      orderBy: {
        startDateYear: "desc",
      },
    });

    return NextResponse.json(educationRecords, { status: 200 });
  } catch (error) {
    console.error("Error fetching education:", error);
    return NextResponse.json(
      { message: "Error fetching education" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    const { educationId } = await request.json();

    if (!educationId) {
      return NextResponse.json(
        { message: "Education ID is required" },
        { status: 400 }
      );
    }

    const deletedEducation = await prisma.education.delete({
      where: { id: educationId },
    });

    return NextResponse.json(deletedEducation, { status: 200 });
  } catch (error) {
    console.error("Error deleting education:", error);
    return NextResponse.json(
      { message: "Error deleting education" },
      { status: 500 }
    );
  }
}