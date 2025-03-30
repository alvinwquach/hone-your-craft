"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { unstable_cache } from "next/cache";

const getCachedUserOffers = unstable_cache(
  async (userId: string | undefined) => {
    return await prisma.offer.findMany({
      where: {
        userId,
      },
      include: {
        job: {
          select: {
            id: true,
            userId: true,
            company: true,
            title: true,
            location: true,
            workLocation: true,
            postUrl: true,
            salary: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
  ["user-offers"],
  {
    revalidate: 60,
    tags: ["user-offers"],
  }
);

export async function getOffers() {
  const currentUser = await getCurrentUser();
  const userOffers = await getCachedUserOffers(currentUser?.id);
  return userOffers;
}
