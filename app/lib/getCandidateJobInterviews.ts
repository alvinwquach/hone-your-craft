"use server";

import getCurrentUser from "./getCurrentUser";
import prisma from "./db/prisma";

// Define only the interview types you are using
type CandidateInterview =
  | "FINAL_ROUND"
  | "ON_SITE"
  | "TECHNICAL"
  | "PANEL"
  | "PHONE_SCREEN"
  | "ASSESSMENT"
  | "INTERVIEW"
  | "VIDEO_INTERVIEW"
  | "FOLLOW_UP";

// Define the frequency object with only those interview types
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

    // Initialize the frequency count object with only the interview types you are using
    const initialInterviewTypeFrequency: Record<CandidateInterview, number> = {
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

      // Ensure interviewType is one of the valid types we are tracking
      if (interviewType in initialInterviewTypeFrequency) {
        interviewTypeFrequency[interviewType as CandidateInterview]++;
      }
    });

    // Sort interview type frequency from highest to lowest
    const sortedInterviewTypeFrequency = Object.entries(interviewTypeFrequency)
      // Sort by frequency in descending order
      .sort(([, freq1], [, freq2]) => freq2 - freq1)
      .reduce((acc, [type, freq]) => {
        acc[type as CandidateInterview] = freq;
        return acc;
      }, {} as Record<CandidateInterview, number>);

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
