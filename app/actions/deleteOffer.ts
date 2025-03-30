"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath } from "next/cache";

export async function deleteOffer(offerId: string) {
  const currentUser = await getCurrentUser();

  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
  });
  if (!offer) {
    throw new Error("Offer not found");
  }

  if (offer.userId !== currentUser?.id) {
    throw new Error("Unauthorized to delete this offer");
  }

  await prisma.offer.delete({
    where: { id: offerId },
  });

  revalidatePath("/profile/offers", "page");
  return { message: "Offer deleted successfully" };
}
