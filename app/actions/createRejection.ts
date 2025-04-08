"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath } from "next/cache";
import { RejectionInitiator } from "@prisma/client";

interface RejectionData {
  jobId: string;
  date: string;
  initiatedBy: RejectionInitiator;
  notes?: string;
}

async function validateRejectionData(
  data: RejectionData
): Promise<string | null> {
  if (!data.jobId) return "Job ID is required";
  if (!data.date) return "Rejection date is required";
  if (!data.initiatedBy) return "Initiator is required";
  return null;
}

export async function createRejection(data: RejectionData) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const validationError = await validateRejectionData(data);
    if (validationError) {
      return {
        success: false,
        message: validationError,
      };
    }

    const rejection = await prisma.rejection.create({
      data: {
        job: { connect: { id: data.jobId } },
        date: new Date(data.date),
        initiatedBy: data.initiatedBy,
        notes: data.notes,
      },
    });

    revalidatePath("/profile", "page");

    return {
      success: true,
      rejection,
    };
  } catch (error) {
    console.error("Error creating rejection:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Error creating rejection",
    };
  }
}
