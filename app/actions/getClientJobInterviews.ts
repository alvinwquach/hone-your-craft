"use server";

import getCurrentUser from "./getCurrentUser";
import prisma from "../lib/db/prisma";
import { InterviewType } from "@prisma/client";
import { unstable_cache } from "next/cache";

const getCachedUserJobInterviews = unstable_cache(
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
      OFFER_EXTENDED: 0,
      OFFER_ACCEPTED: 0,
      OFFER_REJECTED: 0,
      REJECTION: 0,
      CONTRACT_SIGNED: 0,
      SALARY_NEGOTIATION: 0,
      FINAL_DECISION: 0,
      PRE_SCREENING: 0,
      GROUP_INTERVIEW: 0,
      REFERENCE_CHECK: 0,
      TRIAL_PERIOD: 0,
      FINAL_OFFER: 0,
      OFFER_WITHDRAWN: 0,
      NEGOTIATION_PHASE: 0,
      ADDITIONAL_DOCS_REQUIRED: 0,
      NO_SHOW: 0,
      CANDIDATE_WITHDREW: 0,
      HIRING_FREEZE: 0,
      TAKE_HOME_ASSESSMENT: 0,
    };

    // Calculate the frequency count of interview types
    const interviewTypeFrequency = { ...initialInterviewTypeFrequency };
    userInterviews.forEach((interview) => {
      const { interviewType } = interview;
      interviewTypeFrequency[interviewType]++;
    });

    // Sort interview type frequency from highest to lowest
    const sortedInterviewTypeFrequency = Object.entries(interviewTypeFrequency)
      .sort(([, freq1], [, freq2]) => freq2 - freq1)
      .reduce((acc, [type, freq]) => {
        acc[type as InterviewType] = freq;
        return acc;
      }, {} as Record<InterviewType, number>);

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

export default async function getUserJobInterviews() {
  try {
    return await getCachedUserJobInterviews();
  } catch (error) {
    console.error("Error fetching cached candidate interviews:", error);
    throw new Error("Failed to fetch candidate interviews");
  }
}
