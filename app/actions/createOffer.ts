"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath } from "next/cache";

interface OfferData {
  jobId: string;
  offerDate: string;
  offerDeadline?: string;
  salary: string;
}

async function validateOfferData(data: OfferData): Promise<string | null> {
  if (!data.jobId) return "Job ID is required";
  if (!data.offerDate) return "Offer date is required";
  if (!data.salary) return "Salary is required";
  return null;
}

export async function createOffer(data: OfferData) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.id) {
      throw new Error("User not authenticated or missing ID");
    }

    const validationError = await validateOfferData(data);
    if (validationError) {
      return {
        success: false,
        message: validationError,
      };
    }

    const offer = await prisma.offer.create({
      data: {
        job: { connect: { id: data.jobId } },
        offerDate: new Date(data.offerDate),
        offerDeadline: data.offerDeadline
          ? new Date(data.offerDeadline)
          : undefined,
        salary: data.salary,
      },
    });

    revalidatePath("/track", "page"); // Changed to /track to match rejection context

    return {
      success: true,
      offer,
    };
  } catch (error) {
    console.error("Error creating offer:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error creating offer",
    };
  }
}
