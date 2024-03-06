import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  // Extract the email from the URL params
  const userEmail = params.email;

  try {
    // Extract the role from the request body
    const { role } = await request.json();

    // Attempt to update the user's role in the database
    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: { role }, // Update the role field
    });

    // Return a JSON response with the updated user object
    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    // Handle errors and return a JSON response with the error message
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { message: "Error updating user role" },
      { status: 500 }
    );
  }
}

// Get user by email
export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  const userEmail = params.email;

  try {
    // Attempt to find the user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    // If user is not found, return a 404 response
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Return the user as a JSON response
    return NextResponse.json({ user });
  } catch (error) {
    // Handle errors and return a 500 response
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Error fetching user" },
      { status: 500 }
    );
  }
}

// Update user by email
export async function PUT(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  const userEmail = params.email;
  const { role } = await request.json(); // Extract role from request body

  try {
    // Attempt to update the user's role
    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: { role }, // Update the role field
    });

    // Return the updated user as a JSON response
    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    // Handle errors and return a 500 response
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { message: "Error updating user role" },
      { status: 500 }
    );
  }
}



// Delete user by email
export async function DELETE(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  const userEmail = params.email;

  try {
    // Attempt to delete the user
    await prisma.user.delete({
      where: { email: userEmail },
    });

    // Return a success message as a JSON response
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    // Handle errors and return a 500 response
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Error deleting user" },
      { status: 500 }
    );
  }
}
