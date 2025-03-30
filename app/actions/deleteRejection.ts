"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath } from "next/cache";
import { RejectionInitiator } from "@prisma/client";

export interface RejectionWithJob {
  id: string;
  userId: string | null;
  jobId: string | null;
  date: Date | null;
  initiatedBy: RejectionInitiator;
  notes: string | null;
  job: {
    id: string;
    company: string;
    title: string;
    postUrl: string;
  } | null;
}

export interface RejectionGroup {
  [date: string]: RejectionWithJob[];
}

export async function deleteRejection(id: string): Promise<void> {
  const currentUser = await getCurrentUser();

  const existingRejection = await prisma.rejection.findUnique({
    where: { id },
  });
  if (!existingRejection) {
    throw new Error("Rejection not found");
  }

  if (existingRejection.userId !== currentUser?.id) {
    throw new Error("Unauthorized to edit this rejection");
  }

  await prisma.rejection.delete({
    where: { id },
  });

  revalidatePath("/profile/rejections", "page");
}
