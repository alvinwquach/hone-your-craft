"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { InterviewType } from "@prisma/client";

interface InterviewWithJob {
  id: string;
  userId: string | null;
  jobId: string;
  acceptedDate: Date;
  startTime: Date | null;
  endTime: Date | null;
  interviewDate: Date | null;
  interviewType: InterviewType;
  videoUrl: string | null;
  meetingId: string | null;
  passcode: string | null;
  job: {
    title: string;
    company: string;
  };
}

export async function getUpcomingInterviews(): Promise<InterviewWithJob[]> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error("User not authenticated");
  }

  const today = new Date();
  const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const interviews = await prisma.interview.findMany({
    where: {
      userId: currentUser.id,
      interviewDate: {
        gte: today,
        lte: oneWeekFromNow,
      },
    },
    include: {
      job: {
        select: {
          title: true,
          company: true,
        },
      },
    },
    orderBy: {
      interviewDate: "asc",
    },
  });

  return interviews.map((interview) => ({
    ...interview,
    acceptedDate: new Date(interview.acceptedDate),
    startTime: interview.startTime ? new Date(interview.startTime) : null,
    endTime: interview.endTime ? new Date(interview.endTime) : null,
    interviewDate: interview.interviewDate
      ? new Date(interview.interviewDate)
      : null,
  }));
}
