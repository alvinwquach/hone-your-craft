"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath, unstable_cache } from "next/cache";

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

export async function deleteInterview(interviewId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    select: { userId: true },
  });

  if (
    !interview ||
    (currentUser.userRole === "CANDIDATE" &&
      interview.userId !== currentUser.id)
  ) {
    throw new Error("Interview not found or not allowed to delete");
  }

  await prisma.interview.delete({
    where: { id: interviewId },
  });

  revalidatePath("/calendar");
  return { message: "Interview deleted successfully" };
}
