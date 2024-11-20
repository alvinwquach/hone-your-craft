"use server";

import { getServerSession } from "next-auth/next";
import authOptions from "../api/auth/[...nextauth]/options";
import prisma from "../lib/db/prisma";

export async function getSession() {
  return await getServerSession(authOptions);
}

export default async function getCurrentUser() {
  try {
    // Retrieve the current session
    const session = await getSession();
    console.log("User session:", session);
    // Check if the session exists and the user has an email
    if (!session?.user?.email) {
      // If no email is found, return null
      return null;
    }
    // Query the database to find the user by their email
    const currentUser = await prisma.user.findUnique({
      where: {
        // Use the user's email to find them in the database
        email: session.user.email ?? "",
      },
    });
    // If no user is found, return null
    if (!currentUser) {
      return null;
    }
    // Return the current user with specific fields formatted
    return {
      // Spread the current user object to include all its properties
      ...currentUser,
      // Include the user's image
      image: currentUser.image,
      // Include createdAt
      createdAt: currentUser.createdAt.toISOString(),
      // Include updatedAt
      updatedAt: currentUser.updatedAt.toISOString(),
      // Include emailVerified
      emailVerified: currentUser.emailVerified?.toISOString() || null,
    };
  } catch (error: any) {
    // In case of an error during the process, return null
    return null;
  }
}
