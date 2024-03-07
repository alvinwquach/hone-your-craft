"use server";

import prisma from "@/app/lib/db/prisma";
import { getServerSession } from "next-auth";
import authOptions from "../api/auth/[...nextauth]/options";

export const getJobsGroupedByColumn = async () => {
  try {
    // Retrieve the user session
    const session = await getServerSession(authOptions);
    // Check if the user session exists and contains the user ID
    if (!session || !session.user?.userId) {
      throw new Error("User not authenticated or user ID not found in session");
    }
    // Fetch user jobs from the database
    const userJobs = await prisma.job.findMany({
      where: {
        userId: session.user.userId.toString(),
      },
    });

    /* Initialize a Map to store columns
    Group jobs by columns */

    const columns = new Map<TypedColumn, Column>();

    // Ensure all columns are initialized, even if no jobs exist for them
    const columnTypes: TypedColumn[] = [
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
    // Initialize a new board object with columns
    const board: Board = {
      columns: columns,
    };

    return board;
  } catch (error) {
    console.error("Error fetching or grouping jobs:", error);
    throw new Error("Failed to fetch or group jobs");
  }
};
