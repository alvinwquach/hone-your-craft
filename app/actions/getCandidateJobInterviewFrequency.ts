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

const getCachedCandidateJobInterviewFrequency = unstable_cache(
  async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser?.id) {
        throw new Error("User not authenticated or user ID not found");
      }

      const frequency = await prisma.interview.groupBy({
        by: ["interviewType"],
        where: { userId: currentUser.id },
        _count: { interviewType: true },
        orderBy: {
          _count: { interviewType: "desc" },
        },
      });

      return {
        interviewTypeFrequency: frequency.reduce(
          (acc, { interviewType, _count }) => ({
            ...acc,
            [interviewType]: _count.interviewType,
          }),
          {}
        ),
      };
    } catch (error) {
      console.error("Error fetching interview frequencies:", error);
      throw new Error("Failed to fetch interview frequencies");
    }
  },
  ["candidate-interviews"],
  {
    revalidate: 30,
    tags: ["interviews", "jobs"],
  }
);

export const getCandidateJobInterviewFrequency = async () => {
  try {
    return await getCachedCandidateJobInterviewFrequency();
  } catch (error) {
    console.error("Error fetching cached interview frequencies:", error);
    throw new Error("Failed to fetch interview frequencies");
  }
};
