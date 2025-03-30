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
    rejection: {
      date: Date | null;
      initiatedBy: RejectionInitiator;
      notes: string | null;
    }[];
  } | null;
}

export interface RejectionGroup {
  [date: string]: RejectionWithJob[];
}

export async function editRejection(
  id: string,
  updatedNotes: string
): Promise<RejectionWithJob> {
  const currentUser = await getCurrentUser();

  const currentRejection = await prisma.rejection.findUnique({
    where: { id },
    include: {
      job: {
        select: {
          id: true,
          company: true,
          title: true,
          postUrl: true,
          rejection: {
            select: {
              date: true,
              initiatedBy: true,
              notes: true,
            },
          },
        },
      },
    },
  });
  if (!currentRejection) {
    throw new Error("Rejection not found");
  }

  if (currentRejection.userId !== currentUser?.id) {
    throw new Error("Unauthorized to edit this rejection");
  }

  const updatedRejection = await prisma.rejection.update({
    where: { id },
    data: {
      notes: updatedNotes,
    },
  });

  revalidatePath("/profile/rejections", "page");

  return {
    id: updatedRejection.id,
    userId: updatedRejection.userId,
    jobId: updatedRejection.jobId,
    date: updatedRejection.date ? new Date(updatedRejection.date) : null,
    initiatedBy: updatedRejection.initiatedBy,
    notes: updatedRejection.notes,
    job: {
      id: updatedRejection.jobId || "",
      company: currentRejection.job?.company || "",
      title: currentRejection.job?.title || "",
      postUrl: currentRejection.job?.postUrl || "",
      rejection: [
        {
          date: updatedRejection.date ? new Date(updatedRejection.date) : null,
          initiatedBy: updatedRejection.initiatedBy,
          notes: updatedRejection.notes,
        },
      ],
    },
  };
}
