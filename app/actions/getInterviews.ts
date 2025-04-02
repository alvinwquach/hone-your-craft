"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { unstable_cache } from "next/cache";

const getCachedInterviews = unstable_cache(
  async (userId: string) => {
    return await prisma.interview.findMany({
      where: { userId },
      include: {
        job: {
          select: {
            title: true,
            company: true,
          },
        },
      },
    });
  },
  ["interviews"],
  { revalidate: 60 }
);

export async function getInterviews() {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  return await getCachedInterviews(currentUser.id);
}
