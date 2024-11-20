import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";
import { Rejection } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    // Get the current user
    const currentUser = await getCurrentUser();

    // If user is not authenticated, return a 401 response
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userRejections: Rejection[] = await prisma.rejection.findMany({
      where: {
        userId: currentUser.id,
      },
      include: {
        job: {
          select: {
            id: true,
            userId: true,
            company: true,
            title: true,
            description: true,
            industry: true,
            location: true,
            workLocation: true,
            updatedAt: true,
            postUrl: true,
            rejection: {
              select: {
                date: true,
                initiatedBy: true,
                notes: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(userRejections);
  } catch (error) {
    console.error("Error fetching user's jobs:", error);
    return NextResponse.error();
  }
}
