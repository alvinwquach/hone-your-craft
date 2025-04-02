"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { unstable_cache } from "next/cache";

interface Event {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  creator: {
    name: string;
    email: string;
  };
  participant: {
    name: string;
    email: string;
  };
}

const getCachedEvents = unstable_cache(
  async (userId: string) => {
    const events = await prisma.userEvent.findMany({
      where: { creatorId: userId },
      include: {
        creator: { select: { name: true, email: true } },
        participant: { select: { name: true, email: true } },
      },
    });
    return events.map(
      (event): Event => ({
        id: event.id,
        title: event.title,
        description: event.description || "",
        startTime: event.startTime.toISOString(),
        endTime: event.endTime.toISOString(),
        creator: {
          name: event.creator.name || "Unknown",
          email: event.creator.email || "",
        },
        participant: {
          name: event.participant?.name || "Unknown",
          email: event.participant?.email || "",
        },
      })
    );
  },
  ["events"],
  { tags: ["events"] }
);

export async function getEvents(): Promise<Event[]> {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");
  return await getCachedEvents(currentUser.id);
}
