"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath } from "next/cache";
import { InterviewType } from "@prisma/client";

interface InterviewData {
  jobId: string;
  interviewDate: string;
  interviewType: InterviewType;
  acceptedDate: string;
  videoUrl?: string;
  meetingId?: string;
  passcode?: string;
}

async function validateInterviewData(
  data: InterviewData
): Promise<string | null> {
  if (!data.jobId) return "Job ID is required";
  if (!data.interviewDate) return "Interview date is required";
  if (!data.interviewType) return "Interview type is required";
  if (!data.acceptedDate) return "Accepted date is required";
  return null;
}

export async function createInterview(data: InterviewData) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const validationError = await validateInterviewData(data);
    if (validationError) {
      return {
        success: false,
        message: validationError,
      };
    }

    const interview = await prisma.interview.create({
      data: {
        job: { connect: { id: data.jobId } },
        acceptedDate: new Date(data.acceptedDate),
        interviewDate: new Date(data.interviewDate),
        interviewType: data.interviewType,
        videoUrl: data.videoUrl,
        meetingId: data.meetingId,
        passcode: data.passcode,
      },
    });

    revalidatePath("/calendar", "page");

    return {
      success: true,
      interview,
    };
  } catch (error) {
    console.error("Error creating interview:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Error creating interview",
    };
  }
}
