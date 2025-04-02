"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { unstable_cache } from "next/cache";

const getCachedEventTypes = unstable_cache(
  async (userId: string) => {
    return await prisma.eventType.findMany({
      where: { userId },
    });
  },
  ["event_types"],
  { tags: ["event_types"] }
);

export async function getEventTypes() {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  const eventTypes = await getCachedEventTypes(currentUser.id);
  return { eventTypes };
}
