"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath } from "next/cache";

export async function cancelEvent(eventId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error("User not authenticated");
  }

  if (!eventId) {
    throw new Error("Event ID is required");
  }

  const event = await prisma.userEvent.findUnique({
    where: { id: eventId },
  });

  if (
    !event ||
    (event.creatorId !== currentUser.id &&
      event.participantId !== currentUser.id)
  ) {
    throw new Error("Event not found or unauthorized");
  }

  await prisma.userEvent.delete({
    where: { id: eventId },
  });

  revalidatePath("/profile/meetings");
  return { message: "Event cancelled successfully" };
}
