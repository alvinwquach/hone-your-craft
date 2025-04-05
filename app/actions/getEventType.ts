"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "./getCurrentUser";
import { redirect } from "next/navigation";

export async function getEventType(id: string) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return redirect("/login");
  }

  const event = await prisma.eventType.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, image: true } },
      availabilities: {
        include: {
          availability: true,
        },
      },
    },
  });

  if (!event) throw new Error("Event not found");

  const bookedSlots = await prisma.timeSlot.findMany({
    where: {
      isBooked: true,
      event: {
        OR: [{ creatorId: event.userId }, { participantId: event.userId }],
      },
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          description: true,
          startTime: true,
          endTime: true,
          creator: { select: { id: true, name: true, email: true } },
          participant: { select: { id: true, name: true, email: true } },
        },
      },
    },
    orderBy: { startTime: "asc" },
  });

  return {
    event: {
      id: event.id,
      userId: event.userId,
      title: event.title,
      length: event.length ?? 30,
      availabilities: event.availabilities.map((ea) => ({
        id: ea.availability.id,
        startTime: ea.availability.startTime.toISOString(),
        endTime: ea.availability.endTime.toISOString(),
      })),
      user: {
        name: event.user.name ?? "Unknown",
        email: event.user.email ?? "Unknown",
        image: event.user.image ?? "/default-image.png",
      },
    },
    bookedSlots: bookedSlots.map((slot) => ({
      id: slot.id,
      startTime: slot.startTime.toISOString(),
      endTime: slot.endTime.toISOString(),
    })),
  };
}
