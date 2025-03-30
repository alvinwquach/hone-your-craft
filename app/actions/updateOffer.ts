"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath } from "next/cache";

export async function updateOffer(id: string, updatedSalary: string) {
  const currentUser = await getCurrentUser();

  const currentOffer = await prisma.offer.findUnique({
    where: { id },
  });
  if (!currentOffer) {
    throw new Error("Offer not found");
  }

  if (currentOffer.userId !== currentUser?.id) {
    throw new Error("Unauthorized to edit this offer");
  }

  const updatedOffer = await prisma.offer.update({
    where: { id },
    data: {
      salary: updatedSalary,
      offerDate: currentOffer.offerDate,
      offerDeadline: currentOffer.offerDeadline,
    },
  });

  revalidatePath("/profile/offers", "page");
  return updatedOffer;
}
