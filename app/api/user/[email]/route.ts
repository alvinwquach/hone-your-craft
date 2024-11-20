import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    // Fetching current user
    const currentUser = await getCurrentUser();
    // If no current user, return an error response
    if (!currentUser) {
      return NextResponse.error();
    }

    // Extracting email from request parameters
    const userEmail = params.email;

    // Retrieving user from the database based on email
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

    // If user not found, return a 404 response
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Returning user information as a JSON response
    return NextResponse.json({ user });
  } catch (error) {
    // Handling errors and returning a 500 response
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
    // Fetching current user
    const currentUser = await getCurrentUser();
    // If no current user, return an error response
    if (!currentUser) {
      return NextResponse.error();
    }

    // Extracting email from request parameters
    const userEmail = params.email;
    // Extracting role and skills from request body
    const { role, skills } = await request.json();

    // Updating user information in the database
    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: { role, skills },
    });

    // Returning the updated user as a JSON response
    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    // Handling errors and returning a 500 response
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Error updating user" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    // Fetching current user
    const currentUser = await getCurrentUser();
    // If no current user, return an error response
    if (!currentUser) {
      return NextResponse.error();
    }

    // Extracting email from request parameters
    const userEmail = params.email;
    // Extracting skill from request body
    const { role, skill } = await request.json();

    // Split the input skill string by commas to get individual skills
    const skillsToAdd = skill.split(",").map((s: string) => s.trim());

    // Updating user's skills in the database by adding each new skill individually
    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: {
        role, // Add user's role
        skills: { push: skillsToAdd }, // Add multiple skills as separate elements
      },
    });

    // Returning the updated user as a JSON response
    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    // Handling errors and returning a 500 response
    console.error("Error adding skill to user:", error);
    return NextResponse.json(
      { message: "Error adding skill to user" },
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
