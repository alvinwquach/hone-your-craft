import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { Rejection } from "@prisma/client";

const getCachedRejections = unstable_cache(
  async (userId: string) => {
    return await prisma.rejection.findMany({
      where: { userId },
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
  },
  ["user-rejections-{userId}"],
  { revalidate: 3600 }
);

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userRejections = await getCachedRejections(currentUser.id);
    return NextResponse.json(userRejections);
  } catch (error) {
    console.error("Error fetching user's rejections:", error);
    return NextResponse.error();
  }
}