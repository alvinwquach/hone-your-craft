"use server";

import getCurrentUser from "./getCurrentUser";
import prisma from "./db/prisma";

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
            title: true,
            company: true,
            interviews: true,
          },
        },
      },
    });

    console.log(userInterviews);

    // Map user interviews to include interview type
    const interviewsWithTypes = userInterviews.map((interview) => ({
      id: interview.id,
      userId: interview.userId,
      jobId: interview.jobId,
      acceptedDate: interview.acceptedDate,
      interviewDate: interview.interviewDate,
      interviewType: interview.interviewType,
      job: {
        id: interview.id,
        userId: interview.userId,
        company: interview.job.company,
        title: interview.job.title,
      },
    }));

    // Return the user's job interviews with interview types
    return interviewsWithTypes;
  } catch (error) {
    console.error("Error fetching user interviews:", error);
    throw new Error("Failed to fetch user interviews");
  }
};

export default getUserJobInterviews;
