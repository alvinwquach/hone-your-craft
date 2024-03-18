"use server";

import getCurrentUser from "./getCurrentUser";
import prisma from "./db/prisma";
import { InterviewType } from "@prisma/client";

const getUserJobInterviews = async () => {
  try {
    // Retrieve the current user
    const currentUser = await getCurrentUser();

    // Throw an error if the user is not authenticated or user ID is not found
    if (!currentUser?.id) {
      throw new Error("User not authenticated or user ID not found");
    }

    // Fetch user interviews from the database
    const userInterviews = await prisma.interview.findMany({
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

    // Initialize the frequency count object with default values
    const initialInterviewTypeFrequency: Record<InterviewType, number> = {
      FINAL_ROUND: 0,
      ON_SITE: 0,
      TECHNICAL: 0,
      PANEL: 0,
      PHONE_SCREEN: 0,
      ASSESSMENT: 0,
      INTERVIEW: 0,
      VIDEO_INTERVIEW: 0,
      FOLLOW_UP: 0,
    };

    // Calculate the frequency count of interview types
    const interviewTypeFrequency = { ...initialInterviewTypeFrequency };
    userInterviews.forEach((interview) => {
      const { interviewType } = interview;
      interviewTypeFrequency[interviewType]++;
    });

    // Sort interview type frequency from highest to lowest
    const sortedInterviewTypeFrequency = Object.entries(interviewTypeFrequency)
      .sort(([, freq1], [, freq2]) => freq2 - freq1) // Sort by frequency in descending order
      .reduce((acc, [type, freq]) => {
        acc[type as InterviewType] = freq;
        return acc;
      }, {} as Record<InterviewType, number>);

    // Return user interviews along with sorted interview type frequency
    return {
      userInterviews,
      interviewTypeFrequency: sortedInterviewTypeFrequency,
    };
  } catch (error) {
    console.error("Error fetching user interviews:", error);
    throw new Error("Failed to fetch user interviews");
  }
};

export default getUserJobInterviews;