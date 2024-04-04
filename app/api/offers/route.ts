import getCurrentUser from "@/app/lib/getCurrentUser";
import prisma from "@/app/lib/db/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get the current user
    const currentUser = await getCurrentUser();

    // If user is not authenticated, return a 401 response
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userOffers = await prisma.offer.findMany({
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
            offer: {
              select: {
                offerDate: true,
                offerDeadline: true,
                salary: true,
              },
            },
            salary: true,
          },
        },
      },
    });

    return NextResponse.json(userOffers);
  } catch (error) {
    console.error("Error fetching user's jobs:", error);
    return NextResponse.error();
  }
}
