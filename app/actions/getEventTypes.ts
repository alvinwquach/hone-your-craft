"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { redirect } from "next/navigation";

export async function getEventTypes() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return redirect("/login");
  }

  const eventTypes = await prisma.eventType.findMany({
    where: { userId: currentUser.id },
  });
  return { eventTypes };
}
