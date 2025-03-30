import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { InterviewType } from "@prisma/client";

export interface InterviewWithJob {
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

interface InterviewGroup {
  [date: string]: InterviewWithJob[];
}

export async function getUpcomingInterviews(): Promise<InterviewGroup> {
  const currentUser = await getCurrentUser();

  const today = new Date();
  const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const interviews = await prisma.interview.findMany({
    where: {
      userId: currentUser?.id,
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

  const groupedInterviews = interviews.reduce((acc, interview) => {
    const interviewDate = interview.interviewDate
      ? new Date(interview.interviewDate).toLocaleDateString()
      : "No Date";
    if (!acc[interviewDate]) acc[interviewDate] = [];
    acc[interviewDate].push(interview);
    return acc;
  }, {} as Record<string, typeof interviews>);

  return groupedInterviews;
}
