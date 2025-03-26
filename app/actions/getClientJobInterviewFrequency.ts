"use server";
import getCurrentUser from "./getCurrentUser";
import prisma from "../lib/db/prisma";
import { unstable_cache } from "next/cache";

const getCachedClientJobInterviewFrequency = unstable_cache(
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

export default async function getClientJobInterviewFrequency() {
  try {
    return await getCachedClientJobInterviewFrequency();
  } catch (error) {
    console.error("Error fetching cached interview frequencies:", error);
    throw new Error("Failed to fetch interview frequencies");
  }
}
