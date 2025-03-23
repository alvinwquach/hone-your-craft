import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { ApplicationStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

const getCachedJobs = unstable_cache(
  async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("Unauthorized");

    return await prisma.job.findMany({
      where: { userId: currentUser.id },
      orderBy: [{ createdAt: "desc" }],
    });
  },
  ["jobs"],
  {
    revalidate: 60,
  }
);

export async function GET(request: NextRequest) {
  try {
    const userJobs = await getCachedJobs();

    // Create columns with sorted jobs
    const columns = new Map<
      ApplicationStatus,
      { id: ApplicationStatus; jobs: typeof userJobs }
    >();
    const columnTypes: ApplicationStatus[] = [
      "SAVED",
      "APPLIED",
      "INTERVIEW",
      "OFFER",
      "REJECTED",
    ];

    columnTypes.forEach((columnType) => {
      columns.set(columnType, {
        id: columnType,
        jobs: userJobs.filter((job) => job.status === columnType),
      });
    });

    return NextResponse.json({ columns: Array.from(columns.values()) });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}