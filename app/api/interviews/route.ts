import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/lib/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic"; 
export const maxDuration = 20;

export async function GET(request: NextRequest) {
  try {
    // Get the current user
    const currentUser = await getCurrentUser();

    // If user is not authenticated, return a 401 response
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userInterviews = await prisma.interview.findMany({
      where: {
        userId: currentUser.id,
      },
      include: {
        job: {
          select: {
            title: true,
            company: true,
          },
        },
      },
    });

    return NextResponse.json(userInterviews);
  } catch (error) {
    console.error("Error fetching user's jobs:", error);
    return NextResponse.error();
  }
}
