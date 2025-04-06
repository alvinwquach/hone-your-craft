"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "./getCurrentUser";
import { redirect } from "next/navigation";

export async function getEventTypeToReschedule(eventId: string) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return redirect("/login");
  }

  const event = await prisma.userEvent.findUnique({
    where: { id: eventId },
    include: {
      creator: { select: { id: true, name: true, email: true, image: true } },
      participant: { select: { id: true, name: true, email: true } },
      eventType: {
        include: {
          availabilities: {
            include: { availability: true },
          },
        },
      },
    },
  });

  if (!event) throw new Error("Event not found");

  const bookedSlots = await prisma.timeSlot.findMany({
    where: {
      isBooked: true,
      eventId: { not: eventId },
      event: {
        OR: [
          { creatorId: event.creatorId },
          { participantId: event.participantId },
        ],
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
      userId: event.creatorId,
      title: event.title,
      length: event.eventType?.length ?? 30,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      availabilities:
        event.eventType?.availabilities.map((ea) => ({
          id: ea.availability.id,
          userId: ea.availability.userId,
          dayOfWeek: ea.availability.dayOfWeek,
          isRecurring: ea.availability.isRecurring,
          startTime: ea.availability.startTime.toISOString(),
          endTime: ea.availability.endTime.toISOString(),
          createdAt: ea.availability.createdAt.toISOString(),
          updatedAt: ea.availability.updatedAt.toISOString(),
        })) || [],
      user: {
        name: event.creator.name ?? "Unknown",
        email: event.creator.email ?? "Unknown",
        image: event.creator.image ?? "/default-image.png",
      },
    },
    bookedSlots: bookedSlots.map((slot) => ({
      id: slot.id,
      eventId: slot.eventId,
      startTime: slot.startTime.toISOString(),
      endTime: slot.endTime.toISOString(),
      isBooked: slot.isBooked,
      bookedBy: slot.bookedBy ?? "",
      event: {
        id: slot.event.id,
        title: slot.event.title,
        description: slot.event.description ?? "",
        startTime: slot.event.startTime.toISOString(),
        endTime: slot.event.endTime.toISOString(),
        creator: {
          id: slot.event.creator.id,
          name: slot.event.creator.name,
          email: slot.event.creator.email,
        },
        participant: {
          id: slot.event.participant.id,
          name: slot.event.participant.name,
          email: slot.event.participant.email,
        },
      },
    })),
  };
}
