import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

const getCachedInterviews = unstable_cache(
  async (userId: string) => {
    return await prisma.interview.findMany({
      where: {
        userId,
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
  },
  ["interviews"],
  { revalidate: 60 }
);

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const cachedInterviews = await getCachedInterviews(currentUser.id);
    return NextResponse.json(cachedInterviews);
  } catch (error) {
    console.error("Error fetching user's jobs:", error);
    return NextResponse.error();
  }
}