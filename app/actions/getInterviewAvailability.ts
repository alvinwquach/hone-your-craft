"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { unstable_cache } from "next/cache";

interface AvailabilityItem {
  id: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  dayOfWeek: string;
}

const getCachedAvailability = unstable_cache(
  async (userId: string) => {
    const availabilities = await prisma.interviewAvailability.findMany({
      where: { userId },
    });
    return availabilities.map(
      (avail): AvailabilityItem => ({
        id: avail.id,
        startTime: avail.startTime.toISOString(),
        endTime: avail.endTime.toISOString(),
        isRecurring: avail.isRecurring,
        dayOfWeek: avail.dayOfWeek,
      })
    );
  },
  ["interview_availability"],
  { revalidate: 60 }
);

export async function getInterviewAvailability(): Promise<AvailabilityItem[]> {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");
  return await getCachedAvailability(currentUser.id);
}
