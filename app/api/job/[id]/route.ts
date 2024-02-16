import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// Get job by ID
export async function GET({ params }: { params: { jobId: string } }) {
  const jobId = params.jobId;

  try {
    // Attempt to find the job by ID
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });
    // If job is not found, return a 404 response
    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    // Return the job as a JSON response
    return NextResponse.json({ job });
  } catch (error) {
    // Handle errors and return a 500 response
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { message: "Error fetching job" },
      { status: 500 }
    );
  }
}

// Create a new job
export async function POST(request: NextRequest) {
  const jobData = await request.json();

  try {
    // Attempt to create a new job
    const job = await prisma.job.create({
      data: jobData,
    });

    // Return the created job as a JSON response with a 201 status code
    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    // Handle errors and return a 500 response
    console.error("Error creating job:", error);
    return NextResponse.json(
      { message: "Error creating job" },
      { status: 500 }
    );
  }
}

// Update job by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const jobId = params.id;
  const jobData = await request.json();

  try {
    // Attempt to update the job
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: jobData,
    });

    // Return the updated job as a JSON response
    return NextResponse.json({ job: updatedJob });
  } catch (error) {
    // Handle errors and return a 500 response
    console.error("Error updating job:", error);
    return NextResponse.json(
      { message: "Error updating job" },
      { status: 500 }
    );
  }
}

// Delete job by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const jobId = params.id;

  try {
    // Attempt to delete the job
    await prisma.job.delete({
      where: { id: jobId },
    });

    // Return a success message as a JSON response
    return NextResponse.json({ message: "Job deleted successfully" });
  } catch (error) {
    // Handle errors and return a 500 response
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { message: "Error deleting job" },
      { status: 500 }
    );
  }
}
