"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath } from "next/cache";

export async function deleteEventType(eventId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  const eventType = await prisma.eventType.findUnique({
    where: { id: eventId },
    select: { userId: true },
  });

  if (!eventType || eventType.userId !== currentUser.id) {
    throw new Error("Event type not found or not allowed to delete");
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.eventTypeAvailability.deleteMany({
      where: { eventTypeId: eventId },
    });

    await transaction.eventType.delete({
      where: { id: eventId },
    });
  });

  revalidatePath("/calendar");
  return { message: "Event type deleted successfully" };
}
