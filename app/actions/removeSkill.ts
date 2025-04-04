"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath, revalidateTag } from "next/cache";

export async function removeSkill(skill: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser?.id || !currentUser.email) {
    throw new Error("User not authenticated");
  }

  try {
    const currentSkills = currentUser.skills || [];
    const updatedSkills = currentSkills.filter((s) => s !== skill);

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        skills: {
          set: updatedSkills,
        },
      },
      select: {
        skills: true,
      },
    });

    revalidateTag("user-skills");
    revalidateTag("user-profile");
    revalidatePath("/profile");

    return {
      success: true,
      skills: updatedUser.skills,
    };
  } catch (error) {
    console.error("Error removing skill:", error);
    return {
      success: false,
      error: "Failed to remove skill",
    };
  }
}
