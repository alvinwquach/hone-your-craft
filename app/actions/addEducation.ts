"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addEducation(educationData: {
  school: string;
  majors: string[];
  minor?: string;
  startDateMonth?: number;
  startDateYear: number;
  endDateMonth?: number;
  endDateYear: number;
  gpa?: string;
  activities?: string;
  societies?: string;
  description?: string;
}) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return redirect("/login");
    }

    if (
      !educationData.school ||
      !educationData.startDateYear ||
      !educationData.endDateYear
    ) {
      throw new Error("School, Start Year, and End Year are required");
    }

    const newEducation = await prisma.education.create({
      data: {
        userId: currentUser.id,
        school: educationData.school,
        majors: educationData.majors,
        minor: educationData.minor,
        startDateMonth: educationData.startDateMonth,
        startDateYear: educationData.startDateYear,
        endDateMonth: educationData.endDateMonth,
        endDateYear: educationData.endDateYear,
        gpa: educationData.gpa ? parseFloat(educationData.gpa) : null,
        activities: educationData.activities,
        societies: educationData.societies,
        description: educationData.description,
      },
    });

    revalidatePath("/profile");
    return { success: true, data: newEducation };
  } catch (error) {
    console.error("Error creating education:", error);
    return { success: false, error: "Error creating education" };
  }
}
