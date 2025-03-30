"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { RejectionInitiator } from "@prisma/client";

export interface JobRejection {
  id: string;
  job: {
    id: string;
    company: string;
    title: string;
    postUrl: string;
  };
  date: Date;
  initiatedBy: RejectionInitiator;
  notes: string;
}

export async function getRejections(): Promise<Record<string, JobRejection[]>> {
  const currentUser = await getCurrentUser();

  const rejections = await prisma.rejection.findMany({
    where: { userId: currentUser?.id },
    include: {
      job: {
        select: {
          id: true,
          company: true,
          title: true,
          postUrl: true,
        },
      },
    },
    orderBy: { date: "desc" },
  });

  return rejections.reduce((acc, rejection) => {
    const date = rejection.date
      ? new Date(rejection.date).toLocaleDateString()
      : "No Date";

    if (!acc[date]) {
      acc[date] = [];
    }

    acc[date].push({
      id: rejection.id,
      job: {
        id: rejection.job!.id,
        company: rejection.job!.company,
        title: rejection.job!.title,
        postUrl: rejection.job!.postUrl,
      },
      date: rejection.date ? new Date(rejection.date) : new Date(),
      initiatedBy: rejection.initiatedBy,
      notes: rejection.notes ?? "",
    });

    return acc;
  }, {} as Record<string, JobRejection[]>);
}