"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateEducation(
  educationId: string,
  educationData: {
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
  }
) {
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

    const existingEducation = await prisma.education.findUnique({
      where: { id: educationId },
    });

    if (!existingEducation) {
      throw new Error("Education record not found");
    }
    if (existingEducation.userId !== currentUser.id) {
      throw new Error("You do not have permission to update this education");
    }

    const updatedEducation = await prisma.education.update({
      where: { id: educationId },
      data: {
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
    return { success: true, data: updatedEducation };
  } catch (error) {
    console.error("Error updating education:", error);
    return { success: false, error: "Error updating education" };
  }
}

export async function deleteEducation(educationId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    if (!educationId) {
      throw new Error("Education ID is required");
    }

    const deletedEducation = await prisma.education.delete({
      where: { id: educationId },
    });

    revalidatePath("/profile");
    return { success: true, data: deletedEducation };
  } catch (error) {
    console.error("Error deleting education:", error);
    return { success: false, error: "Error deleting education" };
  }
}
