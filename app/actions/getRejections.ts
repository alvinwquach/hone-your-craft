"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
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
    updatedAt: Date;
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

export async function getRejections(): Promise<RejectionGroup> {
  const currentUser = await getCurrentUser();

  const rejections = await prisma.rejection.findMany({
    where: { userId: currentUser?.id },
    include: {
      job: {
        select: {
          id: true,
          company: true,
          title: true,
          updatedAt: true,
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

  return rejections.reduce((acc, rejection) => {
    const date = rejection.date
      ? new Date(rejection.date).toLocaleDateString()
      : "No Date";

    if (!acc[date]) {
      acc[date] = [];
    }

    const formattedRejection: RejectionWithJob = {
      id: rejection.id,
      userId: rejection.userId,
      jobId: rejection.jobId,
      date: rejection.date ? new Date(rejection.date) : null,
      initiatedBy: rejection.initiatedBy,
      notes: rejection.notes,
      job: rejection.job
        ? {
            id: rejection.job.id,
            company: rejection.job.company,
            title: rejection.job.title,
            updatedAt: new Date(rejection.job.updatedAt),
            postUrl: rejection.job.postUrl,
            rejection: rejection.job.rejection.map((r) => ({
              date: r.date ? new Date(r.date) : null,
              initiatedBy: r.initiatedBy,
              notes: r.notes,
            })),
          }
        : null,
    };

    acc[date].push(formattedRejection);
    return acc;
  }, {} as RejectionGroup);
}
