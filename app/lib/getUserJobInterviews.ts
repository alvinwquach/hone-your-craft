"use server";

import getCurrentUser from "./getCurrentUser";
import prisma from "./db/prisma";

// getUserJobInterviews function modified to return mapped interviews directly
const getUserJobInterviews = async () => {
  try {
    // Retrieve the current user
    const currentUser = await getCurrentUser();

    // Check if the user ID is missing
    if (!currentUser?.id) {
      throw new Error("User not authenticated or user ID not found");
    }

    // Fetch user interviews from the database
    const userInterviews = await prisma.interview.findMany({
      // Filter interviews by the current user's ID
      where: {
        userId: currentUser.id,
      },
      // Include related job details along with interviews
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
          },
        },
      },
    });

    // Map user interviews to include interview type and directly return them
    return userInterviews.map((interview) => ({
      id: interview.id,
      userId: interview.userId,
      jobId: interview.job.id,
      acceptedDate: interview.acceptedDate,
      interviewDate: interview.interviewDate,
      interviewType: interview.interviewType,
      job: {
        id: interview.job.id,
        userId: interview.job.userId,
        company: interview.job.company,
        title: interview.job.title,
        description: interview.job.description || "",
        industry: interview.job.industry || null,
        location: interview.job.location || null,
        workLocation: interview.job.workLocation || null,
        updatedAt: interview.job.updatedAt || null,
      },
    }));
  } catch (error) {
    console.error("Error fetching user interviews:", error);
    throw new Error("Failed to fetch user interviews");
  }
};


export default getUserJobInterviews;
