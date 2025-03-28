import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { ApplicationStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

const getCachedTrackedJobs = unstable_cache(
  async () => {
    console.time("getCachedTrackedJobs");
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("Unauthorized");

    console.time("prismaQuery");
    const jobs = await prisma.job.findMany({
      where: { userId: currentUser.id },
      select: {
        id: true,
        title: true,
        company: true,
        postUrl: true,
        status: true,
        createdAt: true,
        description: true,
        workLocation: true,
        salary: true,
        industry: true,
        location: true,
        interviews: {
          select: {
            interviewDate: true,
            interviewType: true,
          },
        },
        offer: {
          select: {
            salary: true,
            offerDate: true,
            offerDeadline: true,
          },
        },
        rejection: {
          select: {
            initiatedBy: true,
            notes: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    });
    console.timeLog("prismaQuery");

    const columns = new Map<
      ApplicationStatus,
      { id: ApplicationStatus; jobs: typeof jobs }
    >();
    const columnTypes: ApplicationStatus[] = [
      "SAVED",
      "APPLIED",
      "INTERVIEW",
      "OFFER",
      "REJECTED",
    ];

    const columnPromises = columnTypes.map((columnType) => ({
      id: columnType,
      jobs: jobs.filter((job) => job.status === columnType),
    }));

    const columnValues = await Promise.all(columnPromises);
    columnValues.forEach((column) => columns.set(column.id, column));
    console.timeLog("getCachedTrackedJobs");
    return Array.from(columns.values());
  },
  ["jobs"],
  {
    revalidate: 60,
  }
);

export async function GET(request: NextRequest) {
  try {
    console.time("GET Request");
    const result = await getCachedTrackedJobs();
    console.timeLog("GET Request");
    return NextResponse.json({ columns: result });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
