"use server";

import getCurrentUser from "./getCurrentUser";
import prisma from "../lib/db/prisma";
import { unstable_cache } from "next/cache";

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

const getCachedCandidateJobInterviews = unstable_cache(
  async () => {
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
      if (interviewType in initialInterviewTypeFrequency) {
        interviewTypeFrequency[interviewType as CandidateInterview]++;
      }
    });

    // Sort interview type frequency from highest to lowest
    const sortedInterviewTypeFrequency = Object.entries(interviewTypeFrequency)
      .sort(([, freq1], [, freq2]) => freq2 - freq1)
      .reduce((acc, [type, freq]) => {
        acc[type as CandidateInterview] = freq;
        return acc;
      }, {} as Record<CandidateInterview, number>);

    return {
      userInterviews,
      interviewTypeFrequency: sortedInterviewTypeFrequency,
    };
  },
  ["candidate-interviews"],
  {
    revalidate: 30,
    tags: ["interviews", "jobs"],
  }
);

export const getCandidateJobInterviews = async () => {
  try {
    return await getCachedCandidateJobInterviews();
  } catch (error) {
    console.error("Error fetching cached candidate interviews:", error);
    throw new Error("Failed to fetch candidate interviews");
  }
};
