import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/lib/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";
import { ApplicationStatus } from "@prisma/client";
export const dynamic = "force-dynamic"; 

export async function GET(request: NextRequest) {
  try {
    // Get the current user
    const currentUser = await getCurrentUser();

    // If user is not authenticated, return a 401 response
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Fetch user jobs from the database
    const userJobs = await prisma.job.findMany({
      where: {
        userId: currentUser.id,
      },
    });

    /* Initialize a Map to store columns
    Group jobs by columns */

    const columns = new Map<ApplicationStatus, Column>();

    // Ensure all columns are initialized, even if no jobs exist for them
    const columnTypes: ApplicationStatus[] = [
      "SAVED",
      "APPLIED",
      "INTERVIEW",
      "OFFER",
      "REJECTED",
    ];

    // Iterate over column types
    columnTypes.forEach((columnType) => {
      // Initialize a new column object with an empty array of jobs
      const column = {
        id: columnType,
        jobs: [],
      };
      // Add the column to the map, using the column type as the key
      columns.set(columnType, column);
    });

    /* Iterate over user jobs
    Add user's jobs to the respective columns */
    for (const job of userJobs) {
      // Check if job status is not null
      if (job.status !== null) {
        // Get the column corresponding to the job status and push the job into its array of jobs
        columns.get(job.status)?.jobs.push(job);
      }
    }

    // Reverse the order of jobs in each column
    columns.forEach((column) => {
      column.jobs.reverse();
    });

    // Initialize a new board object with columns
    const board = {
      columns: Array.from(columns.values()), // Convert Map values to an array
    };

    // Return the board
    return NextResponse.json(board);
  } catch (error) {
    console.error("Error fetching or grouping user's jobs:", error);
    return NextResponse.error();
  }
}
