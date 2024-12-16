import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.error();
    }

    const userEmail = params.email;

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        name: true,
        image: true,
        role: true,
        skills: true,
        userRole: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Error fetching user" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.error();
    }

    const userEmail = params.email;
    const { skills } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: {
        skills: skills,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error removing skills:", error);
    return NextResponse.json(
      { message: "Error removing skills" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.error();
    }

    const userEmail = params.email;
    const { skills } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: {
        skills: {
          push: skills,
        },
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error adding skills:", error);
    return NextResponse.json(
      { message: "Error adding skills" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { email: string; skill: string } }
) {
  try {
    // Fetching current user
    const currentUser = await getCurrentUser();
    // If no current user, return an error response
    if (!currentUser) {
      return NextResponse.error();
    }

    // Extracting email and skill name from request parameters
    const userEmail = params.email;
    const skillName = params.skill;

    // Updating user's skills in the database by removing the specified skill
    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: {
        skills: {
          set: currentUser.skills.filter((s: string) => s !== skillName),
        },
      },
    });

    // Returning the updated user as a JSON response
    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    // Handling errors and returning a 500 response
    console.error("Error deleting skill from user:", error);
    return NextResponse.json(
      { message: "Error deleting skill from user" },
      { status: 500 }
    );
  }
}
