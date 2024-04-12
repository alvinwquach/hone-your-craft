import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/lib/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";

interface RequiredJobData {
  company: string;
  title: string;
  postUrl: string;
  description: string;
}

function validateRequiredJobData(jobData: RequiredJobData) {
  if (
    !jobData.company ||
    !jobData.title ||
    !jobData.postUrl ||
    !jobData.description
  ) {
    return "Company, post url, job title, and job description are required fields.";
  }
  return null;
}

// Get job by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const jobId = params.jobId;

  try {
    // Fetching current user
    const currentUser = await getCurrentUser();
    // If no current user, return an error response
    if (!currentUser) {
      return NextResponse.error();
    }

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
  const validationError = validateRequiredJobData(jobData);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  try {
    // Retrieve the current user from the session
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      // If the current user is not found, return a 401 Unauthorized response
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Add the current user's ID to the job data
    jobData.userId = currentUser.id;

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
  { params }: { params: { jobId: string } }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    // If the current user is not found, return a 401 Unauthorized response
    return NextResponse.json(
      { message: "User not authenticated" },
      { status: 401 }
    );
  }
  const jobId = params.jobId;
  const jobData = await request.json();

  if (
    !jobData.company ||
    !jobData.title ||
    !jobData.postUrl ||
    !jobData.description
  ) {
    return NextResponse.json(
      {
        message:
          "Company, title, postUrl, and description are required fields.",
      },
      { status: 400 }
    );
  }

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
  { params }: { params: { jobId: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      // If the current user is not found, return a 401 Unauthorized response
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    const jobId = params.jobId;

    // Fetch the job to be deleted along with its associated data
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        jobSkills: true,
        interviews: true,
        offer: true,
        rejection: true,
      },
    });

    if (!job) {
      throw new Error("Job not found");
    }

    // Delete associated data (job skills, interviews, offers, rejections)
    await Promise.all([
      prisma.jobSkill.deleteMany({ where: { jobId } }),
      prisma.interview.deleteMany({ where: { jobId } }),
      prisma.offer.deleteMany({ where: { jobId } }),
      prisma.rejection.deleteMany({ where: { jobId } }),
    ]);

    // Delete the job itself
    await prisma.job.delete({ where: { id: jobId } });

    // Return a success message as a JSON response
    return NextResponse.json({
      message: "Job and associated data deleted successfully",
    });
  } catch (error) {
    // Handle errors and return a 500 response
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { message: "Error deleting job" },
      { status: 500 }
    );
  }
}
