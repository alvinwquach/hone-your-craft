"use server";

import { getServerSession } from "next-auth/next";
import authOptions from "../api/auth/[...nextauth]/options";
import prisma from "./db/prisma";

export async function getSession() {
  return await getServerSession(authOptions);
}

export default async function getCurrentUser() {
  try {
    // Retrieve the user session
    const session = await getSession();

    console.log("User session:", session); // Log the session object for debugging

    // Check if the session or user email is missing
    if (!session?.user?.email) {
      // If so, return null
      return null;
    }

    // Query the database to find the current user by email
    const currentUser = await prisma.user.findUnique({
      where: {
        email: session.user.email as string, // Convert user email to string
      },
    });

    // If the current user is not found in the database, return null
    if (!currentUser) {
      return null;
    }

    // Format the user object with ISO string dates for createdAt, updatedAt, and emailVerified fields
    return {
      ...currentUser,
      image: currentUser.image,
      createdAt: currentUser.createdAt.toISOString(), // Convert createdAt date to ISO string
      updatedAt: currentUser.updatedAt.toISOString(), // Convert updatedAt date to ISO string
      emailVerified: currentUser.emailVerified?.toISOString() || null, // Convert emailVerified date to ISO string or null if undefined
    };
  } catch (error: any) {
    // If any error occurs during the process, return null
    return null;
  }
}
