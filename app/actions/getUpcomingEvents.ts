"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function getUpcomingEvents(): Promise<
  {
    id: string;
    title: string;
    description: string | null;
    startTime: Date;
    endTime: Date;
    creator: { name: string | null; email: string | null };
    participant: { name: string | null; email: string | null };
    eventType: { id: string; title: string } | null;
  }[]
> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error("User not authenticated");
  }

  const now = new Date();
  const events = await prisma.userEvent.findMany({
    where: {
      AND: [
        {
          OR: [
            { creatorId: currentUser.id },
            { participantId: currentUser.id },
          ],
        },
        { startTime: { gt: now } },
      ],
    },
    select: {
      id: true,
      title: true,
      description: true,
      startTime: true,
      endTime: true,
      creator: { select: { name: true, email: true } },
      participant: { select: { name: true, email: true } },
      eventType: { select: { id: true, title: true } },
    },
    orderBy: { startTime: "asc" },
  });

  return events.map((event) => ({
    ...event,
    startTime: new Date(event.startTime),
    endTime: new Date(event.endTime),
  }));
}
