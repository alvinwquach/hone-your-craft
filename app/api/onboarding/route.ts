import { NextRequest, NextResponse } from "next/server";
import getCurrentUser from "@/app/lib/getCurrentUser";
import prisma from "@/app/lib/db/prisma";

export async function PUT(request: NextRequest) {
  try {
    // Fetch the currently authenticated user
    const currentUser = await getCurrentUser();
    // If no user is found or user email is not available, return an error response
    if (!currentUser || !currentUser.email) {
      return NextResponse.error();
    }
    // Parse the request body to get the userRole
    const { userRole } = await request.json();
    // Update the user in the database with the new userRole
    const updatedUser = await prisma.user.update({
      // Locate user by their email
      where: { email: currentUser.email },
      // Update userRole in the database
      data: { userRole },
    });
    console.log("Updated User:", updatedUser);
    // Return the updated user as a JSON response
    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    // Handling errors and returning a 500 response
    return NextResponse.json(
      { message: "Error updating user" },
      { status: 500 }
    );
  }
}
