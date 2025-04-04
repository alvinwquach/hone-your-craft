"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getEducation() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return redirect("/login");
    }

    const educationRecords = await prisma.education.findMany({
      where: {
        userId: currentUser.id,
      },
      orderBy: {
        startDateYear: "desc",
      },
    });

    return { success: true, data: educationRecords };
  } catch (error) {
    console.error("Error fetching education:", error);
    return { success: false, error: "Error fetching education" };
  }
}
