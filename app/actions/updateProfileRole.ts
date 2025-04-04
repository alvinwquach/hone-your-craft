"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath } from "next/cache";
import { YearsOfExperience } from "@prisma/client";

export async function updateProfileRole(data: {
  primaryRole: string;
  yearsOfExperience: YearsOfExperience;
}) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not authenticated");

    const updatedUser = await prisma.user.update({
      where: { email: currentUser.email ?? "" },
      data: {
        primaryRole: data.primaryRole,
        yearsOfExperience: data.yearsOfExperience,
      },
    });

    revalidatePath("/profile");
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}
