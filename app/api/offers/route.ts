import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

const getCachedUserOffers = unstable_cache(
  async (userId: string) => {
    return await prisma.offer.findMany({
      where: {
        userId,
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
  },
  ["user-offers"],
  {
    revalidate: 60, 
    tags: ["user-offers"], 
  }
);

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userOffers = await getCachedUserOffers(currentUser.id);
    return NextResponse.json(userOffers);
  } catch (error) {
    console.error("Error fetching user's jobs:", error);
    return NextResponse.error();
  }
}